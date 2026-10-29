import ReferralManager from "./ReferralManager";
import { useCallback, useEffect, useState } from "react";
import {
  Users, Target, TrendingUp, Share2, MessageCircle, GraduationCap,
  Camera, PlusCircle, RotateCcw, CheckCircle2,
} from "lucide-react";

const API = "http://localhost:3001/api";
const TARGET = 500;
const channels = [
  { id: "WhatsApp", label: "WhatsApp communities", type: "Primary", icon: MessageCircle },
  { id: "College Club", label: "College technical clubs", type: "Primary", icon: GraduationCap },
  { id: "Instagram", label: "Instagram student pages", type: "Supporting", icon: Camera },
];
const emptyStats = { total: 0, pending: 0, referred: 0, channels: [] };

export default function App() {
  const [stats, setStats] = useState(emptyStats);
  const [registrations, setRegistrations] = useState([]);
  const [ambassadors, setAmbassadors] = useState([]);
  const [channel, setChannel] = useState("WhatsApp");
  const [form, setForm] = useState({ name: "", email: "", college: "", referralCode: "" });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [demoCounts, setDemoCounts] = useState({ WhatsApp: 0, "College Club": 0, Instagram: 0 });
  const [demoChannel, setDemoChannel] = useState("WhatsApp");
  const [demoCount, setDemoCount] = useState("");

  const refreshData = useCallback(async () => {
    const [statsResponse, registrationsResponse, ambassadorsResponse] = await Promise.all([
      fetch(`${API}/stats`), fetch(`${API}/registrations`), fetch(`${API}/ambassadors`),
    ]);
    if (![statsResponse, registrationsResponse, ambassadorsResponse].every((response) => response.ok)) {
      throw new Error("Could not load campaign data. Check that the API server is running.");
    }
    const [nextStats, nextRegistrations, nextAmbassadors] = await Promise.all([
      statsResponse.json(), registrationsResponse.json(), ambassadorsResponse.json(),
    ]);
    setStats(nextStats);
    setRegistrations(nextRegistrations);
    setAmbassadors(nextAmbassadors);
  }, []);

  useEffect(() => {
    Promise.resolve().then(refreshData).catch((requestError) => setError(requestError.message)).finally(() => setLoading(false));
  }, [refreshData]);

  const progress = Math.min((stats.total / TARGET) * 100, 100);
  const channelTotal = (id) => stats.channels.find((item) => item.channel === id)?.registrations || 0;

  async function submitRegistration(event) {
    event.preventDefault();
    setSaving(true); setMessage(""); setError("");
    try {
      const response = await fetch(`${API}/registrations`, {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, channel }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not submit registration.");
      setMessage(data.message);
      setForm({ name: "", email: "", college: "", referralCode: "" });
      await refreshData();
    } catch (requestError) { setError(requestError.message); }
    finally { setSaving(false); }
  }

  async function verifyRegistration(id) {
    setError("");
    try {
      const response = await fetch(`${API}/registrations/${id}/verify`, { method: "PATCH" });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Could not verify registration.");
      setMessage(data.message);
      await refreshData();
    } catch (requestError) { setError(requestError.message); }
  }

  function addDemoRegistrations(event) {
    event.preventDefault();
    const amount = Number(demoCount);
    if (!Number.isInteger(amount) || amount <= 0) { setError("Enter a positive whole number for demo registrations."); return; }
    setDemoCounts((previous) => ({ ...previous, [demoChannel]: previous[demoChannel] + amount }));
    setDemoCount(""); setMessage(`${amount} demo registrations added. They do not affect campaign totals.`);
  }

  return (
    <main className="dashboard">
      <header className="topbar">
        <div><p className="eyebrow">NXTWAVE · GROWTH CAMPAIGN</p><h1>AI Workshop Growth Tracker</h1><p className="subtitle">Build Your First AI Project in 60 Minutes</p></div>
        <span className="status">● Live database · demo mode</span>
      </header>

      {error && <p className="form-message error-message" role="alert">{error}</p>}
      <section className="stats-grid">
        {[
          { label: "Verified Registrations", value: stats.total, icon: Users },
          { label: "Target", value: TARGET, icon: Target },
          { label: "Verified Referrals", value: stats.referred, icon: Share2 },
          { label: "Target Progress", value: `${progress.toFixed(1)}%`, icon: TrendingUp },
        ].map(({ label, value, icon: Icon }) => <article className="stat-card" key={label}><div className="stat-heading"><span>{label}</span><Icon size={20} /></div><h2>{loading ? "…" : value}</h2></article>)}
      </section>

      <section className="panel"><h2>Registration goal</h2><p>Your campaign is designed to reach 500 final-year engineering students.</p><div className="progress-track"><div className="progress-fill" style={{ width: `${progress}%` }} /></div><p className="muted">{stats.total} verified of {TARGET} registrations · {progress.toFixed(1)}% complete · {stats.pending} pending verification</p></section>

      <section className="panel">
        <h2>Student registration</h2><p className="muted">Submit a student registration to SQLite. Referred registrations count toward rewards after organizer verification.</p>
        <form className="registration-form" onSubmit={submitRegistration}>
          <label htmlFor="student-name">Student name</label><input id="student-name" value={form.name} onChange={(event) => setForm({ ...form, name: event.target.value })} maxLength={100} required />
          <label htmlFor="student-email">Email address</label><input id="student-email" type="email" value={form.email} onChange={(event) => setForm({ ...form, email: event.target.value })} maxLength={254} required />
          <label htmlFor="student-college">College</label><input id="student-college" value={form.college} onChange={(event) => setForm({ ...form, college: event.target.value })} maxLength={160} required />
          <label htmlFor="student-channel">Campaign channel</label><select id="student-channel" value={channel} onChange={(event) => setChannel(event.target.value)}>{channels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select>
          <label htmlFor="student-referral">Ambassador referral code <span className="muted">(optional)</span></label><select id="student-referral" value={form.referralCode} onChange={(event) => setForm({ ...form, referralCode: event.target.value })}><option value="">No referral code</option>{ambassadors.map((item) => <option key={item.id} value={item.referralCode}>{item.name} · {item.referralCode}</option>)}</select>
          <button type="submit" disabled={saving}><PlusCircle size={17} />{saving ? "Submitting…" : "Submit registration"}</button>
          {message && <p className="form-message" role="status">{message}</p>}
        </form>
      </section>

      <section className="panel"><div className="section-heading"><h2>Campaign channels</h2><span className="verified-label"><CheckCircle2 size={15} /> Verified database records</span></div><div className="channel-list">{channels.map(({ id, label, type, icon: Icon }) => <div className="channel-row" key={id}><div className="channel-name"><Icon size={19} /><span>{label}</span></div><div className="channel-results"><strong>{loading ? "…" : channelTotal(id)}</strong><span>{type}</span></div></div>)}</div></section>

      <section className="panel"><div className="section-heading"><div><h2>Registration verification</h2><p className="muted">Organizer review for this local prototype. Verify only registrations you have checked.</p></div><span>{stats.pending} pending</span></div>{registrations.filter((item) => !item.verified).length === 0 ? <p className="muted">No registrations waiting for verification.</p> : <div className="referral-table">{registrations.filter((item) => !item.verified).map((item) => <div className="referral-row" key={item.id}><div className="ambassador-info"><strong>{item.name}</strong><span>{item.email} · {item.college}</span><code>{item.channel}{item.referralCode ? ` · ${item.referralCode}` : ""}</code></div><button type="button" className="verify-button" onClick={() => verifyRegistration(item.id)}>Verify</button></div>)}</div>}</section>

      <ReferralManager onChange={refreshData} />

      <section className="panel demo-panel"><div className="section-heading"><div><h2>Demo data simulator</h2><p className="muted">These sample counts stay in this browser and are excluded from every database total.</p></div><span className="demo-badge">SIMULATED</span></div><form className="registration-form" onSubmit={addDemoRegistrations}><label htmlFor="demo-channel">Demo channel</label><select id="demo-channel" value={demoChannel} onChange={(event) => setDemoChannel(event.target.value)}>{channels.map((item) => <option key={item.id} value={item.id}>{item.label}</option>)}</select><label htmlFor="demo-count">Sample registrations</label><input id="demo-count" type="number" min="1" step="1" value={demoCount} onChange={(event) => setDemoCount(event.target.value)} placeholder="e.g. 25" required /><button type="submit"><PlusCircle size={17} />Add demo registrations</button></form><div className="demo-counts">{channels.map((item) => <span key={item.id}>{item.label}: <strong>{demoCounts[item.id]}</strong></span>)}</div><button className="reset-button" type="button" onClick={() => setDemoCounts({ WhatsApp: 0, "College Club": 0, Instagram: 0 })}><RotateCcw size={15} />Reset demo data</button></section>

      <section className="panel rewards-panel"><div className="rewards-header"><div><p className="eyebrow">CAMPUS AMBASSADOR PROGRAM</p><h2>Refer. Build. Unlock rewards.</h2><p className="muted">Only verified registrations count toward ambassador milestones.</p></div><span className="reward-icon">🏆</span></div><div className="reward-grid"><article className="reward-card"><span className="reward-tag">MILESTONE 1</span><h3>25 verified registrations</h3><p>Unlock exclusive AI project resources.</p></article><article className="reward-card featured-reward"><span className="reward-tag">MILESTONE 2</span><h3>30 verified registrations</h3><p>Qualify for an advanced learning benefit.</p></article></div><p className="reward-note">Proposed campaign incentive · Rewards subject to organizer approval. Registrations must be unique and verified.</p></section>
      <footer className="dashboard-footer">Prototype · Database registrations are live; demo simulator counts are clearly marked and excluded.</footer>
    </main>
  );
}
