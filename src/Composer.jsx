import { useRef, useState } from "react";
import { createEntry } from "./api.js";
import { cleanPhone } from "./format.js";

export default function Composer({ token, onCreated, onUnauthorized }) {
  const [type, setType] = useState("money");
  const [name, setName] = useState("");
  const [phone, setPhone] = useState("");
  const [amount, setAmount] = useState("");
  const [note, setNote] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState("");
  const nameRef = useRef(null);

  const isMoney = type === "money";

  async function submit(e) {
    e.preventDefault();
    setError("");
    setSaved("");

    const cleanedName = name.trim();
    const phone10 = cleanPhone(phone);

    if (!cleanedName) return setError("Give this person a name so you can recognise them later.");
    if (!phone10) return setError("Enter their 10-digit mobile number.");
    if (isMoney && !/^[1-9]\d*$/.test(amount)) {
      return setError("Enter the amount in whole rupees, like 450.");
    }

    setBusy(true);
    try {
      const entry = await createEntry(token, {
        type,
        amount: isMoney ? amount : undefined,
        description: note.trim(),
        counterpartyPhone: phone10,
        counterpartyName: cleanedName,
      });
      setName("");
      setPhone("");
      setAmount("");
      setNote("");
      setSaved(`Saved. ${cleanedName} is in your ledger.`);
      onCreated(entry);
      nameRef.current?.focus();
    } catch (err) {
      if (err.status === 401) return onUnauthorized();
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form className="compose" onSubmit={submit} noValidate>
      <div className="seg" role="radiogroup" aria-label="What did you give?">
        <span className="lead" aria-hidden="true">
          I gave
        </span>
        <label className="seg-opt">
          <input
            type="radio"
            name="entry-type"
            value="money"
            checked={isMoney}
            onChange={() => setType("money")}
          />
          <span>Money</span>
        </label>
        <label className="seg-opt">
          <input
            type="radio"
            name="entry-type"
            value="favour"
            checked={!isMoney}
            onChange={() => setType("favour")}
          />
          <span>A favour</span>
        </label>
      </div>

      <div className="compose-fields">
        <div className="field grow">
          <label htmlFor="c-name">Their name</label>
          <input
            id="c-name"
            ref={nameRef}
            className="input hand-input"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="Rohan"
            maxLength={100}
            autoComplete="off"
            aria-describedby="c-name-hint"
          />
          <span id="c-name-hint" className="hint">
            Only you see this name.
          </span>
        </div>

        <div className="field mid">
          <label htmlFor="c-phone">Their mobile number</label>
          <input
            id="c-phone"
            className="input"
            type="tel"
            inputMode="tel"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="98765 43210"
            autoComplete="off"
          />
        </div>

        {isMoney && (
          <div className="field narrow">
            <label htmlFor="c-amount">Amount in rupees</label>
            <div className="rupee">
              <span aria-hidden="true">₹</span>
              <input
                id="c-amount"
                className="input"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value.replace(/\D/g, ""))}
                maxLength={9}
                autoComplete="off"
              />
            </div>
          </div>
        )}

        <div className="field wide">
          <label htmlFor="c-note">{isMoney ? "What it was for" : "What the favour was"}</label>
          <input
            id="c-note"
            className="input"
            value={note}
            onChange={(e) => setNote(e.target.value)}
            placeholder={isMoney ? "Dinner after the exam" : "Notes from Tuesday's lecture"}
            maxLength={500}
            autoComplete="off"
          />
        </div>

        <button className="btn primary" disabled={busy}>
          {busy ? "Saving…" : "Add to ledger"}
        </button>
      </div>

      <p className="msg err" role="alert">
        {error}
      </p>
      <p className="msg ok" role="status">
        {saved}
      </p>
    </form>
  );
}
