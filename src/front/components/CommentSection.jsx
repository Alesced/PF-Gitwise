import { useState, useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Link } from "react-router-dom";
import { FaHeart, FaTrashAlt } from "react-icons/fa";

export const CommentSection = ({ postId }) => {
  const { store, dispatch } = useGlobalReducer();
  const [newComment, setNewComment] = useState("");
  const [loading, setLoading] = useState(false);

  const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  // Filtramos los comentarios del store global para mostrar solo los de este post
  const comments = (store.allComments || []).filter(comment => comment.post_id === postId);

  const fetchComments = async () => {
    if (!postId) return;
    try {
      const res = await fetch(`${BASE_URL}/api/post/${postId}/comments`);
      const data = await res.json();
      if (res.ok) {
        // Despacha los comentarios para que el store los procese
        dispatch({ type: 'set_comments', payload: data.comments });
      } else {
        toast.error(data.msg || "Error loading comments");
      }
    } catch (err) {
      toast.error("Server error fetching comments");
    }
  };

  useEffect(() => {
    // Cargar comentarios al montar el componente, cambiar de post o al cambiar el token
    if (postId) fetchComments();
  }, [postId, dispatch, store.token]);

  const handleAddComment = async () => {
    if (!newComment.trim()) return;
    setLoading(true);
    try {
      const res = await fetch(`${BASE_URL}/api/post/${postId}/comments`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ text: newComment }),
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: 'add_comment', payload: { ...data.comment, post_id: postId } });
        setNewComment("");
        // Después de agregar, volvemos a cargar para tener la lista completa y actualizada
        fetchComments();
      } else {
        toast.error(data.msg || "Failed to add comment");
      }
    } catch (err) {
      toast.error("Server error posting comment");
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (commentId) => {
    const comment = store.allComments.find(c => c.id === commentId);
    if (!comment) return;

    const method = comment.has_liked ? "DELETE" : "POST";
    try {
      const res = await fetch(`${BASE_URL}/api/comments/${commentId}/like`, {
        method,
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      const data = await res.json();

      if (res.ok || res.status === 201) {
        // Actualiza el estado localmente con la respuesta del backend
        dispatch({
          type: "set_comments",
          payload: store.allComments.map(c =>
            c.id === commentId
              ? {
                ...c,
                has_liked: method === "POST",
                like_count: data.like_count ?? (method === "POST"
                  ? (c.like_count || 0) + 1
                  : Math.max((c.like_count || 1) - 1, 0)),
              }
              : c
          ),
        });
      } else if (res.status === 400 && data.error?.includes("already liked")) {
        // Ya estaba dado like, actualiza el estado localmente
        dispatch({
          type: "set_comments",
          payload: store.allComments.map(c =>
            c.id === commentId
              ? { ...c, has_liked: true }
              : c
          ),
        });
      } else {
        toast.error(data.error || "Error toggling like");
      }
    } catch (err) {
      toast.error("Server error toggling like");
    }
  };

  const handleDelete = async (commentId) => {
    if (!window.confirm("¿Seguro que quieres eliminar este comentario?")) return;
    try {
      const res = await fetch(`${BASE_URL}/api/comments/${commentId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${store.token}`,
        },
      });
      const data = await res.json();
      if (res.ok) {
        dispatch({ type: "delete_comment", payload: commentId });
        toast.success("Comentario eliminado");
      } else if (res.status === 403) {
        toast.error("No tienes permiso para eliminar este comentario");
      } else {
        toast.error(data.error || "Error al eliminar el comentario");
      }
    } catch (err) {
      toast.error("Error del servidor al eliminar el comentario");
    }
  };

  const isAdmin = store?.user?.is_admin;
  const currentUserId = store?.user?.id;

  return (
    <div className="mt-5">
      <h5 className="mb-4 text-light">Comments</h5>
      {store.token ? (
        <div className="mb-4">
          <textarea
            value={newComment}
            onChange={(e) => setNewComment(e.target.value)}
            className="form-control bg-dark text-light border-secondary"
            rows="3"
            placeholder="Write a comment..."
          ></textarea>
          <button
            className="btn btn-primary mt-2"
            onClick={handleAddComment}
            disabled={loading}
          >
            {loading ? "Posting..." : "Post Comment"}
          </button>
        </div>
      ) : (
        <p className="text-light">You must be logged in to leave a comment.</p>
      )}

      <ul className="list-group border-0 bg-transparent">
        {comments.length === 0 && (
          <li className="list-group-item bg-dark text-center text-light">
            No comments yet.
          </li>
        )}

        {comments.map((comment) => (
          <li
            key={comment.id}
            className="list-group-item bg-dark text-light border-secondary mb-2 rounded"
          >
            <div className="d-flex" style={{ width: "100%" }}>
              <div className="me-3 text-center" style={{ width: "60px" }}>
                <img
                  src={
                    comment.author?.avatar_url ||
                    "https://avatars.githubusercontent.com/u/000000?v=4"
                  }
                  alt="avatar"
                  className="rounded-circle"
                  style={{ width: "40px", height: "40px" }}
                />
                <Link
                  to="/profile"
                  className="text-info text-decoration-none fw-semibold d-block mt-1"
                  style={{ fontSize: "0.85rem" }}
                >
                  @{comment.author?.username}
                </Link>
              </div>

              <div className="flex-grow-1 d-flex justify-content-between align-items-start">
                <p className="mb-0">{comment.text}</p>

                <div className="ms-3 d-flex flex-column align-items-center">
                  <button
                    className={`btn btn-sm d-flex align-items-center justify-content-center mb-2 ${comment.has_liked ? "btn-danger" : "btn-outline-light"}`}
                    style={{ width: "40px", height: "40px" }}
                    onClick={() => handleLike(comment.id)}
                    disabled={!store.token}
                    title="Like"
                  >
                    <FaHeart style={{ color: comment.has_liked ? 'red' : 'white' }} />
                    <span className="text-white ms-1">{Number.isFinite(comment.like_count) ? comment.like_count : 0}</span>
                  </button>

                  {(isAdmin || comment.user_id === currentUserId) && (
                    <button
                      className="btn btn-sm btn-outline-danger d-flex align-items-center justify-content-center"
                      style={{ width: "40px", height: "40px" }}
                      onClick={() => handleDelete(comment.id)}
                      title="Delete"
                    >
                      <FaTrashAlt />
                    </button>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};