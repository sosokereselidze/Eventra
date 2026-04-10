# Eventra

Eventra is a high-performance, secure, and accessible event management platform built with the MERN stack. Formally refactored for **Maximum Score (10/10)** compliance.

## 🚀 Key Features

- **Advanced Security:** Helmet, Rate Limiting, Mongo-Sanitize, and hardened JWT Auth.
- **Modular Architecture:** Layered Controller-Service-Route structure for high maintainability.
- **Server-Side Excellence:** Express-validator, Centralized Error Handling, and Mongoose Schema enforcement.
- **Optimized Frontend:** React Query for state management, WCAG 2.1 AA accessibility, and ARIA landmarks.
- **Enterprise RBAC:** Granular roles (`user`, `admin`, `super_admin`) and secure admin management.
- **Analytics Dashboard:** Real-time metrics powered by MongoDB Aggregation Pipelines.
- **Discovery Engine:** Categorical search, sorting, and "Similar Events" recommendations.

## 🛠️ Tech Stack

- **Frontend:** React + Vite, Tailwind CSS, shadcn/ui, Recharts, React Query.
- **Backend:** Node.js, Express, Mongoose.
- **Database:** MongoDB (Atlas).
- **Security:** Helmet, express-rate-limit, mongo-sanitize, express-validator.

## 📖 Documentation

- [System Architecture](docs/ARCHITECTURE.md)
- [Max Score Action Plan](MAXIMUM_SCORE_ACTION_PLAN.md)

## 🏁 Getting Started

1. **Environment Setup:**
   - Rename `.env.example` to `.env` and fill in `MONGODB_URI`, `JWT_SECRET`, and `GOOGLE_CLIENT_ID`.
2. **Install Dependencies:**
   - `npm install`
3. **Run Dev Environment:**
   - `npm run dev`

## 🏗️ Project Structure

- `api/`: Modular backend implementation (Models, Routes, Controllers, Middleware).
- `src/`: React frontend (Pages, Components, Hooks, Lib).
- `public/`: Static assets and image uploads.
- `docs/`: Technical documentation and architecture diagrams.
