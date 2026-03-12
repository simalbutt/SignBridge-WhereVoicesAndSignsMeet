# SignBridge – Where Voices and Signs Meet

---

## Overview
SignBridge is an inclusive e-learning platform designed specifically for deaf and mute students. Inspired by Google Classroom, it allows teachers to create classes, upload lecture materials (text, PDFs, documents, and videos), and post announcements. Students can view content, interact through comments, and ask questions seamlessly.

Lecture videos include text captions and a sign language avatar that translates content into sign language. Students can submit queries via text or by recording/uploading sign language videos, which are automatically converted to text for teachers — enabling smooth two-way communication.

---

## Features
- Teacher management of virtual classrooms  
- Upload and access lecture materials (text, PDFs, documents, videos)  
- Video captions and sign language avatar translation  
- Student interaction via text and sign language video comments  
- Automatic translation of student sign language videos to text for teachers  
- Announcement and notification system  

---

## Tech Stack
- **Backend:** Django & Django REST Framework (DRF)  
- **Frontend:** React.js (Vite-powered)  
- **Database:** PostgreSQL  
- **Authentication:** JWT or Django sessions  
- **Other:** Python-dotenv for environment variables, Axios for API calls  

---

## Folder Structure
```text
SignBridge-WhereVoicesAndSignsMeet/
├── backend/                 # Django backend
│   ├── core/                # Django project settings
│   ├── apps/                # Django apps (users, classes, lectures, comments)
│   ├── media/               # Uploaded media files
│   ├── staticfiles/         # Collected static files
│   ├── requirements.txt     # Python dependencies
│   └── manage.py
├── frontend/                # React frontend
│   ├── src/                 # React components, pages, and API calls
│   ├── public/              # Public assets
│   ├── package.json         # Node dependencies
│   └── vite.config.js
├── venv/                    # Virtual environment (shared)
├── .env                     # Environment variables (local)
├── .gitignore
└── README.md
````

---

## Installation & Setup

### 1. Clone the repository

```bash
git clone <repo-url>
cd SignBridge-WhereVoicesAndSignsMeet
```

### 2. Create & activate virtual environment

```bash
python -m venv venv
venv\Scripts\activate      # Windows
# OR source venv/bin/activate   # Mac/Linux
```

### 3. Backend setup (Django + DRF)

```bash
cd backend
pip install -r requirements.txt
```

### 4. Configure environment variables

* Create a `.env` file at the **project root** with contents like:

```
SECRET_KEY=your_django_secret_key
DEBUG=True
DB_NAME=signbridge_db
DB_USER=signbridge_user
DB_PASSWORD=yourpassword
DB_HOST=127.0.0.1
DB_PORT=5432
```

* Make sure your `backend/core/settings.py` reads these variables using `python-dotenv`:

```python
import os
from dotenv import load_dotenv

load_dotenv()

DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql',
        'NAME': os.getenv('DB_NAME'),
        'USER': os.getenv('DB_USER'),
        'PASSWORD': os.getenv('DB_PASSWORD'),
        'HOST': os.getenv('DB_HOST'),
        'PORT': os.getenv('DB_PORT'),
    }
}

SECRET_KEY = os.getenv('SECRET_KEY')
DEBUG = os.getenv('DEBUG') == 'True'
```

### 5. Apply migrations & run backend

```bash
python manage.py migrate
python manage.py runserver
```

### 6. Frontend setup (React)

```bash
cd frontend
npm install
npm run dev
```

### 7. Access the application

* Frontend: `http://localhost:5173`
* Backend API: `http://127.0.0.1:8000/`

---

## CORS Configuration

* The backend has CORS enabled to allow requests from the React frontend (`localhost:5173`).
* Ensure `django-cors-headers` is installed and added to `INSTALLED_APPS` and `MIDDLEWARE`.

---

## Purpose

SignBridge bridges the communication gap between teachers and deaf or mute students by integrating accessibility-focused features and AI-driven technologies into modern online education. It enables seamless interaction through text, video, and sign language translations.

---

## Final Year Project (FYP)

This project is developed as a **Final Year Project**, demonstrating a **full-stack solution** for inclusive education. It highlights Django, React, PostgreSQL, and accessibility features such as sign language video translation and automatic text conversion.

---

## Notes

* Virtual environment is shared at the project root (`venv/`). Activate it before running backend commands.
* Media files uploaded by students or teachers are stored in `backend/media/`.
* Frontend API calls use Axios; endpoints are defined in `frontend/src/api/`.
* PostgreSQL server runs locally on port `5432`.
* Keep `.env` secret; **do not commit it** to Git.
