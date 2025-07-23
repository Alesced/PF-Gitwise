

import os
from flask import Flask, request, jsonify, url_for, send_from_directory
from flask_migrate import Migrate
from flask_swagger import swagger
from flask_cors import CORS
from flask_bcrypt import Bcrypt
from flask_jwt_extended import JWTManager
from api.utils import APIException, generate_sitemap
from api.models import db
from api.routes import api
from api.admin import setup_admin
from api.commands import setup_commands
from dotenv import load_dotenv
import stripe

ENV = "development" if os.getenv("FLASK_DEBUG") == "1" else "production"
static_file_dir = os.path.join(os.path.dirname(os.path.realpath(__file__)), '../dist/')

# 1. Esto es para stripe. Cargar variables de entorno.
load_dotenv()

# 2. Configurar Stripe.
stripe.api_key = os.getenv('STRIPE_SECRET_KEY')

app = Flask(__name__)

# 🔐 Seguridad
app.config["JWT_SECRET_KEY"] = "secret-key"
jwt = JWTManager(app)
bcrypt = Bcrypt(app)

# 🌐 CORS para todos los orígenes
CORS(app, supports_credentials=True, origins="*", methods=["GET", "POST", "PUT", "DELETE", "OPTIONS"])

# 🔧 Headers manuales CORS
@app.after_request
def apply_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "*"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, PUT, DELETE, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    return response

app.url_map.strict_slashes = False

# 💾 Configuración de Base de Datos
db_url = os.getenv("DATABASE_URL")
if db_url is not None:
    app.config['SQLALCHEMY_DATABASE_URI'] = db_url.replace("postgres://", "postgresql://")
else:
    app.config['SQLALCHEMY_DATABASE_URI'] = "sqlite:////tmp/test.db"

app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
MIGRATE = Migrate(app, db, compare_type=True)
db.init_app(app)

# ⚙️ Setup extra
setup_admin(app)
setup_commands(app)

# 📡 Registrar Blueprint de la API
app.register_blueprint(api, url_prefix='/api')

# 🛠 Error handler
@app.errorhandler(APIException)
def handle_invalid_usage(error):
    return jsonify(error.to_dict()), error.status_code

# 📍 Sitemap en desarrollo
@app.route('/')
def sitemap():
    if ENV == "development":
        return generate_sitemap(app)
    return send_from_directory(static_file_dir, 'index.html')

# 🌐 Catch-all para rutas frontend
@app.route('/<path:path>', methods=['GET'])
def serve_any_other_file(path):
    if not os.path.isfile(os.path.join(static_file_dir, path)):
        path = 'index.html'
    response = send_from_directory(static_file_dir, path)
    response.cache_control.max_age = 0
    return response

# 🧪 Fallback para 404: React routing
@app.errorhandler(404)
def not_found(e):
    return send_from_directory(static_file_dir, 'index.html')

# 🚀 Arranque local
if __name__ == '__main__':
    PORT = int(os.environ.get('PORT', 3001))
    app.run(host='0.0.0.0', port=PORT, debug=True)