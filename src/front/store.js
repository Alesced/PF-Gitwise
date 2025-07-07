export const initialStore = () => {
  return {
    message: null,
    user: {
      username: "guest", // o null si se carga luego
      likes: [] // aquí se almacenan los postId que ha dado like
    },
    todos: [
      {
        id: 1,
        title: "Make the bed",
        background: null,
      },
      {
        id: 2,
        title: "Do my homework",
        background: null,
      }
    ]
  };
};

export default function storeReducer(store, action = {}) {
  switch (action.type) {
    case 'set_hello':
      return {
        ...store,
        message: action.payload
      };

    case 'add_task':
      const { id, color } = action.payload;
      return {
        ...store,
        todos: store.todos.map(todo =>
          todo.id === id ? { ...todo, background: color } : todo
        )
      };

    case 'set_user':
      return {
        ...store,
        user: action.payload
      };

    case 'toggle_like':
      if (!store.user) return store; // seguridad si no hay user

      const currentLikes = store.user.likes || [];

      const updatedLikes = currentLikes.includes(action.payload)
        ? currentLikes.filter(id => id !== action.payload)
        : [...currentLikes, action.payload];

      return {
        ...store,
        user: {
          ...store.user,
          likes: updatedLikes
        }
      };

    default:
      throw Error('Unknown action.');
  }
}