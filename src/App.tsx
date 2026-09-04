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
  const lastActivityRef = useRef(typeof performance === "undefined" ? 0 : performance.now());

  const focus: FocusField = busy ? "none" : loginHover ? "login" : fieldFocus;

  const targetRef = useHenBrain({
    focus,
    email,
    passwordVisible,
    typingEmail,
    typingPassword,
    submitting: busy,
    celebrating: Boolean(session) || busy,
    pointerRef,
    lastActivityRef,
  });

  const headline = useMemo(() => (mode === "login" ? "Log in" : "Create account"), [mode]);

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
      setError("Enter a valid email.");
      return;
    }
    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }
    if (mode === "signup" && name.trim().length < 2) {
      setError("Enter your name.");
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

  function bumpActivity() {
    lastActivityRef.current = performance.now();
  }

  function markEmailTyping() {
    setTypingEmail(true);
    bumpActivity();
    window.clearTimeout(emailTimer.current);
    emailTimer.current = window.setTimeout(() => setTypingEmail(false), 420);
  }

  function markPasswordTyping() {
    setTypingPassword(true);
    bumpActivity();
    window.clearTimeout(passwordTimer.current);
    passwordTimer.current = window.setTimeout(() => setTypingPassword(false), 420);
  }

  function onPointerMove(event: React.PointerEvent<HTMLDivElement>) {
    bumpActivity();
    const box = henBox.current;
    if (!box) return;
    const rect = box.getBoundingClientRect();
    const x = (event.clientX - (rect.left + rect.width / 2)) / (rect.width / 2);
    const y = (event.clientY - (rect.top + rect.height / 2.4)) / (rect.height / 2);
    pointerRef.current = {
      x: Math.max(-1, Math.min(1, x)),
      y: Math.max(-1, Math.min(1, y)),
    };
  }

  const hen = (
    <div className="hen-stage">
      <HenCharacter targetRef={targetRef} />
    </div>
  );

  return (
    <div className="page" onPointerMove={onPointerMove} onPointerDown={bumpActivity} onKeyDown={bumpActivity}>
      <header className="topbar">
        <a className="brand" href="#home">
          PocketMemory
        </a>
      </header>

      {session ? (
        <section className="closet">
          <div className="closet-hen" ref={henBox}>
            {hen}
          </div>
          <div className="closet-panel">
            <h1>You’re in, {session.split("@")[0]}.</h1>
            <p>PocketMemory will keep your outfits so you don’t repeat a look by accident.</p>
            <button className="logout" type="button" onClick={logout}>
              Log out
            </button>
          </div>
        </section>
      ) : (
        <section className="hero" id="home">
          <div className="hero-left" ref={henBox}>
            {hen}
          </div>

          <div className="hero-right">
            <form className="login-card" onSubmit={onSubmit}>
              <h2>{headline}</h2>
              <p>{mode === "login" ? "Welcome back." : "Start a new closet."}</p>

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
                  <label htmlFor="name">Name</label>
                  <input
                    id="name"
                    name="name"
                    autoComplete="nickname"
                    placeholder="Your name"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                  />
                </div>
              ) : null}

              <div className="field" onMouseDown={() => setFieldFocus("email")}>
                <label htmlFor="email">Email</label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@email.com"
                  value={email}
                  onChange={(event) => {
                    setEmail(event.target.value);
                    markEmailTyping();
                  }}
                    onFocus={() => {
                      bumpActivity();
                      setFieldFocus("email");
                    }}
                  onMouseDown={() => setFieldFocus("email")}
                  onBlur={() => setFieldFocus((current) => (current === "email" ? "none" : current))}
                />
              </div>

              <div className="field" onMouseDown={() => setFieldFocus("password")}>
                <label htmlFor="password">Password</label>
                <div className="input-wrap">
                  <input
                    id="password"
                    name="password"
                    type={passwordVisible ? "text" : "password"}
                    autoComplete={mode === "login" ? "current-password" : "new-password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(event) => {
                      setPassword(event.target.value);
                      markPasswordTyping();
                    }}
                    onFocus={() => {
                      bumpActivity();
                      setFieldFocus("password");
                    }}
                    onMouseDown={() => setFieldFocus("password")}
                    onBlur={() => setFieldFocus((current) => (current === "password" ? "none" : current))}
                  />
                  <button
                    className="eye-toggle"
                    type="button"
                    aria-label={passwordVisible ? "Hide password" : "Show password"}
                    onClick={() => setPasswordVisible((value) => !value)}
                  >
                    {passwordVisible ? "Hide" : "Show"}
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
                  Remember me
                </label>
                <button
                  className="ghost-link"
                  type="button"
                  onClick={() => setNotice("Demo: any email and a password of 6+ characters.")}
                >
                  Forgot password?
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
                {busy ? "Signing in…" : mode === "login" ? "Continue" : "Create account"}
              </button>
              <p className="hint">Demo: any email + 6 or more characters.</p>
            </form>
          </div>
        </section>
      )}
    </div>
  );
}
