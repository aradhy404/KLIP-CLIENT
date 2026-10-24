import { useState } from "react";
import { formatEntryDate, formatMoney } from "./format.js";

const STATUS = {
  pending: "Not confirmed yet",
  confirmed: "Confirmed",
  dispute: "Disputed",
  settled: "Settled",
};

// Actions that can't be taken back ask once before they run.
const ASK = {
  dispute: {
    question: "Dispute this entry? The person who recorded it will see it as disputed.",
    yes: "Yes, dispute",
  },
  settle: {
    question: "Mark this as settled? It stays in your history.",
    yes: "Yes, mark settled",
  },
};

function StatusIcon({ status }) {
  const common = {
    viewBox: "0 0 16 16",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.8,
    strokeLinecap: "round",
    strokeLinejoin: "round",
    "aria-hidden": true,
  };
  if (status === "confirmed" || status === "settled") {
    return (
      <svg {...common}>
        <circle cx="8" cy="8" r="6.2" />
        <path d="M5.2 8.3l2 2 3.6-4" />
      </svg>
    );
  }
  if (status === "dispute") {
    return (
      <svg {...common}>
        <path d="M8 2.2l6 10.6H2z" />
        <path d="M8 6.6v2.8M8 11.3v.1" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <circle cx="8" cy="8" r="6.2" strokeDasharray="2.6 2.4" />
    </svg>
  );
}

export default function EntryRow({ entry, fresh, onAction }) {
  const [asking, setAsking] = useState(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const lender = entry.role === "lender";
  const money = entry.type === "money";
  const settled = entry.status === "settled";
  // The server falls back to the phone number when you haven't named someone.
  const unnamed = lender && entry.other_party === entry.counterparty_phone;

  // Only the other person can confirm or dispute. Only the lender can settle.
  const canReply = !lender && entry.status === "pending";
  const canSettle = lender && ["pending", "confirmed", "dispute"].includes(entry.status);

  const direction = money
    ? lender
      ? "owes you"
      : "you owe"
    : lender
      ? "owed to you"
      : "owed by you";

  async function run(action) {
    setBusy(true);
    setError("");
    try {
      await onAction(entry.id, action);
    } catch (err) {
      setError(err.message);
    } finally {
      setAsking(null);
      setBusy(false);
    }
  }

  const classes = ["row", fresh && "fresh", settled && "is-settled"].filter(Boolean).join(" ");

  return (
    <li className={classes}>
      <div className="row-main">
        <p className={unnamed ? "who-num" : "who"}>{entry.other_party}</p>
        <p className="what">{entry.description || (money ? "No note" : "Favour")}</p>
        <p className="meta">
          <span className={`status ${entry.status}`}>
            <StatusIcon status={entry.status} />
            {STATUS[entry.status] ?? entry.status}
          </span>
          <span>{formatEntryDate(entry.created_at)}</span>
          {!lender && <span>Asked of you</span>}
        </p>

        {canReply && !asking && (
          <p className="note">
            {money ? "Is this right? Confirming adds it to what you owe." : "Is this right?"}
          </p>
        )}
        {lender && entry.status === "dispute" && (
          <p className="note">
            They disagree with this entry. Mark it settled once you've sorted it out.
          </p>
        )}

        {(canReply || canSettle) && (
          <div className="actions">
            {asking ? (
              <>
                <p className="ask">{ASK[asking].question}</p>
                <button
                  className="btn primary small"
                  disabled={busy}
                  onClick={() => run(asking)}
                >
                  {busy ? "Saving…" : ASK[asking].yes}
                </button>
                <button className="link-btn" disabled={busy} onClick={() => setAsking(null)}>
                  Cancel
                </button>
              </>
            ) : (
              <>
                {canReply && (
                  <>
                    <button
                      className="btn primary small"
                      disabled={busy}
                      onClick={() => run("confirm")}
                      aria-label={`Confirm entry from ${entry.other_party}`}
                    >
                      {busy ? "Saving…" : "Confirm"}
                    </button>
                    <button
                      className="btn small"
                      disabled={busy}
                      onClick={() => setAsking("dispute")}
                      aria-label={`Dispute entry from ${entry.other_party}`}
                    >
                      Dispute
                    </button>
                  </>
                )}
                {canSettle && (
                  <button
                    className="btn small"
                    disabled={busy}
                    onClick={() => setAsking("settle")}
                    aria-label={`Mark entry for ${entry.other_party} as settled`}
                  >
                    Mark settled
                  </button>
                )}
              </>
            )}
          </div>
        )}

        {error && (
          <p className="msg err" role="alert">
            {error}
          </p>
        )}
      </div>

      <div className="row-amount">
        <p className={money ? "amt" : "amt favour"}>
          {money ? formatMoney(entry.amount_paise) : "Favour"}
        </p>
        <p className="dir">{direction}</p>
      </div>
    </li>
  );
}
