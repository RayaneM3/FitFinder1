# Fit Finder

## Overview
A privacy-first, client-initiated fitness marketplace. Clients browse trainers, initiate conversations, and purchase training plans. Trainers cannot cold-message clients. Location is shown at city level only.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | React 19, TypeScript, Vite, Wouter, TanStack Query, shadcn/ui, TailwindCSS v4 |
| **Backend** | Node.js, Express 5, TypeScript |
| **Database** | PostgreSQL, Drizzle ORM |
| **Payments** | Stripe Connect (Standard) |
| **Authentication** | Session-based (express-session + connect-pg-simple) |

## Getting Started

1. Clone the repository
2. Copy `.env.example` to `.env` and fill in all required values
3. Run `npm install` to install dependencies
4. Run `npm run db:push` to create database tables
5. Run `npm run dev` to start both frontend and backend on port 5000

## Project Structure

- `client/src/pages/` — React page components
- `client/src/components/` — Shared UI components (shadcn/ui)
- `client/src/lib/` — Auth context, query client, utilities
- `server/` — Express API routes, storage layer, WebSocket
- `shared/schema.ts` — Database schema (shared between client and server)

## Key Features

- Multi-step onboarding for trainers and clients
- Role system: CLIENT, TRAINER, or BOTH
- Real-time messaging
- Stripe Connect payments with 12.8% platform fee
- Trainer explore page with filters (specialty, location, price, coaching mode)
- Profile strength meter
- Block/report system
- Legal acceptance tracking

## Environment Variables

Reference the `.env.example` file for all required configuration. Key variables:

| Variable | Description |
|----------|-------------|
| `DATABASE_URL` | PostgreSQL connection string |
| `SESSION_SECRET` | Secret for session cookies (generate 64-character random string) |
| `PORT` | Server port (default: 5000) |
| `NODE_ENV` | Runtime environment (development or production) |
| `APP_URL` | Base URL of the application |
| `STRIPE_SECRET_KEY` | Stripe API secret key |
| `STRIPE_CLIENT_ID` | Stripe Connect client ID |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook signing secret |
| `RESEND_API_KEY` | Resend email API key |
| `FROM_EMAIL` | Sender email address |

## Deployment

- **Frontend**: Vercel (or any static host)
- **Backend**: Railway (or any Node.js host)
- **Database**: Railway PostgreSQL (or Neon, Supabase)

## License

Proprietary — All rights reserved
