import requests
import json
import time

# Configuración
BASE_URL = "https://musical-spoon-5grwqxxxrjxj3v6jg-3001.app.github.dev"  # Cambia esto a tu URL base
# Necesitarás obtener un token nuevo 
TOKEN = "TU_TOKEN_AQUI"  # Reemplaza con tu token actual

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

# Lista de posts a crear
posts = [
    {
        "title": "Turn GitHub into your todo list",
        "description": "Use GitHub issues as a personal task manager. This repo by @azu supports tags, automations, and full integration with Actions. Easy to customize. JS-based.",
        "repo_URL": "https://github.com/azu/missue",
        "stack": "javascript",
        "level": "beginner"
    },
    {
        "title": "Plan, track & chat in your terminal",
        "description": "Taskbook by @klaussinani lets you manage todos, notes, and team messages from the command line. Beginner-friendly. Written in Node.js. No setup needed.",
        "repo_URL": "https://github.com/klaussinani/taskbook",
        "stack": "node",
        "level": "beginner"
    },
    {
        "title": "Superlight Notion-style notes with Markdown",
        "description": "This one by @tldraw uses Markdown with a block editor feel. Built with TypeScript & React. Easy for journaling or structured docs. Elegant and fast.",
        "repo_URL": "https://github.com/tldraw/simplenote",
        "stack": "react",
        "level": "intermediate"
    },
    {
        "title": "Self-hosted Trello alternative",
        "description": "Planka is a kanban board like Trello, built in JS/React. This one by @plankanban is ideal for dev teams wanting open-source task boards with socket-powered sync.",
        "repo_URL": "https://github.com/plankanban/planka",
        "stack": "react",
        "level": "intermediate"
    },
    {
        "title": "TUI dashboard for productivity metrics",
        "description": "Want a top-style productivity tracker? This Python repo by @datarootsio shows real-time goals, coding time, and distractions in the terminal. Advanced setup.",
        "repo_URL": "https://github.com/datarootsio/self-track",
        "stack": "python",
        "level": "advanced"
    },
    {
        "title": "Pomodoro timer in the terminal",
        "description": "Tomato.py by @sanket143 is a minimal Python CLI app for Pomodoro sessions. Simple, clean, and beginner-friendly. Helps stay focused without clutter.",
        "repo_URL": "https://github.com/sanket143/tomato.py",
        "stack": "python",
        "level": "beginner"
    },
    {
        "title": "Developer habit tracker",
        "description": "DevHabit by @a7ul is a gamified habit tracker built with React and Firebase. Tailored for devs who want to improve consistency. Clean UI, mid-level difficulty.",
        "repo_URL": "https://github.com/a7ul/devhabit",
        "stack": "react",
        "level": "intermediate"
    },
    {
        "title": "Airtable clone in your browser",
        "description": "Baserow by @baserow lets you create database-driven spreadsheets in the browser. Written in Django + Vue. Full-featured but needs setup. For pros.",
        "repo_URL": "https://github.com/bramw/baserow",
        "stack": "python",
        "level": "advanced"
    },
    {
        "title": "All-in-one productivity app",
        "description": "AppFlowy by @appflowy is a Notion alternative for devs. Flutter + Rust stack. Local-first, privacy-focused. Powerful but heavy to run. Advanced.",
        "repo_URL": "https://github.com/AppFlowy-IO/appflowy",
        "stack": "other",
        "level": "advanced"
    },
    {
        "title": "Minimal calendar with tasks",
        "description": "Cal by @qix is a lightweight calendar and event manager for the terminal. Built in C. Hardcore minimalism for UNIX fans. Nerdy, no frills.",
        "repo_URL": "https://github.com/qix/cal",
        "stack": "other",
        "level": "advanced"
    },
    {
        "title": "Kanban for your CLI",
        "description": "tuKanban by @maaslalani is a beautiful kanban board in your terminal. TUI built with Go. Zero config. If you love command line tools, you'll love this.",
        "repo_URL": "https://github.com/maaslalani/tukanban",
        "stack": "other",
        "level": "intermediate"
    },
    {
        "title": "Offline-first Markdown notes",
        "description": "Notes by @laurent22 is a JS-based offline Markdown editor. Clean UI, works across devices. Good for journaling. Beginner friendly.",
        "repo_URL": "https://github.com/laurent22/joplin",
        "stack": "javascript",
        "level": "beginner"
    }
]

def create_posts():
    successful_posts = 0
    failed_posts = 0
    
    for i, post in enumerate(posts):
        try:
            # Añadir un pequeño retraso para evitar sobrecargar el servidor
            if i > 0:
                time.sleep(0.5)
                
            print(f"Creating post {i+1}/{len(posts)}: {post['title']}")
            
            # Hacer la solicitud POST
            res = requests.post(
                f"{BASE_URL}/api/user/post/1",  # Nota la barra diagonal añadida
                json=post,
                headers=headers,
                timeout=30  # Añadir timeout
            )
            
            # Verificar la respuesta
            if res.status_code == 201:
                print(f"✓ Post creado exitosamente: {post['title']}")
                successful_posts += 1
            else:
                print(f"✗ Error al crear post: {res.status_code} - {res.text}")
                failed_posts += 1
                
        except requests.exceptions.RequestException as e:
            print(f"✗ Error de conexión: {e}")
            failed_posts += 1
        except Exception as e:
            print(f"✗ Error inesperado: {e}")
            failed_posts += 1
    
    print(f"\nResumen: {successful_posts} posts exitosos, {failed_posts} fallos")

if __name__ == "__main__":
    print("Iniciando creación de posts...")
    create_posts()