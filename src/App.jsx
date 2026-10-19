import { useCallback, useState } from "react";
import Auth from "./Auth.jsx";
import Ledger from "./Ledger.jsx";
import { clearSession, loadSession, saveSession } from "./api.js";

export default function App() {
  const [session, setSession] = useState(loadSession);
  const [notice, setNotice] = useState("");

  const signedIn = (next) => {
    saveSession(next);
    setNotice("");
    setSession(next);
  };

  const signOut = useCallback((message = "") => {
    clearSession();
    setNotice(message);
    setSession(null);
  }, []);

  if (!session) return <Auth notice={notice} onSignedIn={signedIn} />;
  return <Ledger session={session} onSignOut={signOut} />;
}
