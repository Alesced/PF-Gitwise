import requests

BASE_URL = "https://fantastic-doodle-pjw4647v49p936xwr-3001.app.github.dev/api"
TOKEN = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmcmVzaCI6ZmFsc2UsImlhdCI6MTc1MzMwMjQwMCwianRpIjoiNjEyNDk0N2ItOWYwNC00MjkyLWFlNmYtZTcxOWU2NTA3MTcwIiwidHlwZSI6ImFjY2VzcyIsInN1YiI6IjEiLCJuYmYiOjE3NTMzMDI0MDAsImNzcmYiOiJkZjZiYTgwMy0wMmUxLTRiZWEtYjkyYy0xY2Q3ZDE5ZDY2NGEiLCJleHAiOjE3NTMzMDMzMDB9.2c329-fOqfcuzNy6zH8sgSLidgC-FL8IowWifsFDztI"  # replace this with your actual token

headers = {
    "Authorization": f"Bearer {TOKEN}",
    "Content-Type": "application/json"
}

posts = [
    {
        "title": "Turn GitHub into your todo list",
        "description": "Use GitHub issues as a personal task manager. This repo by @azu supports tags, automations, and full integration with Actions. Easy to customize. JS-based.",
        "repo_URL": "https://github.com/azu/missue"
    },
    {
        "title": "Plan, track & chat in your terminal",
        "description": "Taskbook by @klaussinani lets you manage todos, notes, and team messages from the command line. Beginner-friendly. Written in Node.js. No setup needed.",
        "repo_URL": "https://github.com/klaussinani/taskbook"
    },
    {
        "title": "Superlight Notion-style notes with Markdown",
        "description": "This one by @tldraw uses Markdown with a block editor feel. Built with TypeScript & React. Easy for journaling or structured docs. Elegant and fast.",
        "repo_URL": "https://github.com/tldraw/simplenote"
    },
    {
        "title": "Self-hosted Trello alternative",
        "description": "Planka is a kanban board like Trello, built in JS/React. This one by @plankanban is ideal for dev teams wanting open-source task boards with socket-powered sync.",
        "repo_URL": "https://github.com/plankanban/planka"
    },
    {
        "title": "TUI dashboard for productivity metrics",
        "description": "Want a top-style productivity tracker? This Python repo by @datarootsio shows real-time goals, coding time, and distractions in the terminal. Advanced setup.",
        "repo_URL": "https://github.com/datarootsio/self-track"
    },
    {
        "title": "Pomodoro timer in the terminal",
        "description": "Tomato.py by @sanket143 is a minimal Python CLI app for Pomodoro sessions. Simple, clean, and beginner-friendly. Helps stay focused without clutter.",
        "repo_URL": "https://github.com/sanket143/tomato.py"
    },
    {
        "title": "Developer habit tracker",
        "description": "DevHabit by @a7ul is a gamified habit tracker built with React and Firebase. Tailored for devs who want to improve consistency. Clean UI, mid-level difficulty.",
        "repo_URL": "https://github.com/a7ul/devhabit"
    },
    {
        "title": "Airtable clone in your browser",
        "description": "Baserow by @baserow lets you create database-driven spreadsheets in the browser. Written in Django + Vue. Full-featured but needs setup. For pros.",
        "repo_URL": "https://github.com/bramw/baserow"
    },
    {
        "title": "All-in-one productivity app",
        "description": "AppFlowy by @appflowy is a Notion alternative for devs. Flutter + Rust stack. Local-first, privacy-focused. Powerful but heavy to run. Advanced.",
        "repo_URL": "https://github.com/AppFlowy-IO/appflowy"
    },
    {
        "title": "Minimal calendar with tasks",
        "description": "Cal by @qix is a lightweight calendar and event manager for the terminal. Built in C. Hardcore minimalism for UNIX fans. Nerdy, no frills.",
        "repo_URL": "https://github.com/qix/cal"
    },
    {
        "title": "Kanban for your CLI",
        "description": "tuKanban by @maaslalani is a beautiful kanban board in your terminal. TUI built with Go. Zero config. If you love command line tools, you’ll love this.",
        "repo_URL": "https://github.com/maaslalani/tukanban"
    },
    {
        "title": "Offline-first Markdown notes",
        "description": "Notes by @laurent22 is a JS-based offline Markdown editor. Clean UI, works across devices. Good for journaling. Beginner friendly.",
        "repo_URL": "https://github.com/laurent22/joplin"
    }
]

# Submit each post
for post in posts:
    res = requests.post(
        f"{BASE_URL}/user/post/1", json=post, headers=headers
    )
    print(res.status_code, res.json())
