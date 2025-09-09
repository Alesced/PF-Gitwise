import { useEffect, useRef } from "react";
import { FaHeart, FaRegHeart } from "react-icons/fa";
import { toast } from "react-toastify";
import useGlobalReducer from "../hooks/useGlobalReducer";

// Define el archivo de sonido para el clic
const clickSoundFile = "/sounds/pop.mp3";

/**
 * Componente de botón para dar "me gusta" a un post.
 * @param {number} postId - El ID del post.
 */
export const LikeButton = ({ postId }) => {
  // Obtenemos el store y las acciones de nuestro hook global
  const { store, actions } = useGlobalReducer();
  
  // Referencia para el elemento del botón, para manejar la animación
  const buttonRef = useRef(null);
  // Referencia para el objeto de audio, para evitar que se recree en cada render
  const audioRef = useRef(null);

  // Verificamos si el usuario ha dado "me gusta" y contamos los likes del post.
  const likesForPost = store.allLikes.filter(like => like.post_id === postId);
  const isLiked = likesForPost.some(like => like.user_id === store.user?.id);
  const likeCount = likesForPost.length;

  useEffect(() => {
    // Inicializar el objeto de audio una sola vez al montar el componente
    if (!audioRef.current) {
      audioRef.current = new Audio(clickSoundFile);
    }
  }, []);

  /**
   * Dispara la animación de "pop" en el botón.
   */
  const triggerPop = () => {
    // Se asegura de que la referencia existe antes de usarla
    if (buttonRef.current) {
      buttonRef.current.classList.add("pop-animation");
      setTimeout(() => buttonRef.current.classList.remove("pop-animation"), 300);
    }
  };

  /**
   * Maneja la lógica para dar o quitar un "me gusta".
   */
  const handleToggleLike = async () => {
    // Si el usuario no está autenticado, muestra una advertencia y sale de la función.
    if (!store.token) {
      toast.error("You must be logged in to like a post.");
      return;
    }

    try {
      // Delegamos toda la lógica de la API a la acción global del reducer
      await actions.togglePostLike(postId, isLiked);
      
      // Si la acción es exitosa, activamos la animación y el sonido.
      triggerPop();
      audioRef.current?.play().catch(e => console.warn("Failed to play audio", e));

    } catch (error) {
      console.error("Error toggling like:", error);
      toast.error(error.message || "Failed to update like status.");
    }
  };

  return (
    <button
      ref={buttonRef} // Usamos la referencia local para la animación
      onClick={handleToggleLike}
      className={`btn btn-sm border rounded d-flex align-items-center`}
    >
      {/* Icono del corazón cambia según si el post tiene "me gusta" o no */}
      {isLiked ? (
        <FaHeart style={{ color: "#cf0707ff", transition: "transform 0.3s ease" }} className="me-1" />
      ) : (
        <FaRegHeart style={{ color: "#999", transition: "transform 0.3s ease" }} className="me-1" />
      )}
      {likeCount}
    </button>
  );
};
