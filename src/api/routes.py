"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User
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

    return jsonify({"message": "User registered successfully", "token": access_token}), 201

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

    # Generate JWT token
    access_token = create_access_token(identity=user.id)
    return jsonify({"message": "Login successful", "token": access_token}), 200

#------------------------Routes for New Post------------------------
@api.route('/post', methods=['POST'])
@jwt_required()
def handle_new_post():
    user_id = get_jwt_identity()
    data = request.get_json()
    title = data.get('title')
    imagen_URL = data.get('image_URL')
    description = data.get('description')
    repo_URL = data.get('repo_URL')

    if not description or not title or not repo_URL:
        return jsonify({"msg": "Description, title and repo_URL are required"}), 400
    
    post = Post(
        user_id=user_id,
        title=title,
        image_URL=imagen_URL,
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
    user_id = get_jwt_identity()
    data = request.get_json()
    query = data.get('query')

#here we need to implement the api call to the IA service
    # For now, we will just return the query as a response
    if not query:
        return jsonify({"msg": "Query is required"}), 400




