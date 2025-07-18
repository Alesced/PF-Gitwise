// Importa el hook del store global para acceder al usuario
import useGlobalReducer from "../hooks/useGlobalReducer";

// Componente UserProfile
export const UserProfile = () => {
  const { store } = useGlobalReducer();    // Obtiene el usuario desde el contexto global
  const user = store.user;                 // Acceso directo al objeto usuario

  // Si no hay usuario logueado, muestra un mensaje simple
  if (!user) {
    return <p className="text-white p-5">Please log in to view your profile.</p>;
  }

  return (
    <div className="bg-black text-white min-vh-100 p-3">

      {/* Tarjeta principal con datos básicos */}
      <div className="card bg-dark text-white shadow-lg">

        {/* Banner superior del perfil */}
        <div className="position-relative">
          <img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413"
            alt="Banner"
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
          />

          {/* Avatar del usuario */}
          <img
            src={user.avatar_url || "https://avatars.githubusercontent.com/u/000000?v=4"}  // imagen de GH
            alt="Avatar"
            className="rounded-circle border border-3 border-white position-absolute"
            style={{
              width: "120px",
              height: "120px",
              left: "50%",
              transform: "translateX(-50%)",
              bottom: "-60px"
            }}
          />
        </div>

        {/* Información del usuario */}
        <div className="card-body text-center mt-5 pt-4">

          <h3 className="card-title">{user.username}</h3>
          <p className="mb-1"><strong>Email:</strong> {user.email}</p>
          

          {/* Fecha de registro (exacta) */}
          {user.join_date && (
            <p className="mb-2 text-secondary">
              Member since: {new Date(user.join_date).toLocaleDateString()}
            </p>
          )}

          {/* NOTA: Enlaces para mejorar */}
          {/*
          <div className="mt-3 d-flex justify-content-center gap-3">
            {user.github && (
              <a href={user.github} target="_blank" rel="noreferrer">
                <i className="fab fa-github fa-lg text-white"></i>
              </a>
            )}
            {user.linkedin && (
              <a href={user.linkedin} target="_blank" rel="noreferrer">
                <i className="fab fa-linkedin fa-lg text-white"></i>
              </a>
            )}
            {user.portfolio && (
              <a href={user.portfolio} target="_blank" rel="noreferrer">
                <i className="fas fa-globe fa-lg text-white"></i>
              </a>
            )}
          </div>
          */}
        </div>
      </div>

      {/* Sección My Posts */}
      <div className="mt-5">
        <h4 style={{ color: "#2563eb" }}>My Posts</h4>

        {/* Si el usuario tiene posts */}
        {user.my_posts && user.my_posts.length > 0 ? (
          <ul className="list-group list-group-flush">
            {user.my_posts.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white">
                <strong>{post.title}</strong>
              </li>
            ))}
          </ul>
        ) : (
          <p>No posts yet.</p>    // Si no tiene posts
        )}
      </div>

      {/* Sección My Favorites */}
      <div className="mt-4">
        <h4 style={{ color: "#2563eb" }}>My Favorites</h4>

        {/* Si el usuario tiene favoritos */}
        {user.favorites && user.favorites.length > 0 ? (
          <ul className="list-group list-group-flush">
            {user.favorites.map(fav => (
              <li key={fav} className="list-group-item bg-black text-white">
                Favorite Post ID: {fav}
              </li>
            ))}
          </ul>
        ) : (
          <p>No favorites yet.</p>  // Si no tiene favoritos
        )}
      </div>

    </div>
  );
};
