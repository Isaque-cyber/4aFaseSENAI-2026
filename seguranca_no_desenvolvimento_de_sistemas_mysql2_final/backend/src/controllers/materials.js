// Lista materiais com busca opcional.
export async function listMaterials(req, res) {
  const rawSearch = typeof req.query.q === "string" ? req.query.q : "";
  const search = rawSearch.trim();

  if (search.length > 100) {
    return res.status(400).json({
      message: "A busca pode ter no máximo 100 caracteres."
    });
  }

  if (!search) {
    const [rows] = await req.app.locals.db.execute(
      "SELECT id, name, category FROM materials ORDER BY id"
    );
    return res.json(rows);
  }

  const term = `%${search}%`;
  const [rows] = await req.app.locals.db.execute(
    `SELECT id, name, category
     FROM materials
     WHERE name LIKE ? OR category LIKE ?
     ORDER BY id`,
    [term, term]
  );

  return res.json(rows);
}

// Exclui material: a rota ja garante que apenas admin chega aqui.
export async function deleteMaterial(req, res) {
  const id = Number(req.params.id);

  if (!Number.isSafeInteger(id) || id <= 0) {
    return res.status(400).json({ message: "ID invalido." });
  }

  const [result] = await req.app.locals.db.execute(
    "DELETE FROM materials WHERE id = ?",
    [id]
  );

  if (!result.affectedRows) {
    return res.status(404).json({ message: "Material nao encontrado." });
  }

  res.status(204).end();
}
