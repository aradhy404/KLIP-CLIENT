# Klip V1 frontend

A React + Vite frontend scaffold for **Klip — Keep track. Keep it fair.** Uses a dark charcoal / emerald-lime visual system, responsive layout, login/register screens, dashboard, people list, activity filtering, entry details, and an add-entry modal.

## Run it

```bash
npm install
cp .env.example .env
npm run dev
```

On Windows PowerShell, use `Copy-Item .env.example .env` instead of `cp`.

Vite normally starts at `http://localhost:5173`.

## Connect the existing backend

Set `VITE_API_BASE_URL` to the URL where Express is listening. The default is `http://localhost:5000`.

The default endpoint paths are configurable:
- `VITE_LOGIN_PATH=/auth/login`
- `VITE_REGISTER_PATH=/auth/register`
- `VITE_ENTRIES_PATH=/entries`

**Important:** the auth paths, request field names, and token response shape are assumptions because the frontend generator does not have your full auth controller code. Update them in `.env` or `src/api.js` to match the actual backend. The code currently expects login/register to accept `phone` and `password` (registration also sends `name`) and return `token`, `accessToken`, or `data.token`. It sends the JWT as `Authorization: Bearer <token>`.

The entries API is wired for:
- `GET /entries` returning an array of entries (or `{ entries: [...] }` / `{ rows: [...] }`)
- `POST /entries` with `{ type: "money", amount: "500", description: "...", counterpartyPhone: "..." }`

The add-entry form includes the direction ("They owe me" / "I owe them") in the UI. Your current backend schema shown so far infers `role` from `creator_id`; it does not yet accept a direction field. To record both directions correctly, the backend should define how a borrower-created entry is represented before relying on this form with live data. The frontend currently sends the shape supported by the existing controller and keeps direction only for local preview.

## Preview mode

Click **Explore preview** on the login screen to inspect the UI using sample entries without an API. Sample data is for layout preview only and is not stored in PostgreSQL.

## Suggested next integration checks

1. Confirm the Express port and CORS settings allow `http://localhost:5173`.
2. Match login/register paths and payloads to your actual auth routes.
3. Confirm how `POST /entries` represents who owes whom; add a `direction`/creator semantics contract before using the live add form for both directions.
4. Test the GET response fields: `id`, `other_party`, `type`, `amount_paise`, `status`, `description`, `created_at`, `role`.
5. Run `npm run build` before committing.
