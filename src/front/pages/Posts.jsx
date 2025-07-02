import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const mockPosts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Proyecto ${i + 1}`,
  description: "Descripción del proyecto",
  stack: ["HTML", "JavaScript", "React", "Python", "SQL"][i % 5],
  level: ["STUDENT", "JUNIOR_DEV", "MID_DEV", "SENIOR_DEV"][i % 4],
  github: "https://github.com/example/project"
}));

export const Posts = () => {
  const [posts, setPosts] = useState([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const postsPerPage = 6;

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post => {
    return (
      (stackFilter ? post.stack === stackFilter : true) &&
      (levelFilter ? post.level === levelFilter : true)
    );
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  return (
    <div className="min-vh-100 p-5" style={{ backgroundColor: "#0d0d0d" }}>
      <h2 className="text-white mb-4">Proyectos Publicados</h2>

      <div className="d-flex gap-3 mb-4">
        <select
          className="form-select bg-dark text-white border-secondary"
          value={stackFilter}
          onChange={e => setStackFilter(e.target.value)}
        >
          <option value="">Todos los Stacks</option>
          {[...new Set(mockPosts.map(p => p.stack))].map(stack => (
            <option key={stack} value={stack}>{stack}</option>
          ))}
        </select>
        <select
          className="form-select bg-dark text-white border-secondary"
          value={levelFilter}
          onChange={e => setLevelFilter(e.target.value)}
        >
          <option value="">Todos los Niveles</option>
          {[...new Set(mockPosts.map(p => p.level))].map(level => (
            <option key={level} value={level}>{level}</option>
          ))}
        </select>
      </div>

      <div className="row row-cols-1 row-cols-md-3 g-4">
        {currentPosts.map(post => (
          <motion.div
            className="col"
            key={post.id}
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <div className="card bg-black text-white h-100 shadow">
              <div className="card-body">
                <h5 className="card-title" style={{ color: "#2563eb" }}>{post.title}</h5>
                <p className="card-text">{post.description}</p>
                <span className="badge bg-secondary me-2">{post.stack}</span>
                <span className="badge bg-info">{post.level}</span>
              </div>
              <div className="card-footer bg-transparent border-0">
                <a
                  href={post.github}
                  target="_blank"
                  rel="noreferrer"
                  className="btn btn-sm"
                  style={{ backgroundColor: "#2563eb", color: "white" }}
                >
                  Ver GitHub
                </a>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      <div className="d-flex justify-content-center mt-4 gap-2">
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