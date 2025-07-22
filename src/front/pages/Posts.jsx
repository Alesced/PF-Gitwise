// File: src/front/pages/Posts.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { toast } from 'react-toastify';

const STACKS = ["React", "Vue", "Angular", "MERN", "Next.js", "Svelte"];
const LEVELS = ["Beginner", "Intermediate", "Advanced"];

export const AISearch = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [newProject, setNewProject] = useState({ title: '', description: '', github: '', stack: '', level: '' });

  const { store } = useGlobalReducer();
  const postsPerPage = 6;
  const BASE_URL = import.meta.env.VITE_BACKEND_URL;

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const res = await fetch(`${BASE_URL}/api/posts`);
        const data = await res.json();
        if (data.success) setPosts(data.posts);
      } catch (err) {
        console.error("Error fetching posts:", err);
        toast.error("Failed to fetch posts");
      }
    };
    fetchPosts();
  }, []);

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStack = stackFilter ? post.stack === stackFilter : true;
    const matchesLevel = levelFilter ? post.level === levelFilter : true;
    return matchesSearch && matchesStack && matchesLevel;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const handleCreateProject = async () => {
    if (!store.user || !store.user.id) return toast.error("Please login to create a project");
    const { title, description, github } = newProject;
    if (!title || !description || !github) return toast.error("All fields required");

    try {
      const res = await fetch(`${BASE_URL}/api/user/post/${store.user.id}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${store.token}`,
        },
        body: JSON.stringify({ title, description, repo_URL: github })
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to save project");
      setPosts(prev => [data.post, ...prev]);
      setNewProject({ title: '', description: '', github: '', stack: '', level: '' });
      setShowModal(false);
      toast.success("Project created successfully!");
    } catch (err) {
      toast.error("Failed to save project: " + err.message);
    }
  };

  return (
    <div className="container-fluid hero-bg min-vh-100 py-5 px-3 d-flex flex-column align-items-center">
      <div className="w-100 w-md-75 w-lg-50 text-center">
        <h2 className="hero-title mb-3">AI Search & Explore</h2>
        <p className="hero-subtitle mb-4">
          Discover and contribute open-source projects powered by AI. Find ideas,
          publish your work, and connect with fellow developers.
        </p>
        <button className="btn cta-btn my-3" onClick={() => setShowModal(true)}>
          + Create New Project
        </button>

        <div className="d-flex flex-wrap justify-content-center gap-2 mb-5">
          <input
            type="text"
            className="form-control bg-dark text-white border-secondary flex-grow-1"
            style={{ maxWidth: "500px" }}
            placeholder="Search projects..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
          <button className="btn btn-gitwise">Smart Search</button>
        </div>
      </div>

      <div className="d-flex gap-3 justify-content-center mb-4">
        <select
          className="form-select bg-dark text-white border-secondary"
          style={{ maxWidth: "180px" }}
          value={stackFilter}
          onChange={(e) => setStackFilter(e.target.value)}
        >
          <option value="">All Stacks</option>
          {[...new Set(posts.map(p => p.stack))].map(stack => (
            <option key={stack} value={stack}>{stack}</option>
          ))}
        </select>

        <select
          className="form-select bg-dark text-white border-secondary"
          style={{ maxWidth: "180px" }}
          value={levelFilter}
          onChange={(e) => setLevelFilter(e.target.value)}
        >
          <option value="">All Levels</option>
          {[...new Set(posts.map(p => p.level))].map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4 w-100 px-md-5">
        {currentPosts.map(post => (
          <motion.div
            className="col"
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="icon-box h-100 d-flex flex-column justify-content-between">
              <div>
                <h5 style={{ color: "#ffffff" }}>{post.title}</h5>
                <p className="mb-2">{post.description}</p>
                {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
                {post.level && <span className="badge bg-info">{post.level}</span>}
              </div>
              <div className="d-flex justify-content-between align-items-center mt-3">
                <a
                  href={post.repo_URL || post.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-gitwise btn-sm"
                >
                  View GitHub
                </a>
                <div className="d-flex gap-3 align-items-center">
                  <FavoriteButton postId={post.id} count={post.favorite_count || 0} whiteText={true} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

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

      {showModal && (
        <div className="modal fade show d-block" tabIndex="-1" style={{ backgroundColor: "rgba(0, 0, 0, 0.75)" }}>
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header border-secondary">
                <h5 className="modal-title">New Project</h5>
                <button type="button" className="btn-close btn-close-white" onClick={() => setShowModal(false)}></button>
              </div>
              <div className="modal-body">
                <input className="form-control bg-black text-white border-secondary mb-3" placeholder="Project Title" value={newProject.title} onChange={e => setNewProject({ ...newProject, title: e.target.value })} />
                <textarea className="form-control bg-black text-white border-secondary mb-3" placeholder="Project Description" value={newProject.description} onChange={e => setNewProject({ ...newProject, description: e.target.value })} />
                <input className="form-control bg-black text-white border-secondary mb-3" placeholder="GitHub URL" value={newProject.github} onChange={e => setNewProject({ ...newProject, github: e.target.value })} />
              </div>
              <div className="modal-footer border-secondary">
                <button className="btn btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
                <button className="btn btn-gitwise" onClick={handleCreateProject}>Save</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};