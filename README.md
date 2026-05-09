# GameSet — Tennis Tournament Management Platform

Modern platform for organizing Americano tournaments, mixed doubles, round-robin events, and more.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 18 + Vite + Tailwind v4 + shadcn/ui |
| Backend | FastAPI (Python 3.12) |
| Database | Supabase PostgreSQL |
| Auth | Supabase Auth |
| Realtime | Supabase Realtime |
| Deployment | Railway + Docker |

---

## Project Structure

```
game-set/
├── frontend/          # React/Vite app
│   ├── src/
│   │   ├── components/  # UI + feature components
│   │   ├── pages/       # Route pages (all fully functional)
│   │   ├── lib/         # Supabase client, API client, utils
│   │   ├── contexts/    # AuthContext
│   │   └── types/       # TypeScript types
│   ├── Dockerfile
│   └── package.json
├── backend/           # FastAPI
│   ├── app/
│   │   ├── api/v1/routes/  # All API routes
│   │   ├── core/           # Config, dependencies
│   │   ├── schemas/        # Pydantic models
│   │   └── services/       # Americano engine
│   ├── Dockerfile
│   └── requirements.txt
├── supabase/
│   └── migrations/    # SQL schema + RLS policies
├── .github/workflows/ # CI/CD
├── docker-compose.yml
└── railway.toml
```

---

## Quick Start

### 1. Clone & Setup

```bash
git clone https://github.com/prgilangdwi/game-set.git
cd game-set
```

### 2. Supabase Setup

1. Go to your Supabase project dashboard
2. Run migrations in SQL editor:
   - `supabase/migrations/001_initial_schema.sql`
   - `supabase/migrations/002_rls_policies.sql`
3. Copy your `service_role` key from Settings → API

### 3. Backend

```bash
cd backend
cp .env.example .env
# Fill in SUPABASE_SERVICE_KEY in .env
pip install -r requirements.txt
uvicorn app.main:app --reload
# API at http://localhost:8000
# Docs at http://localhost:8000/docs (DEBUG=true)
```

### 4. Frontend

```bash
cd frontend
cp .env.example .env
npm install   # or pnpm install
npm run dev
# App at http://localhost:5173
```

### 5. Docker (full stack)

```bash
cp .env.example .env  # fill in keys
docker compose up
# Frontend: http://localhost:3000
# Backend: http://localhost:8000
```

---

## Core Features

- **Authentication** — Supabase Auth (email + Google)
- **Tournament Creation** — 4-step wizard, 8 formats
- **Americano Scheduler** — minimizes repeated partners/opponents, balances courts and skill
- **Live Scoring** — inline score editing with Supabase Realtime sync
- **Standings** — auto-computed by DB trigger on match completion
- **Public Pages** — shareable `/t/:id` URL with live standings
- **Player Management** — add/remove players, check-in, skill levels

---

## Americano Algorithm

Located in [backend/app/services/americano_engine.py](backend/app/services/americano_engine.py).

Generates rounds with:
1. **Teammate penalty ×10** — avoids pairing same players together
2. **Opponent penalty ×5** — distributes opponent variety
3. **Skill balance** — minimizes rating gap between teams
4. **Mixed doubles** — enforces 1M+1F per team when format=`mixed_doubles`
5. **Court balance** — equalizes playing time across all players

Uses randomized search (200 candidates per round) selecting minimum penalty.

---

## Deployment

### Railway

1. Push to GitHub
2. Connect Railway to your repo
3. Set environment variables in Railway dashboard
4. Deploy — Railway uses `railway.toml`

### Environment Variables (Railway)

```
SUPABASE_URL
SUPABASE_ANON_KEY
SUPABASE_SERVICE_KEY
ALLOWED_ORIGINS=https://your-frontend.railway.app
```

---

## License

MIT
