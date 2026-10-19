# Klip Client

The web app for **Klip**, a private ledger of the money and favours you've given. It talks to the [Klip server](https://github.com/aradhy404/KLIP-SERVER).

Live: https://klip-client.vercel.app

## What it does

- Sign in or create an account with a mobile number and password.
- Shows how much is owed to you, computed from your open entries.
- Lets you write a new entry (money or a favour) with a private name for the other person.
- Lists everything you gave and everything addressed to you, with its status.

Everything on screen comes from the API. There is no sample data.

## Run it locally

```bash
npm install
cp .env.example .env     # set VITE_API_BASE_URL
npm run dev
```

For a local server use `VITE_API_BASE_URL=http://localhost:8000`, and make sure `http://localhost:5173` is allowed by the server's CORS list.

## Environment

| Variable | Purpose |
|---|---|
| `VITE_API_BASE_URL` | API origin, no trailing slash |

The API paths (`/api/auth/login`, `/api/auth/register`, `/api/entry`) are fixed in `src/api.js`. Vite bakes `VITE_*` values in at build time, so redeploy after changing the variable.

## Deploy

Vercel: import the repo, framework preset Vite, set `VITE_API_BASE_URL`. If you set `VITE_LOGIN_PATH`, `VITE_REGISTER_PATH` or `VITE_ENTRIES_PATH` for the earlier version, you can delete them.

## How the totals work

The server has no dashboard endpoint yet, so the client adds up the latest 100 entries:

- **Owed to you:** money entries you created that are pending or confirmed. Settled and disputed entries are history and don't count.
- **You owe:** money entries addressed to you that you have confirmed.

When `GET /api/dashboard` exists, replace `summarize()` in `src/format.js` with that call.

## Structure

```text
src/
├── main.jsx       entry point and fonts
├── App.jsx        signed in or signed out
├── Auth.jsx       sign in and sign up
├── Ledger.jsx     balance, filters and the entry list
├── Composer.jsx   the "write a new entry" form
├── EntryRow.jsx   one line of the ledger
├── api.js         every request to the server, session storage
├── format.js      money, dates, phone cleanup, totals
└── styles.css
```

## Not built yet

Confirm, dispute and settle (the server doesn't have those endpoints yet), and the contacts and people pages.
