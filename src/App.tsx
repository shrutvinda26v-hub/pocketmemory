import { FormEvent, useEffect, useMemo, useRef, useState } from "react";
import "./App.css";
import HenCharacter from "./hen/HenCharacter";
import { FocusField, useHenBrain } from "./hen/useHenBrain";

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
  const [notice, setNotice] = useState("");
  const [busy, setBusy] = useState(false);
  const [session, setSession] = useState<string | null>(() => readSession());
  const [fieldFocus, setFieldFocus] = useState<FocusField>("none");
  const [loginHover, setLoginHover] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState(false);
  const [typingEmail, setTypingEmail] = useState(false);
  const [typingPassword, setTypingPassword] = useState(false);

  const henBox = useRef<HTMLDivElement>(null);
  const emailTimer = useRef(0);
  const passwordTimer = useRef(0);
  const pointerRef = useRef<{ x: number; y: number } | null>(null);

  const focus: FocusField = busy ? "none" : loginHover ? "login" : fieldFocus;
  const henMood =
    busy ? "success" : passwordVisible && fieldFocus === "password" ? "visible" : focus;

  const targetRef = useHenBrain({
    focus,
    email,
    passwordVisible,
    typingEmail,
    typingPassword,
    submitting: busy,
    pointerRef,
  });

  const headline = useMemo(
    () => (mode === "login" ? "Strut back in" : "Join the coop"),
    [mode],
  );

  useEffect(() => {
    return () => {
      window.clearTimeout(emailTimer.current);
      window.clearTimeout(passwordTimer.current);
    };
  }, []);

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
    setNotice("");

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
    setLoginHover(false);
    setFieldFocus("none");
    window.setTimeout(() => {
      persist(trimmedEmail);
      setBusy(false);
    }, 900);
  }

  function logout() {
    window.localStorage.removeItem(SESSION_KEY);
    setSession(null);
    setPassword("");
    setFieldFocus("none");
  }

  function markEmailTyping() {
    setTypingEmail(true);
    window.clearTimeout(emailTimer.current);
    emailTimer.current = window.setTimeout(() => setTypingEmail(false), 420);
  }

  function markPasswordTyping() {
    setTypingPassword(true);
    window.clearTimeout(passwordTimer.current);
    passwordTimer.current = window.setTimeout(() => setTypingPassword(false), 420);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    const box = henBox.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = ((event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2));
    const y = ((event.clientY - (rect.top + rect.height / 2.4)) / (rect.height / 2));
    pointerRef.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };
  }

  return (
    <div className="page" onPointerMove={onPointerMove}>
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
        <span className="chip">Henrietta is watching</span>
      </header>

      {session ? (
        <section className="closet">
          <div className="closet-panel">
            <div className="closet-hen">
              <HenCharacter targetRef={targetRef} mood="success" />
            </div>
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
          <div className="hero-left" ref={henBox}>
            <div className="hen-stage">
              <HenCharacter targetRef={targetRef} mood={henMood} />
            </div>
          </div>

          <div className="hero-right">
            <form className="login-card" onSubmit={onSubmit}>
              <h2>{headline}</h2>
              <p>
                {mode === "login"
                  ? "A nosy hen is already involved. Type anyway."
                  : "Create an account. She will pretend not to look."}
              </p>

              <div className="tabs">
                <button
                  type="button"
                  className={mode === "login" ? "active" : ""}
                  onClick={() => {
                    setMode("login");
                    setError("");
                    setNotice("");
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
                    setNotice("");
                  }}
                >
                  Sign up
                </button>
              </div>

              {error ? <div className="error">{error}</div> : null}
              {notice ? <div className="notice">{notice}</div> : null}

              {mode === "signup" ? (
                <div className="field">
                  <label htmlFor="name">
                    Stage name
                    <span className="micro">What should she cheer?</span>
                  </label>
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
                <label htmlFor="email">
                  Email
                  <span className="micro">Who are you?</span>
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@funky.mail"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    markEmailTyping();
                  }}
                  onFocus={() => setFieldFocus("email")}
                  onMouseDown={() => setFieldFocus("email")}
                  onBlur={() => setFieldFocus((current) => (current === "email" ? "none" : current))}
                />
              </div>

              <div className="field">
                <label htmlFor="password">
                  Password
                  <span className="micro">Don’t worry. I won’t look. 👀</span>
                </label>
                <div className="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="Shhh… secret stuff"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      markPasswordTyping();
                    }}
                    onFocus={() => setFieldFocus("password")}
                    onMouseDown={() => setFieldFocus("password")}
                    onBlur={() => setFieldFocus((current) => (current === "password" ? "none" : current))}
                  />
                  <button
                    className="eye-toggle"
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    onClick={() => setPasswordVisible((value) => !value)}
                  >
                    {passwordVisible ? "🙈" : "👁"}
                  </button>
                </div>
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
                <button
                  className="ghost-link"
                  type="button"
                  onClick={() =>
                    setNotice("She never forgets. Use any 6+ character password for this demo.")
                  }
                >
                  Forgot the groove?
                </button>
              </div>

              <button
                className="submit"
                type="submit"
                disabled={busy}
                onMouseEnter={() => setLoginHover(true)}
                onMouseLeave={() => setLoginHover(false)}
                onFocus={() => setLoginHover(true)}
                onBlur={() => setLoginHover(false)}
              >
                {busy ? "YES!!" : "LET ME IN →"}
              </button>
              <p className="hint">She is watching. Demo: any email + 6+ characters.</p>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
