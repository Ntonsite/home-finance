# Household Consumption & Cost Intelligence System

A full-stack web portal to track and analyze variable household expenses (excluding rent) with quantity-based tracking and monthly analytics.

## Tech Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL, Prisma ORM
- **Authentication**: JWT-based auth
- **Infrastructure**: Fully Dockerized

## Prerequisites
- Docker
- Docker Compose

## Quick Start
1. Clone the repository.
2. Initialize environment variables from `.env.example` to `.env` in the root (optional, or rely on defaults).
3. Run `docker-compose up -d --build` to start the PostgreSQL database, Backend API, and Frontend application.

### Default Credentials
- **Username**: admin
- **Password**: admin123

## Ports
- **Frontend**: `http://localhost:80`
- **Backend API**: `http://localhost:3000`
- **Database**: `localhost:5432`

## Project Structure
- `/frontend`: React code with Vite config and TailwindsCSS
- `/backend`: Node.js Express server with Prisma Schema and Seed scripts
- `docker-compose.yml`: Services definitions

## License
MIT
