 "use client";

import { useState, type FormEvent } from "react";
import { login, type Session } from "../services/login";
import { errorMessage } from "../services/api";
import Home from "./Home";
import Register from "./Register";

export default function Login() {
  const [session, setSession] = useState<Session | null>(null);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [showRegister, setShowRegister] = useState(false);
  const [notice, setNotice] = useState("");

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    setNotice("");

    try {
      const result = await login(email, password);
      setSession(result);
      setPassword("");
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setBusy(false);
    }
  }

  return (
    <main>
      <header>Controle de materiais · Segurança no desenvolvimento</header>

      {session ? (
        <Home
          session={session}
          onLogout={() => {
            setSession(null);
            setEmail("");
            setPassword("");
          }}
        />
      ) : showRegister ? (
        <Register
          onBack={() => setShowRegister(false)}
          onRegistered={message => {
            setShowRegister(false);
            setNotice(message);
          }}
        />
      ) : (
        <section className="panel" aria-labelledby="login-title">
          <h1 id="login-title">Entrar</h1>
          <p>Digite o e-mail e a senha da sua conta.</p>

          {notice && <p className="success" role="status">{notice}</p>}
          {error && <p role="alert" className="error">{error}</p>}

          <form onSubmit={submit}>
            <label htmlFor="email">E-mail</label>
            <input
              id="email"
              type="email"
              autoComplete="username"
              required
              disabled={busy}
              value={email}
              onChange={event => setEmail(event.target.value)}
            />

            <label htmlFor="password">Senha</label>
            <input
              id="password"
              type="password"
              autoComplete="current-password"
              required
              disabled={busy}
              value={password}
              onChange={event => setPassword(event.target.value)}
            />

            <button disabled={busy} type="submit">
              {busy ? "Entrando..." : "Entrar"}
            </button>

            <button
              type="button"
              className="secondary"
              disabled={busy}
              onClick={() => {
                setError("");
                setNotice("");
                setEmail("");
                setPassword("");
                setShowRegister(true);
              }}
            >
              Cadastrar usuário
            </button>
          </form>
        </section>
      )}
    </main>
  );
}
