
import express from "express";
import cors from "cors";
import Database from "better-sqlite3";
import { randomBytes } from "node:crypto";

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

const db = new Database("growth-tracker.db");

db.exec(`
  CREATE TABLE IF NOT EXISTS ambassadors (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    referral_code TEXT NOT NULL UNIQUE,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS registrations (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    college TEXT NOT NULL,
    channel TEXT NOT NULL,
    referral_code TEXT,
    created_at TEXT DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (referral_code)
      REFERENCES ambassadors(referral_code)
  );
`);

db.pragma("foreign_keys = ON");

// Keep existing SQLite files usable when the verification workflow is added.
const registrationColumns = db.prepare("PRAGMA table_info(registrations)").all();
if (!registrationColumns.some((column) => column.name === "verified")) {
  db.exec("ALTER TABLE registrations ADD COLUMN verified INTEGER NOT NULL DEFAULT 0");
}
db.exec("CREATE UNIQUE INDEX IF NOT EXISTS registrations_email_normalized ON registrations(lower(email))");

function generateReferralCode() {
  return `AI-${randomBytes(4).toString("hex").toUpperCase()}`;
}

app.get("/api/health", (req, res) => {
  res.json({ status: "ok", message: "Growth Tracker API is running" });
});

app.post("/api/ambassadors", (req, res) => {
  const name = String(req.body?.name || "").trim();

  if (!name) {
    return res.status(400).json({ error: "Ambassador name is required." });
  }

  for (let attempt = 0; attempt < 5; attempt++) {
    const code = generateReferralCode();

    try {
      const result = db.prepare(
        "INSERT INTO ambassadors (name, referral_code) VALUES (?, ?)"
      ).run(name, code);

      return res.status(201).json({
        id: result.lastInsertRowid,
        name,
        referralCode: code,
      });
    } catch (error) {
      if (!String(error.message).includes("UNIQUE")) {
        console.error(error);
        return res.status(500).json({ error: "Could not create ambassador." });
      }
    }
  }

  return res.status(500).json({ error: "Could not generate a unique code." });
});

app.get("/api/ambassadors", (req, res) => {
  const ambassadors = db.prepare(`
    SELECT
      a.id,
      a.name,
      a.referral_code AS referralCode,
      SUM(CASE WHEN r.verified = 1 THEN 1 ELSE 0 END) AS registrations,
      COUNT(r.id) AS totalRegistrations
    FROM ambassadors a
    LEFT JOIN registrations r ON r.referral_code = a.referral_code
    GROUP BY a.id
    ORDER BY registrations DESC
  `).all();

  res.json(ambassadors);
});

app.post("/api/registrations", (req, res) => {
  const body = req.body || {};
  const name = String(body.name || "").trim();
  const email = String(body.email || "").trim().toLowerCase();
  const college = String(body.college || "").trim();
  const channel = String(body.channel || "").trim();
  const referralCode = String(body.referralCode || "").trim().toUpperCase();

  if (!name || !email || !college || !channel) {
    return res.status(400).json({
      error: "Name, email, college and channel are required.",
    });
  }

  if (name.length > 100 || email.length > 254 || college.length > 160) {
    return res.status(400).json({ error: "Name, email, or college exceeds the allowed length." });
  }

  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Enter a valid email address." });
  }

  const allowedChannels = ["WhatsApp", "College Club", "Instagram"];

  if (!allowedChannels.includes(channel)) {
    return res.status(400).json({ error: "Invalid campaign channel." });
  }

  if (referralCode) {
    const ambassador = db.prepare(
      "SELECT id FROM ambassadors WHERE referral_code = ?"
    ).get(referralCode);

    if (!ambassador) {
      return res.status(400).json({ error: "Referral code not found." });
    }
  }

  try {
    const result = db.prepare(`
      INSERT INTO registrations (name, email, college, channel, referral_code)
      VALUES (?, ?, ?, ?, ?)
    `).run(name, email, college, channel, referralCode || null);

    res.status(201).json({
      id: result.lastInsertRowid,
      message: "Registration submitted. It will count toward rewards after verification.",
      verified: false,
    });
  } catch (error) {
    if (String(error.message).includes("UNIQUE")) {
      return res.status(409).json({
        error: "This email has already been registered.",
      });
    }

    console.error(error);
    res.status(500).json({ error: "Could not save registration." });
  }
});

// Organizer action for this local prototype; production use should add authentication.
app.patch("/api/registrations/:id/verify", (req, res) => {
  const result = db.prepare(
    "UPDATE registrations SET verified = 1 WHERE id = ?"
  ).run(Number(req.params.id));

  if (!result.changes) {
    return res.status(404).json({ error: "Registration not found." });
  }
  res.json({ message: "Registration verified." });
});

app.get("/api/registrations", (req, res) => {
  const registrations = db.prepare(`
    SELECT id, name, email, college, channel, referral_code AS referralCode,
      verified, created_at AS createdAt
    FROM registrations
    ORDER BY id DESC
  `).all();

  res.json(registrations);
});

app.get("/api/stats", (req, res) => {
  const total = db.prepare(
    "SELECT COUNT(*) AS count FROM registrations WHERE verified = 1"
  ).get().count;

  const pending = db.prepare(
    "SELECT COUNT(*) AS count FROM registrations WHERE verified = 0"
  ).get().count;

  const referred = db.prepare(
    "SELECT COUNT(*) AS count FROM registrations WHERE referral_code IS NOT NULL AND verified = 1"
  ).get().count;

  const channels = db.prepare(`
    SELECT channel, COUNT(*) AS registrations
    FROM registrations WHERE verified = 1
    GROUP BY channel
  `).all();

  res.json({
    target: 500,
    total,
    pending,
    referred,
    progress: Math.round((total / 500) * 100),
    channels,
  });
});

app.listen(PORT, () => {
  console.log(`Growth Tracker API running at http://localhost:${PORT}`);
});
