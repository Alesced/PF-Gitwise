"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments, Level, Stack, Likes
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
import smtplib
import ssl
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os
from api.utils import send_email

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
# ------------------------Routes for user registration and authentication------------------------

@api.route('/register', methods=['POST'])
def register_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')
    name = data.get('name')
    last_name = data.get('last_name')
    username = data.get('username')
    level = data.get('level')
    stack = data.get('stack')

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
                    username=username,
                    level=level,
                    stack=stack)
    db.session.add(new_user)
    db.session.commit()

    # Generate JWT token
    access_token = create_access_token(identity=new_user.id)

    return jsonify({"message": "User registered successfully", "token": access_token, "id": new_user.id}), 201

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

        # Posts reales asociados al usuario.
        "my_posts": my_posts,
        # Favoritos reales (IDs de posts)
        "favorites": favorites
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

        if not all([title, description, repo_URL]):
            return jsonify({"error": "Faltan campos requeridos"}), 400

        new_post = Post(
            user_id=user_id,  # Usamos el user_id de la URL
            title=title,
            description=description,
            repo_URL=repo_URL,
            image_URL=data.get('image_URL')
        )

        db.session.add(new_post)
        db.session.commit()

        return jsonify({"message": "Post creado", "post": new_post.serialize()}), 201

    except Exception as e:
        db.session.rollback()
        return jsonify({"error": str(e)}), 500

# ------------------------Routes for Search-IA------------------------


@api.route('/search-ia', methods=['POST'])
@jwt_required()
def handle_search_ia():
    response_body = {
        "message": "Hello! I'm a message that came from the backend, check the network tab on the google inspector and you will see the POST request"
    }

    return jsonify(response_body), 200

# ------------------------Routes for comments a post------------------------


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
        return jsonify({"error": str(e)}), 500


#-----------------------Routes for Likes to Comments------------------------
@api.route('/comments/<int:comment_id>/like', methods=['POST', 'DELETE'])
@jwt_required()
def like_comment(comment_id):
    try:
        user_id = get_jwt_identity()
        comment = Comments.query.get(comment_id)

        if not comment:
            return jsonify({"error": "Comment not found"}), 404

        # Check if the user has already liked this comment
        existing_like = Likes.query.filter_by(
            user_id=user_id, 
            comments_id=comment_id
        ).first()

        # handle POST request to like a comment
        if request.method == 'POST':
            if existing_like:
                return jsonify({
                    "error": "You have already liked this comment", 
                    "comment_id": comment_id
                }), 400

            new_like = Likes(
                user_id=user_id, 
                comments_id=comment_id
            )
            db.session.add(new_like)
            action = "liked"

        # handle DELETE request to unlike a comment
        elif request.method == 'DELETE':
            if not existing_like:
                return jsonify({
                    "error": "You have not liked this comment", 
                    "comment_id": comment_id
                }), 404

            db.session.delete(existing_like)
            action = "unliked"
        
        db.session.commit()

        # Return the updated like count for the comment
        like_count = Likes.query.filter_by(comments_id=comment_id).count()

        return jsonify({
            "success": True,
            "message": f"You have successfully {action} the comment",
            "comment_id": comment_id,
            "like_count": like_count,
            "has_liked": request.method == 'POST' # This will indicate if the user has liked the comment
         }), 200 if request.method == "DELETE" else 201  

    except Exception as e:
        return jsonify({"error": str(e)}), 500




