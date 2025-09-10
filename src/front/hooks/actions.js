import { toast } from "react-toastify";

// La URL base para todas las peticiones a la API.
const BASE_URL = import.meta.env.VITE_BACKEND_URL;

/**
 * @description Función para manejar las respuestas de la API, lanzando un error si la respuesta no es exitosa.
 * @param {Response} response El objeto de respuesta de la API.
 * @returns {Promise<any>} Los datos JSON de la respuesta.
 */
const handleApiResponse = async (response) => {
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.msg || "Error de la API.");
  }
  // Si la respuesta es 204 No Content (como en un DELETE exitoso), no intentes parsear JSON.
  if (response.status === 204) {
    return null;
  }
  return await response.json();
};

/**
 * @description Realiza una petición fetch con manejo de errores y autorización.
 * @param {string} url La URL a la que se hace la petición.
 * @param {string} method El método HTTP (e.g., "GET", "POST").
 * @param {object} [body=null] Los datos a enviar en el cuerpo de la petición.
 * @param {string} [token=null] El token de autorización.
 * @returns {Promise<any>} Los datos JSON de la respuesta.
 */
const fetchWithAuth = async (
  url,
  method = "GET",
  body = null,
  token = null
) => {
  const options = {
    method: method,
    headers: {
      "Content-Type": "application/json",
      ...(token && { Authorization: `Bearer ${token}` }),
    },
    ...(body && { body: JSON.stringify(body) }),
  };
  const res = await fetch(url, options);
  return await handleApiResponse(res);
};

// ------------------- Acciones de Autenticación -------------------

export const login = async (dispatch, body) => {
  try {
    const data = await fetchWithAuth(`${BASE_URL}/api/login`, "POST", body);
    dispatch({
      type: "set_user",
      payload: { token: data.token, user: data.user },
    });
    toast.success("Login successful!");
    return true;
  } catch (error) {
    toast.error(error.message);
    return false;
  }
};

export const signup = async (dispatch, body) => {
  try {
    await fetchWithAuth(`${BASE_URL}/api/register`, "POST", body);
    
    toast.success("Registration successful!");
    return true;
  } catch (error) {
    toast.error(error.message);
    return false;
  }
};

export const logout = (dispatch) => {
  dispatch({ type: "logout" });
  toast.info("Logged out successfully.");
};

// ------------------- Acciones de Carga de Datos Globales -------------------

export const fetchAllPosts = async (dispatch) => {
  try {
    const data = await fetchWithAuth(`${BASE_URL}/api/posts`);
    dispatch({ type: "set_posts", payload: data.posts });
  } catch (error) {
    console.error("Error fetching posts:", error);
    toast.error("Failed to load posts.");
  }
};

export const fetchMorePosts = async (dispatch, page, perPage = 6) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/posts?page=${page}&per_page=${perPage}`
    );
    dispatch({ type: "add_posts", payload: data.posts });
  } catch (error) {
    console.error("Error fetching more posts:", error);
    toast.error("Failed to load more posts.");
  }
};

// NOTA: Se eliminan fetchAllLikes y fetchAllComments ya que no existen endpoints globales en el backend.
// La carga de estos datos se hará de forma contextual (por post, por usuario, etc.).

export const fetchAllFavorites = async (dispatch, token) => {
  try {
    // Esta ruta requiere autenticación para saber de qué usuario son los favoritos.
    const data = await fetchWithAuth(
      `${BASE_URL}/api/favorites`,
      "GET",
      null,
      token
    );
    dispatch({ type: "set_favorite", payload: data.favorites });
  } catch (error) {
    console.error("Error fetching favorites:", error);
    toast.error("Failed to load favorites.");
  }
};

// ------------------- Acciones para el Perfil de Usuario -------------------

export const fetchUserPosts = async (dispatch, token, userId) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/users/${userId}/posts`,
      "GET",
      null,
      token
    );
    const allFetchedLikes = data.posts.flatMap((post) => post.likes || []);
    dispatch({ type: "set_posts", payload: data.posts });
    dispatch({ type: "set_likes", payload: allFetchedLikes });
  } catch (error) {
    console.error("Error fetching user posts:", error);
    toast.error("Failed to load user posts.");
  }
};

export const createPost = async (dispatch, token, userId, body) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/user/post/${userId}`,
      "POST",
      body,
      token
    );
    dispatch({ type: "add_post", payload: data.post });
    toast.success("Project created successfully!");
    return true;
  } catch (error) {
    toast.error("Failed to save project: " + error.message);
    return false;
  }
};

export const deletePost = async (dispatch, token, postId) => {
  try {
    await fetchWithAuth(
      `${BASE_URL}/api/post/${postId}`,
      "DELETE",
      null,
      token
    );
    dispatch({ type: "delete_post", payload: postId });
    toast.success("Post deleted successfully!");
  } catch (error) {
    console.error("Error deleting post:", error);
    toast.error("Failed to delete post.");
  }
};

export const editPost = async (dispatch, token, postId, body) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/post/${postId}`,
      "PUT",
      body,
      token
    );
    dispatch({ type: "edit_post", payload: data.post });
    toast.success("Post updated successfully!");
  } catch (error) {
    console.error("Error editing post:", error);
    toast.error("Failed to update post.");
  }
};

// ------------------- Acciones para el manejo de comentarios -------------------

export const loadComments = async (dispatch, postId, token) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/post/${postId}/comments`,
      "GET",
      null,
      token 
    );
    dispatch({ type: "set_comments", payload: data.comments });
  } catch (error) {
    console.error("Error loading comments:", error);
    if (error.message !== "Missing Authorization Header") {
      toast.error("Failed to load comments.");
    }
  }
};

export const addComment = async (dispatch, store, commentText, postId) => {
  const { token } = store;
  if (!token) throw new Error("You must be logged in to add a comment.");

  const body = { text: commentText };
  try {
    // CORREGIDO: La URL debe incluir el postId
    const data = await fetchWithAuth(
      `${BASE_URL}/api/post/${postId}/comments`,
      "POST",
      body,
      token
    );
    dispatch({ type: "add_comment", payload: data.comment });
  } catch (error) {
    console.error("Error adding comment:", error);
    throw new Error("Failed to add comment.");
  }
};

export const toggleCommentLike = async (dispatch, store, commentId) => {
  const { token, user } = store;

  if (!token || !user) {
    throw new Error("You must be logged in to like a comment.");
  }

  try {
    const comment = store.allComments.find(c => c.id === commentId);
    const hasLiked = comment?.has_liked; // Usa la propiedad has_liked directamente
    
    const method = hasLiked ? "DELETE" : "POST";

    const data = await fetchWithAuth(
      `${BASE_URL}/api/comments/${commentId}/like`,
      method,
      null,
      token
    );

    // Actualizar el estado con la respuesta del backend
    dispatch({
      type: "update_comment_likes",
      payload: {
        commentId,
        likeCount: data.like_count,
        hasLiked: data.has_liked
      }
    });

  } catch (error) {
    console.error("Error toggling comment like:", error);
    
    // Si es error 400 (like ya existe), sincronizar el estado
    if (error.message.includes("already liked")) {
      dispatch({
        type: "update_comment_likes",
        payload: {
          commentId,
          hasLiked: true
        }
      });
    } 
    // Si es error 404 (like no existe), sincronizar el estado
    else if (error.message.includes("not liked")) {
      dispatch({
        type: "update_comment_likes",
        payload: {
          commentId,
          hasLiked: false
        }
      });
    } else {
      throw new Error("Failed to update comment like status.");
    }
  }
};

export const deleteComment = async (dispatch, store, commentId) => {
  const { token } = store;

  if (!token) {
    throw new Error("You must be logged in to delete a comment.");
  }

  try {
    await fetchWithAuth(
      `${BASE_URL}/api/comments/${commentId}`,
      "DELETE",
      null,
      token
    );

    dispatch({ type: "delete_comment", payload: commentId });
  } catch (error) {
    console.error("Error deleting comment:", error);
    throw new Error("Failed to delete comment.");
  }
};
// ------------------- Acciones de Likes y Favoritos de Posts -------------------

export const togglePostLike = async (dispatch, store, postId, isLiked) => {
  if (!store.user) {
    toast.error("You must be logged in to like posts.");
    return;
  }

  // REFACTORIZADO: Lógica simplificada usando una sola URL.
  const token = store.token;
  const method = isLiked ? "DELETE" : "POST";
  const url = `${BASE_URL}/api/post/${postId}/likes`;

  try {
    const data = await fetchWithAuth(url, method, null, token);

    if (isLiked) {
      // Para eliminar el like, necesitamos su ID, que el estado ya no conoce directamente.
      // Buscamos el likeId en el store para enviarlo al reducer.
      const like = store.allLikes.find(
        (l) => l.post_id === postId && l.user_id === store.user.id
      );
      if (like) {
        dispatch({ type: "delete_like", payload: like.id });
      }
    } else {
      dispatch({ type: "add_like", payload: data.like });
    }
  } catch (error) {
    console.error("Error toggling like:", error);
    toast.error(error.message || "Failed to update like status.");
  }
};

export const toggleFavorite = async (dispatch, store, postId) => {
  if (!store.user) {
    toast.error("You must be logged in to favorite posts.");
    return;
  }

  const token = store.token;
  const favoriteInStore = store.allFavorites.find(
    (fav) => fav.post_id === postId && fav.user_id === store.user.id
  );

  const isFavorited = !!favoriteInStore;
  let method, url, body;

  if (isFavorited) {
    // --- Lógica para ELIMINAR ---
    const favoriteId = favoriteInStore.favorite_id;
    if (!favoriteId) {
      console.error("Favorite ID not found in store.");
      return toast.error(
        "An internal error occurred. Please refresh the page."
      );
    }
    method = "DELETE";
    url = `${BASE_URL}/api/favorites/${favoriteId}`;
    body = null;
  } else {
    // --- Lógica para AGREGAR ---
    method = "POST";
    url = `${BASE_URL}/api/favorites`;
    body = { post_id: postId };
  }

  try {
    const responseData = await fetchWithAuth(url, method, body, token);

    if (isFavorited) {
      // ✨ CORRECCIÓN: Despachamos la acción con el 'postId' para que el reducer pueda encontrar y eliminar el post fácilmente.
      dispatch({ type: "delete_favorite", payload: postId });
      toast.success("Post removed from favorites!");
    } else {
      const postToAdd = store.allPosts.find((p) => p.id === postId);
      if (postToAdd) {
        const newFavoriteItem = {
          ...postToAdd,
          favorite_id: responseData.favorite.id,
          post_id: postId,
          user_id: store.user.id,
        };
        dispatch({ type: "add_favorite", payload: newFavoriteItem });
        toast.success("Post added to favorites!");
      }
    }
  } catch (error) {
    console.error("Error toggling favorite:", error);
    toast.error(error.message || "Failed to update favorite status.");
  }
};

//----------------------------Acciones del administrador--------------------------
export const adminDeletePost = async (dispatch, token, postId) => {
  try {
    await fetchWithAuth(
      `${BASE_URL}/api/admin/posts/${postId}`,
      "DELETE",
      null,
      token
    );
    dispatch({ type: "delete_post", payload: postId });
    toast.success("Post deleted successfully by admin!");
  } catch (error) {
    console.error("Error deleting post as admin:", error);
    toast.error("Failed to delete post as admin.");
    throw error;
  }
};

export const fetchAdminPosts = async (dispatch, token) => {
  try {
    const data = await fetchWithAuth(
      `${BASE_URL}/api/admin/posts`,
      "GET",
      null,
      token
    );
    dispatch({ type: "set_posts", payload: data.posts });
  } catch (error) {
    console.error("Error fetching admin posts:", error);
    toast.error("Failed to load posts for administration.");
  }
};
