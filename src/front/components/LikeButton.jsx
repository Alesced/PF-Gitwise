// File: src/front/components/LikeButton.jsx
import { useState, useEffect } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from 'react-toastify';

export const LikeButton = ({ postId }) => {
  const { store, dispatch } = useGlobalReducer();
  const [liked, setLiked] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [likeCount, setLikeCount] = useState(() => {
    const stored = localStorage.getItem(`like-${postId}`);
    return stored ? parseInt(stored, 10) : 0;
  });

  useEffect(() => {
    if (store.user?.likes?.includes(postId)) setLiked(true);

    fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${postId}/likes`)
      .then(res => res.json())
      .then(data => {
        setLikeCount(data.count || 0);
        localStorage.setItem(`like-${postId}`, data.count || 0);
      })
      .catch(() => setLikeCount(0));
  }, [store.user, postId]);

  const handleLike = async () => {
    if (!store.user) return toast.error("Please login to like posts.");
    setLoading(true);
    setError(null);

    const method = liked ? "DELETE" : "POST";
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/posts/${postId}/like`, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
      });

      const contentType = res.headers.get("content-type");
      if (!contentType?.includes("application/json")) throw new Error("Unexpected response format (not JSON)");
      const data = await res.json();

      if (res.ok) {
        setLiked(!liked);
        const updated = likeCount + (liked ? -1 : 1);
        setLikeCount(updated);
        localStorage.setItem(`like-${postId}`, updated);
        dispatch({ type: "toggle_like", payload: postId });
      } else throw new Error(data.error || "Unknown error");
    } catch (err) {
      setError(err.message);
      toast.error("Like failed: " + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-icon d-flex align-items-center gap-1"
      onClick={handleLike}
      disabled={loading}
      title={liked ? "Unlike" : "Like"}
    >
      {liked ? <FaHeart className="text-danger" /> : <FaRegHeart className="text-light" />}
      <span>{likeCount}</span>
    </button>
  );
};
