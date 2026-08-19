# De'Day Pool Villa

Customer-facing booking site for De'Day Pool Villa — React + Vite + TypeScript + Tailwind CSS v4, LINE LIFF login, talking to the [Go/Gin backend](../deday-pool-villa-backend) for all data.

## Setup

1. Copy `.env.example` to `.env.local` and set `VITE_API_BASE_URL` (the backend's URL) and `VITE_LIFF_ID` (your LINE LIFF app ID).
2. `npm install`
3. `npm run dev` — starts on http://localhost:5173

Requires the backend running (see `../deday-pool-villa-backend/README.md`) for any page that fetches data.

## Notes

- LINE LIFF login requires HTTPS, so testing the real login flow locally needs an ngrok tunnel (and a second tunnel for the backend, since the browser will block a mixed-content HTTP fetch from an HTTPS page).
- `npm run build` type-checks (`tsc -b`) then builds with Vite; `npm run preview` serves the production build locally.
