// File: src/front/pages/UserProfile.jsx

import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { motion } from "framer-motion";
import { toast } from "react-toastify";

const STACKS = ["React", "Vue", "Angular", "MERN", "Next.js", "Svelte"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const UserProfile = () => {
  const { store, dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", repo_URL: "" });
  const [activeTab, setActiveTab] = useState("posts");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", github: "", stack: "", level: "" });
  const [loading, setLoading] = useState(true);

  const user = store.user || {
    username: "GuestDev",
    email: "guest@example.com",
    avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    join_date: "2024-05-01",
    my_posts: [],
    favorites: []
  };

  useEffect(() => {
    // Si el usuario no está en el store, redirigir al login
    if (!store.user) {
      setLoading(false);
      return navigate("/login");
    }

    // Funciones para hacer el fetch de datos del usuario y sus favoritos
    const fetchAllData = async () => {
      setLoading(true);
      const token = localStorage.getItem("token");

      try {
        //obtener todos los post
        const postsRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/users/${store.user.id}/posts`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const postsData = await postsRes.json();
        dispatch({ type: 'set_post', payload: postsData.posts});

        // obtener los favoritos del usuario
        const favoriteRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/favorites`,{
          headers: {Authorization: `Bearer ${token}`},
        });

        const favoriteData = await favoriteRes.json();
        const favoritePost = await Promise.all(
          favoriteData.favorites.map(async (f) => {
            const postRes = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/post/${f.post_id}`, {
              headers: {Authorization: `Bearer ${token}`},
            });
            return postRes.ok ? (await postRes.json()).post : null;
          })
        );
        dispatch({ type: 'set_favorites', payload: favoritePost.filter(Boolean)});

        //obtener los likes del usuario
        const likeRes = await fetchAllData(`${import.meta.env.VITE_BACKEND_URL}/`)
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        
        dispatch({
          type: "set_user",
          payload: { user: data.user, token: store.token }
        });
        const userPost = data.posts.filter(post => post.user_id === store.user.id)
        setMyPosts(userPost);
      } catch (error) {
        console.error("Fetch user data failed:", error.message);
        setMyPosts([]);
        toast.error("Failed to load user data.");
      } finally {
        setLoading(false);
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
            return r.ok ? (await r.json()).post : null;
          })
        );
        setFavorites(fullPosts.filter(Boolean));
      }
    };
    
    fetchUserData();
    fetchFavorites();
    
  }, [store.user?.id]); // El array de dependencia es correcto

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center text-white">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  const handleCreateProject = async () => {
    const { title, description, github, stack, level } = newProject;
    if (!title || !description || !github) return toast.error("All fields required");

    try {
      const res = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/user/post/${store.user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({
          title,
          description,
          repo_URL: github,
          image_URL: "https://via.placeholder.com/300",
          stack,
          level,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.msg || "Failed to save project");
      setMyPosts(prev => [data.post, ...prev]);
      toast.success("Project created!");
      setShowModal(false);
      setNewProject({ title: "", description: "", github: "", stack: "", level: "" });
    } catch (err) {
      console.error("POST error:", err);
      toast.error("Failed to save project: " + err.message);
    }
  };

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

  const renderList = () => {
    const list = activeTab === "posts" ? myPosts : favorites;
    const editable = activeTab === "posts";
    const displayed = list.slice(0, visibleCount);

    return (
      <>
        {editable && (
          <div className="text-center mb-4">
            <button className="btn btn-gitwise" onClick={() => setShowModal(true)}>+ Create New Project</button>
          </div>
        )}

        {showModal && (
          <section className="modal d-block bg-dark bg-opacity-75">
            <div className="modal-dialog modal-dialog-centered">
              <div className="modal-content bg-dark text-white p-4 rounded">
                <h5 className="mb-3">New Project</h5>
                <input type="text" className="form-control mb-2" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea className="form-control mb-2" placeholder="Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })}></textarea>
                <input type="text" className="form-control mb-2" placeholder="GitHub Repo URL" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} />
                <select className="form-select mb-2" value={newProject.stack} onChange={e => setNewProject({ ...newProject, stack: e.target.value })}>
                  <option value="">Select Stack</option>
                  {STACKS.map((stack, i) => <option key={i} value={stack}>{stack}</option>)}
                </select>
                <select className="form-select mb-3" value={newProject.level} onChange={e => setNewProject({ ...newProject, level: e.target.value })}>
                  <option value="">Select Level</option>
                  {LEVELS.map((level, i) => <option key={i} value={level}>{level}</option>)}
                </select>
                <div className="d-flex justify-content-between">
                  <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                  <button className="btn btn-gitwise" onClick={handleCreateProject}>Save Project</button>
                </div>
              </div>
            </div>
          </section>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
          {displayed.length > 0 ? displayed.map(p => renderCard(p, editable)) : <p className="text-light">No content yet.</p>}
        </div>
        {list.length > visibleCount && (
          <div className="text-center mt-4">
            <button className="btn btn-outline-light" onClick={() => setVisibleCount(c => c + 6)}>Load More</button>
          </div>
        )}
      </>
    );
  };

  return (
    <div className="container-fluid min-vh-100 d-flex flex-column justify-content-start py-5 hero-bg text-white">
      <div className="text-center mb-5">
        <h1 className="hero-title">Welcome, {user.username}</h1>
        <p className="hero-subtitle">Manage your GitWise profile and track your contributions</p>
      </div>

      <div className="icon-box mb-5 mx-auto" style={{ maxWidth: "600px", width: "100%" }}>
        <div className="position-relative mb-4">
          <img src="https://images.unsplash.com/photo-1503264116251-35a269479413" alt="Banner" className="w-100 rounded" style={{ height: "180px", objectFit: "cover" }} />
          <img src="https://avatars.githubusercontent.com/u/000000?v=4" alt="Avatar" className="rounded-circle border border-3 border-white position-absolute" style={{ width: "100px", height: "100px", left: "50%", transform: "translateX(-50%)", bottom: "-50px" }} />
        </div>
        <div className="text-center pt-5">
          <h3 className="fw-bold mb-1">{user.username}</h3>
          <p className="mb-1 text-light">{user.email}</p>
          {user.join_date && <p className="text-secondary">Member since: {new Date(user.join_date).toLocaleDateString()}</p>}
        </div>
      </div>

      <div className="px-4 w-100">
        <div className="d-flex justify-content-center gap-4 mb-4">
          <button className={`btn ${activeTab === "posts" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setActiveTab("posts")}>My Posts</button>
          <button className={`btn ${activeTab === "favorites" ? "btn-primary" : "btn-outline-light"}`} onClick={() => setActiveTab("favorites")}>My Favorites</button>
        </div>

        {renderList()}
      </div>
    </div>
  );
};