import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaRegComment } from "react-icons/fa";
import { CommentSection } from "../components/CommentSection";
import { FavoriteButton } from "../components/FavoriteButton";
import { LikeButton } from "../components/LikeButton";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";

// Componente principal para mostrar y filtrar posts
export const Posts = () => {
  const { store, actions } = useGlobalReducer();
  const [loading, setLoading] = useState(true);
  
  // Estados para los filtros y la paginación
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  
  // Estado para la cantidad de posts a mostrar
  const [visiblePostCount, setVisiblePostCount] = useState(6);
  const postsPerPage = 6;

  // Llama a la acción para cargar posts solo una vez al inicio
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      await actions.fetchAllPosts();
      setLoading(false);
    };
    fetchInitialData();
  }, []);

  // Lógica de filtrado en el frontend (más concisa)
  const filteredPosts = (store.allPosts || []).filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter === "" || post.stack === stackFilter;
    const matchesLevel = levelFilter === "" || post.level === levelFilter;
    return matchesSearch && matchesStack && matchesLevel;
  });

  // Paginación: solo muestra la cantidad de posts visibles
  const postsToDisplay = filteredPosts.slice(0, visiblePostCount);
  const hasMore = visiblePostCount < filteredPosts.length;
  
  // Resetea la cantidad de posts visibles cuando cambian los filtros
  useEffect(() => {
    setVisiblePostCount(postsPerPage);
  }, [stackFilter, levelFilter, searchTerm]);

  const handleLoadMore = () => {
    setVisiblePostCount(prevCount => prevCount + postsPerPage);
  };
  
  // Opciones únicas para los filtros
  const uniqueStacks = [...new Set((store.allPosts || []).map(p => p.stack).filter(Boolean))];
  const uniqueLevels = [...new Set((store.allPosts || []).map(p => p.level).filter(Boolean))];

  if (loading) {
    return (
      <div className="container-fluid min-vh-100 d-flex justify-content-center align-items-center text-white">
        <div className="spinner-border" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

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
          {postsToDisplay.map(post => (
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

                {/* Sección de comentarios con animación de AnimatePresence */}
                <AnimatePresence>
                  {openCommentPostId === post.id && (
                    <motion.div
                      className="mt-3 w-100"
                      initial={{ opacity: 0, y: -20, height: 0 }}
                      animate={{ opacity: 1, y: 0, height: "auto" }}
                      exit={{ opacity: 0, y: -20, height: 0 }}
                      transition={{ duration: 0.3 }}
                      style={{ overflow: 'hidden' }}
                    >
                      <CommentSection postId={post.id} visible={true} />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="d-flex justify-content-center mt-5">
          <button
            className="btn btn-gitwise"
            onClick={handleLoadMore}
          >
            Load More
          </button>
        </div>
      )}

      {/* Mensaje si no hay posts encontrados */}
      {filteredPosts.length === 0 && !loading && (
        <div className="text-white text-center mt-5">
          <p>No se encontraron posts con los filtros aplicados.</p>
        </div>
      )}
    </div>
  );
};

export default Posts;
