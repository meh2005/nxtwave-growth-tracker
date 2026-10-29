# NxtWave Growth Challenge

React + Vite frontend, Express API, and `better-sqlite3` database for student registrations and campus ambassadors.

## Local development

Use two terminals from this project folder.

Terminal 1 (PowerShell):

```powershell
$env:ADMIN_SECRET = "<choose-a-local-secret>"
npm.cmd run server
```

Terminal 2:

```powershell
npm.cmd run dev
```

Open the Vite URL printed in Terminal 2. Vite proxies `/api` requests to Express on `localhost:3001`. The API listens on `0.0.0.0` and uses `PORT` when supplied. Verification requires the same `ADMIN_SECRET` in the server environment and in the organizer verification field in the dashboard. If it is unset, verification is disabled.

The default SQLite file is `growth-tracker.db`, resolved from the server process working directory to preserve the project's existing database location. Set `DATABASE_PATH` to an absolute path when you need a different location. The server logs the resolved path on startup. It does not create or copy a deployment database automatically; back up and deliberately migrate existing data when changing paths.

## Production deployment

Use a Node.js hosting service that supports `better-sqlite3` native modules and a persistent writable disk. Configure these environment variables in the host settings:

- `NODE_ENV=production`
- `PORT` to the port provided by the host (the server defaults to `3001`)
- `ADMIN_SECRET` to a long, unique secret stored in the host's secret manager; do not put it in source control or a `VITE_*` variable
- `DATABASE_PATH` to an absolute file path on the host's persistent disk, for example `/var/data/growth-tracker.db` if that is the mount path your host provides

Build and start commands:

```sh
npm ci
npm run build
npm start
```

In production Express serves the generated `dist` assets and sends `index.html` for frontend routes. API routes remain under `/api` and unknown API paths return JSON 404 responses.

SQLite data is durable only when the database file is on storage that survives application restarts and redeploys. Many free/container filesystems are ephemeral, so registrations may disappear if `DATABASE_PATH` points at the application directory. Mount a persistent disk, set `DATABASE_PATH` to a file on that disk, and configure backups. Do not point multiple app instances at a shared network filesystem SQLite file; SQLite is best suited here to a single server instance with a local persistent disk. Use a managed database before scaling to multiple instances. To retain the current local `growth-tracker.db`, make a backup and copy it to the configured persistent path before launching the deployed app; the app never deletes or migrates that file automatically.

The verification endpoint is `PATCH /api/registrations/:id/verify` and requires the `X-Admin-Secret` header. The dashboard sends the secret entered in its organizer field. Keep the secret private and use HTTPS in production.
