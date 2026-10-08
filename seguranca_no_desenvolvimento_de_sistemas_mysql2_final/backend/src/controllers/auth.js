import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

// Limite simples em memória para a atividade:
// 5 tentativas inválidas e bloqueio por 10 minutos.
const MAX_LOGIN_ATTEMPTS = 5;
const LOCK_TIME_MS = 10 * 60 * 1000;
const loginAttempts = new Map();

function getClientKey(req, email) {
  const ip = req.ip || req.socket?.remoteAddress || "unknown";
  return `${ip}:${email}`;
}

function getLoginState(key) {
  const state = loginAttempts.get(key);
  if (!state) return { attempts: 0, lockedUntil: 0 };

  if (state.lockedUntil && Date.now() >= state.lockedUntil) {
    loginAttempts.delete(key);
    return { attempts: 0, lockedUntil: 0 };
  }

  return state;
}

// Faz login e devolve um token com a role que veio do banco.
export async function login(req, res) {
  const { email, password } = req.body || {};

  if (
    typeof email !== "string" ||
    typeof password !== "string" ||
    !email.trim() ||
    !password ||
    Buffer.byteLength(password) > 72
  ) {
    return res.status(400).json({ message: "Informe email e senha validos." });
  }

  const normalizedEmail = email.trim().toLowerCase();
  const key = getClientKey(req, normalizedEmail);
  const state = getLoginState(key);

  if (state.lockedUntil) {
    const retryAfterSeconds = Math.ceil((state.lockedUntil - Date.now()) / 1000);
    res.set("Retry-After", String(retryAfterSeconds));
    return res.status(429).json({
      message: `Muitas tentativas. Tente novamente em ${retryAfterSeconds} segundos.`,
      retryAfterSeconds,
    });
  }

  // O ? envia o email como dado, sem mistura-lo ao comando SQL.
  const [rows] = await req.app.locals.db.execute(
    "SELECT id, name, email, password_hash, role FROM users WHERE email = ?",
    [normalizedEmail]
  );
  const user = rows[0];

  // bcrypt compara a senha digitada com o hash salvo no banco.
  if (!user || !(await bcrypt.compare(password, user.password_hash))) {
    const nextAttempts = state.attempts + 1;

    if (nextAttempts >= MAX_LOGIN_ATTEMPTS) {
      const lockedUntil = Date.now() + LOCK_TIME_MS;
      loginAttempts.set(key, { attempts: nextAttempts, lockedUntil });

      const retryAfterSeconds = Math.ceil(LOCK_TIME_MS / 1000);
      res.set("Retry-After", String(retryAfterSeconds));
      return res.status(429).json({
        message: `Limite de ${MAX_LOGIN_ATTEMPTS} tentativas atingido. Tente novamente em ${retryAfterSeconds} segundos.`,
        retryAfterSeconds,
      });
    }

    loginAttempts.set(key, { attempts: nextAttempts, lockedUntil: 0 });

    const remainingAttempts = MAX_LOGIN_ATTEMPTS - nextAttempts;
    return res.status(401).json({
      message: "Email ou senha incorretos.",
      remainingAttempts,
    });
  }

  // Login correto limpa o contador daquele email/IP.
  loginAttempts.delete(key);

  const token = jwt.sign(
    { role: user.role },
    process.env.JWT_SECRET,
    { subject: String(user.id), expiresIn: "1h", algorithm: "HS256" }
  );

  return res.json({
    token,
    user: { id: user.id, name: user.name, email: user.email, role: user.role }
  });
}
