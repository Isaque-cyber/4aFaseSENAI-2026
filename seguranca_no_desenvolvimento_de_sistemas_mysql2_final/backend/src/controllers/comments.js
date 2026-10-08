function validateComment(value) {
  return (
    typeof value === "string" &&
    value.trim().length >= 1 &&
    value.trim().length <= 500
  );
}

export async function listComments(req, res) {
  const materialId = Number(req.params.id);

  if (!Number.isSafeInteger(materialId) || materialId <= 0) {
    return res.status(400).json({ message: "ID do produto invalido." });
  }

  const [rows] = await req.app.locals.db.execute(
    `SELECT
       c.id,
       c.material_id,
       c.comment,
       c.created_at,
       u.name AS author
     FROM comments c
     INNER JOIN users u ON u.id = c.user_id
     WHERE c.material_id = ?
     ORDER BY c.id DESC`,
    [materialId]
  );

  return res.json(rows);
}

export async function createComment(req, res) {
  const materialId = Number(req.params.id);
  const { comment } = req.body || {};

  if (!Number.isSafeInteger(materialId) || materialId <= 0) {
    return res.status(400).json({ message: "ID do produto invalido." });
  }

  if (!validateComment(comment)) {
    return res.status(400).json({
      message: "O comentario deve ser um texto com 1 a 500 caracteres."
    });
  }

  const [materials] = await req.app.locals.db.execute(
    "SELECT id FROM materials WHERE id = ?",
    [materialId]
  );

  if (!materials.length) {
    return res.status(404).json({ message: "Produto nao encontrado." });
  }

  const userId = Number(req.user?.sub);

  if (!Number.isSafeInteger(userId) || userId <= 0) {
    return res.status(401).json({ message: "Sessao invalida." });
  }

  const text = comment.trim();

  const [result] = await req.app.locals.db.execute(
    "INSERT INTO comments (material_id, user_id, comment) VALUES (?, ?, ?)",
    [materialId, userId, text]
  );

  return res.status(201).json({
    id: result.insertId,
    material_id: materialId,
    comment: text
  });
}
