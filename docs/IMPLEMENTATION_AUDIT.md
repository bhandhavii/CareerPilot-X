# CareerPilot X — Implementation Audit

Audit basis: source-code inspection of the supplied project archive, route comparison, and TypeScript/CSS syntax checks. This is not a claim that the app passed a live browser end-to-end test.

## Updated in this build

- Light mode now uses a consistent white, pale-blue, navy and blue-accent palette across the dashboard, its hard-coded dark panels, cards, forms, tables, navigation and landing-stage overlay cards. Dark mode rules are left in place.
- DSA Arena's Easy/Medium/Hard difficulty filter has been removed. Topic, status and text search remain. Difficulty labels shown on each question are retained where the source provides them.

## Confirmed limitations / not implemented

1. **Continue with Google is not implemented.** The current authentication modal contains email/password sign-in and registration only. There is no Google OAuth button, OAuth callback, or backend Google-auth route. A Google account cannot sign in through this build.
2. **Live AI needs a provider key.** Without `GEMINI_API_KEY` or `OPENAI_API_KEY` in `server/.env`, Interview Center, Project Mentor and AI Assistant use labelled local practice/template guidance. These fallbacks are usable but are not live generative AI.
3. **Email reminders need SMTP.** CodeChef reminder preferences can be saved without SMTP, but email delivery will not happen until `SMTP_HOST`, `SMTP_USER`, `SMTP_PASS`, and `MAIL_FROM` are configured. The backend must be running at the selected Wednesday reminder time (Asia/Kolkata).
4. **Voice features depend on browser permissions/support.** Speech recognition is only available where the browser exposes `SpeechRecognition`/`webkitSpeechRecognition` (typically Chrome/Edge); microphone permission is required. Text answers remain available.

## Configuration-dependent behavior

- MongoDB is optional for local development: if the connection fails, the backend logs that it is using the resilient JSON-backed store. For production/multi-device persistence, configure and verify MongoDB.
- `JWT_SECRET` must be set to a long private value in `server/.env`; do not leave the example placeholder for a real deployment.
- Vite proxies `/api` to `http://localhost:5000`; the backend must be running on port 5000 while using the frontend at port 5173.

## Checks performed in this audit

- All 58 TypeScript/TSX source files transpiled with zero syntax diagnostics using the installed TypeScript transpiler.
- `client/src/index.css` parsed successfully with PostCSS.
- Client API URL paths were compared with Express route declarations; every static client API path checked has a corresponding server route (dynamic route parameters were treated as matches where applicable).
- The archive's previous build did not complete: the checked-in/current `client/node_modules` was incomplete (missing React/type packages and Vite), and `npm ci` timed out in this environment. Therefore a production Vite build, server typecheck, automated backend tests, and browser-level module tests remain **unverified** and should be run after dependencies install successfully.

## Recommended verification after extraction

1. In `server`, run `npm install`, copy `.env.example` to `.env`, set a strong `JWT_SECRET`, and add AI/SMTP/MongoDB settings only if those features are needed.
2. In `client`, run `npm install`.
3. Run backend and frontend in separate terminals, then check `/api/health` and test account creation/login, dashboard refresh, learning progress, DSA status/notes, interview fallback or live AI, Project Mentor, resume upload, and reminder delivery.
4. Run `npm run build` from the project root and `npm test --prefix server` after dependencies are installed.
