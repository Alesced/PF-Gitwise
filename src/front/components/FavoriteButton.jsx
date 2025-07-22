// File: src/front/components/FavoriteButton.jsx
import { useEffect, useState, useRef } from "react";
import { FaHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";

const clickSoundFile = "/sounds/pop.mp3";

export const FavoriteButton = ({ postId, whiteText = false, onToggle, count: countProp = 0 }) => {
  const { store } = useGlobalReducer();
  const [isFavorite, setIsFavorite] = useState(false);
  const [count, setCount] = useState(countProp);
  const token = localStorage.getItem("token");
  const heartRef = useRef(null);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(clickSoundFile);
  }, []);

  const fetchCount = async () => {
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/count/${postId}`);
      if (res.ok) {
        const data = await res.json();
        setCount(Math.max(0, data.count));
      }
    } catch (err) {
      console.error("Failed to fetch favorite count:", err);
    }
  };

  const fetchUserFavStatus = async () => {
    if (!token) return;
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const data = await res.json();
        const ids = data.map(f => f.post_id);
        setIsFavorite(ids.includes(postId));
      }
    } catch (err) {
      console.error("Error checking user favorite status", err);
    }
  };

  useEffect(() => {
    fetchCount();
    fetchUserFavStatus();
  }, [postId]);

  const triggerPop = () => {
    heartRef.current?.classList.add("pop-animation");
    setTimeout(() => heartRef.current?.classList.remove("pop-animation"), 300);
  };

  const toggleFavorite = async () => {
    if (!token) return;
    const method = isFavorite ? "DELETE" : "POST";
    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/${postId}`, {
        method,
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        setIsFavorite(!isFavorite);
        setCount(prev => Math.max(0, (prev ?? 0) + (isFavorite ? -1 : 1)));
        triggerPop();
        audioRef.current?.play().catch(e => console.warn("Audio play failed", e));
        onToggle?.();
      }
    } catch (err) {
      console.error("Failed to toggle favorite:", err);
    }
  };

  return (
    <button
      disabled={!token}
      className={`btn btn-sm border rounded d-flex align-items-center ${whiteText ? "text-white" : ""}`}
      onClick={toggleFavorite}
    >
      <FaHeart
        ref={heartRef}
        style={{
          color: isFavorite ? "#ff4b5c" : "#999",
          transition: "transform 0.3s ease"
        }}
        className="me-1"
      />
      <span style={{ color: whiteText ? "#fff" : undefined }}>{count ?? 0}</span>
    </button>
  );
};