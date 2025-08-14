// File: src/store.js

export const initialStore = () => {
  const storedUser = localStorage.getItem("user");
  const storedToken = localStorage.getItem("token");

  return {
    message: null,
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    todos: [
      { id: 1, title: "Make the bed", background: null },
      { id: 2, title: "Do my homework", background: null },
    ],
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return { ...store, message: action.payload };

    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map(todo =>
          todo.id === id ? { ...todo, background: color } : todo
        ),
      };

    case 'set_user':
      return {
        ...store,
        user: action.payload.user,
        token: action.payload.token,
      };

    case 'logout':
      return {
        ...store,
        user: null,
        token: null,
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

    default:
      throw Error('Unknown action.');
  }
}