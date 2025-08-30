import { toast } from "react-toastify";

// Define el estado inicial de la tienda.
export const initialStore = () => {
  return {
    message: null,
    user: null,
    token: null,
    allPosts: [],
    allComments: [],
    allFavorites: [],
    allLikes: [],
    commentLikes: [],
  };
};

// El reducer se encarga de cambiar el estado de la tienda según la acción.
export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case "set_user":
      return {
        ...store,
        user: action.payload.user,
        token: action.payload.token || store.token,
      };
    case "logout":
      return {
        ...store,
        user: null,
        token: null,
        allPosts: [],
        allComments: [],
        allFavorites: [],
        allLikes: [],
        commentLikes: [],
      };
    case "set_posts":
      return { ...store, allPosts: action.payload };

    case "add_posts":
      // Evita posts duplicados
      const newPosts = action.payload.filter(
        (newPost) => !store.allPosts.some((post) => post.id === newPost.id)
      );
      return { ...store, allPosts: [...store.allPosts, ...newPosts] };

    case "add_post":
      return { ...store, allPosts: [action.payload, ...store.allPosts] };

    case "edit_post":
      return {
        ...store,
        allPosts: store.allPosts.map((post) =>
          post.id === action.payload.id ? action.payload : post
        ),
      };

    case "delete_post":
      return {
        ...store,
        allPosts: store.allPosts.filter((post) => post.id !== action.payload),
      };

    case "set_comments":
      // Actualiza los comentarios de la tienda con los nuevos datos.
      return {
        ...store,
        allComments: action.payload,
      };

    case "add_comment":
      // Añade un nuevo comentario al final de la lista.
      return {
        ...store,
        allComments: [...store.allComments, action.payload],
      };

    case "delete_comment":
      // Elimina un comentario de la lista por su ID.
      return {
        ...store,
        allComments: store.allComments.filter(
          (comment) => comment.id !== action.payload
        ),
      };

    case "set_favorite":
      return {
        ...store,
        allFavorites: action.payload,
      };

    case "add_favorite":
      return {
        ...store,
        allFavorites: [...store.allFavorites, action.payload],
      };

    case "delete_favorite":
      return {
        ...store,
        allFavorites: store.allFavorites.filter(
          (fav) => fav.id !== action.payload
        ),
      };

    case "set_likes":
      return { ...store, allLikes: action.payload };

    case "add_like":
      return { ...store, allLikes: [...store.allLikes, action.payload] };

    case "delete_like":
      return {
        ...store,
        allLikes: store.allLikes.filter((like) => like.id !== action.payload),
      };
    case "update_comment_likes":
      return {
        ...store,
        allComments: store.allComments.map((comment) =>
          comment.id === action.payload.commentId
            ? {
                ...comment,
                comment_likes: action.payload.likes,
                like_count: action.payload.likeCount,
                has_liked: action.payload.hasLiked,
              }
            : comment
        ),
      };
    default:
      throw new Error(`Unhandled action type: ${action.type}`);
  }
}
