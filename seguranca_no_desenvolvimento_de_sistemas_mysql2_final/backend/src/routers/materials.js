import { Router } from "express";
import { listMaterials, deleteMaterial } from "../controllers/materials.js";
import { listComments, createComment } from "../controllers/comments.js";
import { authenticate, requireRole } from "../middleware/auth.js";

const router = Router();

router.use(authenticate);

// Admin e usuario podem consultar e pesquisar.
router.get("/", listMaterials);

// Comentarios de um produto/material.
router.get("/:id/comments", listComments);
router.post("/:id/comments", createComment);

// Apenas admin pode excluir.
router.delete("/:id", requireRole("admin"), deleteMaterial);

export default router;
