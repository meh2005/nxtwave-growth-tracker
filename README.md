# NxtWave Growth Challenge

React + Vite dashboard with an Express API and SQLite storage for student registrations and campus ambassadors.

## Run locally

Open two terminals in this folder:

1. `npm run server` starts the API at `http://localhost:3001`.
2. `npm run dev` starts Vite. Open the local URL printed by Vite.

The API creates `growth-tracker.db` in this folder. Dashboard totals and channel figures use verified SQLite registrations. Student submissions are pending until an organizer verifies them in the dashboard. Emails are trimmed, lowercased, and protected by a case-insensitive unique index. Referral codes are checked against existing ambassadors.

The verification action is intentionally unauthenticated for this local prototype. Add organizer authentication and email/identity verification before using it with public traffic or real reward fulfillment.

The separate demo simulator stores sample counts only in browser state; it never changes database totals. Existing ambassador codes are shown in the registration form, and ambassador reward progress counts verified registrations only.
