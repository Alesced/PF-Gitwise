"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments, Level, Stack, Likes, Favorites
from sqlalchemy.orm import joinedload
from sqlalchemy import func
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity, verify_jwt_in_request
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from api.utils import send_email
from functools import wraps,  lru_cache
from datetime import datetime, UTC
import stripe
import requests
import json
import logging
import re
import hashlib

# configuracion del logger
logger = logging.getLogger(__name__)
api = Blueprint('api', __name__)
bcrypt = Bcrypt()
# Allow CORS requests to this API
CORS(api)

# Configuración de DeepSeek
DEEPSEEK_API_URL = "https://api.deepseek.com/v1/chat/completions"
DEEPSEEK_API_KEY = os.getenv("DEEPSEEK_API_KEY")

# Función de caché


@lru_cache(maxsize=100)
def get_search_cache_key(user_request, user_tags, post_count):
    key_str = f"{user_request}:{user_tags}:{post_count}"
    return hashlib.md5(key_str.encode()).hexdigest()

# -------------------------Decorator Administrator------------------------


def admin_required(fn):
    """
    Versión simplificada que no inyecta el admin
    """
    @wraps(fn)
    def wrapper(*args, **kwargs):
        try:
            verify_jwt_in_request()
            current_user_id = get_jwt_identity()
            user = User.query.get(current_user_id)

            if not user:
                return jsonify({"error": "Usuario no encontrado"}), 404

            if not user.is_admin:
                return jsonify({"error": "Se requieren privilegios de administrador"}), 403

            return fn(*args, **kwargs)  # <-- Sin inyectar parámetros

        except Exception as e:
            return jsonify({"error": "Error de autorización", "details": str(e)}), 401

    return wrapper
# -------------------------Functions for Smart Search------------------------


def validate_response_format(response_text):
    """
    Valida que la respuesta de la API tenga el formato esperado
    """
    # Verifica que contenga los campos esenciales
    required_patterns = [
        r"RANK_POSITION:\s*\d+",
        r"POST_ID:\s*\d+",
        r"JUSTIFICATION:",
        r"RELEVANCE:",
        r"FIT_SCORE:\s*\d+"
    ]

    return all(re.search(pattern, response_text) for pattern in required_patterns)


def parse_ai_response(response_text):
    """
    Parsea la respuesta de la API y extrae la información estructurada
    """
    # Expresión regular para capturar todos los posts en la respuesta
    pattern = re.compile(
        r"RANK_POSITION:\s*(\d+)\s*"
        r"POST_ID:\s*(\d+)\s*"
        r'JUSTIFICATION:\s*"([^"]+)"\s*'
        r'RELEVANCE:\s*"([^"]+)"\s*'
        r'FIT_SCORE:\s*(\d+)',
        re.MULTILINE | re.DOTALL
    )

    results = []
    matches = pattern.findall(response_text)

    for match in matches:
        rank, post_id, justification, relevance, score = match
        results.append({
            "rank_position": int(rank),
            "post_id": int(post_id),
            "justification": justification.strip(),
            "relevance": relevance.strip(),
            "fit_score": int(score)
        })

    # Ordenar por posición en el ranking
    results.sort(key=lambda x: x["rank_position"])
    return results


def extract_keywords(user_request):
    """
    Extrae palabras clave importantes de la solicitud del usuario
    """
    # Palabras comunes a ignorar (stop words)
    stop_words = {
        "the", "a", "an", "and", "or", "but", "in", "on", "at", "to",
        "for", "of", "with", "by", "is", "are", "was", "were", "be", "been",
        "this", "that", "these", "those", "i", "you", "he", "she", "it", "we",
        "they", "my", "your", "his", "her", "its", "our", "their", "what",
        "which", "who", "whom", "where", "when", "why", "how", "can", "could",
        "would", "should", "may", "might", "must", "will", "shall", "about"
    }

    # Convertir a minúsculas y dividir en palabras
    words = user_request.lower().split()

    # Filtrar palabras relevantes (eliminar stop words y palabras muy cortas)
    keywords = [
        word for word in words
        if word not in stop_words and len(word) > 2 and word.isalpha()
    ]

    return set(keywords)


def parse_post_list(post_results_list):
    """
    Convierte la cadena de texto de posts en una lista de diccionarios
    """
    posts = []
    lines = post_results_list.strip().split('\n')

    for line in lines:
        # El formato esperado es: "ID: X | Title: Y | Description: Z"
        parts = line.split('|')
        if len(parts) < 3:
            continue

        # Extraer ID
        id_part = parts[0].strip()
        id_match = re.search(r'ID:\s*(\d+)', id_part)
        if not id_match:
            continue

        # Extraer título
        title_part = parts[1].strip()
        title_match = re.search(r'Title:\s*(.+)', title_part)

        # Extraer descripción
        desc_part = parts[2].strip() if len(parts) > 2 else ""
        desc_match = re.search(r'Description:\s*(.+)', desc_part)

        posts.append({
            'id': id_match.group(1),
            'title': title_match.group(1) if title_match else "[Untitled]",
            'description': desc_match.group(1) if desc_match else ""
        })

    return posts


def calculate_relevance_score(post, keywords):
    """
    Calcula un puntaje de relevancia entre un post y las palabras clave
    """
    # Combinar título y descripción para el análisis
    content = f"{post.get('title', '')} {post.get('description', '')}".lower()

    score = 0

    # Ponderar coincidencias en el título más que en la descripción
    title = post.get('title', '').lower()
    for keyword in keywords:
        # Coincidencia exacta en el título
        if f" {keyword} " in f" {title} ":
            score += 3
        # Coincidencia parcial en el título
        elif keyword in title:
            score += 2
        # Coincidencia exacta en el contenido
        elif f" {keyword} " in f" {content} ":
            score += 2
        # Coincidencia parcial en el contenido
        elif keyword in content:
            score += 1

    return score


def filter_posts_by_keywords(user_request, post_results_list):
    """
    Filtrado inicial por palabras clave para reducir el conjunto de posts
    """
    keywords = extract_keywords(user_request)
    posts = parse_post_list(post_results_list)

    # Si no hay palabras clave relevantes, devolver todos los posts
    if not keywords:
        return posts[:20]  # Limitar a 20 posts como máximo

    filtered_posts = []
    for post in posts:
        score = calculate_relevance_score(post, keywords)
        # Umbral mínimo de relevancia
        if score >= 2:  # Ajusta este valor según necesites
            filtered_posts.append((score, post))

    # Ordenar por puntaje (mayor a menor)
    filtered_posts.sort(key=lambda x: x[0], reverse=True)

    # Devolver solo los posts, sin los puntajes
    return [post for score, post in filtered_posts[:20]]  # Máximo 20 posts


def hybrid_search(user_request, post_results_list, user_tags=None):
    """
    Sistema híbrido que primero filtra con algoritmo simple y luego usa IA
    para rankear solo los posts más relevantes
    """
    # Primero filtramos con un algoritmo simple basado en palabras clave
    filtered_posts = filter_posts_by_keywords(user_request, post_results_list)

    # Si no encontramos posts relevantes con el filtrado simple
    if not filtered_posts:
        # Podemos optar por devolver resultados vacíos o usar IA con todos los posts
        return {
            "results": [],
            "dev_debug": {
                "status": "No relevant posts found in initial filtering",
                "filtered_count": 0
            }
        }

    # Preparamos la lista reducida para la IA
    reduced_list = "\n".join([
        f"ID: {post['id']} | Title: {post['title']} | Description: {post['description']}"
        for post in filtered_posts
    ])

    # Llamamos a la IA solo con los posts pre-filtrados
    ai_response = AI_search(user_request, reduced_list, user_tags)

    # Añadimos información de debug sobre el filtrado
    if "dev_debug" in ai_response:
        ai_response["dev_debug"]["initial_filtered_count"] = len(
            filtered_posts)
        ai_response["dev_debug"]["initial_filtering"] = "Applied"

    return ai_response

# -----------------------------Defs for DeepSeek API-------------------------


def AI_search(user_request, post_results_list, user_tags=None):
    prompt = f"""
Eres un asistente especializado en analizar y clasificar proyectos de código abierto. Tu tarea es rankear posts de proyectos basándote en qué tan bien coinciden con la solicitud del usuario.

### Instrucciones:
1. Evalúa cada post según su relevancia para la solicitud del usuario
2. Asigna a cada post:
   - Una posición en el ranking (comenzando en 1)
   - Su ID de post
   - Una justificación específica
   - Una etiqueta de relevancia
   - Un puntaje de ajuste (FIT_SCORE) de 0 a 100

### Solicitud del usuario:
{user_request}

### Etiquetas de perfil (opcional):
{user_tags or 'No proporcionadas'}

### Posts candidatos:
{post_results_list}

### Formato de respuesta (para cada post):
RANK_POSITION: [número]
POST_ID: [id]
JUSTIFICATION: "[justificación específica]"
RELEVANCE: "[etiqueta de relevancia]"
FIT_SCORE: [puntaje]

Solo responde con el formato especificado, sin comentarios adicionales.
"""

    try:
        headers = {
            "Authorization": f"Bearer {DEEPSEEK_API_KEY}",
            "Content-Type": "application/json"
        }

        payload = {
            "model": "deepseek-coder",
            "messages": [
                {
                    "role": "system",
                    "content": "Analiza y rankea proyectos de código abierto para developers."  # Más corto
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            "temperature": 0.2,      # Reducido para más consistencia
            "max_tokens": 350,       # Reducido basado en análisis real
            "top_p": 0.9,            # Añadido para mejor control
            "frequency_penalty": 0.1  # Reduce repeticiones
        }

        response = requests.post(
            DEEPSEEK_API_URL, headers=headers, json=payload, timeout=30)
        response.raise_for_status()

        result_text = response.json()["choices"][0]["message"]["content"]

        # El resto del procesamiento permanece igual
        if validate_response_format(result_text):
            results = parse_ai_response(result_text)
            debug_note = "✅ Analizado correctamente con DeepSeek"
        else:
            results = []
            debug_note = "⚠️ Formato de respuesta inesperado"

        # Calculamos tokens y costos estimados (DeepSeek es más económico)
        input_tokens = len(prompt) / 4  # Estimación aproximada
        output_tokens = len(result_text) / 4

        # Precios de DeepSeek (ejemplo, verificar precios actuales)
        input_cost_per_token = 0.0000005  # $0.50 por millón de tokens
        output_cost_per_token = 0.0000015  # $1.50 por millón de tokens

        estimated_cost = (input_tokens * input_cost_per_token) + \
            (output_tokens * output_cost_per_token)

        return {
            "results": results,
            "dev_debug": {
                "input_tokens": int(input_tokens),
                "output_tokens": int(output_tokens),
                "total_tokens": int(input_tokens + output_tokens),
                "estimated_cost": f"${estimated_cost:.6f}",
                "model": "deepseek-coder",
                "raw_output": result_text,
                "status": debug_note
            }
        }

    except Exception as e:
        logger.error(f"Error en API de DeepSeek: {str(e)}")
        return {
            "results": [],
            "dev_debug": {
                "error": str(e),
                "status": "Error de API DeepSeek"
            }
        }


# ------------------------Routes for Hello World------------------------


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
# ------------------------Routes for user registration and authentication------------------------


@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    stack = data.get('stack')
    level = data.get('level')

    # Solo esta línea adicional para convertir a booleano
    is_admin = True if str(data.get('is_admin', 'False')
                           ).lower() == 'true' else False

    if not all([email, password, name, last_name, username]):
        return jsonify({"error": "All fields are required"}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(
        email=email,
        password=hashed_password,
        name=name,
        last_name=last_name,
        username=username,
        is_admin=is_admin,
        stack=Stack[stack.upper()] if stack else None,
        level=Level[level.upper()] if level else None,
        member_since=datetime.now(UTC)
    )

    db.session.add(new_user)
    db.session.commit()

    access_token = create_access_token(identity=new_user.id)

    return jsonify({
        "message": "User registered successfully",
        "token": access_token,
        "user": {
            "id": new_user.id,
            "email": new_user.email,
            "username": new_user.username,
            "is_admin": new_user.is_admin,
            "stack": new_user.stack.name if new_user.stack else None,
            "level": new_user.level.name if new_user.level else None
        }
    }), 201

# ------------------------Routes for Contacts us------------------------


@api.route('/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    fullname = data.get('fullname')  # that's the actual front-end variable
    email = data.get('email')
    subject = data.get('subject')  # this one was missing
    message = data.get('message')

    if not all([fullname, email, subject, message]):
        return jsonify({"error": "All fields are required"}), 400
    # this part was missing (cause you didn't have utils.py before)
    try:
        send_email(
            sender=email,
            subject=subject,
            user_message=message
        )
        response_body = {
            "message": "Thank you for contacting GitWise! We will get back to you as soon as possible."
        }
        return jsonify(response_body), 200

    except Exception as error:
        print("Could not send email:", error)
        print("Error arguments:", error.args)
        return jsonify({"error": "Failed to send message"}), 500

# ------------------------Routes for user login------------------------
# Ruta de login: permite a un usuario autenticarse y obtener sus datos + token


@api.route('/login', methods=['POST'])
def login_user():
    # Obtiene datos enviados desde el frontend
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    # Validación básica: email y password obligatorios
    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Busca el usuario por email
    user = User.query.filter_by(email=email).first()

    # Verifica existencia y contraseña válida
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Crea token JWT para sesión segura
    access_token = create_access_token(identity=str(user.id))

    # CAMBIO - Generar lista real de posts (my_posts)
    # Recorre la relación "user.say" (posts creados por el usuario)
    my_posts = [
        {
            "id": post.id,
            # Si no tiene título, muestra texto alternativo
            "title": post.title or "(No title)"
        }
        # user.say es la relación User -> Post (one-to-many)
        for post in user.say
    ]

    # CAMBIO - Generar lista real de favoritos (favorites)
    # Extrae IDs de post desde relación "user.star" (favorites)
    # user.star es User -> Favorites
    favorites = [fav.post_id for fav in user.star]

    # CAMBIO - Preparar objeto JSON con toda la info real del usuario.
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "last_name": user.last_name,
        # Imagen que se puede modificar despues
        "avatar_url": "https://avatars.githubusercontent.com/u/000000?v=4",
        "join_date": user.member_since.isoformat(),    # Fecha de registro exacta
        "is_admin": user.is_admin,
        # Posts reales asociados al usuario.
        "my_posts": my_posts,
        # Favoritos reales (IDs de posts)
        "favorites": favorites,
        "stack": user.stack.name if user.stack else None,
        "level": user.level.name if user.level else None
    }

    # Retorna token + datos del usuario al frontend
    return jsonify({
        "message": "Login successful",
        "token": access_token,      # Token JWT
        "user": user_data           # Todos los datos del usuario
    }), 200


# ------------------------Routes for New Post------------------------
@api.route('/user/post/<int:user_id>', methods=['POST'])
@jwt_required()
def handle_new_post(user_id):
    try:
        # Verificar que el usuario del token coincide con el user_id
        current_user_id = get_jwt_identity()
        if int(current_user_id) != user_id:
            return jsonify({"error": "No autorizado"}), 403

        # Resto de tu lógica...
        data = request.get_json()
        title = data.get('title')
        description = data.get('description')
        repo_URL = data.get('repo_URL')
        level = data.get('level')
        stack = data.get('stack')

        if not all([title, description, repo_URL]):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        new_post = Post(
            user_id=user_id,  # Usamos el user_id de la URL
            title=title,
            description=description,
            repo_URL=repo_URL,
            image_URL=data.get('image_URL'),
            stack=Stack[stack.upper()] if stack else None,
            level=Level[level.upper()] if level else None
        )

        db.session.add(new_post)
        db.session.commit()

        return jsonify({"message": "Post creado", "post": new_post.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Smart Search------------------------


@api.route('/smart-search', methods=['POST'])
@jwt_required()
def smart_search():
    try:
        data = request.get_json()
        user_request = data.get("user_request")
        user_tags = data.get("user_tags")

        if not user_request:
            return jsonify({"error": "User request is required"}), 400

        # Obtener todos los posts
        posts = Post.query.all()
        post_count = len(posts)

        # Generar clave de caché
        cache_key = get_search_cache_key(
            user_request, str(user_tags), post_count)

        # Verificar si existe en caché
        if hasattr(api, 'search_cache'):
            cached_result = api.search_cache.get(cache_key)
            if cached_result:
                return jsonify(cached_result), 200

        # Si no está en caché, procesar normalmente
        post_results_list = "\n".join([
            f"ID: {post.id} | Title: {post.title or '[Untitled]'} | Description: {post.description}"
            for post in posts
        ])

        ai_response = hybrid_search(user_request, post_results_list, user_tags)

        # Almacenar en caché
        if not hasattr(api, 'search_cache'):
            api.search_cache = {}
        api.search_cache[cache_key] = ai_response

        return jsonify(ai_response), 200

    except Exception as error:
        logger.error(f"API call failed: {error}")
        return jsonify({"error": str(error)}), 500
# ------------------------Routes for comments a post------------------------


@api.route('/post/<int:post_id>/comments', methods=['GET', 'POST'])
@jwt_required()  # Requiere autenticación para ambos métodos
def handle_post_comments(post_id):
    if request.method == 'GET':
        try:
            # Verificar que el post existe
            post = Post.query.get(post_id)
            if not post:
                return jsonify({"error": "Post not found"}), 404

            # Obtener comentarios con información del autor
            comments = Comments.query.filter_by(post_id=post_id).options(
                joinedload(Comments.author)).all()

            # Serializar los comentarios
            comments_data = []
            for comment in comments:
                comment_data = comment.serialize()

                # Agregar información de likes si no está incluida en serialize
                if not hasattr(comment_data, 'like_count'):
                    # Obtener el conteo de likes para este comentario
                    like_count = Likes.query.filter_by(
                        comments_id=comment.id).count()
                    comment_data['like_count'] = like_count

                    # Verificar si el usuario actual ha dado like a este comentario
                    current_user_id = get_jwt_identity()
                    if current_user_id:
                        user_has_liked = Likes.query.filter_by(
                            user_id=current_user_id,
                            comments_id=comment.id
                        ).first() is not None
                        comment_data['has_liked'] = user_has_liked

                comments_data.append(comment_data)

            return jsonify({
                "success": True,
                "comments": comments_data
            }), 200

        except Exception as e:
            return jsonify({"error": str(e)}), 500

    elif request.method == 'POST':
        try:
            current_user_id = get_jwt_identity()
            data = request.get_json()
            title = data.get('title')
            text = data.get('text')

            if not text:
                return jsonify({"msg": "Text is required"}), 400

            post = Post.query.get(post_id)
            if not post:
                return jsonify({"msg": "Post not found"}), 404

            comment = Comments(
                user_id=current_user_id,
                post_id=post_id,
                title=title,
                text=text
            )
            db.session.add(comment)
            db.session.commit()

            # Para devolver el comentario recién creado, cargamos el autor
            db.session.refresh(comment)
            comment = Comments.query.options(
                joinedload(Comments.author)).get(comment.id)

            return jsonify({"msg": "Comment added successfully", "comment": comment.serialize()}), 201

        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get, Edit and Delete Post by ID------------------------


@api.route('/post/<int:post_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_post_by_id(post_id):
    # GET: Return post. PUT: Update post. DELETE: Delete post.
    # verify if the post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404

    # verify if the user is the owner of the post
    user_id = get_jwt_identity()
    if post.user_id != int(user_id):
        return jsonify({"msg": "You are not the owner of this post"}), 403

    # Handle GET, PUT, DELETE methods for the post
    if request.method == 'GET':
        return jsonify({"post": post.serialize()}), 200

    elif request.method == 'PUT':
        # Update the post with the provided data
        data = request.get_json()
        if not data:
            return jsonify({"msg": "No data provided"}), 400
        try:
            post.title = data.get('title', post.title)
            post.image_URL = data.get('image_URL', post.image_URL)
            post.description = data.get('description', post.description)
            post.repo_URL = data.get('repo_URL', post.repo_URL)
            post.level = data.get('level', post.level)
            post.stack = data.get('stack', post.stack)
            db.session.commit()
            return jsonify({"msg": "Post updated successfully", "post": post.serialize()}), 200
        except KeyError as e:
            db.session.rollback()
            return jsonify({"msg": f"Server error: {str(e)}"}), 500
    # DELETE method to remove the post
    elif request.method == 'DELETE':
        try:
            db.session.delete(post)
            db.session.commit()
            return jsonify({"msg": "Post deleted successfully"}), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"msg": f"Server error: {str(e)}"}), 500

# ------------------- Route GET and PUT user Profile--------------------------------------------


@api.route('/users/profile/<int:user_id>', methods=['GET', 'PUT'])
@jwt_required()
def handle_user_profile(user_id):
    try:
        # Verificación de identidad
        current_user_id = get_jwt_identity()
        if int(current_user_id) != user_id:
            return jsonify({"error": "Unauthorized access"}), 403

        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "User not found"}), 404

        if request.method == 'GET':
            return jsonify(user.serialize()), 200

        elif request.method == 'PUT':
            if not request.is_json:
                return jsonify({"error": "Request must be JSON"}), 400

            data = request.get_json()

            # Validar campos enum
            if 'level' in data:
                try:
                    data['level'] = Level[data['level'].upper()]
                except KeyError:
                    valid_levels = [e.name.lower() for e in Level]
                    return jsonify({
                        "error": f"Invalid level. Valid options: {valid_levels}"
                    }), 400

            if 'stack' in data:
                try:
                    data['stack'] = Stack[data['stack'].upper()]
                except KeyError:
                    valid_stacks = [e.name.lower() for e in Stack]
                    return jsonify({
                        "error": f"Invalid stack. Valid options: {valid_stacks}"
                    }), 400

            # Actualizar campos permitidos
            update_fields = ['email', 'name',
                             'last_name', 'username', 'stack', 'level']
            updated = False

            for field in update_fields:
                if field in data:
                    current_value = getattr(user, field)
                    new_value = data[field]

                    # Comparar valores actuales con nuevos
                    if current_value != new_value:
                        setattr(user, field, new_value)
                        updated = True

            if updated:
                db.session.commit()
                # Serializar manualmente para asegurar compatibilidad con JSON
                user_data = {
                    "id": user.id,
                    "email": user.email,
                    "name": user.name,
                    "last_name": user.last_name,
                    "username": user.username,
                    "stack": user.stack.value if user.stack else None,
                    "level": user.level.value if user.level else None
                }
                return jsonify({
                    "message": "Profile updated successfully",
                    "user": user_data
                }), 200
            else:
                return jsonify({"message": "No changes detected"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

    # Retorno por defecto (nunca debería ejecutarse)
    return jsonify({"error": "Unexpected error"}), 500

# ------------------------Routes for Get all Posts------------------------


@api.route('/posts', methods=['GET'])
def get_all_posts():
    # This endpoint retrieves all posts with pagination, author info, and comment stats
    try:
        # Pagination parameters
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        posts_query = Post.query.order_by(Post.id.desc())
        posts_paginated = posts_query.paginate(
            page=page, per_page=per_page, error_out=False)

        if not posts_paginated.items:
            return jsonify({"msg": "No posts found"}), 404

        posts_data = []
        for post in posts_paginated.items:
            author = User.query.get(post.user_id)

            # Si el autor no existe (fue borrado), proporcionamos datos por defecto
            # en lugar de dejar que la aplicación se estrelle.
            author_info = {
                "username": "Usuario Desconocido",
                "avatar": None
            }
            if author:
                author_info["username"] = author.username
                author_info["avatar"] = author.image_URL if hasattr(
                    author, 'image_URL') else None

            # get the comments for the post and count them
            comments = Comments.query.filter_by(post_id=post.id).all()
            comment_count = len(comments)

            # get the total likes for each comment and sum them up
            total_likes = 0
            for comment in comments:
                total_likes += Likes.query.filter_by(
                    comments_id=comment.id).count()

            post_data = post.serialize()
            post_data.update({
                "author_info": {
                    "username": author.username,
                    "avatar": author.image_URL if hasattr(author, 'image_URL') else None
                },
                "stats": {
                    "comments": comment_count,
                    "likes": total_likes  # Likes totales en todos los comentarios del post
                }
            })
            posts_data.append(post_data)

        return jsonify({
            "success": True,
            "posts": posts_data,
            "pagination": {
                "total_posts": posts_paginated.total,
                "current_page": page,
                "posts_per_page": per_page,
                "total_pages": posts_paginated.pages
            }
        }), 200

    except Exception as e:
        print(f"Error en get_all_posts: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Post by UserID------------------------


@api.route('/users/<int:user_id>/posts', methods=['GET'])
@jwt_required()
def get_user_post(user_id):
    current_user_id = int(get_jwt_identity())

    # Verify if the current user is the same as the user_id in the URL
    if current_user_id != user_id:
        return jsonify({"error": "Unauthorized User"}), 403

    # subquery for caount the comment in each post
    comment_count_subquery = db.session.query(
        Comments.post_id,
        func.count(Comments.post_id).label('comment_count')
    ).group_by(Comments.post_id).subquery()

    # subquery for count the like in each post
    post_like_subquery = db.session.query(
        Likes.post_id,
        func.count(Likes.id).label('post_likes')
    ).filter(Likes.post_id.isnot(None)) \
        .group_by(Likes.post_id).subquery()

    # subquery for count the like in each comment
    comment_likes_subquery = db.session.query(
        Comments.post_id,
        func.count(Likes.id).label('comment_likes')
    ).join(Likes, Likes.comments_id == Comments.id) \
        .group_by(Comments.post_id).subquery()

    # we have here all the subquery with user's post table
    posts_query = db.session.query(
        Post,
        comment_count_subquery.c.comment_count,
        post_like_subquery.c.post_likes,
        comment_likes_subquery.c.comment_likes
    ).outerjoin(comment_count_subquery,  Post.id == comment_count_subquery.c.post_id)\
        .outerjoin(post_like_subquery, Post.id == post_like_subquery.c.post_id) \
        .outerjoin(comment_likes_subquery, Post.id == comment_likes_subquery.c.post_id)\
        .filter(Post.user_id == user_id).order_by(Post.id.desc())

    results = posts_query.all()

    # If the list is empty we return 200 OK
    posts_data = []
    for post, comment_count, post_likes, comment_likes in results:
        # sum the total likes of posts and comments for obtain the total
        total_likes = (post_likes or 0) + (comment_likes or 0)
        post_info = post.serialize()
        post_info['stats'] = {
            'comments': comment_count or 0,
            'likes': total_likes or 0
        }
        posts_data.append(post_info)

    user = User.query.get(user_id)

    return jsonify({
        "success": True,
        "posts": posts_data,
        "user": user.serialize()
    }), 200

# ------------------------Routes GET and POST Favorites by users------------------------


@api.route('/favorites', methods=['POST', 'GET'])
@jwt_required()
def handle_favorites():
    user_id = get_jwt_identity()

    if request.method == 'GET':
        favorites = Favorites.query.filter_by(user_id=user_id).all()

        # Nueva lista para almacenar los datos combinados
        combined_favorites = []
        for fav in favorites:
            post = Post.query.get(fav.post_id)
            if post:
                # Obtenemos los datos del post
                post_data = post.serialize()

                # Añadimos el 'id' de la relación de favorito al diccionario del post
                post_data['favorite_id'] = fav.id

                combined_favorites.append(post_data)

        # Devolvemos la lista de posts con el 'favorite_id' incluido
        return jsonify({"favorites": combined_favorites}), 200

    if request.method == 'POST':
        # Agregar un nuevo favorito
        data = request.get_json()
        post_id = data.get('post_id')

        if not post_id:
            return jsonify({"error": "Post ID is required"}), 400

        # Verificar si el post ya es favorito del usuario
        existing_favorite = Favorites.query.filter_by(
            user_id=user_id, post_id=post_id).first()
        if existing_favorite:
            return jsonify({"error": "Post already in favorites"}), 409

        new_favorite = Favorites(user_id=user_id, post_id=post_id)
        db.session.add(new_favorite)
        db.session.commit()

        return jsonify({"message": "Favorite added", "favorite": new_favorite.serialize()}), 201

# ------------------------Routes for Delete Favorites by id------------------------


@api.route('/favorites/<int:favorite_id>', methods=['DELETE'])
@jwt_required()
def delete_favorite(favorite_id):
    user_id = get_jwt_identity()
    favorite = Favorites.query.get(favorite_id)

    if not favorite:
        return jsonify({"error": "Favorite not found"}), 404

    # Verificar que el usuario del token es el dueño del favorito
    if favorite.user_id != int(user_id):
        return jsonify({"error": "Unauthorized"}), 403

    db.session.delete(favorite)
    db.session.commit()

    return jsonify({"message": "Favorite deleted"}), 200
# ------------------------Routes for likes to Posts--------------------------


@api.route('post/<int:post_id>/likes', methods=['POST', 'DELETE'])
@jwt_required()
def handle_post_like(post_id):
    current_user = int(get_jwt_identity())

    # verificar si el post existe
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post not found"}), 404

    existing_like = Likes.query.filter_by(
        user_id=current_user, post_id=post_id).first()

    if request.method == 'POST':
        if existing_like:
            return jsonify({"error": "Post already liked"}), 400

        new_like = Likes(user_id=current_user, post_id=post_id)
        db.session.add(new_like)
        db.session.commit()
        return jsonify({"message": "Post liked", "like": new_like.serialize()}), 200

    elif request.method == 'DELETE':
        if not existing_like:
            return jsonify({"error": "Post is not liked"}), 404

        db.session.delete(existing_like)
        db.session.commit()
        return jsonify({"msg": "Post unliked succesfully"}), 200

# -----------------------Routes for Likes to Comments-----------------------


@api.route('/comments/<int:comment_id>/like', methods=['POST', 'DELETE'])
@jwt_required()
def like_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        comment = Comments.query.get(comment_id)

        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Buscar like existente
        existing_like = Likes.query.filter_by(
            user_id=current_user_id,
            comments_id=comment_id
        ).first()

        if request.method == 'POST':
            if existing_like:
                return jsonify({
                    "error": "You have already liked this comment",
                    "comment_id": comment_id
                }), 400

            new_like = Likes(
                user_id=current_user_id,
                comments_id=comment_id
            )
            db.session.add(new_like)
            message = "Comment liked successfully"

        elif request.method == 'DELETE':
            if not existing_like:
                return jsonify({
                    "error": "You have not liked this comment",
                    "comment_id": comment_id
                }), 404

            db.session.delete(existing_like)
            message = "Comment unliked successfully"

        db.session.commit()

        # Obtener información actualizada
        like_count = Likes.query.filter_by(comments_id=comment_id).count()

        # Verificar si el usuario actual ha dado like después de la operación
        current_user_has_liked = Likes.query.filter_by(
            user_id=current_user_id,
            comments_id=comment_id
        ).first() is not None

        return jsonify({
            "success": True,
            "message": message,
            "comment_id": comment_id,
            "like_count": like_count,
            "has_liked": current_user_has_liked
        }), 200

    except Exception as e:
        db.session.rollback()
        print(f"Error in like_comment: {str(e)}")  # Para debugging
        return jsonify({"error": "Internal server error"}), 500

# -------------------------Routes for Get all Users (Admin only)------------------------


@api.route('/admin/users', methods=['GET'])
@admin_required
def get_all_users():
    try:
        # Pagination parameters
        # page and per_page are used to control the number of results returned
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        # Filter parameters
        # <--- strip() is for removing whitespaces from the beginning and end of the string
        search = request.args.get('search', '').strip()
        is_active = request.args.get('is_active', None, type=lambda v: v.lower(
        ) == 'true')  # --- filters for active or inactive users
        # --- filters for admin or non-admin users
        is_admin = request.args.get(
            'is_admin', None, type=lambda v: v.lower() == 'true')

        # Ordenation parameters
        sort_field = request.args.get(
            'sort', 'member_since')  # Default sort field
        # Default order is descending
        order = request.args.get('order', 'desc')

        # Field validation
        # Valid sort fields are defined to prevent SQL injection and ensure valid ordering
        valid_sort_fields = ['id', 'email', 'username',
                             'member_since', 'name', 'last_name', 'is_active', 'is_admin']

        # Check if the provided sort field is valid
        if sort_field not in valid_sort_fields:
            sort_field = 'member_since'  # Default sort field if the provided one is invalid

        # Build the query in our data base
        query = User.query

        # Apply search filter if exists
        # The search term is used to filter users by email, username, name or last_name
        if search:
            # The search term is wrapped in % to allow partial matches
            search_term = f"%{search}%"
            query = query.filter(
                db.or_(
                    # The ilike() function is used for case-insensitive matching
                    User.email.ilike(search_term),
                    User.username.ilike(search_term),
                    User.name.ilike(search_term),
                    User.last_name.ilike(search_term)
                )
            )

        # Apply filters for active and admin users if is specified
        # The is_active and is_admin parameters are used to filter users by their active status and admin status
        if is_active is not None:
            query = query.filter(User.is_active == is_active)

        if is_admin is not None:
            query = query.filter(User.is_admin == is_admin)

        # Apply ordering asc or desc
        if order == 'asc':
            query = query.order_by(getattr(User, sort_field).asc())
        else:
            query = query.order_by(getattr(User, sort_field).desc())

        # Paginate the query results for page and per_page
        users_paginated = query.paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        # Response data
        users_data = []
        for user in users_paginated.items:
            user_data = {
                "id": user.id,
                "email": user.email,
                "username": user.username,
                "name": user.name,
                "last_name": user.last_name,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "member_since": user.member_since.isoformat(),
                "stack": user.stack.value if user.stack else None,
                "level": user.level.value if user.level else None
            }
            users_data.append(user_data)

        return jsonify({
            "success": True,
            "users": users_data,
            "pagination": {
                "total_users": users_paginated.total,
                "current_page": page,
                "users_per_page": per_page,
                "total_pages": users_paginated.pages
            },
            "filters": {
                "applied": {
                    "search": search,
                    "is_active": is_active,
                    "is_admin": is_admin,
                    "sort_field": sort_field,
                    "order": order
                },
                "valid_sort_fields": valid_sort_fields
            }
        }), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"msg": "Error to obtain the Users' List", "error": str(e)}), 500

# ------------------------Routes for Get User by ID (Admin only)------------------------


@api.route('/admin/users/<int:user_id>', methods=['GET', 'DELETE'])
@admin_required
def admin_manage_user(user_id):
    """
    Maneja operaciones para un usuario específico
    GET: Obtiene detalles del usuario
    DELETE: Elimina un usuario permanentemente (con todas sus dependencias)
    """
    try:
        user = User.query.get(user_id)
        if not user:
            return jsonify({"error": "Usuario no encontrado"}), 404

        current_admin_id = get_jwt_identity()

        # Evitar que un admin se elimine a sí mismo
        if request.method == 'DELETE' and user_id == current_admin_id:
            return jsonify({"error": "No puedes eliminarte a ti mismo"}), 400

        if request.method == 'GET':
            # Serialización segura para Enums
            user_data = {
                "id": user.id,
                "name": user.name,
                "last_name": user.last_name,
                "email": user.email,
                "username": user.username,
                "is_active": user.is_active,
                "is_admin": user.is_admin,
                "member_since": user.member_since.isoformat() if user.member_since else None,
                "stack": user.stack.name if user.stack else None,  # Serialización correcta de Enum
                # Serialización correcta de Enum
                "level": user.level.name if user.level else None,
                "stats": {
                    "total_posts": len(user.say),
                    "total_comments": len(user.reply),
                    "total_favorites": len(user.star)
                }
            }
            return jsonify(user_data), 200

        elif request.method == 'DELETE':
            try:
                # Eliminar en cascada todas las dependencias

                # 1. Eliminar posts del usuario (con sus comentarios y favoritos)
                for post in user.say:
                    Comments.query.filter_by(post_id=post.id).delete()
                    Favorites.query.filter_by(post_id=post.id).delete()
                    db.session.delete(post)

                # 2. Eliminar comentarios hechos por el usuario
                Comments.query.filter_by(user_id=user_id).delete()

                # 3. Eliminar favoritos del usuario
                Favorites.query.filter_by(user_id=user_id).delete()

                # 4. Eliminar likes del usuario
                Likes.query.filter_by(user_id=user_id).delete()

                # Finalmente eliminar el usuario
                db.session.delete(user)
                db.session.commit()

                return jsonify({
                    "message": "Usuario eliminado permanentemente con todas sus dependencias",
                    "deleted_user_id": user_id
                }), 200

            except Exception as delete_error:
                db.session.rollback()
                return jsonify({
                    "error": "Error al eliminar el usuario",
                    "details": str(delete_error)
                }), 500

    except Exception as e:
        return jsonify({
            "error": "Error en el servidor",
            "details": str(e)
        }), 500
# ----------------------Routes for Get all Post (Admin only)------------------------


@api.route('/admin/posts', methods=['GET'])
@admin_required
def admin_get_posts():
    """
    Obtiene todos los posts (sin parámetro admin inyectado)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        posts = Post.query.order_by(Post.id.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        posts_data = [post.serialize() for post in posts.items]

        return jsonify({
            "posts": posts_data,
            "total": posts.total,
            "pages": posts.pages,
            "current_page": page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Post by ID (Admin only)------------------------


@api.route('/admin/posts/<int:post_id>', methods=['GET', 'DELETE'])
@admin_required
def handle_single_admin_post(post_id):
    """
    Maneja operaciones para un post específico
    GET: Obtiene detalles del post
    DELETE: Elimina un post específico
    """
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"error": "Post no encontrado"}), 404

    if request.method == 'GET':
        post_data = post.serialize()
        post_data['author'] = {
            'id': post.author.id,
            'username': post.author.username,
            'email': post.author.email
        }
        post_data['comments'] = [c.serialize() for c in post.reply]
        return jsonify(post_data), 200

    elif request.method == 'DELETE':
        try:
            # Eliminar en cascada
            Comments.query.filter_by(post_id=post_id).delete()
            Favorites.query.filter_by(post_id=post_id).delete()
            db.session.delete(post)
            db.session.commit()
            return jsonify({
                "message": "Post eliminado permanentemente",
                "deleted_id": post_id
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Comments (Admin only)------------------------


@api.route('/admin/comments', methods=['GET'])
@admin_required
def admin_get_comments():
    """
    Obtiene todos los comentarios (sin parámetro admin inyectado)
    """
    try:
        page = request.args.get('page', 1, type=int)
        per_page = request.args.get('per_page', 10, type=int)

        comments = Comments.query.order_by(Comments.id.desc()).paginate(
            page=page,
            per_page=per_page,
            error_out=False
        )

        comments_data = [comment.serialize() for comment in comments.items]

        return jsonify({
            "comments": comments_data,
            "total": comments.total,
            "pages": comments.pages,
            "current_page": page
        }), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Get Comments by ID (Admin only)------------------------


@api.route('/admin/comments/<int:comment_id>', methods=['GET', 'DELETE'])
@admin_required
def handle_single_admin_comment(comment_id):
    """
    Maneja operaciones para un comentario específico
    GET: Obtiene detalles del comentario
    DELETE: Elimina un comentario específico
    """
    comment = Comments.query.get(comment_id)
    if not comment:
        return jsonify({"error": "Comentario no encontrado"}), 404

    if request.method == 'GET':
        comment_data = comment.serialize()
        comment_data['author'] = {
            'id': comment.author.id,
            'username': comment.author.username
        }
        comment_data['post_title'] = comment.say.title
        return jsonify(comment_data), 200

    elif request.method == 'DELETE':
        try:
            # Eliminar en cascada
            Likes.query.filter_by(comments_id=comment_id).delete()
            db.session.delete(comment)
            db.session.commit()
            return jsonify({
                "message": "Comentario eliminado permanentemente",
                "deleted_id": comment_id
            }), 200
        except Exception as e:
            db.session.rollback()
            return jsonify({"error": str(e)}), 500
# ---------------------------Routes for Get Dashboard (Admin only)--------------------------


@api.route('/admin/dashboard', methods=['GET'])
@admin_required
def admin_dashboard():
    """
    Dashboard administrativo (sin parámetro admin inyectado)
    """
    try:
        current_admin_id = get_jwt_identity()  # Obtenemos el ID desde el token

        stats = {
            "total_users": User.query.count(),
            "active_users": User.query.filter_by(is_active=True).count(),
            "total_posts": Post.query.count(),
            "recent_posts": [p.serialize() for p in Post.query.order_by(Post.id.desc()).limit(5).all()],
            "total_comments": Comments.query.count(),
            "your_admin_id": current_admin_id  # Solo información de referencia
        }

        return jsonify(stats), 200

    except Exception as e:
        return jsonify({"error": str(e)}), 500
# ------------------------------Routes Stripe Checkout----------------------


@api.route('/create-stripe-session', methods=['POST'])
def create_stripe_session():
    # Log the incoming request to see what the server is receiving.
    print("Received request for Stripe session creation.")
    try:
        data = request.get_json()
        print(f"Received data: {data}")

        # Check if the required 'amount' is present.
        if 'amount' not in data:
            print("Error: Missing 'amount' in request data.")
            return jsonify({'error': 'Missing required data: amount'}), 400

        amount = data['amount']

        # Get 'frontend_url' if it exists in the data, otherwise use a default.
        # This makes the field optional in the request.
        frontend_url = data.get('frontend_url', 'http://localhost:3000')

        # Add 'https://' if the URL doesn't have a scheme.
        if not frontend_url.startswith('http'):
            frontend_url = 'https://' + frontend_url

        # Convert amount to an integer to ensure it's in the correct format.
        # This is a common point of failure.
        amount_int = int(amount)

        print(
            f"Creating Stripe session with amount: {amount_int} and frontend_url: {frontend_url}")

        session = stripe.checkout.Session.create(
            payment_method_types=['card'],
            line_items=[{
                'price_data': {
                    'currency': 'usd',
                    'product_data': {
                        'name': 'GitWise Donation',
                    },
                    'unit_amount': amount_int,
                },
                'quantity': 1,
            }],
            mode='payment',
            success_url=f'{frontend_url}/donation-success',
            cancel_url=f'{frontend_url}/donation-cancel',
            # Add metadata to the Stripe session
            metadata=data.get('metadata', {})
        )

        print(f"Stripe session created successfully. URL: {session.url}")

        return jsonify({
            'sessionId': session.id,
            'url': session.url
        }), 200

    except ValueError:
        # Handle the case where the amount isn't a valid number.
        print("Error: 'amount' is not a valid number.")
        return jsonify({'error': 'Invalid amount provided'}), 400
    except Exception as e:
        # Log the specific exception to help with debugging.
        print(f"An unexpected error occurred: {e}")
        return jsonify({'error': str(e)}), 500

# -----------------------------Se añadio Delete Comments -------------------------


@api.route('/comments/<int:comment_id>', methods=['DELETE'])
@jwt_required()
def delete_comment(comment_id):
    try:
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)

        comment = Comments.query.get(comment_id)
        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Permitir borrar si es admin o autor del comentario
        if not user or (not user.is_admin and comment.user_id != user.id):
            return jsonify({"error": "Unauthorized. Only admin or author can delete"}), 403

        db.session.delete(comment)
        db.session.commit()

        return jsonify({"message": "Comment deleted successfully"}), 200

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500
