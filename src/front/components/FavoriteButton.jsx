// src/front/components/FavoriteButton.jsx

import { useEffect, useState, useRef, forwardRef } from "react";
import { FaHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";

const clickSoundFile = "/sounds/pop.mp3";

export const FavoriteButton = forwardRef(({ postId, whiteText = false, onToggle, count: countProp = 0 }, ref) => {
    const { store } = useGlobalReducer();
    const [isFavorite, setIsFavorite] = useState(false);
    const [count, setCount] = useState(countProp);
    const token = localStorage.getItem("token");
    const audioRef = useRef(null);
    
 

    useEffect(() => {
      audioRef.current = new Audio(clickSoundFile);
    }, []);

 
    useEffect(() => {
        setCount(countProp);
    }, [countProp]);

    const fetchUserFavorites = async () => {
      if (!token) return;
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const data = await res.json();
        const matching = data.filter(f => f.post_id === postId);
        setIsFavorite(matching.length > 0);
      } catch (err) {
        console.error("Error checking favorites:", err.message);
      }
    };

    useEffect(() => {
      fetchUserFavorites();
    }, [postId]);

    const triggerPop = () => {
      ref?.current?.classList.add("pop-animation");
      setTimeout(() => ref?.current?.classList.remove("pop-animation"), 300);
    };

    const toggleFavorite = async () => {
      if (!token) return;
      const method = isFavorite ? "DELETE" : "POST";
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites/${postId}`, {
          method,
          headers: { Authorization: `Bearer ${token}` },
        });
        if (!res.ok) throw new Error("Toggle favorite failed");
        setIsFavorite(!isFavorite);
        setCount(prev => prev + (isFavorite ? -1 : 1));
        triggerPop();
        audioRef.current?.play().catch(e => console.warn("Audio play failed", e));
        onToggle?.();
      } catch (err) {
        console.error("Error toggling favorite:", err.message);
      }
    };

    return (
      <button
        ref={ref}
        disabled={!token}
        className={`btn btn-sm border rounded d-flex align-items-center ${whiteText ? "text-white" : ""}`}
        onClick={toggleFavorite}
      >
        <FaHeart
          style={{
            color: isFavorite ? "#ff4b5c" : "#999",
            transition: "transform 0.3s ease"
          }}
          className="me-1"
        />
        <span style={{ color: whiteText ? "#fff" : undefined }}>{count}</span>
      </button>
    );
});