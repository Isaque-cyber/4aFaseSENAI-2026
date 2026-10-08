 "use client";

import { useEffect, useState } from "react";
import { api, errorMessage } from "../services/api";
import type { Session } from "../services/login";

type Material = { id: number; name: string; category: string };
type Comment = {
  id: number;
  material_id: number;
  comment: string;
  created_at: string;
  author: string;
};

type Props = { session: Session; onLogout: () => void };

export default function Home({ session, onLogout }: Props) {
  const [materials, setMaterials] = useState<Material[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [deleting, setDeleting] = useState<number | null>(null);
  const [search, setSearch] = useState("");
  const [revision, setRevision] = useState(0);
  const [selectedMaterial, setSelectedMaterial] = useState<Material | null>(null);
  const [comments, setComments] = useState<Comment[]>([]);
  const [commentText, setCommentText] = useState("");
  const [commentsLoading, setCommentsLoading] = useState(false);
  const [commentBusy, setCommentBusy] = useState(false);
  const isAdmin = session.user.role === "admin";

  useEffect(() => {
    let active = true;

    async function loadMaterials() {
      try {
        const response = await api.get<Material[]>("/materials", {
          params: search.trim() ? { q: search.trim() } : undefined,
          headers: { Authorization: `Bearer ${session.token}` },
        });

        if (active) setMaterials(response.data);
      } catch (error) {
        if (active) setError(errorMessage(error));
      } finally {
        if (active) setLoading(false);
      }
    }

    loadMaterials();
    return () => { active = false; };
  }, [session.token, revision, search]);

  function refresh() {
    setLoading(true);
    setError("");
    setNotice("");
    setRevision(current => current + 1);
  }

  async function remove(material: Material) {
    if (!window.confirm(`Excluir ${material.name} do banco de dados?`)) return;

    setDeleting(material.id);
    setError("");
    setNotice("");

    try {
      await api.delete(`/materials/${material.id}`, {
        headers: { Authorization: `Bearer ${session.token}` },
      });

      setMaterials(current => current.filter(item => item.id !== material.id));
      setNotice(`${material.name} excluído.`);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setDeleting(null);
    }
  }

  async function openComments(material: Material) {
    setSelectedMaterial(material);
    setComments([]);
    setCommentText("");
    setError("");
    setNotice("");
    setCommentsLoading(true);

    try {
      const response = await api.get<Comment[]>(
        `/materials/${material.id}/comments`,
        { headers: { Authorization: `Bearer ${session.token}` } }
      );
      setComments(response.data);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setCommentsLoading(false);
    }
  }

  async function submitComment() {
    if (!selectedMaterial) return;

    setCommentBusy(true);
    setError("");
    setNotice("");

    try {
      await api.post(
        `/materials/${selectedMaterial.id}/comments`,
        { comment: commentText },
        { headers: { Authorization: `Bearer ${session.token}` } }
      );

      setCommentText("");
      setNotice("Comentário cadastrado com sucesso.");
      await openComments(selectedMaterial);
    } catch (error) {
      setError(errorMessage(error));
    } finally {
      setCommentBusy(false);
    }
  }

  return (
    <section className="panel" aria-labelledby="materials-title">
      <div className="actions">
        <p><strong>{session.user.name}</strong> · {session.user.email}</p>
        <button className="secondary" onClick={onLogout}>Sair</button>
      </div>

      <h1 id="materials-title">Produtos / Materiais</h1>
      <p>
        Perfil: <strong>{isAdmin ? "Administrador (admin)" : "Usuário comum (user)"}</strong>
      </p>

      <label htmlFor="material-search">Pesquisar produto ou categoria</label>
      <input
        id="material-search"
        type="search"
        placeholder="Digite para pesquisar..."
        value={search}
        maxLength={100}
        onChange={event => setSearch(event.target.value)}
      />

      <div className="actions">
        <button className="secondary" disabled={loading || deleting !== null} onClick={refresh}>
          Atualizar materiais
        </button>
      </div>

      {error && <p className="error" role="alert">{error}</p>}
      {notice && <p className="success" role="status">{notice}</p>}

      {loading ? (
        <p role="status">Carregando materiais...</p>
      ) : (
        <ul className="materials">
          {materials.map(material => (
            <li key={material.id}>
              <span>
                <strong>{material.name}</strong> · {material.category}
              </span>

              <div className="actions">
                <button
                  className="secondary"
                  onClick={() => openComments(material)}
                  disabled={deleting !== null}
                >
                  Comentários
                </button>

                {isAdmin ? (
                  <button
                    className="danger"
                    disabled={deleting !== null}
                    onClick={() => remove(material)}
                  >
                    {deleting === material.id ? "Excluindo..." : "Excluir"}
                  </button>
                ) : (
                  <span className="muted">Somente leitura</span>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}

      {!loading && !error && materials.length === 0 && (
        <p>Nenhum produto/material encontrado.</p>
      )}

      {selectedMaterial && (
        <section className="comments" aria-labelledby="comments-title">
          <div className="actions">
            <h2 id="comments-title">
              Comentários: {selectedMaterial.name}
            </h2>
            <button
              className="secondary"
              onClick={() => setSelectedMaterial(null)}
              disabled={commentBusy}
            >
              Fechar
            </button>
          </div>

          <label htmlFor="comment">Novo comentário</label>
          <textarea
            id="comment"
            rows={5}
            maxLength={500}
            placeholder="Digite seu comentário..."
            value={commentText}
            disabled={commentBusy}
            onChange={event => setCommentText(event.target.value)}
          />
          <small>{commentText.length}/500 caracteres</small>

          <button
            onClick={submitComment}
            disabled={commentBusy || !commentText.trim()}
          >
            {commentBusy ? "Enviando..." : "Enviar comentário"}
          </button>

          {commentsLoading ? (
            <p>Carregando comentários...</p>
          ) : comments.length === 0 ? (
            <p>Nenhum comentário cadastrado.</p>
          ) : (
            <ul className="comments-list">
              {comments.map(item => (
                <li key={item.id}>
                  <strong>{item.author}</strong>
                  <p>{item.comment}</p>
                  <small>{new Date(item.created_at).toLocaleString("pt-BR")}</small>
                </li>
              ))}
            </ul>
          )}
        </section>
      )}
    </section>
  );
}
