# Professional MCQs Question Bank & Admin Panel

## Quick Start Guide (Local Laptop Setup)

### 1. Prerequisites
- **Node.js** v18+ installed (https://nodejs.org)
- **MongoDB Atlas URI** (or local MongoDB instance `mongodb://127.0.0.1:27017/question_bank`)

### 2. Install Dependencies
Open a terminal in this root folder and run:
```bash
npm run install:all
```

### 3. Configure Environment Variables
Copy `backend/.env.example` to `backend/.env` and fill in your MongoDB connection string:
```bash
cp backend/.env.example backend/.env
```

### 4. Seed Initial Super Admin Account
```bash
npm run seed:admin
```
*(Default login: `admin@iftikharzahid.me` / `Admin@123456`)*

### 5. Run Backend & Frontend
Open **two terminal tabs**:
- **Terminal 1 (Backend API - Port 5000):**
  ```bash
  npm run dev:backend
  ```
- **Terminal 2 (React Frontend - Port 5173):**
  ```bash
  npm run dev:frontend
  ```

Open **http://localhost:5173/qb/** for the Student Portal and **http://localhost:5173/qb/admin/login** for the Admin Panel.
