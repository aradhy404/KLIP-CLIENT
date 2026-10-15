import React, { useEffect, useMemo, useState } from "react";
import {
  ArrowDownLeft, ArrowUpRight, Bell, Check, ChevronDown, ChevronRight,
  CircleHelp, Command, CreditCard, FileClock, Filter, HandCoins, LayoutDashboard,
  LogOut, Menu, Plus, Search, Settings2, ShieldCheck, Sparkles, Users, Wallet,
  X, ArrowUpRight as ExternalArrow, LoaderCircle
} from "lucide-react";
import { clearToken, createEntry, fetchEntries, getToken, loginRequest, registerRequest, setToken } from "./api";

const demoEntries = [
  { id: "demo-1", other_party: "Rohan Sharma", type: "money", amount_paise: 125000, status: "active", description: "Dinner split", created_at: "2026-10-14T18:20:00Z", role: "lender" },
  { id: "demo-2", other_party: "Ananya Verma", type: "money", amount_paise: 80000, status: "active", description: "Concert tickets", created_at: "2026-10-13T13:10:00Z", role: "borrower" },
  { id: "demo-3", other_party: "Kabir Mehta", type: "money", amount_paise: 250000, status: "settled", description: "Weekend trip", created_at: "2026-10-11T09:45:00Z", role: "lender" },
  { id: "demo-4", other_party: "Ishita Singh", type: "money", amount_paise: 45000, status: "active", description: "Cab fare", created_at: "2026-10-09T16:30:00Z", role: "borrower" },
  { id: "demo-5", other_party: "Dev Malhotra", type: "money", amount_paise: 120000, status: "active", description: "Project materials", created_at: "2026-10-08T12:00:00Z", role: "lender" }
];
const money = (paise = 0) => new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format((Number(paise) || 0) / 100);
const formatDate = (date) => {
  if (!date) return "Recently";
  return new Date(date).toLocaleDateString("en-IN", { day: "numeric", month: "short" });
};
const initials = (name = "Klip User") => name.split(/\s+/).slice(0, 2).map((s) => s[0]).join("").toUpperCase();

function Brand() {
  return <div className="brand"><div className="brand-mark"><Command size={19} strokeWidth={2.7}/></div><div><div className="brand-name">klip<span>.</span></div><div className="brand-tagline">KEEP TRACK. KEEP IT FAIR.</div></div></div>;
}
function Avatar({ name, small = false }) {
  const colors = ["avatar-mint", "avatar-lilac", "avatar-peach", "avatar-blue", "avatar-yellow"];
  const idx = [...(name || "K")].reduce((n, c) => n + c.charCodeAt(0), 0) % colors.length;
  return <div className={`avatar ${colors[idx]} ${small ? "avatar-small" : ""}`}>{initials(name)}</div>;
}
function AuthScreen({ onAuthed }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setError(""); setBusy(true);
    try {
      const body = mode === "login" ? { phone, password } : { name: name.trim(), phone, password };
      const result = mode === "login" ? await loginRequest(body) : await registerRequest(body);
      const token = result.token || result.accessToken || result.data?.token;
      if (!token) throw new Error("The API responded, but no token was found. Check your backend response shape in src/api.js.");
      setToken(token); onAuthed();
    } catch (err) {
      setError(`${err.message}. Check the API paths and request fields in your .env file/backend.`);
    } finally { setBusy(false); }
  };
  return <main className="auth-shell">
    <section className="auth-left">
      <Brand />
      <div className="auth-copy"><div className="eyebrow"><span className="pulse-dot"/> MONEY, WITHOUT THE AWKWARDNESS</div>
        <h1>Good friends.<br/><span>Clear balances.</span></h1>
        <p>Keep every split, loan and payback in one calm place. No mental maths. No “I’ll send it later” mysteries.</p>
        <div className="auth-proof"><div className="proof-avatars"><Avatar name="Rohan"/><Avatar name="Ananya"/><Avatar name="Kabir"/></div><div><strong>Keep it between you.</strong><span>Simple, transparent, fair.</span></div></div>
      </div>
      <div className="auth-footer">© 2026 Klip · Built for keeping things fair.</div>
    </section>
    <section className="auth-right"><div className="auth-card">
      <div className="mobile-brand"><Brand/></div>
      <div className="auth-heading"><div className="eyebrow">YOUR LEDGER, YOUR RULES</div><h2>{mode === "login" ? "Welcome back." : "Make it official."}</h2><p>{mode === "login" ? "Pick up right where you left off." : "Create your account and keep things clear."}</p></div>
      <form onSubmit={submit} className="form-stack">
        {mode === "register" && <label>Your name<input value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Aradhy Tripathi" autoComplete="name" required/></label>}
        <label>Phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Enter your registered phone" autoComplete="tel" required/></label>
        <label>Password<input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Enter your password" autoComplete={mode === "login" ? "current-password" : "new-password"} required minLength={6}/></label>
        {error && <div className="error-box">{error}</div>}
        <button className="button button-primary button-full" disabled={busy}>{busy ? <LoaderCircle className="spin" size={17}/> : null}{mode === "login" ? "Sign in" : "Create account"} <ChevronRight size={17}/></button>
      </form>
      <div className="auth-switch">{mode === "login" ? "New to Klip?" : "Already have an account?"} <button onClick={() => { setMode(mode === "login" ? "register" : "login"); setError(""); }}>{mode === "login" ? "Create an account" : "Sign in instead"}</button></div>
      <div className="secure-note"><ShieldCheck size={15}/> Your ledger is private to you and the people involved.</div>
    </div></section>
  </main>;
}
function Sidebar({ page, setPage, onLogout, mobileOpen, setMobileOpen }) {
  const nav = [
    { id: "overview", label: "Overview", icon: LayoutDashboard },
    { id: "people", label: "People", icon: Users },
    { id: "activity", label: "Activity", icon: FileClock }
  ];
  return <>
    {mobileOpen && <button className="mobile-scrim" onClick={() => setMobileOpen(false)} aria-label="Close menu"/>}
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-top"><Brand/><button className="icon-button mobile-close" onClick={() => setMobileOpen(false)} aria-label="Close menu"><X size={18}/></button></div>
      <div className="workspace-label">WORKSPACE</div>
      <nav className="nav-list">{nav.map(({ id, label, icon: Icon }) => <button key={id} className={`nav-item ${page === id ? "nav-active" : ""}`} onClick={() => { setPage(id); setMobileOpen(false); }}><Icon size={18}/><span>{label}</span>{id === "activity" && <span className="nav-pill">NEW</span>}</button>)}</nav>
      <div className="sidebar-bottom"><div className="help-card"><div className="help-icon"><CircleHelp size={17}/></div><strong>Need a hand?</strong><p>Keeping money clear keeps friendships easy.</p><button onClick={() => alert("Klip V1 help centre is coming soon.")}>Explore tips <ExternalArrow size={13}/></button></div><button className="nav-item" onClick={() => alert("Settings are coming soon.")}><Settings2 size={18}/><span>Settings</span></button><button className="nav-item logout-item" onClick={onLogout}><LogOut size={18}/><span>Sign out</span></button><div className="sidebar-version"><span className="version-dot"/> Klip V1.0 <span>·</span> Preview</div></div>
    </aside>
  </>;
}
function Header({ onAdd, onMenu, userName }) {
  return <header className="topbar"><div className="topbar-left"><button className="icon-button menu-trigger" onClick={onMenu} aria-label="Open menu"><Menu size={20}/></button><div className="breadcrumb">Workspace <ChevronRight size={14}/> <strong>Overview</strong></div></div><div className="topbar-actions"><div className="date-chip"><span className="date-live"/> Your ledger is up to date</div><button className="icon-button notification-button" onClick={() => alert("You're all caught up.")} aria-label="Notifications"><Bell size={18}/><i/></button><div className="topbar-user"><Avatar name={userName || "Klip User"} small/><ChevronDown size={14}/></div><button className="button button-primary top-add" onClick={onAdd}><Plus size={16}/> Add entry</button></div></header>;
}
function StatCard({ label, amount, sub, icon: Icon, tone, trend }) {
  return <div className="stat-card"><div className="stat-top"><span>{label}</span><div className={`stat-icon ${tone}`}><Icon size={18}/></div></div><div className="stat-amount">{amount}</div><div className="stat-foot"><span className="stat-trend">{trend}</span><span>{sub}</span></div></div>;
}
function EntryRow({ entry, onClick }) {
  const lender = entry.role === "lender";
  return <button className="entry-row" onClick={() => onClick(entry)}><Avatar name={entry.other_party || "Unknown"} small/><div className="entry-main"><strong>{entry.other_party || "Unknown person"}</strong><span>{entry.description || "No description"}</span></div><div className={`entry-status ${entry.status === "settled" ? "status-settled" : ""}`}><span/>{entry.status === "settled" ? "Settled" : "Open"}</div><div className={`entry-amount ${lender ? "amount-in" : "amount-out"}`}><strong>{lender ? "+" : "−"}{money(entry.amount_paise)}</strong><span>{lender ? "They owe you" : "You owe"}</span></div><div className="entry-date">{formatDate(entry.created_at)}</div><ChevronRight className="entry-chevron" size={16}/></button>;
}
function EmptyState({ onAdd }) {
  return <div className="empty-state"><div className="empty-icon"><HandCoins size={25}/></div><h3>Your ledger starts here</h3><p>Add your first entry and make money between friends easier to track.</p><button className="button button-primary" onClick={onAdd}><Plus size={16}/> Add your first entry</button></div>;
}
function AddEntryModal({ onClose, onCreate }) {
  const [type, setType] = useState("owed_to_me");
  const [amount, setAmount] = useState("");
  const [phone, setPhone] = useState("");
  const [description, setDescription] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault(); setError("");
    const value = Number(amount);
    if (!Number.isFinite(value) || value <= 0 || !Number.isInteger(value)) { setError("Enter a valid whole-rupee amount."); return; }
    if (!phone.trim()) { setError("Enter the other person's phone number."); return; }
    setBusy(true);
    try {
      await onCreate({ type: "money", amount: String(value), description: description.trim(), counterpartyPhone: phone.trim(), direction: type });
      onClose();
    } catch (err) { setError(err.message || "Could not create entry."); }
    finally { setBusy(false); }
  };
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="entry-modal" role="dialog" aria-modal="true" aria-labelledby="modal-title">
    <div className="modal-top"><div><div className="eyebrow">NEW LEDGER ENTRY</div><h2 id="modal-title">Make it clear.</h2><p>Keep the details simple. You can review them later.</p></div><button className="icon-button" onClick={onClose} aria-label="Close"><X size={19}/></button></div>
    <form onSubmit={submit} className="form-stack">
      <label>Who owes whom?</label>
      <div className="direction-switch"><button type="button" className={type === "owed_to_me" ? "direction-active" : ""} onClick={() => setType("owed_to_me")}><ArrowDownLeft size={17}/> They owe me</button><button type="button" className={type === "i_owe" ? "direction-active" : ""} onClick={() => setType("i_owe")}><ArrowUpRight size={17}/> I owe them</button></div>
      <label>Amount<input type="number" inputMode="numeric" min="1" step="1" value={amount} onChange={e => setAmount(e.target.value)} placeholder="₹ 0" required/><span className="field-hint">Whole rupees for V1.</span></label>
      <label>Their phone number<input value={phone} onChange={e => setPhone(e.target.value)} placeholder="Phone number linked to their account" required/></label>
      <label>What's it for?<input value={description} onChange={e => setDescription(e.target.value)} placeholder="e.g. Dinner, tickets, cab fare" maxLength={500} required/></label>
      {error && <div className="error-box">{error}</div>}
      <div className="modal-actions"><button type="button" className="button button-quiet" onClick={onClose}>Cancel</button><button className="button button-primary" disabled={busy}>{busy ? <LoaderCircle className="spin" size={16}/> : <Plus size={16}/>} Save entry</button></div>
    </form>
  </section></div>;
}
function EntryDetail({ entry, onClose }) {
  if (!entry) return null;
  const lender = entry.role === "lender";
  return <div className="modal-backdrop" onMouseDown={e => { if (e.target === e.currentTarget) onClose(); }}><section className="entry-modal detail-modal" role="dialog" aria-modal="true">
    <div className="modal-top"><div><div className="eyebrow">ENTRY DETAILS</div><h2>{entry.other_party || "Ledger entry"}</h2><p>{entry.description || "No description provided"}</p></div><button className="icon-button" onClick={onClose}><X size={19}/></button></div>
    <div className="detail-amount"><span>{lender ? "They owe you" : "You owe them"}</span><strong className={lender ? "amount-in" : "amount-out"}>{lender ? "+" : "−"}{money(entry.amount_paise)}</strong><span className={`entry-status ${entry.status === "settled" ? "status-settled" : ""}`}><span/>{entry.status === "settled" ? "Settled" : "Open"}</span></div>
    <div className="detail-line"><span>Created</span><strong>{formatDate(entry.created_at)}</strong></div><div className="detail-line"><span>Entry type</span><strong>Money</strong></div><div className="detail-line"><span>Entry ID</span><strong className="mono">{String(entry.id).slice(0, 12)}</strong></div>
    <div className="notice-box"><ShieldCheck size={17}/><span>Changes and settlement actions will be available once the V1 lifecycle API is connected.</span></div>
    <div className="modal-actions"><button className="button button-quiet" onClick={onClose}>Close details</button></div>
  </section></div>;
}
function App() {
  const [token, setTokenState] = useState(getToken());
  const [entries, setEntries] = useState(demoEntries);
  const [live, setLive] = useState(false);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState("overview");
  const [search, setSearch] = useState("");
  const [filter, setFilter] = useState("all");
  const [modalOpen, setModalOpen] = useState(false);
  const [selected, setSelected] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [notice, setNotice] = useState("");
  const userName = localStorage.getItem("klip_name") || "Aradhy Tripathi";

  const loadEntries = async () => {
    if (!getToken()) return;
    setLoading(true);
    try { const result = await fetchEntries(); setEntries(result); setLive(true); }
    catch (err) { setNotice(`API connection issue: ${err.message}`); }
    finally { setLoading(false); }
  };
  useEffect(() => { if (token) loadEntries(); }, [token]);
  const logout = () => { clearToken(); setTokenState(null); setLive(false); setEntries(demoEntries); };
  const onAuthed = () => { setTokenState(getToken()); };
  const onCreate = async (form) => {
    if (live || getToken()) {
      const result = await createEntry({ type: form.type, amount: form.amount, description: form.description, counterpartyPhone: form.counterpartyPhone });
      const entry = result.entry || result;
      setEntries(old => [entry, ...old]); setNotice("Entry saved successfully.");
      return;
    }
    const amountPaise = Number(form.amount) * 100;
    const entry = { id: `local-${Date.now()}`, other_party: form.counterpartyPhone, type: "money", amount_paise: amountPaise, status: "active", description: form.description, created_at: new Date().toISOString(), role: form.direction === "owed_to_me" ? "lender" : "borrower" };
    setEntries(old => [entry, ...old]); setNotice("Preview entry added locally. Sign in to save entries to your account.");
  };
  const filtered = useMemo(() => entries.filter(e => {
    const query = search.toLowerCase();
    const matchesSearch = `${e.other_party || ""} ${e.description || ""}`.toLowerCase().includes(query);
    const matchesFilter = filter === "all" || (filter === "owed" && e.role === "lender" && e.status !== "settled") || (filter === "owing" && e.role !== "lender" && e.status !== "settled") || (filter === "settled" && e.status === "settled");
    const matchesPage = page !== "people" || true;
    return matchesSearch && matchesFilter && matchesPage;
  }), [entries, search, filter, page]);
  const owedToMe = entries.filter(e => e.role === "lender" && e.status !== "settled").reduce((sum, e) => sum + (Number(e.amount_paise) || 0), 0);
  const iOwe = entries.filter(e => e.role !== "lender" && e.status !== "settled").reduce((sum, e) => sum + (Number(e.amount_paise) || 0), 0);
  const net = owedToMe - iOwe;
  const uniquePeople = [...new Map(entries.map(e => [e.other_party || e.counterparty_phone, e])).values()];
  if (!token) return <><AuthScreen onAuthed={onAuthed}/><button className="preview-access" onClick={() => { setTokenState("preview"); setNotice("You're viewing sample data. Sign in to connect your backend."); }}>Explore preview <ChevronRight size={15}/></button></>;
  return <div className="app-shell">
    <Sidebar page={page} setPage={setPage} onLogout={logout} mobileOpen={mobileOpen} setMobileOpen={setMobileOpen}/>
    <main className="main-area"><Header onAdd={() => setModalOpen(true)} onMenu={() => setMobileOpen(true)} userName={userName}/>
      <div className="content-wrap">
        {notice && <div className="notice-banner"><span>{notice}</span><button onClick={() => setNotice("")} aria-label="Dismiss"><X size={15}/></button></div>}
        <div className="welcome-row"><div><div className="eyebrow">THURSDAY, OCTOBER 15, 2026</div><h1>{page === "people" ? "Your people." : page === "activity" ? "The full picture." : "Money, made clearer."}</h1><p>{page === "people" ? "Every person, every balance, all in one place." : page === "activity" ? "A transparent history of what’s moving." : "A little clarity goes a long way. Here’s where things stand."}</p></div><button className="button button-primary welcome-add" onClick={() => setModalOpen(true)}><Plus size={17}/> New entry</button></div>
        {!live && <div className="preview-banner"><Sparkles size={16}/><span><strong>Preview mode</strong> — showing sample ledger data. Sign in to connect your live account.</span><button onClick={() => { setTokenState(null); clearToken(); }}>Sign in <ChevronRight size={14}/></button></div>}
        {page === "overview" && <div className="stats-grid"><StatCard label="Owed to you" amount={money(owedToMe)} sub="across open entries" icon={ArrowDownLeft} tone="tone-green" trend={<ArrowDownLeft size={13}/>}/><StatCard label="You owe" amount={money(iOwe)} sub="across open entries" icon={ArrowUpRight} tone="tone-peach" trend={<ArrowUpRight size={13}/>}/><StatCard label="Your net balance" amount={`${net >= 0 ? "+" : "−"}${money(Math.abs(net))}`} sub="owed to you minus owed by you" icon={Wallet} tone="tone-lilac" trend={<Check size={13}/>}/></div>}
        <section className="panel"><div className="panel-head"><div><h2>{page === "people" ? "People" : page === "activity" ? "All activity" : "Recent entries"}</h2><p>{page === "people" ? `${uniquePeople.length} people in your ledger` : `${filtered.length} ${filtered.length === 1 ? "entry" : "entries"} to keep track of`}</p></div><div className="panel-actions"><div className="search-box"><Search size={16}/><input value={search} onChange={e => setSearch(e.target.value)} placeholder={page === "people" ? "Search people..." : "Search entries..."}/>{search && <button onClick={() => setSearch("")}><X size={13}/></button>}</div><div className="filter-wrap"><Filter size={15}/><select value={filter} onChange={e => setFilter(e.target.value)} aria-label="Filter entries"><option value="all">All entries</option><option value="owed">Owed to me</option><option value="owing">I owe</option><option value="settled">Settled</option></select></div></div></div>
          {loading ? <div className="loading-state"><LoaderCircle className="spin" size={22}/> Loading your entries…</div> : page === "people" ? <div className="people-list">{uniquePeople.filter(e => `${e.other_party || ""}`.toLowerCase().includes(search.toLowerCase())).map((entry, idx) => {
            const person = entry.other_party || "Unknown person";
            const personEntries = entries.filter(e => e.other_party === entry.other_party);
            const balance = personEntries.reduce((sum, e) => sum + (e.status === "settled" ? 0 : (e.role === "lender" ? 1 : -1) * (Number(e.amount_paise) || 0)), 0);
            return <button className="person-row" key={entry.id || idx} onClick={() => { setSelected(entry); }}><Avatar name={person}/><div className="person-copy"><strong>{person}</strong><span>{personEntries.length} {personEntries.length === 1 ? "entry" : "entries"}</span></div><div className={`person-balance ${balance >= 0 ? "amount-in" : "amount-out"}`}><strong>{balance >= 0 ? "+" : "−"}{money(Math.abs(balance))}</strong><span>{balance >= 0 ? "owes you" : "you owe"}</span></div><ChevronRight size={17}/></button>;
          })}</div> : filtered.length ? <div className="entries-list">{filtered.map(entry => <EntryRow key={entry.id} entry={entry} onClick={setSelected}/>)}</div> : <EmptyState onAdd={() => setModalOpen(true)}/>}
          <div className="panel-footer"><span><ShieldCheck size={14}/> Only you and the other person can see a shared entry.</span><button onClick={() => setPage(page === "activity" ? "overview" : "activity")}>{page === "activity" ? "Back to overview" : "View all activity"} <ChevronRight size={14}/></button></div>
        </section>
        <footer className="page-footer"><span>© 2026 Klip</span><span>Keep track. Keep it fair. <span className="footer-heart">♥</span></span><span className="connection-state"><i className={live ? "connected" : ""}/>{live ? "Connected to API" : "Preview data"}</span></footer>
      </div>
    </main>
    {modalOpen && <AddEntryModal onClose={() => setModalOpen(false)} onCreate={onCreate}/>}
    {selected && <EntryDetail entry={selected} onClose={() => setSelected(null)}/>}
  </div>;
}
export default App;