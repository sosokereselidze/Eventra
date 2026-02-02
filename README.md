# Eventra Pro

Eventra Pro is a modern event management and booking platform built with the MERN stack (MongoDB, Express, React, Node.js). It offers a seamless experience for users to discover events and for administrators to manage them.

## Key Features

- **Google Authentication:** Secure login and registration using Google accounts.
- **Event Discovery:** Browse and search for upcoming events by category.
- **Instant Booking:** Secure ticket booking with real-time availability tracking.
- **Admin Dashboard:** Comprehensive tools for managing events, users, and bookings.
- **Analytics:** Visual data representation of revenue, users, and event distribution.
- **Responsive Design:** Optimized for both desktop and mobile devices.

## Tech Stack

- **Frontend:** React, Vite, Tailwind CSS, shadcn/ui, Recharts.
- **Backend:** Node.js, Express.
- **Database:** MongoDB.
- **Authentication:** JWT, Google OAuth 2.0.

## Getting Started

1. **Environment Setup:**
   - Configure your `.env` file with `MONGODB_URI`, `GOOGLE_CLIENT_ID`, and `VITE_GOOGLE_CLIENT_ID`.
2. **Install Dependencies:**
   - Run `npm install` in the root directory.
3. **Run the Application:**
   - Use `npm run dev` to start both the frontend and backend concurrently.

## Project Structure

- `server/`: Backend API implementation and database logic.
- `src/`: React frontend components and pages.
- `public/`: Static assets and uploaded images.
