// File: src/front/pages/AdminPosts.jsx

import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockPosts = Array.from({ length: 25 }, (_, i) => ({
  id: i + 1,
  title: `Project ${i + 1}`,
  description: "Project description",
  stack: ["HTML", "JavaScript", "React", "Python", "SQL"][i % 5],
  level: ["STUDENT", "JUNIOR_DEV", "MID_DEV", "SENIOR_DEV"][i % 4],
  github: "https://github.com/example/project"
}));

export const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [stackFilter, setStackFilter] = useState("");
  const [levelFilter, setLevelFilter] = useState("");
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postToDelete, setPostToDelete] = useState(null);

  const navigate = useNavigate();
  const postsPerPage = 7;

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const filtered = posts.filter(post => {
    return (
      (stackFilter ? post.stack === stackFilter : true) &&
      (levelFilter ? post.level === levelFilter : true) &&
      (search ? post.title.toLowerCase().includes(search.toLowerCase()) : true)
    );
  });

  const totalPages = Math.ceil(filtered.length / postsPerPage);
  const current = filtered.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleDelete = () => {
    setPosts(prev => prev.filter(p => p.id !== postToDelete));
    setPostToDelete(null);
  };

  return (
    <div className="p-5 bg-black min-vh-100 text-white">
      <h4 className="mb-4" style={{ color: "white" }}>
        Project Management
      </h4>

      <div className="row mb-3">
        <div className="col-md-3">
          <input
            type="text"
            placeholder="Search by title"
            className="form-control bg-dark text-white border-secondary"
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
        </div>
        <div className="col-md-3">
          <select
            className="form-select bg-dark text-white border-secondary"
            value={stackFilter}
            onChange={e => setStackFilter(e.target.value)}
          >
            <option value="">All Stacks</option>
            {[...new Set(posts.map(p => p.stack))].map(stack => (
              <option key={stack} value={stack}>{stack}</option>
            ))}
          </select>
        </div>
        <div className="col-md-3">
          <select
            className="form-select bg-dark text-white border-secondary"
            value={levelFilter}
            onChange={e => setLevelFilter(e.target.value)}
          >
            <option value="">All Levels</option>
            {[...new Set(posts.map(p => p.level))].map(level => (
              <option key={level} value={level}>{level}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-hover table-bordered align-middle">
          <thead>
            <tr>
              <th>ID</th>
              <th>Title</th>
              <th>Stack</th>
              <th>Level</th>
              <th>GitHub</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {current.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.stack}</td>
                <td>{post.level}</td>
                <td>
                  <a
                    href={post.github}
                    target="_blank"
                    rel="noreferrer"
                    className="text-primary"
                  >
                    View
                  </a>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-primary me-2"
                    onClick={() => navigate("/post-form", { state: post })}
                  >
                    Edit
                  </button>
                  <button
                    className="btn btn-sm btn-outline-danger"
                    onClick={() => setPostToDelete(post.id)}
                  >
                    Delete
                  </button>
                </td>
              </tr>
            ))}
            {current.length === 0 && (
              <tr>
                <td colSpan="6" className="text-center text-secondary">
                  No projects found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="d-flex justify-content-center gap-2 mt-4">
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

      {/* Delete confirmation modal */}
      {postToDelete && (
        <div className="modal show d-block" tabIndex="-1">
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">Delete project?</h5>
                <button
                  type="button"
                  className="btn-close"
                  onClick={() => setPostToDelete(null)}
                />
              </div>
              <div className="modal-body">
                <p>This action cannot be undone.</p>
              </div>
              <div className="modal-footer">
                <button className="btn btn-secondary" onClick={() => setPostToDelete(null)}>
                  Cancel
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};