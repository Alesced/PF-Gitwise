// File: src/front/components/LikeButton.jsx
import { FaHeart, FaRegHeart } from "react-icons/fa";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from 'react-toastify';
import { useMemo } from 'react';


export const LikeButton = ({ postId}) => {
  const { store, dispatch } = useGlobalReducer();

  // 1. Usamos useMemo para calcular los datos relacionados con los likes.
  //    Esto solo se volverá a ejecutar si `store.allLikes` o `postId` cambian.
  const { isLiked, likeCount, currentUserLikeId } = useMemo(() => {
    if (!store.allLikes || !store.user) {
      return { isLiked: false, likeCount: 0, currentUserLikeId: null };
    }
    
    // Filtramos los likes para este post una sola vez.
    const likesForPost = store.allLikes.filter(like => like.post_id === postId);
    const likeCount = likesForPost.length;

    // Buscamos el like del usuario actual en el array ya filtrado.
    const currentUserLike = likesForPost.find(like => like.user_id === store.user.id);
    
    return {
      isLiked: !!currentUserLike, // Convertimos el resultado a booleano
      likeCount,
      currentUserLikeId: currentUserLike ? currentUserLike.id : null,
    };
  }, [store.allLikes, store.user, postId]);

  const handleToggleLike = async () => {
    if (!store.user) {
      toast.error("Debes iniciar sesión para dar me gusta.");
      return;
    }

    const token = store.token;
    const url = `${import.meta.env.VITE_BACKEND_URL}/api/post/${postId}/likes`;
    const method = isLiked ? "DELETE" : "POST";

    try {
      const res = await fetch(url, {
        method,
        headers: {
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      if (!res.ok) {
        throw new Error("La solicitud para cambiar el 'me gusta' falló.");
      }

      if (isLiked) {
        // Si se eliminó, despachamos la acción con el ID del like.
        dispatch({ type: 'delete_like', payload: currentUserLikeId });
      } else {
        // Si se agregó, despachamos la acción con el nuevo like del servidor.
        const data = await res.json();
        dispatch({ type: 'add_like', payload: data.like });
      }
    } catch (error) {
      console.error("Error al cambiar el 'me gusta':", error);
      toast.error("No se pudo actualizar el estado del 'me gusta'.");
    }
  };

  return (
    <button onClick={handleToggleLike} className={`btn btn-sm border rounded d-flex align-items-center`}>
      <FaHeart  style={{
          color: isLiked ? "#cf0707ff" : "#999",
          transition: "transform 0.3s ease",
        }}
        className="me-1" /> {likeCount}
    </button>
  );
};
