import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaHeart, FaTrashAlt } from "react-icons/fa";

/**
 * Componente para mostrar y gestionar la sección de comentarios de un post.
 * @param {Object} props - Las props del componente.
 * @param {number} props.postId - El ID del post al que pertenecen los comentarios.
 */
export const CommentSection = ({ postId }) => {
  // Obtenemos el store y las acciones del hook global
  const { store, actions } = useGlobalReducer();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [confirmDeleteId, setConfirmDeleteId] = useState(null);

  // Filtramos los comentarios del store global para este post
  const comments = (store.allComments || []).filter(comment => comment.post_id === postId);

  // Cargar comentarios del post al montar el componente
  useEffect(() => {
    // Si la acción existe y tenemos un postId válido, cargamos los comentarios.
    if (actions.loadComments && postId) {
      actions.loadComments(postId);
    }
  }, [postId, actions]);

  const handleAddComment = async () => {
    // Verificamos que el comentario no esté vacío y que el usuario esté logueado
    if (!newComment.trim() || !store.token) {
      toast.warn("You must be logged in to leave a comment.");
      return;
    }
    setLoading(true);
    try {
      // Llamamos a la acción del reducer para manejar la adición del comentario
      await actions.addComment(newComment, postId);
      setNewComment(""); // Limpiamos el input después de la acción
      toast.success("Comment added successfully!");
    } catch (err) {
      toast.error(err.message || "Failed to add comment.");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    if (!store.token) {
      toast.warn("You must be logged in to like a comment.");
      return;
    }
    try {
      // Delegamos la lógica de 'me gusta' a una acción del reducer
      await actions.toggleCommentLike(commentId);
    } catch (err) {
      toast.error(err.message || "Error toggling like.");
    }
  };

  const handleDelete = async (commentId) => {
    // Si ya hay una confirmación pendiente, la procesamos.
    if (confirmDeleteId === commentId) {
      try {
        // Delegamos la lógica de eliminación a una acción del reducer
        await actions.deleteComment(commentId);
        toast.success("Comment deleted successfully!");
        setConfirmDeleteId(null); // Limpiamos la confirmación
      } catch (err) {
        toast.error(err.message || "Failed to delete comment.");
      }
    } else {
      // Si no hay confirmación, la pedimos al usuario
      setConfirmDeleteId(commentId);
      setTimeout(() => setConfirmDeleteId(null), 5000); // Se cancela automáticamente después de 5 segundos
    }
  };

  // Verificamos si el usuario actual es administrador o el autor del comentario
  const isAdmin = store?.user?.is_admin;
  const currentUserId = store?.user?.id;

  return (
    <div className="mt-5">
      <h5 className="mb-4 text-light">Comentarios</h5>
      {store.token ? (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-control bg-dark text-light border-secondary"
            rows="3"
            placeholder="Escribe un comentario..."
          ></textarea>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddComment}
            disabled={loading}
          >
            {loading ? "Publicando..." : "Publicar Comentario"}
          </button>
        </div>
      ) : (
        <p className="text-light">Debes iniciar sesión para dejar un comentario.</p>
      )}

      <ul className="list-group border-0 bg-transparent">
        {comments.length === 0 && (
          <li className="list-group-item bg-dark text-center text-light">
            No hay comentarios aún.
          </li>
        )}

        {comments.map((comment) => (
          <li
            key={comment.id}
            className="list-group-item bg-dark text-light border-secondary mb-2 rounded"
          >
            <div className="d-flex justify-content-between align-items-center">
              <div className="d-flex align-items-center">
                <img
                  src={
                    comment.author?.avatar_url ||
                    "https://avatars.githubusercontent.com/u/000000?v=4"
                  }
                  alt="avatar"
                  className="rounded-circle me-3"
                  style={{ width: "40px", height: "40px" }}
                />
                <div className="flex-grow-1">
                  <Link
                    to="/profile"
                    className="text-info text-decoration-none fw-semibold d-block"
                    style={{ fontSize: "0.85rem" }}
                  >
                    @{comment.author?.username}
                  </Link>
                  <p className="mb-0">{comment.text}</p>
                </div>
              </div>

              <div className="d-flex align-items-center">
                <button
                  className={`btn btn-sm me-2 ${comment.has_liked ? "btn-danger" : "btn-outline-light"}`}
                  onClick={() => handleLike(comment.id)}
                  disabled={!store.token}
                  title="Me gusta"
                >
                  <FaHeart />
                  <span className="ms-1">{comment.like_count ?? 0}</span>
                </button>

                {(isAdmin || comment.user_id === currentUserId) && (
                  <>
                    {confirmDeleteId === comment.id ? (
                      <button
                        className="btn btn-sm btn-danger"
                        onClick={() => handleDelete(comment.id)}
                      >
                        Confirmar
                      </button>
                    ) : (
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(comment.id)}
                        title="Eliminar"
                      >
                        <FaTrashAlt />
                      </button>
                    )}
                  </>
                )}
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};
