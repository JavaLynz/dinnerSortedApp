# 🍽️ Dinner Sorted

> **AI-powered meal planning that turns Sunday prep into a sorted week.**

**Live app → [dinnersorted.app](https://app.dinnersorted.app)**

Dinner Sorted solves the daily "what's for dinner?" problem with AI-generated weekly meal plans personalised to your household — dietary needs, batch cooking preferences, and what's already in your fridge. Each plan comes with a smart shopping list for what's missing.

Built as a full-stack SaaS product and official graduation project (examensarbete) at Edugrade, Sweden.

---

## ✨ Features

- **AI meal plan generation** — personalised weekly plans via the OPEN AI API
- **Household profiles** — dietary preferences, family size, batch cook preferences
- **Smart shopping list** — auto-generated from the weekly plan, grouped by category
- **Sunday Sorted flow** — designed around a weekly planning rhythm, not daily chaos
- **Auth & user accounts** — secure login via Supabase Auth
- **Responsive UI** — works on mobile and desktop

---

## 🛠 Tech Stack

| Layer | Technology |
|-------|------------|
| Backend | Java 21, Spring Boot 3, REST API |
| Frontend | React 18, Vite |
| AI | OPEN AI API |
| Auth & Database | Supabase (PostgreSQL) |
| Backend deploy | Render |
| Frontend deploy | Vercel |
| Testing | JUnit 5, Mockito (TDD throughout) |
| CI/CD | GitHub Actions |

---

## 📁 Project Structure

```
dinnerSortedApp/
├── backend/        # Spring Boot REST API (Java 21)
│   ├── src/main/java/
│   │   ├── controllers/    # REST endpoints
│   │   ├── services/       # Business logic + Claude API integration
│   │   ├── models/         # JPA entities
│   │   └── repositories/   # Data access layer
│   └── src/test/           # JUnit + Mockito tests
└── frontend/       # React 18 + Vite
    └── src/
        ├── components/     # UI components
        ├── pages/          # Route-level views
        └── lib/            # Supabase client, API helpers
```

---

## 🚀 Getting Started

### Prerequisites
- Java 21+
- Node.js 18+
- A [Supabase](https://supabase.com) project
- An [OPEN AI](https://platform.openai.com/api-keys) API key

### Backend

```bash
cd backend
cp .env.example .env   # add your keys (see Environment Variables below)
./mvnw spring-boot:run
```

Runs on `http://localhost:8080`

### Frontend

```bash
cd frontend
npm install
cp .env.example .env.local   # add your keys
npm run dev
```

Runs on `http://localhost:5173`

---

## 🔐 Environment Variables

Never commit real keys. See `backend/.env.example` and `frontend/.env.example` for required variables.

**Backend needs:**
```
OPENAI_API_KEY=
SUPABASE_URL=
SUPABASE_SERVICE_KEY=
```

**Frontend needs:**
```
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_API_BASE_URL=
```

---

## 🧪 Testing

TDD applied throughout. Run backend tests with:

```bash
cd backend
./mvnw test
```

Unit and integration tests written with JUnit 5 and Mockito.

---

## 📚 Background

Built as an official graded examensarbete at [Edugrade](https://edugrade.se), Sweden (Agil Javautvecklare programme, graduating June 2026).

The project applies the full programme curriculum in a real production context: Spring Boot, REST APIs, JPA/Hibernate, OAuth/Supabase auth, TDD, CI/CD, and cloud deployment.

See `/docs` for kravdokument and wireframes.

---

## 👩‍💻 Author

**Lynsey Fox** — [linkedin.com/in/lynseyfox](https://linkedin.com/in/lynseyfox) · [dinnersorted.app](https://app.dinnersorted.app)
