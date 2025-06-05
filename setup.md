# Localization Manager Setup Guide

This guide will help you set up and run the localization management application with the FastAPI backend and Next.js frontend.

## Prerequisites

- **Python 3.12+** (for backend)
- **Node.js 18+** (for frontend)
- **PostgreSQL** database (via Supabase or local installation)
- **Poetry** (recommended for Python dependency management)

## Backend Setup

1. **Navigate to the backend directory:**
   ```bash
   cd backend
   ```

2. **Create a virtual environment (optional but recommended):**
    ```bash
    python -m venv venv
    source venv/bin/activate  # On Windows use `venv\Scripts\activate`
    ```

3.  **Install dependencies:**
    ```bash
    pip install -r requirements.txt
    ```

4. **Set up environment variables:**
   ```bash
   cp .env.example .env
   ```
   
   Edit the `.env` file with your database credentials:
   ```env
   SUPABASE_URL=your_supabase_project_url
   SUPABASE_KEY=your_supabase_anon_key
   ```

5. **Set up the database:**
   - Used the API keys provided in .env.local.example
   - Tables already created

6. **Run the backend:**
   ```bash
   # Using Poetry
   poetry run uvicorn src.localization_management_api.main:app --reload
   
   # Or using Python directly
   python -m uvicorn src.localization_management_api.main:app --reload
   ```

   The API will be available at `http://localhost:8000`

## Frontend Setup

1. **Navigate to the frontend directory:**
   ```bash
   cd frontend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp .env.local.example .env.local
   ```
   
   The `.env.local` file should contain:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:8000
   NEXT_PUBLIC_DEV_MODE=true
   ```

4. **Run the frontend:**
   ```bash
   npm run dev
   ```

   The application will be available at `http://localhost:3000`