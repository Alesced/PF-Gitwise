import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const mockPosts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Proyecto ${i + 1}`,
  description: "Descripción del proyecto",
  stack: ["HTML", "JavaScript", "React", "Python", "SQL"][i % 5],
  level: ["STUDENT", "JUNIOR_DEV", "MID_DEV", "SENIOR_DEV"][i % 4],
  github: "https://github.com/example/project"
}));

export const AdminPosts = () => {
  const [posts, setPosts] = useState([]);
  const [search, setSearch] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [postToDelete, setPostToDelete] = useState(null);
  const navigate = useNavigate();

  const postsPerPage = 6;

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(search.toLowerCase())
  );

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const currentPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const handleDelete = () => {
    setPosts(prev => prev.filter(p => p.id !== postToDelete.id));
    setPostToDelete(null);
  };

  return (
    <div className="min-vh-100 bg-black text-white p-4">
      <div className="d-flex justify-content-between align-items-center mb-3">
        <h4 style={{ color: "#2563eb" }}>Panel de Proyectos</h4>
        <input
          type="text"
          className="form-control w-25 bg-dark text-white border-secondary"
          placeholder="Buscar por título..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
      </div>

      <div className="table-responsive">
        <table className="table table-dark table-striped table-hover">
          <thead>
            <tr>
              <th>#</th>
              <th>Título</th>
              <th>Stack</th>
              <th>Nivel</th>
              <th>GitHub</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {currentPosts.map(post => (
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
                    className="text-decoration-none text-info"
                  >
                    Ver repo
                  </a>
                </td>
                <td>
                  <button
                    className="btn btn-sm btn-outline-light me-2"
                    onClick={() => navigate("/post-form", { state: post })}
                  >
                    Editar
                  </button>
                  <button
                    className="btn btn-sm btn-danger"
                    onClick={() => setPostToDelete(post)}
                  >
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Paginación */}
      <div className="d-flex justify-content-center mt-3 gap-2">
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`btn btn-sm ${
              page === currentPage ? "btn-primary" : "btn-outline-secondary"
            }`}
            onClick={() => setCurrentPage(page)}
          >
            {page}
          </button>
        ))}
      </div>

      {/* Modal de Confirmación */}
      {postToDelete && (
        <div
          className="modal fade show d-block"
          tabIndex="-1"
          style={{ backgroundColor: "rgba(0,0,0,0.5)" }}
        >
          <div className="modal-dialog modal-dialog-centered">
            <div className="modal-content bg-dark text-white">
              <div className="modal-header">
                <h5 className="modal-title">¿Eliminar proyecto?</h5>
                <button
                  type="button"
                  className="btn-close btn-close-white"
                  onClick={() => setPostToDelete(null)}
                ></button>
              </div>
              <div className="modal-body">
                ¿Estás seguro de que quieres eliminar{" "}
                <strong>{postToDelete.title}</strong>?
              </div>
              <div className="modal-footer">
                <button
                  className="btn btn-secondary"
                  onClick={() => setPostToDelete(null)}
                >
                  Cancelar
                </button>
                <button className="btn btn-danger" onClick={handleDelete}>
                  Eliminar
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};