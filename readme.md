# Notes App

A **full-stack Notes App** built with **React** + **Django REST Framework**, using **JWT Authentication**.  
Users can sign up, log in, add, and delete notes. The admin panel allows managing users and notes.  

---

## Features

- **JWT Authentication** (access & refresh tokens)
- **Custom User model** in Django
- **Notes CRUD**:  
  - Add a note  
  - Delete a note  
  - View all notes
- **Admin Panel** for user & note management
-  Responsive React frontend with **TailwindCSS**
- **SQLite3** database

---

## Tech Stack

- **Frontend:** React, React Router, Axios, TailwindCSS  
- **Backend:** Django, Django REST Framework  
- **Authentication:** JWT (JSON Web Tokens)  
- **Database:** SQLite3  
- **Other:** Custom User model, Admin panel  

---

## Installation

### Backend (Django)

1. Clone the repository:
    ```bash
    git clone <repository-url>
    cd backend
    ```

2. Create & activate a virtual environment:
    ```bash
    python -m venv env
    source env/bin/activate  # Linux/macOS
    env\Scripts\activate     # Windows
    ```

3. Install dependencies:
    ```bash
    pip install -r requirements.txt
    ```

4. Apply migrations:
    ```bash
    python manage.py makemigrations
    python manage.py migrate
    ```

5. Create a superuser:
    ```bash
    python manage.py createsuperuser
    ```

6. Run the server:
    ```bash
    python manage.py runserver
    ```

---

### Frontend (React)

1. Navigate to frontend folder:
    ```bash
    cd frontend
    ```

2. Install dependencies:
    ```bash
    npm install
    ```

3. Start the development server:
    ```bash
    npm start
    ```

---

## ⚡ Usage

1. Open `http://localhost:5173` in your browser.  
2. Sign up as a new user 
3. Log in 
4. Access your notes dashboard:  
   - Add new notes   
   - Delete notes   
5. Admin can manage all users and notes at `http://127.0.0.1:8000/admin/` 

---

## Notes

- All API requests are protected with **JWT tokens** 
- Frontend stores **access** & **refresh tokens** in `localStorage`  
- Axios interceptors automatically refresh tokens if expired   

---

## License

This project is licensed under the MIT License.
