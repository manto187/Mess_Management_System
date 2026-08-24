# Mess Management System (میس مینجمنٹ سسٹم)

A production-ready, mobile-first Mess Management System with a focus on simplicity and Urdu-friendly interface.

## Tech Stack
- **Frontend**: Next.js 16 (Latest), Tailwind CSS 4, shadcn/ui, Lucide Icons.
- **Backend**: NestJS, Prisma ORM (v7), PostgreSQL.
- **Auth**: JWT-based authentication with protected routes.

## Core Features
- **Urdu Interface**: Fully translated UI with Noto Nastaliq Urdu font.
- **Simple Dashboard**: Card-based overview for quick insights.
- **Member Management**: Add, update, and toggle active status for mess members.
- **Meal Tracking**: Daily meal recording (Breakfast, Lunch, Dinner).
- **Expense Tracking**: Categorized mess expenses.
- **Payment Management**: Month-wise payment tracking with one-click "Paid" status.
- **Responsive Design**: Optimized for mobile use in the kitchen/mess.

## Getting Started

### 1. Prerequisitess
- Node.js 20+
- PostgreSQL (or Docker to run the included `docker-compose.yml`)

### 2. Database Setup
Start the local PostgreSQL database:
```bash
docker compose up -d
```

### 3. Backend Setup
1. Go to the backend directory: `cd backend`
2. Install dependencies: `npm install`
3. Configure `.env` (check `.env` for defaults)
4. Generate Prisma client: `npm run prisma:generate`
5. Push schema to database: `npm run prisma:push`
6. Start dev server: `npm run start:dev`

### 4. Frontend Setup
1. Go to the frontend directory: `cd frontend`
2. Install dependencies: `npm install`
3. Configure `.env.local`
4. Start dev server: `npm run dev`

## Architecture
- **Backend**: Follows NestJS feature-based modular structure. Uses Clean Architecture principles by separating concerns into Controllers, Services, and DTOs. Prisma acts as the Repository layer.
- **Frontend**: Uses Next.js App Router with a centralized state management (`store/auth.context.tsx`) and reusable UI components in `components/ui`.

## Design Philosophy
- **Large Touch Targets**: High buttons and inputs for easy mobile use.
- **Soft Colors**: Emerald and Teal gradients for a premium, calming feel.
- **Minimalist**: Cards instead of complex tables to reduce cognitive load for non-technical users.

## Roadmap

- [ ] QR Code Attendance
- [ ] SMS Notifications
- [ ] WhatsApp Notifications
- [ ] Expense Analytics
- [ ] PDF Reports
- [ ] Multi-language Support
- [ ] Dark Mode
- [ ] Offline Mode
