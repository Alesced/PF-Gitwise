import requests
import json
import time
from datetime import datetime

# Configuración
BASE_URL = "https://vigilant-space-doodle-jj7x5qqq7wqq2547q-3001.app.github.dev"

# CREDENCIALES - ¡YA ACTUALIZADAS!
USER_EMAIL = "nuevo_usuario@example.com"
USER_PASSWORD = "Password123!"

# Headers
headers = {
    "Content-Type": "application/json"
}

# Mapeo corregido según tus Enums de base de datos
STACK_MAPPING = {
    "javascript": "JAVASCRIPT",
    "node": "JAVASCRIPT",  # Node.js es JavaScript
    "react": "JAVASCRIPT", # React es JavaScript
    "python": "PYTHON",
    "other": "HTML"        # Usamos HTML como valor por defecto para "other"
}

LEVEL_MAPPING = {
    "beginner": "STUDENT",
    "intermediate": "JUNIOR_DEV", 
    "advanced": "MID_DEV"
}

# Lista de posts corregida con los valores correctos de Enum
posts = [
    {
        "title": "Turn GitHub into your todo list",
        "description": "Use GitHub issues as a personal task manager. This repo by @azu supports tags, automations, and full integration with Actions. Easy to customize. JS-based.",
        "repo_URL": "https://github.com/azu/missue",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "STUDENT"      # Corregido
    },
    {
        "title": "Plan, track & chat in your terminal",
        "description": "Taskbook by @klaussinani lets you manage todos, notes, and team messages from the command line. Beginner-friendly. Written in Node.js. No setup needed.",
        "repo_URL": "https://github.com/klaussinani/taskbook",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "STUDENT"      # Corregido
    },
    {
        "title": "Superlight Notion-style notes with Markdown",
        "description": "This one by @tldraw uses Markdown with a block editor feel. Built with TypeScript & React. Easy for journaling or structured docs. Elegant and fast.",
        "repo_URL": "https://github.com/tldraw/simplenote",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "JUNIOR_DEV"   # Corregido
    },
    {
        "title": "Self-hosted Trello alternative",
        "description": "Planka is a kanban board like Trello, built in JS/React. This one by @plankanban is ideal for dev teams wanting open-source task boards with socket-powered sync.",
        "repo_URL": "https://github.com/plankanban/planka",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "JUNIOR_DEV"   # Corregido
    },
    {
        "title": "TUI dashboard for productivity metrics",
        "description": "Want a top-style productivity tracker? This Python repo by @datarootsio shows real-time goals, coding time, and distractions in the terminal. Advanced setup.",
        "repo_URL": "https://github.com/datarootsio/self-track",
        "stack": "PYTHON",      # Corregido
        "level": "MID_DEV"      # Corregido
    },
    {
        "title": "Pomodoro timer in the terminal",
        "description": "Tomato.py by @sanket143 is a minimal Python CLI app for Pomodoro sessions. Simple, clean, and beginner-friendly. Helps stay focused without clutter.",
        "repo_URL": "https://github.com/sanket143/tomato.py",
        "stack": "PYTHON",      # Corregido
        "level": "STUDENT"      # Corregido
    },
    {
        "title": "Developer habit tracker",
        "description": "DevHabit by @a7ul is a gamified habit tracker built with React and Firebase. Tailored for devs who want to improve consistency. Clean UI, mid-level difficulty.",
        "repo_URL": "https://github.com/a7ul/devhabit",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "JUNIOR_DEV"   # Corregido
    },
    {
        "title": "Airtable clone in your browser",
        "description": "Baserow by @baserow lets you create database-driven spreadsheets in the browser. Written in Django + Vue. Full-featured but needs setup. For pros.",
        "repo_URL": "https://github.com/bramw/baserow",
        "stack": "PYTHON",      # Corregido
        "level": "MID_DEV"      # Corregido
    },
    {
        "title": "All-in-one productivity app",
        "description": "AppFlowy by @appflowy is a Notion alternative for devs. Flutter + Rust stack. Local-first, privacy-focused. Powerful but heavy to run. Advanced.",
        "repo_URL": "https://github.com/AppFlowy-IO/appflowy",
        "stack": "HTML",        # Corregido (usando HTML para "other")
        "level": "MID_DEV"      # Corregido
    },
    {
        "title": "Minimal calendar with tasks",
        "description": "Cal by @qix is a lightweight calendar and event manager for the terminal. Built in C. Hardcore minimalism for UNIX fans. Nerdy, no frills.",
        "repo_URL": "https://github.com/qix/cal",
        "stack": "HTML",        # Corregido (usando HTML para "other")
        "level": "MID_DEV"      # Corregido
    },
    {
        "title": "Kanban for your CLI",
        "description": "tuKanban by @maaslalani is a beautiful kanban board in your terminal. TUI built with Go. Zero config. If you love command line tools, you'll love this.",
        "repo_URL": "https://github.com/maaslalani/tukanban",
        "stack": "HTML",        # Corregido (usando HTML para "other")
        "level": "JUNIOR_DEV"   # Corregido
    },
    {
        "title": "Offline-first Markdown notes",
        "description": "Notes by @laurent22 is a JS-based offline Markdown editor. Clean UI, works across devices. Good for journaling. Beginner friendly.",
        "repo_URL": "https://github.com/laurent22/joplin",
        "stack": "JAVASCRIPT",  # Corregido
        "level": "STUDENT"      # Corregido
    }
]

def login_and_get_token():
    """Hace login y obtiene un token válido según tu endpoint"""
    login_data = {
        "email": USER_EMAIL,
        "password": USER_PASSWORD
    }
    
    try:
        print("🔐 Intentando login...")
        response = requests.post(
            f"{BASE_URL}/api/login",
            json=login_data,
            headers=headers,
            timeout=15
        )
        
        print(f"📋 Código de respuesta: {response.status_code}")
        
        if response.status_code == 200:
            response_data = response.json()
            
            # Extraer token según el formato de tu API
            token = response_data.get('token')
            if not token:
                print("❌ No se encontró 'token' en la respuesta")
                print(f"Respuesta completa: {json.dumps(response_data, indent=2)}")
                return None
            
            print(f"✅ Login exitoso! Token obtenido: {token[:30]}...")
            return token
            
        else:
            print(f"❌ Error en login: Código {response.status_code}")
            print(f"Respuesta: {response.text}")
            return None
            
    except Exception as e:
        print(f"❌ Error inesperado durante login: {e}")
        return None

def create_post(post_data, token, retries=2):
    """Intenta crear un post con el token proporcionado"""
    post_headers = headers.copy()
    post_headers["Authorization"] = f"Bearer {token}"
    
    for attempt in range(retries):
        try:
            print(f"   🚀 Intentando crear post (intento {attempt + 1})...")
            
            response = requests.post(
                f"{BASE_URL}/api/user/post/3",
                json=post_data,
                headers=post_headers,
                timeout=30
            )
            
            print(f"   📋 Código de respuesta: {response.status_code}")
            
            if response.status_code == 201:
                print("   ✅ Post creado exitosamente!")
                return True, response
            else:
                print(f"   ⚠️ Error {response.status_code}: {response.text[:100]}...")
                if attempt < retries - 1:
                    time.sleep(1)
                    
        except Exception as e:
            print(f"   🌐 Error de conexión: {e}")
            if attempt < retries - 1:
                time.sleep(2)
    
    return False, None

def create_posts():
    """Función principal para crear posts"""
    
    # 1. Obtener token mediante login
    token = login_and_get_token()
    if not token:
        print("\n❌ No se pudo obtener token.")
        return
    
    print(f"\n🚀 Iniciando creación de {len(posts)} posts...\n")
    
    successful_posts = 0
    failed_posts = 0
    
    for i, post in enumerate(posts):
        try:
            # Pequeña pausa entre requests
            if i > 0:
                time.sleep(1)
            
            print(f"\n📝 [{i+1}/{len(posts)}] Creando: {post['title']}")
            print(f"   🛠️ Stack: {post['stack']}, 📊 Level: {post['level']}")
            
            # Intentar crear el post
            success, response = create_post(post, token)
            
            if success:
                successful_posts += 1
            else:
                failed_posts += 1
                
        except Exception as e:
            print(f"   ❌ Error inesperado: {e}")
            failed_posts += 1
    
    # Resumen final
    print(f"\n{'='*60}")
    print("📊 RESUMEN FINAL")
    print(f"{'='*60}")
    print(f"✅ Posts exitosos: {successful_posts}")
    print(f"❌ Posts fallidos: {failed_posts}")
    if len(posts) > 0:
        print(f"🎯 Tasa de éxito: {(successful_posts/len(posts)*100):.1f}%")
    print(f"{'='*60}")

if __name__ == "__main__":
    print("🐍 Script de creación de posts (VALORES CORREGIDOS)")
    print(f"⏰ Hora de inicio: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"🌐 URL base: {BASE_URL}")
    print(f"👤 Usuario: {USER_EMAIL}")
    
    create_posts()
    
    print(f"\n⏰ Hora de finalización: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")