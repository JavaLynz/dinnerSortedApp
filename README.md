# dinnerSortedApp

An AI-driven meal planner. Users input ingredients they have at home and dietary preferences, and the app generates a multi-day menu with a shopping list for missing items.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend | Java 21, Spring Boot 3 |
| Frontend | React 18, Vite |
| AI | OpenAI API |
| Auth & DB | Supabase |
| Backend deploy | Railway |
| Frontend deploy | Vercel |

## Project Structure
dinnerSortedApp/
├── backend/    # Spring Boot REST API

└── frontend/   # React 18 + Vite

## Getting Started

### Backend
```bash
cd backend
cp .env.example .env   # fill in your keys
./mvnw spring-boot:run
```
Runs on `http://localhost:8080`

### Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # fill in your keys
npm run dev
```
Runs on `http://localhost:5173`

## Environment Variables

See `backend/.env.example` and `frontend/.env.example` — never commit real keys.

## Examensarbete

Built as a graduation project at Edugrade Gävle. See `/docs` for kravdokument and wireframes.
