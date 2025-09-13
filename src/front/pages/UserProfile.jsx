import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { LikeButton } from "../components/LikeButton";
import { BsThreeDotsVertical } from "react-icons/bs";
import { CommentSection } from "../components/CommentSection";
import { FavoriteButton } from "../components/FavoriteButton";
import { FaRegComment } from "react-icons/fa";

// Estos valores deben coincidir con tus Enums de base de datos
const STACKS = ["HTML", "CSS", "JAVASCRIPT", "PYTHON", "SQL"];
const LEVELS = ["student", "junior_dev", "mid_dev", "senior_dev"];

// Función para formatear los valores para visualización
const formatValue = (value) => {
  if (!value) return '';

  if (value === "JAVASCRIPT") return "JavaScript";
  if (value === "student") return "Student";
  if (value === "junior_dev") return "Junior Dev";
  if (value === "mid_dev") return "Mid Dev";
  if (value === "senior_dev") return "Senior Dev";

  return value;
};

export const UserProfile = () => {
  // Usa el hook para obtener el 'store' y las 'actions'
  const { store, dispatch, actions } = useGlobalReducer();
  const navigate = useNavigate();
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ title: "", description: "", repo_URL: "", stack: "", level: "" });
  const [activeTab, setActiveTab] = useState("posts");
  const [visibleCount, setVisibleCount] = useState(6);
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: "", description: "", github: "", stack: "", level: "" });
  const [loading, setLoading] = useState(true);
  const [openDropdownId, setOpenDropdownId] = useState(null);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  // Derivamos el estado de forma reactiva del store
  const myPosts = (store.allPosts || []).filter(post => post.user_id === store.user?.id);
  const favorites = (store.allFavorites || []);

  const user = store.user || {
    username: "GuestDev",
    email: "guest@example.com",
    avatar_url: "https://avatars.githubusercontent.com/u/000000?v=4",
    join_date: "2024-05-01",
    my_posts: [],
    favorites: []
  };

  useEffect(() => {
    // Si el usuario no está logeado, lo redirigimos
    if (!store.user) {
      setLoading(false);
      return navigate("/login");
    }

    // La lógica de fetching se ha movido a las acciones
    const fetchUserData = async () => {
      setLoading(true);
      try {
        // Llamamos a las nuevas acciones para obtener los datos
        await actions.fetchUserPosts(store.user.id);
      } catch (error) {
        console.error("Fetch user posts failed:", error.message);
        toast.error("Failed to load user posts");
      } finally {
        setLoading(false);
      }
    };

    fetchUserData();
  }, [store.user?.id, dispatch, navigate]);

  // Cargar favoritos cuando el token esté disponible
  useEffect(() => {
    if (store.token) {
      actions.fetchAllFavorites();
    }
  }, [store.token]);

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
    if (!title || !description || !github || !stack || !level) {
      return toast.error("Todos los campos son requeridos");
    }

    try {
      // Llamamos a la acción 'createPost' con los parámetros correctos
      const success = await actions.createPost(store.user.id, {
        title,
        description,
        repo_URL: github,
        image_URL: "https://via.placeholder.com/300",
        stack,
        level,
      });

      if (success) {
        setShowModal(false);
        setNewProject({
          title: "",
          description: "",
          github: "",
          stack: "",
          level: ""
        });
        toast.success("Project created successfully!");
      }
    } catch (err) {
      console.error("POST error:", err);
      toast.error("Failed to save project: " + err.message);
    }
  };

  const removePost = async (id) => {
    // Llamamos a la acción 'deletePostAPI'
    await actions.deletePostApi(id);
  };

  const startEdit = (post) => {
    setEditId(post.id);
    setFormData({
      title: post.title,
      description: post.description,
      repo_URL: post.repo_URL,
      stack: post.stack || "",
      level: post.level || ""
    });
  };

  const cancelEdit = () => {
    setEditId(null);
    setFormData({ title: "", description: "", repo_URL: "", stack: "", level: "" });
  };

  const saveEdit = async (id) => {
    // Llamamos a la acción 'editPostAPI'
    await actions.editPostApi(id, formData);
    cancelEdit();
  };

  const renderCard = (item, editable = false) => {
    // Determinar si es un favorito (tiene favorite_id) o un post normal
    const isFavorite = item.hasOwnProperty('favorite_id');

    // Debug: verificar la estructura del item
    console.log("Item data:", item);

    // Crear un objeto post unificado con valores por defecto
    const post = isFavorite ? {
      id: item.post_id,        // Usar post_id para favoritos
      title: item.title || "Untitled Project",
      description: item.description || "No description available",
      repo_URL: item.repo_URL,
      image_URL: item.image_URL,
      stack: item.stack,
      level: item.level,
      user_id: item.user_id,
      favorite_id: item.favorite_id || item.id
    } : {
      ...item,
      title: item.title || "Untitled Project",
      description: item.description || "No description available"
    };

    return (
      <motion.div
        className="col"
        key={post.id}
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
      >
        <div className="icon-box d-flex flex-column justify-content-between position-relative">
          {editable && editId === post.id ? (
            <>
              <input type="text" className="form-control mb-2" value={formData.title} onChange={e => setFormData({ ...formData, title: e.target.value })} />
              <textarea className="form-control mb-2" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })} />
              <input type="url" className="form-control mb-2" value={formData.repo_URL} onChange={e => setFormData({ ...formData, repo_URL: e.target.value })} />

              <div className="row mb-2">
                <div className="col">
                  <select className="form-select" value={formData.stack} onChange={e => setFormData({ ...formData, stack: e.target.value })}>
                    <option value="">Select Stack</option>
                    {STACKS.map((stack, i) => <option key={i} value={stack}>{formatValue(stack)}</option>)}
                  </select>
                </div>
                <div className="col">
                  <select className="form-select" value={formData.level} onChange={e => setFormData({ ...formData, level: e.target.value })}>
                    <option value="">Select Level</option>
                    {LEVELS.map((level, i) => <option key={i} value={level}>{formatValue(level)}</option>)}
                  </select>
                </div>
              </div>

              <div className="d-flex justify-content-between">
                <button className="btn btn-sm btn-success" onClick={() => saveEdit(post.id)}>Save</button>
                <button className="btn btn-sm btn-secondary" onClick={cancelEdit}>Cancel</button>
              </div>
            </>
          ) : (
            <>
              {editable && (
                <div className="dropdown position-absolute top-0 end-0 m-2" style={{ zIndex: 1000 }}>
                  <button
                    className="btn btn-link text-white p-0"
                    type="button"
                    onClick={() => setOpenDropdownId(openDropdownId === post.id ? null : post.id)}
                  >
                    <BsThreeDotsVertical size={20} />
                  </button>
                  <ul
                    className={`dropdown-menu dropdown-menu-dark${openDropdownId === post.id ? " show" : ""}`}
                    style={{ left: "auto", right: "0" }}
                  >
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => { startEdit(post); setOpenDropdownId(null); }}>Edit</a>
                    </li>
                    <li>
                      <a className="dropdown-item" href="#" onClick={() => { removePost(post.id); setOpenDropdownId(null); }}>Delete</a>
                    </li>
                  </ul>
                </div>
              )}

              <div>
                <h5 className="text-white">{post.title || "Untitled Project"}</h5>
                <p>{post.description || "No description available."}</p>
                <div className="d-flex gap-2 mb-2">
                  {post.stack && <span className="badge bg-secondary">{formatValue(post.stack)}</span>}
                  {post.level && <span className="badge bg-info">{formatValue(post.level)}</span>}
                </div>
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">View GitHub</a>
                <div className="d-flex align-items-center gap-2">
                  <LikeButton postId={post.id} />
                  <FavoriteButton postId={post.id} count={post.favorite_count || 0} whiteText />
                  <button
                    className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                    style={{ width: "40px", height: "32px" }}
                    onClick={() => setOpenCommentPostId(prev => prev === post.id ? null : post.id)}
                  >
                    <FaRegComment />
                  </button>
                </div>
              </div>
              {openCommentPostId === post.id && (
                <div className="comment-section-anim open">
                  <CommentSection postId={post.id} />
                </div>
              )}
            </>
          )}
        </div>
      </motion.div>
    );
  };
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
                  {STACKS.map((stack, i) => <option key={i} value={stack}>{formatValue(stack)}</option>)}
                </select>

                <select className="form-select mb-3" value={newProject.level} onChange={e => setNewProject({ ...newProject, level: e.target.value })}>
                  <option value="">Select Level</option>
                  {LEVELS.map((level, i) => <option key={i} value={level}>{formatValue(level)}</option>)}
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
          {displayed.length > 0 ? displayed.map(item => renderCard(item, editable)) : <p className="text-light">No content yet.</p>}
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
          <div className="d-flex justify-content-center gap-2 mt-2">
            {user.stack && <span className="badge bg-success rounded-pill px-3 py-2 fs-6">{formatValue(user.stack)}</span>}
            {user.level && <span className="badge bg-primary rounded-pill px-3 py-2 fs-6">{formatValue(user.level)}</span>}
          </div>
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