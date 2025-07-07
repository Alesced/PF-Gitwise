// File: src/front/components/LikeButton.jsx
import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const LikeButton = ({ postId }) => {
  const { store, dispatch } = useGlobalReducer();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);

  // 🔄 Sincroniza con el store por si cambia dinámicamente
  useEffect(() => {
    setLiked(store.user?.likes?.includes(postId) || false);
  }, [store.user?.likes, postId]);

  const handleLike = async () => {
    if (!store.user) {
      alert("Please log in to like posts.");
      return;
    }

    setLoading(true);
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/like/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        }
      });

      if (res.ok) {
        setLiked(!liked);
        dispatch({ type: "toggle_like", payload: postId });
      } else {
        const error = await res.json();
        console.error("Like failed:", error.message);
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn btn-sm"
      onClick={handleLike}
      disabled={loading}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? (
        <FaHeart className="text-danger" />
      ) : (
        <FaRegHeart className="text-light" />
      )}
    </button>
  );
};