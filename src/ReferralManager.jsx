
import { useEffect, useState } from "react";
import { Copy, KeyRound, PlusCircle, Users } from "lucide-react";

const API = "/api";

export default function ReferralManager({ onChange }) {
  const [name, setName] = useState("");
  const [ambassadors, setAmbassadors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");

  async function loadAmbassadors() {
    try {
      const response = await fetch(`${API}/ambassadors`);
      if (!response.ok) throw new Error("Could not load ambassadors.");
      const data = await response.json();
      setAmbassadors(data);
    } catch {
      setMessage("Could not connect to the backend. Check that the server is running.");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    Promise.resolve().then(loadAmbassadors);
  }, []);

  async function createAmbassador(event) {
    event.preventDefault();
    if (!name.trim()) return;

    setSaving(true);
    setMessage("");

    try {
      const response = await fetch(`${API}/ambassadors`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Could not generate referral code.");
      }

      setName("");
      setMessage(`Referral code ${data.referralCode} created successfully.`);
      await loadAmbassadors();
      await onChange?.();
    } catch (error) {
      setMessage(error.message);
    } finally {
      setSaving(false);
    }
  }

  async function copyCode(code) {
    try {
      await navigator.clipboard.writeText(code);
      setMessage(`Copied ${code} to clipboard.`);
    } catch {
      setMessage(`Your referral code is ${code}. Copy it manually.`);
    }
  }

  return (
    <section className="panel referral-manager">
      <div className="referral-title">
        <div className="referral-heading-icon">
          <KeyRound size={23} />
        </div>
        <div>
          <h2>Referral Code Generator</h2>
          <p className="muted">
            Create unique ambassador codes and track attributed registrations.
          </p>
        </div>
      </div>

      <form className="referral-form" onSubmit={createAmbassador}>
        <label htmlFor="ambassador-name">Ambassador name</label>
        <div className="referral-input-row">
          <input
            id="ambassador-name"
            type="text"
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="e.g. Student Ambassador 01"
            maxLength={100}
            required
          />
          <button type="submit" disabled={saving}>
            <PlusCircle size={17} />
            {saving ? "Generating..." : "Generate code"}
          </button>
        </div>
      </form>

      {message && <p className="referral-message" role="status">{message}</p>}

      <div className="referral-list-heading">
        <h3>Registered ambassadors</h3>
        <span>{ambassadors.length} total</span>
      </div>

      {loading ? (
        <p className="muted">Loading ambassadors...</p>
      ) : ambassadors.length === 0 ? (
        <div className="referral-empty">
          <Users size={26} />
          <p>No ambassadors yet. Generate your first referral code above.</p>
        </div>
      ) : (
        <div className="referral-table">
          {ambassadors.map((ambassador) => (
            <div className="referral-row" key={ambassador.id}>
              <div className="ambassador-info">
                <strong>{ambassador.name}</strong>
                <code>{ambassador.referralCode}</code>
              </div>
              <div className="ambassador-stats">
                <div className="ambassador-progress">
                  <span><Users size={15} /> {ambassador.registrations} verified</span>
                  <span className="milestone-progress">{Math.min(ambassador.registrations, 30)} / 30 to next reward</span>
                  <div className="mini-progress"><span style={{ width: `${Math.min((ambassador.registrations / 30) * 100, 100)}%` }} /></div>
                  <span className="milestone-state">{ambassador.registrations >= 30 ? "30 registration reward reached" : ambassador.registrations >= 25 ? "25 registration reward reached" : `${25 - ambassador.registrations} to first reward`}</span>
                </div>
                <button
                  type="button"
                  className="copy-code-button"
                  onClick={() => copyCode(ambassador.referralCode)}
                  aria-label={`Copy ${ambassador.referralCode}`}
                >
                  <Copy size={15} />
                  Copy
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      <p className="referral-footnote">
        Demo prototype · Codes are generated by the backend and saved in SQLite.
      </p>
    </section>
  );
}
