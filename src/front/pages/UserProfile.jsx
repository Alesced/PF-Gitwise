// File: src/front/pages/UserProfile.jsx

import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { motion } from "framer-motion";

export const UserProfile = () => {
  const { store } = useGlobalReducer();
  const navigate = useNavigate();
  const [myPosts, setMyPosts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", repo_URL: "" });

  const user = store.user || {
    username: "GuestDev",
    email: "guest@example.com",
    avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    join_date: "2024-05-01",
    my_posts: [],
    favorites: []
  };

  useEffect(() => {
    if (!store.user) return navigate("/login");

    const fetchPosts = async () => {
      const token = localStorage.getItem("token");
      try {
        const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (!res.ok) {
          const text = await res.text();
          console.error("Error response:", text);
          throw new Error(`Failed: ${res.status}`);
        }

        const json = await res.json();
        const allPosts = json.posts || [];
        const userPosts = allPosts.filter(p => p.user_id === store.user.id);
        setMyPosts(userPosts);
      } catch (err) {
        console.error("Fetch posts failed:", err.message);
      }
    };

    const fetchFavorites = async () => {
      const token = localStorage.getItem("token");
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) {
        const favs = await res.json();
        const fullPosts = await Promise.all(
          favs.map(async (f) => {
            const r = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${f.post_id}`, {
              headers: { Authorization: `Bearer ${token}` },
            });
            if (!r.ok) return null;
            const json = await r.json();
            return json.post;
          })
        );
        setFavorites(fullPosts.filter(Boolean));
      }
    };

    fetchPosts();
    fetchFavorites();
  }, [store.user?.id, store.user?.my_posts?.length]);

  const removePost = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${id}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    if (res.ok) setMyPosts(myPosts.filter(p => p.id !== id));
  };

  const startEdit = (post) => {
    setEditId(post.id);
    setFormData({ title: post.title, description: post.description, repo_URL: post.repo_URL });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: "", description: "", repo_URL: "" });
  };

  const saveEdit = async (id) => {
    const token = localStorage.getItem("token");
    const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${id}`, {
      method: "PUT",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(formData),
    });
    if (res.ok) {
      const json = await res.json();
      setMyPosts(myPosts.map(p => p.id === id ? json.post : p));
      cancelEdit();
    }
  };

  const renderCard = (post, editable = false) => (
    <motion.div
      className="col"
      key={post.id}
      initial={{ opacity: 0, y: 50 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="icon-box h-100 d-flex flex-column justify-content-between">
        {editable && editId === post.id ? (
          <>
            <input type="text" className="form-control mb-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
            <textarea className="form-control mb-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
            <input type="url" className="form-control mb-2" value={formData.repo_URL} onChange={e => setFormData({ ...formData, repo_URL: e.target.value })} />
            <div className="d-flex justify-content-between">
              <button className="btn btn-sm btn-success" onClick={() => saveEdit(post.id)}>Save</button>
              <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
            </div>
          </>
        ) : (
          <>
            <div>
              <h5 className="text-white">{post.title}</h5>
              <p>{post.description}</p>
              {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
              {post.level && <span className="badge bg-info">{post.level}</span>}
            </div>
            <div className="d-flex justify-content-between align-items-center mt-3">
              <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">View GitHub</a>
              <div className="d-flex gap-2 align-items-center">
                <FavoriteButton postId={post.id} whiteText={true} />
                {editable && <>
                  <button className="btn btn-sm btn-outline-primary" onClick={() => startEdit(post)}>Edit</button>
                  <button className="btn btn-sm btn-outline-danger" onClick={() => removePost(post.id)}>Delete</button>
                </>}
              </div>
            </div>
          </>
        )}
      </div>
    </motion.div>
  );

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start py-5 hero-bg text-white">
      <div className="text-center mb-5">
        <h1 className="hero-title">Welcome, {user.username}</h1>
        <p className="hero-subtitle">Manage your GitWise profile and track your contributions</p>
      </div>

      <div className="icon-box mb-5 mx-auto" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="position-relative mb-4">
          <img
            src="https://images.unsplash.com/photo-1503264116251-35a269479413"
            alt="Banner"
            className="w-100 rounded"
            style={{ height: "180px", objectFit: "cover" }}
          />
          <img
            src={user.avatar_url}
            alt="Avatar"
            className="rounded-circle border border-3 border-white position-absolute"
            style={{ width: "100px", height: "100px", left: "50%", transform: "translateX(-50%)", bottom: "-50px" }}
          />
        </div>

        <div className="text-center pt-5">
          <h3 className="fw-bold mb-1">{user.username}</h3>
          <p className="mb-1 text-light">{user.email}</p>
          {user.join_date && (
            <p className="text-secondary">Member since: {new Date(user.join_date).toLocaleDateString()}</p>
          )}
        </div>
      </div>

      <div className="px-4 w-100">
        <h4 className="mb-3" style={{ color: "#7b5bff" }}>My Posts</h4>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {myPosts.length > 0 ? myPosts.map(p => renderCard(p, true)) : <p className="text-light">No posts yet.</p>}
        </div>

        <h4 className="mt-5 mb-3" style={{ color: "#7b5bff" }}>My Favorites</h4>
        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {favorites.length > 0 ? favorites.map(p => renderCard(p)) : <p className="text-light">No favorites yet.</p>}
        </div>
      </div>
    </div>
  );
};