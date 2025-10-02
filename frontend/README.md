# 🎮 Juego de Rol Web (RPG)

Proyecto académico de aplicación web para la gestión de personajes de un **juego de rol**, con roles diferenciados:  
- **GM (Game Master)**: administra el catálogo global y controla personajes.  
- **Jugador**: elige personajes disponibles y gestiona los suyos.  

Desarrollado con **Django REST Framework (backend)** y **React + Vite (frontend)**.  

---
---

## 🧑‍💻 Funcionalidades principales

- **Rol GM (Game Master)**:
  - Administrar catálogos de razas, poderes, habilidades y equipamientos.
  - Crear personajes y definir sus opciones de habilidades.
  - Subir nivel, cambiar estado (VIVO, MUERTO, CONGELADO) y liberar personajes.

- **Rol Jugador**:
  - Elegir personajes disponibles en el pool.
  - Seleccionar exactamente 2 habilidades de las opciones definidas por el GM.
  - Ver y administrar únicamente sus personajes.

---

## 🔄 CI/CD

El proyecto cuenta con **GitHub Actions** que corren automáticamente en cada push/pull request:  
- Backend: instala dependencias, corre migraciones y ejecuta `pytest`.  
- Frontend: instala dependencias, corre `npm run test` y compila con `vite build`.  

Workflows ubicados en `.github/workflows`.

---

## 🛡️ Seguridad aplicada

- Contraseñas encriptadas con Django.  
- Tokens JWT para autenticación.  
- Intentos de login limitados con `django-axes`.  
- Validación estricta de datos en backend.  
- Auditoría de acciones en el modelo `AuditLog` y en archivo `audit.log`.  

## 🚀 Tecnologías principales

- **Backend**: Django 5, Django REST Framework, SimpleJWT, SQLite (dev) / PostgreSQL (prod).
- **Frontend**: React 18 + Vite, Tailwind CSS.
- **Pruebas**: Pytest, Vitest, Testing Library, Cypress (E2E).
- **CI/CD**: GitHub Actions.
- **Seguridad**: JWT, validación de datos, auditoría de acciones, control de accesos por rol.

---

## ⚙️ Instalación del proyecto

```bash
# 1. Clonar repositorio
git clone https://github.com/tuusuario/juego-rol-web.git
cd juego-rol-web

# 2. Configuración backend
cd backend
python -m venv .venv
source .venv/bin/activate        # Linux / Mac
.venv\Scripts\activate           # Windows
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# 3. Configuración frontend
cd ../frontend
npm install
npm run dev

# 4. Variables de entorno
# backend/.env
DEBUG=True
SECRET_KEY=tu_clave
ALLOWED_HOSTS=127.0.0.1,localhost
CORS_ALLOWED_ORIGINS=http://127.0.0.1:5173

# frontend/.env.development
VITE_API_URL=http://127.0.0.1:8000

# 4. Pruebas
# Backend
cd backend
pytest -q

# Frontend
cd frontend
npm run test

# End-to-End
cd frontend
npx cypress open


