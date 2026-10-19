import { formatEntryDate, formatMoney } from "./format.js";

const STATUS = {
  pending: "Not confirmed yet",
  confirmed: "Confirmed",
  dispute: "Disputed",
  settled: "Settled",
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

export default function EntryRow({ entry, fresh }) {
  const lender = entry.role === "lender";
  const money = entry.type === "money";
  const settled = entry.status === "settled";
  // The server falls back to the phone number when you haven't named someone.
  const unnamed = lender && entry.other_party === entry.counterparty_phone;

  const direction = money
    ? lender
      ? "owes you"
      : "you owe"
    : lender
      ? "owed to you"
      : "owed by you";

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
