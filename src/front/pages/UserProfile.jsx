import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

export const UserProfile = () => {
  const [user, setUser] = useState(null);
  const [favorites, setFavorites] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const mockUser = {
      username: "albertdcm",
      email: "albert@example.com",
      tech_stack: "React, Python",
      level: "MID_DEV",
      github: "https://github.com/albertdcm"
    };

    const mockFavorites = [
      { id: 1, title: "React Portfolio", stack: "React" },
      { id: 2, title: "API REST", stack: "Python" }
    ];

    const mockMyPosts = [
      { id: 3, title: "Chat App", stack: "JavaScript" },
      { id: 4, title: "Landing Page", stack: "HTML" }
    ];

    setUser(mockUser);
    setFavorites(mockFavorites);
    setMyPosts(mockMyPosts);
  }, []);

  if (!user) return <p className="text-white p-5">Loading profile...</p>;

  return (
    <div className="bg-black text-white min-vh-100 p-3">
      <div className="card bg-dark text-white shadow-lg">
        {/* Banner */}
        <div className="position-relative">
          <img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413"
            alt="Banner"
            className="card-img-top"
            style={{ height: "200px", objectFit: "cover" }}
          />

          {/* Avatar */}
          <img
            src="https://avatars.githubusercontent.com/u/000000?v=4"
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

        {/* Info */}
        <div className="card-body text-center mt-5 pt-4">
          <h3 className="card-title">{user.username}</h3>
          <p className="text-secondary mb-2">{user.tech_stack}</p>
          <p className="mb-2">Level: <strong>{user.level}</strong></p>
          <p className="mb-3">Email: {user.email}</p>

          <a
            href={user.github}
            className="btn btn-outline-primary btn-sm"
            target="_blank"
            rel="noreferrer"
          >
            GitHub Profile
          </a>
        </div>
      </div>

      {/* My Posts */}
      <div className="mt-5">
        <h4 style={{ color: "#2563eb" }}>My Posts</h4>
        {myPosts.length === 0 ? (
          <p>No posts yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {myPosts.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white">
                {post.title} ({post.stack})
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Favorites */}
      <div className="mt-4">
        <h4 style={{ color: "#2563eb" }}>My Favorites</h4>
        {favorites.length === 0 ? (
          <p>No favorites yet.</p>
        ) : (
          <ul className="list-group list-group-flush">
            {favorites.map(post => (
              <li key={post.id} className="list-group-item bg-black text-white">
                {post.title} ({post.stack})
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};