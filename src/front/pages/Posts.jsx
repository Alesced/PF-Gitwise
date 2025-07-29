// File: src/front/pages/Posts.jsx

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from "react-toastify";
import { Navigate } from "react-router-dom";
import SmartSearch from "../components/SmartSearch";

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
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

  const uniqueStacks = [...new Set(posts.map(p => p.stack).filter(Boolean))];
  const uniqueLevels = [...new Set(posts.map(p => p.level).filter(Boolean))];

  return (
    <div className="container-fluid hero-bg min-vh-100 py-5 px-3 d-flex flex-column align-items-center">
      <section className="w-100 text-center" style={{ marginTop: "-20px" }}>
        <SmartSearch onSearchStart={() => setShowMainContent(false)} onSearchEnd={() => setShowMainContent(true)} />
        <h2 className="hero-title mt-4 mb-3">Explore</h2>
        <p className="hero-subtitle mb-4">
          Discover open-source projects, and connect with developers like you.
        </p>
      </section>

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
              <select className="form-select bg-dark text-white border-secondary" style={{ maxWidth: "180px" }} value={stackFilter} onChange={(e) => setStackFilter(e.target.value)}>
                <option value="">Select Stack</option>
                {uniqueStacks.map((stack, i) => <option key={`stack-filter-${i}`} value={stack}>{stack}</option>)}
              </select>

              <select className="form-select bg-dark text-white border-secondary" style={{ maxWidth: "180px" }} value={levelFilter} onChange={(e) => setLevelFilter(e.target.value)}>
                <option value="">Select Level</option>
                {uniqueLevels.map((level, i) => <option key={`level-filter-${i}`} value={level}>{level}</option>)}
              </select>
            </section>

            <section className="w-100 px-md-5">
              <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                {currentPosts.map(post => (
                  <motion.div key={post.id} className="col" initial={{ opacity: 0, y: 50 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}>
                    <div className="icon-box h-100 d-flex flex-column justify-content-between">
                      <h5 style={{ color: "#fff" }}>{post.title}</h5>
                      <p>{post.description}</p>
                      {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
                      {post.level && <span className="badge bg-info">{post.level}</span>}
                      <div className="d-flex justify-content-between align-items-center mt-3">
                        <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">GitHub</a>
                        <FavoriteButton postId={post.id} count={post.favorite_count || 0} whiteText />
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            </section>

            <section className="d-flex justify-content-center mt-5 gap-2">
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                <button key={page} className={`btn btn-sm ${page === currentPage ? "btn-primary" : "btn-outline-secondary"}`} onClick={() => setCurrentPage(page)}>
                  {page}
                </button>
              ))}
            </section>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};