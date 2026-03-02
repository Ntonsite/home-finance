# Home Portal - Household Consumption & Cost Intelligence System

A full-stack web portal designed to track and analyze variable household expenses (such as groceries, utilities, and fuel) featuring quantity-based tracking, budgeting, and comprehensive monthly analytics. 

## 🌐 Live Access
- **Public IP**: `http://51.20.193.1`

## 🛠 Tech Stack
- **Frontend**: React (Vite), TypeScript, TailwindCSS, Recharts
- **Backend**: Node.js, Express, PostgreSQL, Prisma ORM
- **Authentication**: JWT-based Authentication & Role-Based Access Control
- **Infrastructure**: Fully Dockerized with HAProxy load balancing

## 📋 Prerequisites
- Docker
- Docker Compose

## 🚀 Quick Start
1. Clone the repository.
2. Copy the `.env.example` to `.env` in the root directory (optional, but recommended to customize settings).
3. Run `docker-compose up -d --build` to start the required services (PostgreSQL, HAProxy, Backend API, and Frontend application).

### 🔑 Default Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🔌 Ports / Services
- **HAProxy / Main Entry**: `http://localhost:80` (or `http://51.20.193.1` in production)
- **Backend API**: `http://localhost:3000`
- **Database**: `localhost:5432`

## 📁 Project Structure
- `/frontend`: React application using Vite and TailwindCSS for styling.
- `/backend`: Node.js Express server with Prisma Schema migrations and Seed scripts.
- `/haproxy`: Configuration for the HAProxy reverse proxy/load balancer.
- `docker-compose.yml`: Defines all services, networks, and volumes for container deployment.

## 📄 License
This project is licensed under the MIT License.
