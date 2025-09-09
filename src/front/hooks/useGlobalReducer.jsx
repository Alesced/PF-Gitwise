// Import necessary hooks and functions from React.
import { useContext, useReducer, createContext, useEffect } from "react";
import storeReducer, { initialStore } from "../store";
import { toast } from "react-toastify";
import * as globalActions from "./actions"; // Importamos las acciones de la API

// Crea un contexto para el estado global.
const StoreContext = createContext();

// Define el componente proveedor.
export function StoreProvider({ children }) {
  // Usamos useReducer e inicializamos el estado con la función que lee localStorage.
  const [store, dispatch] = useReducer(storeReducer, initialStore());

  // Usa el hook useEffect para guardar el estado en localStorage.
  // Este efecto se ejecutará solo cuando el 'store.token' o 'store.user' cambien.
  useEffect(() => {
    try {
      if (store.token && store.user) {
        localStorage.setItem("token", store.token);
        localStorage.setItem("user", JSON.stringify(store.user));
      } else {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
      }
    } catch (error) {
      console.error("Error al guardar en el localStorage:", error);
    }
  }, [store.token, store.user]);

  // Se ejecuta una vez al cargar la aplicación para cargar todos los datos
  useEffect(() => {
    // Si el usuario está logeado, cargamos sus datos específicos
    if (store.token) {
      // Puedes agregar la lógica para cargar datos del usuario aquí si lo necesitas
    }
    // Cargamos todos los datos públicos para todos los usuarios
    globalActions.fetchAllPosts(dispatch);
  }, []);

  // Proporciona el store y dispatch a los componentes hijos.
  return (
    <StoreContext.Provider value={{ store, dispatch }}>
      {children}
    </StoreContext.Provider>
  );
}

// Hook personalizado para acceder al estado global y a las acciones.
export default function useGlobalReducer() {
  const { dispatch, store } = useContext(StoreContext);

  // Define las acciones que los componentes pueden usar.
  const actions = {
    // Acciones de autenticación
    setAuth: (token, user) => dispatch({ type: 'set_user', payload: { token, user } }),
    login: (body) => globalActions.login(dispatch, body),
    signup: (body) => globalActions.signup(dispatch, body), // Nueva acción agregada
    logout: () => globalActions.logout(dispatch), // Corregido: Ahora llama a la función de actions.js

    // Acciones para manejar los estados, que llaman a la lógica del store
    addPost: (post) => dispatch({ type: 'add_post', payload: post }),
    editPost: (post) => dispatch({ type: 'edit_post', payload: post }),
    deletePost: (id) => dispatch({ type: 'delete_post', payload: id }),

    // Acciones de la API que usan la lógica definida en actions.js
    fetchAllPosts: () => globalActions.fetchAllPosts(dispatch), // Nueva acción agregada
    fetchMorePosts: (page, perPage) => globalActions.fetchMorePosts(dispatch, page, perPage), // Nueva acción agregada
    fetchAllFavorites: () => globalActions.fetchAllFavorites(dispatch, store.token), // Nueva acción agregada
    fetchUserPosts: (userId) => globalActions.fetchUserPosts(dispatch, store.token, userId), // Nueva acción agregada
    createPost: (userId, body) => globalActions.createPost(dispatch, store.token, userId, body), // Nueva acción agregada
    deletePostApi: (postId) => globalActions.deletePost(dispatch, store.token, postId), // Nueva acción agregada y renombrada para evitar conflicto
    editPostApi: (postId, body) => globalActions.editPost(dispatch, store.token, postId, body), // Nueva acción agregada y renombrada para evitar conflicto
    adminDeletePost: (postId) => globalActions.adminDeletePost(dispatch, store.token, postId),
    fetchAdminPosts: () => globalActions.fetchAdminPosts(dispatch, store.token),

    // Acciones de API que usan la lógica definida en actions.js
    // Ahora las acciones de comentarios también están disponibles
    loadComments: (postId) => globalActions.loadComments(dispatch, postId, store.token),
    addComment: (commentText, postId) => globalActions.addComment(dispatch, store, commentText, postId),
    deleteComment: (commentId) => globalActions.deleteComment(dispatch, store, commentId),
    toggleCommentLike: (commentId) => globalActions.toggleCommentLike(dispatch, store, commentId),

    // Acciones de la API para posts y favoritos
    togglePostLike: (postId, isLiked) => globalActions.togglePostLike(dispatch, store, postId, isLiked),
    toggleFavorite: (postId) => globalActions.toggleFavorite(dispatch, store, postId),
  };

  return { store, dispatch, actions };
}
