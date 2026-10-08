-- Execute depois de criar a tabela users e usando a tabela materials da aula.
-- Não apaga nem altera registros existentes.

CREATE TABLE IF NOT EXISTS comments (
  id INT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
  material_id INT NOT NULL,
  user_id INT UNSIGNED NOT NULL,
  comment VARCHAR(500) CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT fk_comments_material
    FOREIGN KEY (material_id) REFERENCES materials(id)
    ON DELETE CASCADE,

  CONSTRAINT fk_comments_user
    FOREIGN KEY (user_id) REFERENCES users(id)
    ON DELETE CASCADE
) CHARACTER SET = utf8mb4 COLLATE = utf8mb4_unicode_ci;
