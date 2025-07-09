// File: src/front/components/LikeButton.jsx
import { useState } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const LikeButton = ({ postId }) => {
  const { store, dispatch } = useGlobalReducer();
  const [liked, setLiked] = useState(store.user?.likes?.includes(postId));
  const [loading, setLoading] = useState(false);

  const handleLike = async () => {
    if (!store.user) return alert("Please login to like posts.");
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
      }
    } catch (err) {
      console.error("Like error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-icon"
      onClick={handleLike}
      disabled={loading}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-light" />}
    </button>
  );
};