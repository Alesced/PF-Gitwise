"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity

api = Blueprint('api', __name__)
bcrypt = Bcrypt()
# Allow CORS requests to this API
CORS(api)


@api.route('/hello', methods=['POST', 'GET'])
def handle_hello():

    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the GET request"
    }

    return jsonify(response_body), 200
#------------------------Routes for user registration and authentication------------------------

@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')

    if not all([email, password, name, last_name, username]):
        return jsonify({"error": "All fields are required"}), 400

    # verify if the user already exists
    if User.query.filter_by(email=email).first():
        return jsonify({"error": "Email already exists"}), 400
    if User.query.filter_by(username=username).first():
        return jsonify({"error": "Username already exists"}), 400

    # Create a new user instance
    # utf-8 decode is used to convert the hashed password to a string
    hashed_password = bcrypt.generate_password_hash(password).decode('utf-8')
    new_user = User(email=email,
                    password=hashed_password,
                    name=name,
                    last_name=last_name,
                    username=username)
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token
    access_token = create_access_token(identity=new_user.id)

    return jsonify({"message": "User registered successfully", "token": access_token, "id": new_user.id}), 201

#------------------------Routes for Contacts us------------------------
@api.route('/contact', methods=['POST'])
def handle_contact():
    data = request.get_json()
    name = data.get('name')
    email = data.get('email')
    message = data.get('message')

    if not all([name, email, message]):
        return jsonify({"error": "All fields are required"}), 400

    # Here you would typically send an email or save the contact message to the database
    response_body = {
        "message": "Thank you for contacting us! We will get back to you soon."
    }

    return jsonify(response_body), 200

#------------------------Routes for user login------------------------
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
            "title": post.title or "(No title)"   # Si no tiene título, muestra texto alternativo
        }
        for post in user.say   # user.say es la relación User -> Post (one-to-many)
    ]

    # CAMBIO - Generar lista real de favoritos (favorites)
    # Extrae IDs de post desde relación "user.star" (favorites)
    favorites = [fav.post_id for fav in user.star]   # user.star es User -> Favorites


    # CAMBIO - Preparar objeto JSON con toda la info real del usuario.
    user_data = {
        "id": user.id,
        "username": user.username,
        "email": user.email,
        "name": user.name,
        "last_name": user.last_name,
        "avatar_url": "https://avatars.githubusercontent.com/u/000000?v=4",   # Imagen que se puede modificar despues
        "join_date": user.member_since.isoformat(),    # Fecha de registro exacta 

        "my_posts": my_posts,                          # Posts reales asociados al usuario.
        "favorites": favorites                         # Favoritos reales (IDs de posts)
    }

    # Retorna token + datos del usuario al frontend
    return jsonify({
        "message": "Login successful",
        "token": access_token,      # Token JWT
        "user": user_data           # Todos los datos del usuario
    }), 200



#------------------------Routes for New Post------------------------
@api.route('/post', methods=['POST'])
@jwt_required()
def handle_new_post():
    user_id_row= get_jwt_identity()
    user_id = str(user_id_row)
    data = request.get_json()
    title = data.get('title')
    image_URL = data.get('image_URL')
    description = data.get('description')
    repo_URL = data.get('repo_URL')

    if not description or not title or not repo_URL:
        return jsonify({"msg": "Description, title and repo_URL are required"}), 400
    
    post = Post(
        user_id=user_id,
        title=title,
        image_URL=image_URL,
        description=description,
        repo_URL=repo_URL
    )
    db.session.add(post)
    db.session.commit()

    return jsonify({"msg": "Post created successfully", "post": post.serialize()}), 201

#------------------------Routes for Search-IA------------------------
@api.route('/search-ia', methods=['POST'])
@jwt_required()
def handle_search_ia():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the POST request"
    }

    return jsonify(response_body), 200

#------------------------Routes for comments a post------------------------
@api.route('/post/<int:post_id>/comments', methods=['POST'])
@jwt_required()
def handle_comments(post_id):
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    text = data.get('text')

    if not text:
        return jsonify({"msg": "Text is required"}), 400
    
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404
    
    comments = Comments(
        user_id=user_id,
        post_id=post_id,
        title=title,
        text=text
    )
    db.session.add(comments)
    db.session.commit()

    return jsonify({"msg": "Comment added successfully", "comment": comments.serialize()}), 201








