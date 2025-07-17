"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments, Level, Stack
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
@api.route('/login', methods=['POST'])
def login_user():
    data = request.get_json()
    email = data.get('email')
    password = data.get('password')

    if not email or not password:
        return jsonify({"error": "Email and password are required"}), 400

    # Verify user credentials
    user = User.query.filter_by(email=email).first()

    # Check if user exists and password matches
    if not user or not bcrypt.check_password_hash(user.password, password):
        return jsonify({"error": "Invalid email or password"}), 401

    # Generate JWT token ------> Aqui hubo una edicion
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful", "token": access_token, "id": user.id, "name": user.name,"last_name": user.last_name, "username": user.username, "email": user.email, "stack": user.stack.value if user.stack else None, "level": user.level.value if user.level else None }), 200

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

#------------------- Route GET and PUT user Profile--------------------------------------------
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
            update_fields = ['email', 'name', 'last_name', 'username', 'stack', 'level']
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





