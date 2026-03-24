# Action Plan to Reach Maximum Score (10/10)

## 1. Architecture & Code Quality

**Current issues:**
- Single monolithic ~760-line backend file with all routes/logic mixed together
- No separation of concerns (controllers, services, route modules)
- Repeated try/catch blocks instead of a central error handler

**Target state:**
- Layered architecture with routes, controllers, services, and middleware separated
- Single error-handling pattern
- Reusable validation middleware

**Concrete changes:**
1. Split backend into: `api/routes/`, `api/controllers/`, `api/middleware/`, `api/services/`, `api/utils/`
2. Create route modules: `auth.js`, `events.js`, `bookings.js`, `admin.js` — mount via `app.use('/api/auth', authRoutes)`, etc.
3. Add central error-handling middleware: `(err, req, res, next)` that returns consistent JSON and logs
4. Extract business logic into services; keep controllers thin (validate → call service → respond)
5. Use a validation library (express-validator) consistently instead of ad-hoc `if (!x)` checks

---

## 2. Frontend (React)

**Current issues:**
- Admin page uses manual fetch + local state instead of React Query
- Search/filter is client-side only — no server-side search API
- Limited accessibility (ARIA landmarks, keyboard nav, focus management)

**Target state:**
- Server-side search/filter for events
- React Query for all server state (including Admin)
- WCAG 2.1 AA compliance (semantic HTML, ARIA, keyboard nav)

**Concrete changes:**
1. Refactor Admin page: use `useQuery` for users, bookings, analytics; `useMutation` for mutations; invalidate queries on success
2. Add server-side search: `/api/events?search=...&category=...&sort=date` — implement filtering in backend; pass query params from Events page
3. Accessibility: add `<main>`, `aria-label` on nav/forms, semantic headings (`<h1>` hierarchy), ensure keyboard navigation works, add `aria-live` for dynamic content (toasts), proper `alt` text on images (avoid empty `alt=""` unless decorative)

---

## 3. Backend (Node.js + Express)

**Current issues:**
- No request validation layer — relies on minimal checks like `if (!eventData.title)`
- No central error handler
- No server-side search/filter for events
- Raw `req.body` spread into documents without sanitization

**Target state:**
- All inputs validated with express-validator before use
- Central error handler for consistent 4xx/5xx responses
- Events API supports `?search=`, `?category=`, `?sort=`, `?featured=`

**Concrete changes:**
1. Add express-validator: validate body/params/query on every route; return 400 with field-level errors if invalid
2. Add global error handler: `app.use((err, req, res, next) => { ... })` — map error types to status codes, don’t leak stack traces in production
3. Extend GET `/api/events`: accept `search`, `category`, `sort`, `featured` query params; build MongoDB filter; return filtered, sorted results
4. Consider API versioning (e.g. `/api/v1/`) for future compatibility

---

## 4. Database (MongoDB)

**Current issues:**
- No schema layer — implicit schemas, no validation or type coercion
- DB name mismatch: `eventra_db` in code vs `eventflow` in .env.example
- No migrations or schema documentation

**Target state:**
- Explicit schemas with Mongoose (or similar) — validation, casting, middleware
- Consistent DB name from env; document in README
- Index strategy documented; compound indexes where needed

**Concrete changes:**
1. Introduce Mongoose models for User, Event, Booking — define schemas with types, required fields, defaults, validation
2. Add compound indexes for common queries (e.g. `{ featured: 1, date: 1 }` for featured events)
3. Fix DB name: use `eventflow` or `eventra` consistently; derive from MONGODB_URI
4. Document schema in `docs/SCHEMA.md` or README

---

## 5. Features & Functionality

**Current issues:**
- Super Admin is username-based only — no proper RBAC
- No email verification, booking confirmations, or event favorites
- No server-side search — limits scalability

**Target state:**
- Role-based access (user, admin, super_admin) stored in DB
- Booking confirmation flow (email or UI)
- At least one standout feature beyond basic CRUD

**Concrete changes:**
1. Add `role` field to User schema: `user` | `admin` | `super_admin`; Super Admin via role + env, not hardcoded username
2. Booking confirmation: send email on booking (Nodemailer/SendGrid) or at minimum a clear confirmation UI with receipt
3. Event favorites: add `POST/DELETE /api/events/:id/favorite`, `GET /api/events/favorites`; store in user or separate collection; UI with heart icon
4. Implement server-side search for events (see Backend section)
5. Optional: email verification on signup

---

## 6. Performance & Optimization

**Current issues:**
- Analytics loads all users, events, bookings into memory — doesn’t scale
- N+1 pattern in admin bookings (fetch user/event per booking in loop)
- No caching (Redis) or lazy loading

**Target state:**
- Aggregation pipelines for analytics — no full collection loads
- Batched/joined queries instead of loops
- Caching for hot endpoints; lazy loading for images/code-splitting

**Concrete changes:**
1. Rewrite analytics: use MongoDB `$group`, `$lookup`, `$project` for revenue, category stats, recent activity — avoid `find({}).toArray()` then in-memory reduce
2. Admin bookings: use `$lookup` to join events/users in a single aggregation query
3. Add Redis (or in-memory) cache for `/api/events/featured`, `/api/events` with short TTL; cache key includes query params
4. Frontend: lazy-load routes with `React.lazy` + `Suspense`; add `loading="lazy"` on event images

---

## 7. Security

**Current issues:**
- No helmet (security headers)
- No rate limiting (brute-force risk on login)
- No NoSQL injection protection (mongo-sanitize)
- No CSRF protection
- Auth uses `new RegExp(\`^${identifier}$\`, 'i')` — ReDoS / injection risk if identifier contains regex chars
- Minimal password validation (length only)
- Default JWT secret in development — dangerous if deployed

**Target state:**
- Security headers (helmet), rate limiting, input sanitization
- Safe auth logic; strong password rules
- No default secrets in production

**Concrete changes:**
1. Add helmet: `npm install helmet` → `app.use(helmet())`
2. Add rate limiting: `npm install express-rate-limit` — global (e.g. 100 req/15min) + stricter for `/api/auth/login` and `/api/auth/signup` (5/15min)
3. Add mongo-sanitize: sanitize `req.body`, `req.query`, `req.params` before using in queries
4. Fix auth regex: don’t put user input directly into RegExp; use `$eq` with normalized string or escape regex chars
5. Add express-validator on all routes — validate types, lengths, formats
6. Strengthen password: min 8 chars, require letter + number; validate on backend
7. Remove default JWT secret: require `JWT_SECRET` env var; fail startup if missing in production
8. Consider CSRF tokens for state-changing requests if using cookie-based auth

---

## 8. DevOps & Deployment

**Current issues:**
- No CI/CD, tests, or Docker
- Uploads to local filesystem — doesn’t work on Vercel serverless (ephemeral)
- Unused env vars (ADMIN_PASSWORD)
- No health-check or monitoring guidance

**Target state:**
- CI/CD pipeline (GitHub Actions); automated tests; Docker optional
- Cloud storage for uploads (S3, Vercel Blob)
- Clear env documentation; health endpoint for monitoring

**Concrete changes:**
1. Add CI: GitHub Actions — `npm run lint`, `npm test` on push/PR
2. Add tests: Jest/Vitest for unit; Supertest for API integration (auth, events CRUD, bookings)
3. Move uploads to S3/Vercel Blob/Cloudflare R2 — store URLs in DB; remove local `public/uploads` dependency
4. Document all env vars in README; remove or implement ADMIN_PASSWORD
5. Extend `/api/health` to verify DB connection; add simple uptime check for monitoring

---

## 9. Documentation & Maintainability

**Current issues:**
- README says `server/` but actual folder is `api/`
- Project naming inconsistent (Eventra Pro vs eventflow-pro)
- No API documentation (OpenAPI/Swagger)

**Target state:**
- Accurate README with correct structure and naming
- API documentation (OpenAPI/Swagger)
- Architecture overview for onboarding

**Concrete changes:**
1. Update README: fix structure section (`api/`, not `server/`); align name (EventFlow Pro or Eventra Pro)
2. Add API docs: OpenAPI/Swagger — document endpoints, request/response schemas, auth
3. Create `docs/ARCHITECTURE.md`: high-level diagram (frontend ↔ API ↔ DB), auth flow, folder structure
4. Add JSDoc for key functions; inline comments for non-obvious logic

---

## 10. Innovation & Uniqueness

**Current issues:**
- Standard event CRUD + booking — nothing that differentiates from typical project
- Cookie consent and Web Share are nice but not unique

**Target state:**
- At least one clearly differentiated feature or standout UX

**Concrete changes:**
1. Add real-time: WebSocket or polling for ticket availability; live "X tickets left" updates
2. Event recommendations: "You might also like" based on category or past bookings
3. Calendar export: add to calendar (iCal/Google) for booked events
4. QR code tickets: generate QR for each booking; scan at entrance (demo)
5. Waitlist for sold-out events: users can join; notify when tickets become available
6. Polish: skeleton loaders, optimistic updates, undo for booking cancellation

---

## Summary Checklist

| Category | Key Action |
|----------|------------|
| 1. Architecture | Split API into routes/controllers/services; central error handler |
| 2. Frontend | React Query for Admin; server-side search; a11y (ARIA, keyboard) |
| 3. Backend | express-validator; central error handler; events search/filter API |
| 4. Database | Mongoose schemas; fix DB name; document schema |
| 5. Features | RBAC; booking confirmation; favorites; server-side search |
| 6. Performance | Aggregation pipelines; $lookup; Redis cache; lazy loading |
| 7. Security | Helmet; rate limit; mongo-sanitize; fix auth regex; validation; JWT secret |
| 8. DevOps | CI/CD; tests; cloud uploads; env docs |
| 9. Documentation | Fix README; OpenAPI; ARCHITECTURE.md |
| 10. Innovation | Add 1–2 standout features (real-time, recommendations, QR, etc.) |

---

## Priority Order (Highest Impact First)

1. **Security** — Helmet, rate limiting, validation, fix auth regex
2. **Backend refactor** — Routes, controllers, central error handler
3. **Validation** — express-validator on all inputs
4. **Documentation** — Fix README, add API docs
5. **Performance** — Analytics aggregation, bookings $lookup
6. **Features** — Server-side search, RBAC, favorites
7. **Frontend** — Admin React Query, a11y
8. **DevOps** — CI, tests, cloud storage
9. **Database** — Mongoose, schema docs
10. **Innovation** — Standout features
