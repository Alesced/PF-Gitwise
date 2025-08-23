// src/front/components/FavoriteButton.jsx

import React, { useEffect, useState, useRef, forwardRef, useContext } from "react";
import { FaBookmark  } from "react-icons/fa";
import { toast } from "react-toastify";
import useGlobalReducer from "../hooks/useGlobalReducer";

const clickSoundFile = "/sounds/pop.mp3";

export const FavoriteButton = forwardRef(({ postId, whiteText = false, onToggle, count: countProp = 0 }, ref) => {
  const { store, dispatch } = useGlobalReducer();
  // Mantenemos tu estado local para la animación y el conteo
  const [isFavorite, setIsFavorite] = useState(false);
  const [count, setCount] = useState(countProp);
  const audioRef = useRef(null);

  useEffect(() => {
    audioRef.current = new Audio(clickSoundFile);
  }, []);

  useEffect(() => {
    setCount(countProp);
  }, [countProp]);

  // CORRECCIÓN: Este useEffect asegura que el estado local esté siempre sincronizado
  // con el estado global de favoritos
  useEffect(() => {
    const isPostFavorite = store.allFavorites.some(fav => fav.post_id === postId);
    setIsFavorite(isPostFavorite);
  }, [store.allFavorites, postId]); // Dependencias: Se ejecuta si el store.allFavorites o el postId cambian

  const triggerPop = () => {
    ref?.current?.classList.add("pop-animation");
    setTimeout(() => ref?.current?.classList.remove("pop-animation"), 300);
  };

  const toggleFavorite = async () => {
    if (!store.token) {
      toast.warn("Debes iniciar sesión para marcar favoritos.");
      return;
    }

    // CAMBIO NECESARIO: Usamos la variable local isFavorite
    const method = isFavorite ? "DELETE" : "POST";
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/favorites/${postId}`;

    try {
      const res = await fetch(url, {
        method,
        headers: { Authorization: `Bearer ${store.token}` },
      });

      if (!res.ok) {
        const errorData = await res.json();
        throw new Error(errorData.error || "Fallo al alternar favorito");
      }

      // Si la operación fue exitosa, disparamos una acción al store
      if (method === "POST") {
        const data = await res.json();
        dispatch({ type: 'add_favorite', payload: data.favorite });
      } else {
        dispatch({ type: 'delete_favorite', payload: postId });
      }

      triggerPop();
      audioRef.current?.play().catch(e => console.warn("Fallo al reproducir audio", e));
      onToggle?.();
    } catch (err) {
      console.error("Error al alternar favorito:", err.message);
      toast.error(err.message);
    }
  };

  return (
    <button
      ref={ref}
      disabled={!store.token}
      className={`btn btn-sm border rounded d-flex align-items-center ${whiteText ? "text-white" : ""}`}
      onClick={toggleFavorite}
    >
      <FaBookmark 
        style={{
          color: isFavorite ? "#fafafaff" : "#999",
          transition: "transform 0.3s ease",
        }}
        className="me-1"
      />
      <span style={{ color: whiteText ? "#fff" : undefined }}>{count}</span>
    </button>
  );
});