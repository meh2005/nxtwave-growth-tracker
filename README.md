# 🚀 NxtWave Growth Tracker

A full-stack web application built for the NxtWave Growth Challenge to manage student registrations, track ambassador referrals, verify registrations, and monitor progress toward a campaign goal of **500 verified registrations in 7 days**.

## 🌐 Live Demo

**Live Application:** https://nxtwave-growth-tracker.onrender.com/

**GitHub Repository:** https://github.com/meh2005/nxtwave-growth-tracker

> **Note:** The application is hosted on Render's free tier. The web service may take a little time to start after inactivity, and the free PostgreSQL database has a limited lifetime.

## 🎯 Project Objective

The objective is to support a student outreach campaign targeting 500 verified registrations within seven days with a proposed budget of ₹2,000.

The Growth Tracker provides a centralized platform to manage registrations, measure referral performance, and monitor progress toward the campaign target.

## ✨ Features

- 📝 **Student Registration** — Collect student details through a registration form.
- 🛡️ **Duplicate Prevention** — Reject duplicate email registrations using case-insensitive validation.
- 🔗 **Referral Tracking** — Attribute registrations to student ambassadors through referral codes.
- ✅ **Registration Verification** — Distinguish pending registrations from verified registrations.
- 📊 **Campaign Dashboard** — Monitor verified registrations against the 500-registration target.
- 📣 **Channel Tracking** — Track campaign registrations by acquisition channel.
- 🏆 **Ambassador Performance** — Monitor verified referrals and progress toward reward milestones.
- 🔐 **Organizer Protection** — Protect student-record access, registration verification, and ambassador creation using an admin secret.
- 🗄️ **PostgreSQL Database** — Store campaign registrations and ambassador records.
- 📱 **Responsive Interface** — Access the registration and dashboard interfaces across screen sizes.

## 🛠️ Tech Stack

| Layer | Technologies |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Node.js, Express.js |
| Database | PostgreSQL |
| Database Driver | node-postgres (`pg`) |
| Deployment | Render |
| Version Control | Git, GitHub |

## ⚙️ How It Works

1. Students register through the web application.
2. The backend validates the submitted information and rejects duplicate email addresses.
3. Referral codes associate eligible registrations with student ambassadors.
4. Organizers access protected features to review and verify registrations.
5. The dashboard displays campaign progress, channel performance, and ambassador referral statistics.

Only verified registrations count toward the overall campaign target. Ambassador reward progress is based on verified registrations attributed to the respective ambassador.

## 💻 Run Locally

### Prerequisites

- Node.js and npm
- Git
- Access to a PostgreSQL database

### 1. Clone the repository

```bash
git clone https://github.com/meh2005/nxtwave-growth-tracker.git
cd nxtwave-growth-tracker
```

### 2. Install dependencies

```bash
npm install --include=dev
```

### 3. Configure environment variables

The backend requires the following environment variables:

| Variable | Purpose |
|---|---|
| `DATABASE_URL` | PostgreSQL connection URL |
| `ADMIN_SECRET` | Secret used to authorize organizer operations |
| `NODE_ENV` | Application environment; use `development` locally and `production` on Render |

Keep actual credentials private. Do not commit them to GitHub or expose them through frontend variables such as `VITE_ADMIN_SECRET`.

### 4. Start the backend

In PowerShell, configure your own PostgreSQL URL and admin secret:

```powershell
$env:DATABASE_URL = "YOUR_POSTGRESQL_CONNECTION_URL"
$env:ADMIN_SECRET = "YOUR_PRIVATE_ADMIN_SECRET"
npm.cmd run server
```

Keep this terminal running.

### 5. Start the frontend

Open a second terminal in the project directory:

```powershell
npm.cmd run dev
```

Open the local URL printed by Vite, usually:

http://localhost:5173

During development, Vite proxies `/api` requests to the Express backend.

## 🔐 Security

- Organizer operations require the `X-Admin-Secret` request header.
- Keep `DATABASE_URL` and `ADMIN_SECRET` private.
- Never hardcode secrets in application code or expose them to the browser.
- Configure production secrets through Render's environment settings.
- Use a strong, randomly generated admin secret.

## ☁️ Deployment on Render

The application is deployed as a Render Web Service backed by Render PostgreSQL.

### Build and start commands

**Build Command**

```bash
npm install --include=dev && npm run build
```

**Start Command**

```bash
npm start
```

### Environment variables

Configure these in the Render dashboard:

| Variable | Value |
|---|---|
| `NODE_ENV` | `production` |
| `DATABASE_URL` | Internal PostgreSQL connection URL from Render |
| `ADMIN_SECRET` | A strong, private admin secret |

The Express server serves the production frontend from the Vite `dist` directory and exposes backend endpoints under `/api`.

## 🧪 Validation

The following checks passed after the PostgreSQL migration:

- `npm.cmd run lint`
- `npm.cmd run build`
- `node --check server.js`

These checks validate code quality, production build generation, and server syntax. Live registration and organizer workflows should also be tested after deployment.

## ⚠️ Free-Tier Limitations

This prototype uses Render's free hosting options.

- The web service may spin down after inactivity and take time to respond when accessed again.
- Render Free PostgreSQL has a limited lifetime and storage capacity.
- Export any data you need before the database expires.
- This setup is intended for a prototype and challenge demonstration, not permanent production data storage.

## 🔮 Future Improvements

- Individual organizer accounts and role-based access control.
- Downloadable campaign reports and data exports.
- Automated tests for registration and referral workflows.
- More detailed channel conversion analytics.
- Long-term database persistence and backup strategy.

## 👩‍💻 Project

**NxtWave Growth Challenge — Growth Tracker**

Built to explore practical campaign management through student registration workflows, referral attribution, verification, and data-driven growth tracking.

---

*The campaign target and proposed budget describe the project plan; they do not imply that 500 registrations have already been achieved.*