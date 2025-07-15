"""
This module takes care of starting the API Server, Loading the DB and Adding the endpoints
"""
from flask import Flask, request, jsonify, url_for, Blueprint
from api.models import db, User, Post, Comments, Likes
from api.utils import generate_sitemap, APIException
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager, create_access_token, jwt_required, get_jwt_identity
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
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
    access_token = create_access_token(identity=str(user.id))
    return jsonify({"message": "Login successful", "token": access_token, "id": user.id}), 200

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

#------------------------Routes for Get, Edit and Delete Post by ID------------------------
@api.route('/post/<int:post_id>', methods=['GET', 'PUT', 'DELETE'])
@jwt_required()
def handle_post_by_id(post_id):
    # GET: Return post. PUT: Update post. DELETE: Delete post.
    #verify if the post exists
    post = Post.query.get(post_id)
    if not post:
        return jsonify({"msg": "Post not found"}), 404
    
    #verify if the user is the owner of the post
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


