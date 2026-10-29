# NxtWave Growth Challenge

React + Vite dashboard with an Express API and PostgreSQL storage for student registrations and campus ambassadors.

## Local development

Install and start PostgreSQL locally, then create a database and user with permission to create tables and indexes. The server initializes its schema on startup. Open two terminals in this project folder.

Terminal 1 (PowerShell):

```powershell
$env:DATABASE_URL = "postgresql://<user>:<password>@localhost:5432/nxtwave_growth"
$env:ADMIN_SECRET = "<choose-a-local-secret>"
npm.cmd run server
```

Terminal 2:

```powershell
npm.cmd run dev
```

Open the Vite URL printed in Terminal 2. Vite proxies `/api` to Express on `localhost:3001`. The API uses `PORT` when supplied and otherwise uses `3001`.

## Render deployment

Create a Render Web Service and a Render Postgres database in the same region. Configure these variables in the web service's Environment settings:

- `NODE_ENV=production`
- `DATABASE_URL` set to the database's internal connection URL (do not paste it into source code or frontend variables)
- `ADMIN_SECRET` set to a long, unique secret in Render's environment settings
- `PORT` is provided by Render; the server defaults to `3001` when running elsewhere

Use `npm ci && npm run build` as the build command and `npm start` as the start command. Express serves the generated `dist` files and frontend routes; API endpoints remain under `/api`. Keep the web service and database in the same Render region so the internal database URL can be used.

Render's free Postgres plan has a 1 GB limit, no backups, and expires 30 days after creation. After expiration, the database is inaccessible; it can be upgraded during the following 14-day grace period before Render deletes its data. Export anything you need to retain before expiration. See [Render's free instance limitations](https://render.com/docs/free).

## Organizer access and API behavior

Set `ADMIN_SECRET` in the server environment. The dashboard uses the entered organizer secret for `POST /api/ambassadors`, `GET /api/registrations`, and `PATCH /api/registrations/:id/verify`; these requests send it in the `X-Admin-Secret` header. The secret is not stored in the database, source, or frontend build. If it is unset, organizer actions are disabled. Use HTTPS when deployed.

Public endpoints provide health, ambassador referral choices and reward counts, registration submission, and campaign statistics. Registration email uniqueness is case-insensitive. Referral codes are validated and also protected by a foreign key. New registrations default to unverified; only verified registrations count toward dashboard goals and rewards.

## Existing SQLite data

The old `growth-tracker.db` is intentionally left untouched and is not read or imported by this server. Back it up separately. To preserve existing records, perform a deliberate one-time migration into the initialized PostgreSQL database: export ambassadors first, then registrations, preserve registration `verified` values and timestamps, import referral codes exactly, and reset the identity sequences if importing the old IDs. Verify row counts and referral relationships before switching traffic. Do not point this server at the SQLite file; it now requires `DATABASE_URL`.
