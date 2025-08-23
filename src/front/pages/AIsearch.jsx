import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import { LikeButton } from "../components/LikeButton"
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import SmartSearch from "../components/SmartSearch";
import { FaRegComment } from "react-icons/fa";
import { CommentSection } from "../components/CommentSection";

export const AIsearch = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [openCommentPostId, setOpenCommentPostId] = useState(null);
 

  const [showMainContent, setShowMainContent] = useState(true);


  const { store } = useGlobalReducer();
  const postsPerPage = 6;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");

  if (!store.token) return <Navigate to="/login" replace />;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/posts`);
        const data = await res.json();
        if (res.ok && data.success) {
          setPosts(data.posts);
        } else {
          toast.error(data.msg || "Error fetching posts");
        }
      } catch (err) {
        console.error("Fetch error:", err);
        toast.error("Failed to fetch posts");
      }
    };
    fetchPosts();
  }, [BASE_URL]);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter ? post.stack === stackFilter : true;
    const matchesLevel = levelFilter ? post.level === levelFilter : true;
    return matchesSearch && matchesStack && matchesLevel;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

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
              <SmartSearch onSearchStart={() => setShowMainContent(false)} onSearchEnd={() => setShowMainContent(true)} />
            </section>
          </motion.div>
        )}

        <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 px-md-5">
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

                {openCommentPostId === post.id && (
                  <div className="mt-3 w-100">
                    <CommentSection postId={post.id} visible={true} />
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </div>

        <div className="d-flex justify-content-center mt-5 gap-2">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
            <button key={page} className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCurrentPage(page)}>
              {page}
            </button>
          ))}
        </div>
      </AnimatePresence>
    </div>
  );
};
