# Goal-Forge — Local Development & Testing

This repo contains the Goal-Forge application (frontend + backend). The following instructions help you run everything locally and test both frontend and backend.

## Prerequisites
- Docker & Docker Compose (for local DB)
- Node.js (16+ recommended)
- npm

## Quick local run (recommended)
1. Copy `.env.example` to `.env` and set values (optional). For local dev, docker-compose provides a DB with default credentials.

2. Start services:

   docker-compose up --build

   This will:
   - Start PostgreSQL on port 5432
   - Build the app image, run `drizzle-kit push` to create the schema, then start the server on port 5000

3. Check health:

   GET http://localhost:5000/api/health

4. Seed demo data (dev only):

   POST http://localhost:5000/api/dev/seed

   If `DEV_SEED_TOKEN` is set in your `.env`, include it as `?token=<token>`.

5. Open the frontend in development mode:

   cd client
   npm install
   npm run dev

   The frontend will connect to the API (same origin in production). For dev, configure your API base as needed.

## Running migrations manually

Make sure `DATABASE_URL` is set.

  npm run db:push

## Tests
- Integration and E2E tests are planned (I'll add Playwright/Cypress if you want). For now, you can call the health and seed endpoints to validate the app flow.

## Deployment plan
- I will use Supabase for Postgres, Render for backend, and Vercel for frontend by default. I can provision these for you or prepare CI scripts so you can deploy with minimal steps.

