// File: src/front/components/FavoriteButton.jsx
import { useState } from "react";
import { FaStar, FaRegStar } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const FavoriteButton = ({ postId }) => {
  const { store, dispatch } = useGlobalReducer();
  const [favorited, setFavorited] = useState(store.user?.favorites?.includes(postId));
  const [loading, setLoading] = useState(false);

  const handleFavorite = async () => {
    if (!store.user) return alert("Please login to favorite posts.");
    setLoading(true);

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/favorite/${postId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`
        }
      });

      if (res.ok) {
        setFavorited(!favorited);
        dispatch({ type: "toggle_favorite", payload: postId });
      }
    } catch (err) {
      console.error("Favorite error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      className="btn-icon"
      onClick={handleFavorite}
      disabled={loading}
      title={favorited ? "Unfavorite" : "Favorite"}
    >
      {favorited ? <FaStar className="text-warning" /> : <FaRegStar className="text-light" />}
    </button>
  );
};