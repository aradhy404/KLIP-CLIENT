import { useState } from "react";
import { login, register } from "./api.js";
import { cleanPhone } from "./format.js";

export default function Auth({ notice, onSignedIn }) {
  const [mode, setMode] = useState("login");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [busy, setBusy] = useState(false);
  const [slow, setSlow] = useState(false);
  const [error, setError] = useState("");

  const isRegister = mode === "register";

  function switchMode() {
    setMode(isRegister ? "login" : "register");
    setError("");
  }

  async function submit(e) {
    e.preventDefault();
    setError("");

    const cleanedName = name.trim();
    const phone10 = cleanPhone(phone);

    if (isRegister && !cleanedName) return setError("Enter your name.");
    if (!phone10) return setError("Enter a 10-digit mobile number.");
    if (isRegister && password.length < 8) {
      return setError("Use at least 8 characters for your password.");
    }
    if (!isRegister && !password) return setError("Enter your password.");

    setBusy(true);
    setSlow(false);
    try {
      const onSlow = () => setSlow(true);
      const res = isRegister
        ? await register(cleanedName, phone10, password, onSlow)
        : await login(phone10, password, onSlow);
      onSignedIn({ token: res.token, user: res.data });
    } catch (err) {
      setError(err.message);
      setBusy(false);
      setSlow(false);
    }
  }

  return (
    <div className="auth">
      <aside className="auth-hero">
        <span className="wordmark">klip</span>

        <div className="auth-copy">
          <h1>Who owes you?</h1>
          <p>
            Write down the money and favours you've given. Klip keeps the record, so nobody has to
            remember.
          </p>
        </div>

        <div className="scrap" aria-hidden="true">
          <div className="scrap-line">
            <span className="hand">Rohan</span>
            <span>dinner after the exam</span>
            <b>₹450</b>
          </div>
          <div className="scrap-line">
            <span className="hand">Isha</span>
            <span>Tuesday's lecture notes</span>
            <b className="hand">favour</b>
          </div>
        </div>
      </aside>

      <main className="auth-form-wrap">
        <form className="auth-form" onSubmit={submit} noValidate>
          <h2>{isRegister ? "Create your account" : "Sign in"}</h2>
          <p className="muted">
            {isRegister
              ? "Entries made about your number appear here once you sign up."
              : "Pick up your ledger where you left it."}
          </p>

          {notice && (
            <p className="msg notice" role="status">
              {notice}
            </p>
          )}

          {isRegister && (
            <div className="field">
              <label htmlFor="a-name">Your name</label>
              <input
                id="a-name"
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                autoComplete="name"
                maxLength={100}
              />
            </div>
          )}

          <div className="field">
            <label htmlFor="a-phone">Mobile number</label>
            <input
              id="a-phone"
              className="input"
              type="tel"
              inputMode="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              autoComplete="tel-national"
              placeholder="98765 43210"
            />
          </div>

          <div className="field">
            <label htmlFor="a-password">Password</label>
            <div className="with-action">
              <input
                id="a-password"
                className="input"
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                autoComplete={isRegister ? "new-password" : "current-password"}
              />
              <button
                type="button"
                className="link-btn inside"
                onClick={() => setShowPassword((v) => !v)}
                aria-pressed={showPassword}
              >
                {showPassword ? "Hide" : "Show"}
              </button>
            </div>
            {isRegister && <span className="hint">At least 8 characters.</span>}
          </div>

          <button className="btn primary block" disabled={busy}>
            {busy
              ? isRegister
                ? "Creating account…"
                : "Signing in…"
              : isRegister
                ? "Create account"
                : "Sign in"}
          </button>

          <p className="msg err" role="alert">
            {error}
          </p>
          {slow && (
            <p className="msg" role="status">
              Waking the server. On the free plan this can take up to a minute.
            </p>
          )}

          <p className="switch">
            {isRegister ? "Already have an account?" : "New to Klip?"}{" "}
            <button type="button" className="link-btn" onClick={switchMode}>
              {isRegister ? "Sign in" : "Create an account"}
            </button>
          </p>

          <p className="fine">Only you and the person on an entry can see it.</p>
        </form>
      </main>
    </div>
  );
}
