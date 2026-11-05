# CareerPilot X

CareerPilot X is a student placement-preparation platform built with React, Vite, Node.js, Express and MongoDB.

## Main modules

- Dashboard with activity-based progress and first-time empty states
- My Learning
- Daily Missions
- DSA Arena (the uploaded DSA question list, grouped by topic, with LeetCode practice links)
- Resume Analyzer
- Interview Center (choose an interview area, answer by text or voice, receive relevant AI follow-ups and final feedback)
- Daily Mock Test
- Project Mentor
- Placement Readiness
- AI Assistant
- Profile & Settings

The 3D landing experience is retained. The landing-page sections below it use simpler explanations of the actual platform modules.

## Requirements

- Node.js 20 or newer
- MongoDB Community Server running locally, or a MongoDB connection URI
- npm

## 1. Configure the backend

Open a terminal in the `server` folder:

```bash
npm install
```

Copy `.env.example` to `.env` and set your own JWT secret. The local MongoDB URI shown in the example is suitable when MongoDB is running on the same computer.

```env
PORT=5000
MONGODB_URI=mongodb://127.0.0.1:27017/careerpilot-x
JWT_SECRET=replace_with_a_long_random_secret
GEMINI_API_KEY=
OPENAI_API_KEY=
```

AI features need either a valid `GEMINI_API_KEY` or `OPENAI_API_KEY`. Account signup and login do not need SMTP, OTP or email verification. SMTP values are optional and are only used by the CodeChef reminder feature.

Start the backend:

```bash
npm run dev
```

The API runs at `http://localhost:5000`.

## 2. Configure and start the frontend

Open a second terminal in the `client` folder:

```bash
npm install
npm run dev
```

Open the local Vite URL shown in the terminal (normally `http://localhost:5173`). The Vite development server proxies `/api` requests to the backend at port 5000.

## 3. Production builds

From the project root:

```bash
npm run build
```

Or build each part from its own folder using `npm run build`.

## Interview voice mode

Voice input uses the browser Speech Recognition API and spoken replies use browser speech synthesis. Chrome/Edge support and microphone permission are recommended. If voice input is unavailable, the interview can still be completed by typing.

## Security notes

- Passwords are stored as bcrypt hashes.
- JWT secret and AI provider keys belong only in `server/.env`.
- Do not commit `.env` or share secret keys.
- AI-generated project plans and interview feedback require a configured AI provider; the UI reports configuration errors instead of inventing results.
