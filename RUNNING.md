# Running SafeVoice 🛡️

Follow these steps to get the SafeVoice reporting platform running locally or via Docker.

## Prerequisites
- **Node.js**: v20 or v22 (recommended)
- **PostgreSQL**: Local instance or Docker-based
- **Docker & Docker Compose**: (Optional, for containerized run)

---

## 1. Local Development Setup

### Backend (Server)
1. Navigate to the server directory:
   ```bash
   cd server
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Configure environment variables:
   - Ensure `server/.env` exists and has the correct `DATABASE_URL`.
4. Initialize the database:
   ```bash
   npm run db:migrate
   npm run db:seed
   ```
5. Start the server in development mode:
   ```bash
   npm run dev
   ```

### Frontend (Client)
1. Navigate to the client directory:
   ```bash
   cd client
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite dev server:
   ```bash
   npm run dev
   ```
   *The app will be available at `http://localhost:5173`.*

---

## 2. Docker Setup (Alternative)

If you prefer using Docker to run the entire stack (PostgreSQL, Backend, Frontend):

1. From the root directory:
   ```bash
   docker-compose up --build
   ```
2. The application will be available at `http://localhost:8080`.

---

## Troubleshooting

- **Missing Scripts**: If you get "npm error Missing script", ensure you are in the correct directory (`server` or `client`) and that `package.json` contains the scripts.
- **Database Connection**: Ensure your PostgreSQL service is running and the `DATABASE_URL` in `server/.env` is correct.
- **Node Version**: If you encounter issues with `node --watch`, ensure you are using Node.js v18.11.0 or higher.
