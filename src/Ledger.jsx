import { useCallback, useEffect, useMemo, useState } from "react";
import { listEntries } from "./api.js";
import { formatMoney, formatToday, plural, summarize } from "./format.js";
import Composer from "./Composer.jsx";
import EntryRow from "./EntryRow.jsx";

const FILTERS = [
  { id: "all", label: "Everything" },
  { id: "gave", label: "I gave" },
  { id: "asked", label: "Asked of me" },
];

const EMPTY_TEXT = {
  all: "No entries yet. Write your first one above.",
  gave: "You haven't recorded anything you've given yet.",
  asked: "Nothing is addressed to you yet. Entries other people make about your number appear here.",
};

export default function Ledger({ session, onSignOut }) {
  const { token, user } = session;
  const [entries, setEntries] = useState(null);
  const [error, setError] = useState("");
  const [slow, setSlow] = useState(false);
  const [filter, setFilter] = useState("all");
  const [freshId, setFreshId] = useState(null);

  const endSession = useCallback(
    () => onSignOut("Your session ended. Sign in again."),
    [onSignOut]
  );

  const load = useCallback(async () => {
    setError("");
    try {
      setEntries(await listEntries(token, () => setSlow(true)));
    } catch (err) {
      if (err.status === 401) return endSession();
      setError(err.message);
    } finally {
      setSlow(false);
    }
  }, [token, endSession]);

  useEffect(() => {
    load();
  }, [load]);

  const stats = useMemo(() => (entries ? summarize(entries) : null), [entries]);

  const visible = useMemo(() => {
    if (!entries) return [];
    if (filter === "gave") return entries.filter((e) => e.role === "lender");
    if (filter === "asked") return entries.filter((e) => e.role === "borrower");
    return entries;
  }, [entries, filter]);

  const handleCreated = (entry) => {
    setFreshId(entry.id);
    setFilter("all");
    load();
  };

  const facts = stats
    ? [
        stats.favours > 0 && `${plural(stats.favours, "favour", "favours")} still open`,
        stats.owedUnconfirmed > 0 &&
          `${plural(stats.owedUnconfirmed, "entry", "entries")} not confirmed by the other person`,
        stats.youOwe > 0 && `You owe ${formatMoney(stats.youOwe)} on confirmed entries`,
        stats.toReview > 0 &&
          `${plural(stats.toReview, "entry", "entries")} addressed to you, not yet confirmed`,
      ].filter(Boolean)
    : [];

  return (
    <>
      <header className="bar">
        <span className="wordmark">klip</span>
        <div className="bar-right">
          <span className="who-am-i">{user.name}</span>
          <button className="link-btn" onClick={() => onSignOut()}>
            Sign out
          </button>
        </div>
      </header>

      <main className="page">
        <p className="today">{formatToday()}</p>

        {stats ? (
          <section aria-label="Your balance">
            <p className="owed">{formatMoney(stats.owed)}</p>
            <p className="owed-line">
              {stats.owed > 0
                ? `is owed to you by ${plural(stats.people, "person", "people")}.`
                : stats.favours > 0
                  ? "in money is owed to you right now."
                  : "is owed to you right now."}
            </p>
            {facts.length > 0 && (
              <ul className="facts">
                {facts.map((f) => (
                  <li key={f}>{f}</li>
                ))}
              </ul>
            )}
          </section>
        ) : (
          <section aria-label="Your balance">
            <p className="owed placeholder" aria-hidden="true">
              ₹0
            </p>
          </section>
        )}

        <section className="sheet" aria-labelledby="ledger-title">
          <div className="sheet-head">
            <h2 id="ledger-title">Ledger</h2>
            <div className="tabs">
              {FILTERS.map((f) => (
                <button
                  key={f.id}
                  className="tab"
                  aria-pressed={filter === f.id}
                  onClick={() => setFilter(f.id)}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          <Composer token={token} onCreated={handleCreated} onUnauthorized={endSession} />

          {slow && (
            <p className="banner" role="status">
              Waking the server. On the free plan this can take up to a minute.
            </p>
          )}

          {error ? (
            <div className="empty">
              <p className="msg err">{error}</p>
              <button className="btn" onClick={load}>
                Try again
              </button>
            </div>
          ) : !entries ? (
            <div aria-hidden="true">
              <div className="skel" />
              <div className="skel" />
              <div className="skel" />
            </div>
          ) : visible.length === 0 ? (
            <div className="empty">
              <p>{EMPTY_TEXT[filter]}</p>
            </div>
          ) : (
            <ol className="rows">
              {visible.map((entry) => (
                <EntryRow key={entry.id} entry={entry} fresh={entry.id === freshId} />
              ))}
            </ol>
          )}

          {entries && entries.length >= 100 && (
            <p className="banner">Showing your latest 100 entries. The totals above cover these.</p>
          )}
        </section>

        <p className="fine center">Only you and the person on an entry can see it.</p>
      </main>
    </>
  );
}
