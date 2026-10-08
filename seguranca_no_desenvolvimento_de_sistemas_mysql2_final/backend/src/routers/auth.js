import { Router } from "express";
import { login } from "../controllers/auth.js";
import { register } from "../controllers/register.js";

const router = Router();
// Login ? p?blico: o aluno ainda n?o possui um token.
router.post("/login", login);
// Cadastro também é público: ainda não existe uma sessão.
router.post("/register", register);
export default router;
