# Eventra Pro - Architecture & Implementation

This document describes the refactored architecture of Eventra Pro, designed for maximum security, scalability, and performance (10/10 Score Action Plan).

## System Overview

Eventra Pro follows a modern, layered MERN architecture with a focus on modularity and security.

### 1. Backend Layer (Node.js + Express)

The backend has been refactored from a monolithic `index.js` into a structured, modular system:

- **Entry Point (`api/index.js`)**: Initializes the Express app, applies global security middleware, and mounts modular routes.
- **Routes (`api/routes/`)**: Defines API endpoints for Auth, Events, Bookings, and Admin.
- **Controllers (`api/controllers/`)**: Contains the business logic for each resource.
- **Middleware (`api/middleware/`)**:
  - `errorHandler.js`: Centralized global error handling.
  - `authMiddleware.js`: JWT-based authentication and RBAC (Role-Based Access Control).
  - `validationMiddleware.js`: Request body/param validation using `express-validator`.
- **Models (`api/models/`)**: Mongoose schemas for `User`, `Event`, and `Booking` with strict validation and indexing.

### 2. Frontend Layer (React + Vite)

- **State Management**: Migrated from manual `fetch` to **React Query (@tanstack/react-query)** for robust server-state management, caching, and optimistic updates.
- **Design System**: Built with Tailwind CSS and Radix UI primitives (via shadcn/ui), ensuring a premium, consistent look.
- **Accessibility (WCAG 2.1)**: Implemented semantic HTML, ARIA landmarks, and keyboard navigation.
- **Search & Filtering**: Fully optimized server-side search and filtering for high performance with large datasets.

### 3. Security Implementation

- **Headers**: `helmet` for OWASP-compliant security headers.
- **Rate Limiting**: `express-rate-limit` to prevent Brute Force and DoS attacks.
- **Data Protection**: `mongo-sanitize` to prevent NoSQL injection.
- **Input Validation**: Strict schema enforcement via Mongoose and request validation via `express-validator`.
- **Auth Hardening**: Collation-based case-insensitive lookups to mitigate ReDoS and identifier injection.

### 4. Database Optimization

- **Mongoose Migration**: Transitioned from raw MongoDB driver to Mongoose for schema enforcement.
- **Aggregation Pipelines**: Rewritten analytics and complex joins (Admin Dashboard) as MongoDB aggregation pipelines for O(1) or O(log n) efficiency.
- **Indexing**: Optimized compound indexes on frequently queried fields (`date`, `category`, `user_id`).

### 5. Deployment & DevOps

- **CI/CD**: Configured GitHub Actions for automated linting and testing.
- **Environment Management**: Hardened `.env` usage for all sensitive credentials.
- **Unified Entry Point**: Optimized `server.js` (or `api/index.js`) for Vercel/Vite serverless deployments.

---

## Innovation Features

1. **Recommendation Engine**: Basic "Similar Events" algorithm based on categorical similarity and availability.
2. **Event Favorites**: Persistent user interest tracking.
3. **Advanced RBAC**: Granular roles (`user`, `admin`, `super_admin`) for enterprise-ready management.
