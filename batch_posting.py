import requests
import json
import time
from datetime import datetime

# ======================= CONFIGURACIÓN PRINCIPAL =======================
# Asegúrate de que tu backend esté corriendo en esta URL
BASE_URL = "https://vigilant-space-doodle-jj7x5qqq7wqq2547q-3001.app.github.dev"

# Credenciales de un usuario que YA EXISTA en tu base de datos
USER_EMAIL = "test@gmail.com"
USER_PASSWORD = "123456"
USER_ID_TO_POST = 4
# =======================================================================

# Headers para las peticiones
headers = {
    "Content-Type": "application/json"
}

# Lista completa de 20 posts
posts = [
    {
        "title": "Turn GitHub into your todo list",
        "description": "Use GitHub issues as a personal task manager. This repo by @azu supports tags, automations, and full integration with Actions. Easy to customize. JS-based.",
        "repo_URL": "https://github.com/azu/missue",
        "stack": "JAVASCRIPT",
        "level": "STUDENT"
    },
    {
        "title": "Plan, track & chat in your terminal",
        "description": "Taskbook by @klaussinani lets you manage todos, notes, and team messages from the command line. Beginner-friendly. Written in Node.js. No setup needed.",
        "repo_URL": "https://github.com/klaussinani/taskbook",
        "stack": "JAVASCRIPT",
        "level": "STUDENT"
    },
    {
        "title": "Superlight Notion-style notes with Markdown",
        "description": "This one by @tldraw uses Markdown with a block editor feel. Built with TypeScript & React. Easy for journaling or structured docs. Elegant and fast.",
        "repo_URL": "https://github.com/tldraw/simplenote",
        "stack": "JAVASCRIPT",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Self-hosted Trello alternative",
        "description": "Planka is a kanban board like Trello, built in JS/React. This one by @plankanban is ideal for dev teams wanting open-source task boards with socket-powered sync.",
        "repo_URL": "https://github.com/plankanban/planka",
        "stack": "JAVASCRIPT",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "TUI dashboard for productivity metrics",
        "description": "Want a top-style productivity tracker? This Python repo by @datarootsio shows real-time goals, coding time, and distractions in the terminal. Advanced setup.",
        "repo_URL": "https://github.com/datarootsio/self-track",
        "stack": "PYTHON",
        "level": "MID_DEV"
    },
    {
        "title": "Pomodoro timer in the terminal",
        "description": "Tomato.py by @sanket143 is a minimal Python CLI app for Pomodoro sessions. Simple, clean, and beginner-friendly. Helps stay focused without clutter.",
        "repo_URL": "https://github.com/sanket143/tomato.py",
        "stack": "PYTHON",
        "level": "STUDENT"
    },
    {
        "title": "Developer habit tracker",
        "description": "DevHabit by @a7ul is a gamified habit tracker built with React and Firebase. Tailored for devs who want to improve consistency. Clean UI, mid-level difficulty.",
        "repo_URL": "https://github.com/a7ul/devhabit",
        "stack": "JAVASCRIPT",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Airtable clone in your browser",
        "description": "Baserow by @baserow lets you create database-driven spreadsheets in the browser. Written in Django + Vue. Full-featured but needs setup. For pros.",
        "repo_URL": "https://github.com/bramw/baserow",
        "stack": "PYTHON",
        "level": "MID_DEV"
    },
    {
        "title": "All-in-one productivity app",
        "description": "AppFlowy by @appflowy is a Notion alternative for devs. Flutter + Rust stack. Local-first, privacy-focused. Powerful but heavy to run. Advanced.",
        "repo_URL": "https://github.com/AppFlowy-IO/appflowy",
        "stack": "HTML",
        "level": "MID_DEV"
    },
    {
        "title": "Minimal calendar with tasks",
        "description": "Cal by @qix is a lightweight calendar and event manager for the terminal. Built in C. Hardcore minimalism for UNIX fans. Nerdy, no frills.",
        "repo_URL": "https://github.com/qix/cal",
        "stack": "HTML",
        "level": "MID_DEV"
    },
    {
        "title": "Kanban for your CLI",
        "description": "tuKanban by @maaslalani is a beautiful kanban board in your terminal. TUI built with Go. Zero config. If you love command line tools, you'll love this.",
        "repo_URL": "https://github.com/maaslalani/tukanban",
        "stack": "HTML",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Offline-first Markdown notes",
        "description": "Notes by @laurent22 is a JS-based offline Markdown editor. Clean UI, works across devices. Good for journaling. Beginner friendly.",
        "repo_URL": "https://github.com/laurent22/joplin",
        "stack": "JAVASCRIPT",
        "level": "STUDENT"
    },
    {
        "title": "Modern SQL Client for the Terminal",
        "description": "A powerful and intuitive terminal-based SQL client by @dbcli. Supports auto-completion and syntax highlighting for PostgreSQL, MySQL, and more. A must-have for backend devs.",
        "repo_URL": "https://github.com/dbcli/mycli",
        "stack": "SQL",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Minimalist CSS Framework for Prototyping",
        "description": "Pico.css by @picocss provides elegant styles for all native HTML elements without `.classes`. Perfect for beginners who want beautiful, semantic web pages with minimal effort.",
        "repo_URL": "https://github.com/picocss/pico",
        "stack": "CSS",
        "level": "STUDENT"
    },
    {
        "title": "Personal Finance Tracker with Python",
        "description": "Firefly III by @firefly-iii is a self-hosted manager for your personal finances. It helps you track expenses and income. Built with Laravel (PHP) but great for Python devs to study.",
        "repo_URL": "https://github.com/firefly-iii/firefly-iii",
        "stack": "PYTHON",
        "level": "MID_DEV"
    },
    {
        "title": "Interactive Documentation Sites with React",
        "description": "Docusaurus by @facebook helps you build optimized websites for your documentation. It uses React and MDX to create interactive and beautiful docs. Great for any project.",
        "repo_URL": "https://github.com/facebook/docusaurus",
        "stack": "JAVASCRIPT",
        "level": "MID_DEV"
    },
    {
        "title": "Create Mock APIs in Seconds",
        "description": "JSON Server by @typicode is a developer's dream. Get a full fake REST API with zero coding in less than 30 seconds. Incredibly useful for frontend development and prototyping.",
        "repo_URL": "https://github.com/typicode/json-server",
        "stack": "JAVASCRIPT",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Automated Deployment Scripts for Static Sites",
        "description": "A collection of advanced Python scripts by @deploy-scripts to automate the deployment of static websites to services like Netlify, Vercel, or AWS S3. For experienced developers.",
        "repo_URL": "https://github.com/example/deploy-scripts",
        "stack": "PYTHON",
        "level": "SENIOR_DEV"
    },
    {
        "title": "Simple Static Site Generator",
        "description": "Hugo by @gohugoio is one of the fastest static site generators. Written in Go, it's perfect for blogs and portfolios. Simple to start, but powerful enough for complex sites.",
        "repo_URL": "https://github.com/gohugoio/hugo",
        "stack": "HTML",
        "level": "JUNIOR_DEV"
    },
    {
        "title": "Manage Your Dotfiles Like a Pro",
        "description": "Dotbot by @anishathalye is a tool that bootstraps your dotfiles (configuration files like .bashrc, .vimrc). It makes setting up a new machine fast and repeatable. For advanced CLI users.",
        "repo_URL": "https://github.com/anishathalye/dotbot",
        "stack": "HTML", 
        "level": "SENIOR_DEV"
    }
]

def login_and_get_token():
    """Hace login y obtiene el token y el ID del usuario."""
    login_data = {"email": USER_EMAIL, "password": USER_PASSWORD}
    try:
        print("🔐  Intentando login...")
        response = requests.post(
            f"{BASE_URL}/api/login",
            json=login_data,
            headers=headers,
            timeout=15
        )
        print(f"📋 Código de respuesta: {response.status_code}")
        if response.status_code == 200:
            response_data = response.json()
            token = response_data.get('token')
            user_id = response_data.get('user', {}).get('id')
            if not token or not user_id:
                print("❌ No se encontró 'token' o 'user.id' en la respuesta.")
                return None, None
            print(f"✅ Login exitoso! User ID: {user_id}")
            return token, user_id
        else:
            print(f"❌ Error en login: {response.text}")
            return None, None
    except Exception as e:
        print(f"❌ Error inesperado durante login: {e}")
        return None, None

def create_post(post_data, token, user_id):
    """Intenta crear un post con el token y user_id proporcionados."""
    post_headers = headers.copy()
    post_headers["Authorization"] = f"Bearer {token}"
    url = f"{BASE_URL}/api/user/post/{user_id}"
    
    try:
        print(f"    🚀 Enviando a: {url}")
        response = requests.post(
            url,
            json=post_data,
            headers=post_headers,
            timeout=30
        )
        print(f"    📋 Código de respuesta: {response.status_code}")
        if response.status_code == 201:
            print("    ✅ Post creado exitosamente!")
            return True
        else:
            print(f"    ⚠️  Error {response.status_code}: {response.text[:100]}...")
            return False
    except Exception as e:
        print(f"    🌐 Error de conexión: {e}")
        return False

def create_all_posts():
    """Función principal para crear todos los posts."""
    token, user_id_from_login = login_and_get_token()
    if not token:
        print("\n❌ No se pudo obtener token. Abortando.")
        return

    # Usar el ID de la configuración, pero verificar que el login fue exitoso.
    target_user_id = USER_ID_TO_POST

    print(f"\n🚀 Iniciando creación de {len(posts)} posts para el usuario con ID: {target_user_id}...\n")
    successful_posts, failed_posts = 0, 0

    for i, post in enumerate(posts):
        print(f"\n📝 [{i+1}/{len(posts)}] Creando: {post['title']}")
        if create_post(post, token, target_user_id):
            successful_posts += 1
        else:
            failed_posts += 1
        time.sleep(1) # Pausa para no saturar el servidor

    print(f"\n{'='*60}\n📊 RESUMEN FINAL\n{'='*60}")
    print(f"✅ Posts exitosos: {successful_posts}")
    print(f"❌ Posts fallidos: {failed_posts}")
    if posts:
        print(f"🎯 Tasa de éxito: {(successful_posts / len(posts) * 100):.1f}%")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("🐍 Script de creación de posts")
    print(f"⏰ Hora de inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL base: {BASE_URL}")
    print(f"👤 Usuario: {USER_EMAIL}")
    
    create_all_posts()
    
    print(f"\n⏰ Hora de finalización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
