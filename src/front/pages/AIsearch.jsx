import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import { LikeButton } from "../components/LikeButton";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import SmartSearch from "../components/SmartSearch";
import { FaRegComment } from "react-icons/fa";
import { CommentSection } from "../components/CommentSection";

export const AIsearch = () => {
  // Usamos el store global para acceder a los posts y el dispatch para las acciones
  const { store, dispatch } = useGlobalReducer();
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
  const [showMainContent, setShowMainContent] = useState(true);

  // Derivamos el estado de forma reactiva del store
  const posts = store.allPosts || [];
  const postsPerPage = 6;

  // Si el token no existe, navegamos al login
  if (!store.token) return <Navigate to="/login" replace />;

  // Lógica de filtrado de posts en el frontend
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter ? post.stack === stackFilter : true;
    const matchesLevel = levelFilter ? post.level === levelFilter : true;
    return matchesSearch && matchesStack && matchesLevel;
  });

  // Lógica de paginación para "Cargar más"
  const totalPosts = filteredPosts.length;
  const hasMore = totalPosts > currentPage * postsPerPage;
  const currentPosts = filteredPosts.slice(0, currentPage * postsPerPage);

  const handleLoadMore = () => {
    setCurrentPage(prevPage => prevPage + 1);
  };

  return (
    <div className="container-fluid hero-bg min-vh-100 py-5 px-3 d-flex flex-column align-items-center">
      <AnimatePresence>
        {showMainContent && (
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.4 }}
            className="w-100 d-flex flex-column align-items-center"
          >
            <section className="w-100 d-flex gap-3 justify-content-center mb-4 flex-wrap">
              <SmartSearch
                onSearchStart={() => setShowMainContent(false)}
                onSearchEnd={() => setShowMainContent(true)}
              />
            </section>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Manejamos el estado de carga y la ausencia de posts */}
      {posts.length === 0 ? (
        <div className="d-flex justify-content-center align-items-center text-white" style={{ minHeight: '300px' }}>
          <div className="spinner-border" role="status">
            <span className="visually-hidden">Loading...</span>
          </div>
        </div>
      ) : (
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
      )}

      {hasMore && (
        <div className="d-flex justify-content-center mt-5">
          <button
            className="btn btn-gitwise"
            onClick={handleLoadMore}
          >
            Cargar Más
          </button>
        </div>
      )}
    </div>
  );
};

export default AIsearch;
