import { FormEvent, useMemo, useState } from "react";
import "./App.css";

type Mode = "login" | "signup";

const SESSION_KEY = "pocketmemory-session";

function readSession() {
  try {
    return window.localStorage.getItem(SESSION_KEY);
  } catch {
    return null;
  }
}

export default function App() {
  const [mode, setMode] = useState<Mode>("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [name, setName] = useState("");
  const [remember, setRemember] = useState(true);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<string | null>(() => readSession());

  const headline = useMemo(
    () => (mode === "login" ? "Strut back in" : "Join the coop"),
    [mode],
  );

  function persist(nextEmail: string) {
    if (remember) {
      window.localStorage.setItem(SESSION_KEY, nextEmail);
    } else {
      window.localStorage.removeItem(SESSION_KEY);
    }
    setSession(nextEmail);
  }

  function onSubmit(event: FormEvent) {
    event.preventDefault();
    setError("");

    const trimmedEmail = email.trim().toLowerCase();
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(trimmedEmail)) {
      setError("That email looks scrambled. Try again, superstar.");
      return;
    }
    if (password.length < 6) {
      setError("Password needs at least 6 funky characters.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Give Henrietta a name to cheer for.");
      return;
    }

    setBusy(true);
    window.setTimeout(() => {
      persist(trimmedEmail);
      setBusy(false);
    }, 450);
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setPassword("");
  }

  return (
    <div className="page">
      <header className="topbar">
        <a className="brand" href="#home">
          <span className="brand-mark">
            <img src="/henrietta-hen.png" alt="" />
          </span>
          <span className="brand-copy">
            <span className="brand-name">PocketMemory</span>
            <span className="brand-tag">wardrobe app • cluck your look</span>
          </span>
        </a>
        <span className="chip">Henrietta is in the building</span>
      </header>

      {session ? (
        <section className="closet">
          <div className="closet-panel">
            <img src="/henrietta-hen.png" alt="Henrietta the stylish hen" />
            <h1>You made it, {session.split("@")[0]}!</h1>
            <p>
              The closet is warming up. PocketMemory will remember every outfit so
              you never repeat a vibe by accident.
            </p>
            <button className="logout" type="button" onClick={logout}>
              Log out and strut off
            </button>
          </div>
        </section>
      ) : (
        <section className="hero" id="home">
          <div className="hero-left">
            <div className="headline-wrap">
              <span className="eyebrow">Meet Henrietta • your fashion hen</span>
              <h1 className="headline">CLOSET CHAOS? HEN GOT YOU.</h1>
              <p className="lede">
                PocketMemory is a funky wardrobe sidekick. Snap the fit, stash the
                memory, and let this stylish hen keep your looks loud.
              </p>
            </div>
            <div className="hen-stage">
              <div className="speech">Let’s get dressed, superstar!</div>
              <span className="blob" />
              <span className="star" />
              <span className="zig" />
              <img
                className="hen"
                src="/henrietta-hen.png"
                alt="Funny, stylish, energetic cartoon hen named Henrietta giving a thumbs-up"
              />
            </div>
          </div>

          <div className="hero-right">
            <form className="login-card" onSubmit={onSubmit}>
              <h2>{headline}</h2>
              <p>
                {mode === "login"
                  ? "Log in and let Henrietta open the closet."
                  : "Create an account. The hen already likes your vibe."}
              </p>

              <div className="tabs">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setMode("login");
                    setError("");
                  }}
                >
                  Log in
                </button>
                <button
                  type="button"
                  className={mode === "signup" ? "active" : ""}
                  onClick={() => {
                    setMode("signup");
                    setError("");
                  }}
                >
                  Sign up
                </button>
              </div>

              {error ? <div className="error">{error}</div> : null}

              {mode === "signup" ? (
                <div className="field">
                  <label htmlFor="name">Stage name</label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="nickname"
                    placeholder="Henrietta Fan"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="field">
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@funky.mail"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                />
              </div>

              <div className="field">
                <label htmlFor="password">Password</label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete={mode === "login" ? "current-password" : "new-password"}
                  placeholder="6+ spicy characters"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                />
              </div>

              <div className="row">
                <label>
                  <input
                    type="checkbox"
                    checked={remember}
                    onChange={(event) => setRemember(event.target.checked)}
                  />
                  Keep me struttin’
                </label>
                <button className="ghost-link" type="button">
                  Forgot the groove?
                </button>
              </div>

              <button className="submit" type="submit" disabled={busy}>
                {busy ? "Shaking tail feathers..." : mode === "login" ? "STRUT IN" : "JOIN THE COOP"}
              </button>
              <p className="hint">Demo login: any email + a password of 6+ characters.</p>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
