# Campus Connect

Campus Connect is a student-focused platform built to make campus life easier. It helps students buy, sell, and exchange books, notes, study materials, and other essentials in a safe and simple way. Students can also connect with peers, chat, share updates, and discover campus listings from one place.

This project is designed for students who want a faster and more convenient way to trade academic resources and stay connected with their campus community.

---

## Project Structure

```
campus_connect/
├── backend/    # Node.js + Express + MongoDB + Socket.IO
└── frontend/   # React + TanStack Router + Vite + Tailwind
```

---

## What this project does

- Buy and sell books, notes, and study materials
- Post listings for campus items and academic resources
- Chat with students directly through the platform
- Discover useful items shared by peers
- Keep everything in one student community marketplace

---

## Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Firebase project (for Google Auth)
- Cloudinary account (for image uploads)

---

## Backend Setup

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on port 5000
```

### Required environment variables (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | Server port (default 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `JWT_SECRET` | Random 64-char secret |
| `JWT_EXPIRES_IN` | Token expiry (e.g. `7d`) |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase private key (with `\n`) |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `CLIENT_URL` | Frontend URL for CORS (e.g. `http://localhost:8080`) |

---

## Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env   # fill in your values
npm run dev            # starts on port 8080
```

### Required environment variables (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | Backend API URL (e.g. `http://localhost:5000/api`) |
| `VITE_FIREBASE_API_KEY` | Firebase web API key |
| `VITE_FIREBASE_AUTH_DOMAIN` | Firebase auth domain |
| `VITE_FIREBASE_PROJECT_ID` | Firebase project ID |
| `VITE_FIREBASE_STORAGE_BUCKET` | Firebase storage bucket |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Firebase messaging sender ID |
| `VITE_FIREBASE_APP_ID` | Firebase app ID |

---

## Deployment

### Backend — Render / Railway / Fly.io
1. Set all environment variables in the platform dashboard
2. Build command: `npm install`
3. Start command: `npm start`

### Frontend — Cloudflare Pages / Vercel / Netlify
1. Set all `VITE_*` environment variables in the platform dashboard
2. Build command: `npm run build`
3. Output directory: `dist`

---

## Tech Stack

**Backend:** Node.js, Express, MongoDB (Mongoose), Firebase Admin, Cloudinary, Socket.IO, JWT  
**Frontend:** React 19, TanStack Router, TanStack Query, Vite, Tailwind CSS v4, Framer Motion, Socket.IO Client
