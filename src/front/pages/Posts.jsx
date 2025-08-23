import { useEffect, useState, useContext } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import { FaRegComment } from "react-icons/fa";
import { CommentSection } from "../components/CommentSection";
import { FavoriteButton } from "../components/FavoriteButton";
import { LikeButton } from "../components/LikeButton"

const useGlobalReducer = () => {
  // Simulación del hook useGlobalReducer
  const [store, setStore] = useState({
    token: "fake-token", // Asumimos un token para evitar la redirección
    posts: [], // Se inicializa como un array vacío para ser llenado por el fetch
  });
  const dispatch = (action) => {
    if (action.type === 'set_posts') {
      setStore(prev => ({ ...prev, posts: action.payload }));
    }
  };
  return { store, dispatch };
};


// Componente principal para mostrar y filtrar posts
export const Posts = () => {
  const { store, dispatch } = useGlobalReducer();
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openCommentPostId, setOpenCommentPostId] = useState(null);

  const postsPerPage = 6;
  // Usamos una URL de ejemplo para demostrar que el código funciona.
  // IMPORTANTE: Debes reemplazar esta URL con la tuya real.
  const BASE_URL = `${import.meta.env.VITE_BACKEND_URL}`; 

  // Hook para cerrar el modal de comentarios al hacer clic fuera
  useEffect(() => {
    const handleOutsideClick = (event) => {
      // Usamos un selector para verificar si el clic está fuera de la sección de comentarios
      const commentSection = document.querySelector('.comment-section-container');
      if (openCommentPostId && commentSection && !commentSection.contains(event.target)) {
        setOpenCommentPostId(null);
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [openCommentPostId]);

  // Hook para cargar todos los posts
  useEffect(() => {
    const fetchAllPosts = async () => {
      let allPosts = [];
      let page = 1;
      let hasMore = true;
      try {
        while (hasMore) {
          // CORRECCIÓN CLAVE: Agregamos el parámetro de paginación a la URL
          const res = await fetch(`${BASE_URL}/api/posts?page=${page}&per_page=${postsPerPage}`);
          
          if (!res.ok) {
            // Manejamos errores de la API, por ejemplo un 404
            const errorData = await res.json();
            toast.error(errorData.msg || "Error fetching posts");
            hasMore = false;
            setLoading(false);
            return; // Salimos de la función
          }
          
          const data = await res.json();
          if (data.posts && data.posts.length > 0) {
            allPosts = [...allPosts, ...data.posts];
            // Tu lógica de paginación está bien, la mantenemos
            if (data.posts.length < postsPerPage) {
              hasMore = false;
            } else {
              page++;
            }
          } else {
            hasMore = false;
          }
        }
        dispatch({ type: 'set_posts', payload: allPosts });
        setLoading(false);
      } catch (err) {
        console.error("Fetch error:", err);
        // Este error de sintaxis (<!) se maneja aquí
        toast.error("Failed to fetch posts. Please check the backend URL and server status.");
        setLoading(false);
      }
    };
    fetchAllPosts();
  }, [dispatch, postsPerPage]);

  // Muestra un mensaje de carga mientras se obtienen los posts
  if (loading) {
    return <div className="text-center mt-5">Cargando...</div>;
  }

  // Lógica de filtrado de posts en el frontend
  const filteredPosts = (store.posts || []).filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter ? post.stack === stackFilter : true;
    const matchesLevel = levelFilter ? post.level === levelFilter : true;
    return matchesSearch && matchesStack && matchesLevel;
  });

  // Lógica de paginación
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // Opciones únicas para los filtros
  const uniqueStacks = [...new Set((store.posts || []).map(p => p.stack).filter(Boolean))];
  const uniqueLevels = [...new Set((store.posts || []).map(p => p.level).filter(Boolean))];

  return (
    <div className="container-fluid hero-bg min-vh-100 py-5 px-3 d-flex flex-column align-items-center">
      <section className="w-100 text-center" style={{ marginTop: "-20px" }}>
        <h2 className="hero-title mt-4 mb-3">Explore</h2>
        <p className="hero-subtitle mb-4">
          Discover open-source projects, and connect with developers like you.
        </p>
      </section>

      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="w-100 d-flex flex-column align-items-center"
      >
        {/* Sección de filtros */}
        <section className="w-100 d-flex gap-3 justify-content-center mb-4 flex-wrap">
          {/* Campo de búsqueda */}
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary"
            placeholder="Search posts..."
            style={{ maxWidth: "300px" }}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />

          {/* Filtro por Stack */}
          <select
            className="form-select bg-dark text-white border-secondary"
            style={{ maxWidth: "180px" }}
            value={stackFilter}
            onChange={(e) => setStackFilter(e.target.value)}
          >
            <option value="">Select Stack</option>
            {uniqueStacks.map((stack) => <option key={stack} value={stack}>{stack}</option>)}
          </select>

          {/* Filtro por Nivel */}
          <select
            className="form-select bg-dark text-white border-secondary"
            style={{ maxWidth: "180px" }}
            value={levelFilter}
            onChange={(e) => setLevelFilter(e.target.value)}
          >
            <option value="">Select Level</option>
            {uniqueLevels.map((level) => <option key={level} value={level}>{level}</option>)}
          </select>
        </section>
      </motion.div>

      {/* Lista de posts */}
      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 px-md-5">
        <AnimatePresence>
          {currentPosts.map(post => (
            <motion.div key={post.id} className="col" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
              <div className="position-relative">
                <div
                  className="icon-box d-flex flex-column justify-content-between"
                  style={{ minHeight: "300px" }}
                >
                  <h5 style={{ color: "#fff" }}>{post.title}</h5>
                  <p>{post.description}</p>
                  {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
                  {post.level && <span className="badge bg-info">{post.level}</span>}

                  <div className="d-flex justify-content-between align-items-center mt-3">
                    <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">GitHub</a>
                    <div className="d-flex align-items-center gap-2">
                      <LikeButton postId={post.id} />
                      <FavoriteButton postId={post.id} count={post.favorite_count || 0} whiteText />
                      <button
                        className="btn btn-outline-light btn-sm d-flex align-items-center justify-content-center"
                        style={{ width: "40px", height: "32px" }}
                        onClick={() =>
                          setOpenCommentPostId((prev) => (prev === post.id ? null : post.id))
                        }
                      >
                        <FaRegComment />
                      </button>
                    </div>
                  </div>
                </div>

                {/* Sección de comentarios */}
                <div className={`mt-3 w-100 comment-section-container ${openCommentPostId === post.id ? 'd-block' : 'd-none'}`}>
                  <CommentSection postId={post.id} visible={true} />
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center mt-5 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-secondary"}`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Posts;
