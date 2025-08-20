// File: src/store.js

import { complex } from "framer-motion";

export const initialStore = () => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  return {
    message: null,
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    allPosts: [],
    allComments: [],
    allFavorites: [],
    allLikes: []
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_user':
      localStorage.setItem("user", JSON.stringify(action.payload.user));
      localStorage.setItem("token", action.payload.token);
      return {
        ...store,
        user: action.payload.user,
        token: action.payload.token,
      };
    case 'logout':
      localStorage.removeItem("user");
      localStorage.removeItem("token");
      return {
        ...store,
        user: null,
        token: null,
        allPosts: [],
        allComments: [],
        allFavorites: [],
        allLikes: []
      };
    case 'toggle_like':
      if (!store.user) return store;
      const updatedLikes = store.user.likes?.includes(action.payload)
        ? store.user.likes.filter(id => id !== action.payload)
        : [...(store.user.likes || []), action.payload];
      return {
        ...store,
        user: { ...store.user, likes: updatedLikes },
      };

    case 'toggle_favorite':
      if (!store.user) return store;
      const updatedFavorites = store.user.favorites?.includes(action.payload)
        ? store.user.favorites.filter(id => id !== action.payload)
        : [...(store.user.favorites || []), action.payload];
      return {
        ...store,
        user: { ...store.user, favorites: updatedFavorites },
      };
    
    case 'set_posts':
      // almacena todos los post 
      return {...store, allPosts: action.payload};

    case 'add_post':
      // add nuevo post
      return {...store, 
        allPosts: [action.payload, ...store.allPosts] 
      };
    case 'edit_post':
    // edita un post especifico por su id 
      return{
        ...store,
        allPosts: store.allPosts.map(post => 
          post.id === action.payload.id ? action.payload : post),
      };
    case 'delete_post':
      return{
        ...store,
        allPost: store.allPost.filter(post => 
          post.id !== action.payload)
      }
    case 'set_comments':
      // almacena todos los comentarios en el estado
      return{
        ...store, allComments: action.payload
      };
    case 'add_comment':
      // add nuevo comentario 
      return{
        ...store, allComments: [...store.allComments, action.payload],
      };
    case 'delete_comment':
      //elimina un comentario por su id
      return{
        ...store,
        allComments: store.allComments.filter(comment => comment.id !== action.payload),
      };
    case 'set_favorite':
      // almacena los favoritos 
      return {
        ...store,
        allFavorites: action.payload
      };
    case 'add_favorite':
      // agregar un favorito
      return {
        ...store,
        allFavorites: [...store.allFavorites, action.payload]
      };
    case 'delete_favorite':
    //remover los favoritos por su id 
    return{
      ...store,
      allFavorites: store.allFavorites.filter(fav =>
        fav.id !== action.payload
      )
    };
    case 'set_likes':
      // lista incial de likes
      return {...store, allLikes: action.payload};
    case 'add_like':
      //agrega un nuevo like al estado
      return {
        ...store,
        allLikes: [...store.allLikes, action.payload]
      };
    case 'delete_like':
      //elimina un like por su id
      return {
        ...store, 
        allLikes: store.allLikes.filter(like => like.post_id !== action.payload)
      };
    default:
      throw Error('Unknown action.');
  }
}