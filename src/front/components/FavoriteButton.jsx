import { useEffect, useRef } from "react";
import { FaBookmark, FaRegBookmark } from "react-icons/fa";
import { toast } from "react-toastify";
import useGlobalReducer from "../hooks/useGlobalReducer";

// Define el archivo de sonido para el clic
const clickSoundFile = "/sounds/pop.mp3";

/**
 * Componente de botón para agregar o quitar un post de favoritos.
 * El estado de "favorito" se gestiona de forma global.
 * @param {number} postId - El ID del post.
 * @param {boolean} whiteText - Indica si el texto debe ser blanco.
 * @param {number} count - El número de favoritos del post.
 */
export const FavoriteButton = ({ postId, whiteText = false, count: countProp = 0 }) => {
  // Obtenemos el store y las acciones de nuestro hook global
    const { store, actions } = useGlobalReducer();
  
  // Referencia para el elemento del botón, utilizada para la animación
    const buttonRef = useRef(null);
  // Referencia para el objeto de audio, para evitar que se recree en cada render
    const audioRef = useRef(null);

    // Corregimos esta línea para que verifique tanto el post_id como el user_id.
    const isFavorite = store.allFavorites.some(
        fav => fav.post_id === postId && fav.user_id === store.user?.id
    );

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
   * Maneja la lógica para agregar o quitar el post de favoritos.
   */
    const toggleFavorite = async () => {
    // Si el usuario no está autenticado, muestra una advertencia y sale de la función.
        if (!store.token) {
            toast.warn("You must be logged in to toggle favorites.");
            return;
        }

        try {
      // Llama a la acción global para manejar la lógica de la API
            await actions.toggleFavorite(postId);

      // Si la acción es exitosa, activamos la animación y el sonido.
            triggerPop();
            audioRef.current?.play().catch(e => console.warn("Failed to play audio", e));
        } catch (err) {
            console.error("Failed to toggle favorites:", err);
      // La acción ya debería manejar el toast, pero lo mantenemos aquí como fallback
            toast.error(err.message || "Failed to toggle favorite. Please try again.");
        }
    };

    return (
        <button
            ref={buttonRef}
            disabled={!store.token}
            className={`btn btn-sm border rounded d-flex align-items-center justify-content-center ${whiteText ? "text-white" : ""}`}
            // 👇 Y se añade un estilo para un tamaño fijo y cuadrado
            style={{ width: "41px", height: "32px" }}
            onClick={toggleFavorite}
        >
            {isFavorite ? (
                <FaBookmark
                    style={{
                        color: "#ffc107",
                        transition: "transform 0.3s ease",
                    }}
                />
            ) : (
                <FaRegBookmark
                    style={{
                        color: whiteText ? "#fff" : "#999",
                        transition: "transform 0.3s ease",
                    }}
                />
            )}
        </button>
    );
};
