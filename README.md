# Realtime Product Dashboard – Frontend

This is the Next.js app that you see in the browser. It lets a demo admin log in, manage products stored in Firestore, and view a couple of charts on the analytics page.

You don’t need to touch any framework boilerplate – the important entry points are the `/login`, `/products`, and `/analytics` routes.

---

## Running the frontend

From the `frontend` folder:

```bash
npm install
npm run dev
```

Then open `http://localhost:3000` in your browser.

- `/login` – sign in with the demo user.
- `/products` – realtime product table (CRUD + status toggle).
- `/analytics` – bar + pie chart based on products.

### Demo login

These credentials must match the backend’s hard‑coded user:

- **Email:** `admin@example.com`
- **Password:** `Admin@123`

If you ever change them, update both this file and `auth.service.ts` in the backend.

---

## Configuration

Create a `.env.local` file in `frontend/`:

```bash
NEXT_PUBLIC_API_BASE_URL=http://localhost:4000/api

# Firebase client config (same project the backend uses)
NEXT_PUBLIC_FIREBASE_API_KEY=YOUR_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=YOUR_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID=YOUR_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_APP_ID=YOUR_FIREBASE_APP_ID
```

You only need to set these once; after that `npm run dev` should just work.

---

## What’s inside

Just the pieces that matter for the assignment:

- `app/(public)/login` – login form using React Hook Form + Zod.
- `app/(protected)/products` – product table (TanStack Table) with Shadcn dialogs.
- `app/(protected)/analytics` – analytics view using Shadcn charts + Recharts.
- `features/*` – RTK Query slices for auth, products, analytics.
- `components/ui` – Shadcn UI components (button, card, dialog, chart, …).

The rest is standard Next.js plumbing.

---

## Production build

```bash
npm run build
npm start
```

Point `NEXT_PUBLIC_API_BASE_URL` at your deployed backend and the app should behave exactly the same as it does locally.
