# Unifire Registry

A full-stack fire extinguisher management system for Don Bosco College of Engineering.

## Tech Stack
- **Frontend**: React + Vite + Tailwind CSS v4 + Axios + Papa Parse
- **Backend**: Node.js + Express
- **Database**: Supabase (PostgreSQL)
- **Icons**: Lucide React

## Project Structure
- `frontend/`: React application (Client).
- `backend/`: Node.js Express server (API).

## Setup Instructions

### 1. Backend Configuration
1. Navigate to the `backend` folder.
2. Create a `.env` file.
3. Add your Supabase credentials:
   ```env
   PORT=5000
   SUPABASE_URL=your_supabase_url
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   ```
4. Run: `npm install && npm run dev`

### 2. Frontend Configuration
1. Navigate to the `frontend` folder.
2. Create a `.env` file.
3. Add the backend API URL:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```
4. Run: `npm install && npm run dev`

## Features
- Full CRUD for fire extinguishers.
- Automatic status calculation based on due dates.
- "Mark as Refilled" logic (updates last refilled and adds 1 year to due date).
- Export registry to CSV using Papa Parse.
- Dark mode UI with real-time stats and alerts.
