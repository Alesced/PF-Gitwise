// File: src/front/pages/AdminPosts.jsx
import { useEffect, useState } from "react";

const mockPosts = Array.from({ length: 10 }, (_, i) => ({
  id: i + 1,
  title: `Proyecto ${i + 1}`,
  stack: ["HTML", "JavaScript", "React", "Python", "SQL"][i % 5],
  level: ["STUDENT", "JUNIOR_DEV", "MID_DEV", "SENIOR_DEV"][i % 4],
}));

export const AdminPosts = () => {
  const [posts, setPosts] = useState([]);

  useEffect(() => {
    setPosts(mockPosts);
  }, []);

  const handleEdit = (id) => {
    alert(`Editar proyecto ${id}`);
  };

  const handleDelete = (id) => {
    if (confirm("¿Estás seguro de eliminar este proyecto?")) {
      setPosts(posts.filter(p => p.id !== id));
    }
  };

  return (
    <div className="min-vh-100 p-5 bg-black text-white">
      <h2 className="mb-4" style={{ color: "#2563eb" }}>Vista Admin de Proyectos</h2>
      <div className="table-responsive">
        <table className="table table-dark table-striped table-bordered">
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Stack</th>
              <th>Nivel</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            {posts.map(post => (
              <tr key={post.id}>
                <td>{post.id}</td>
                <td>{post.title}</td>
                <td>{post.stack}</td>
                <td>{post.level}</td>
                <td>
                  <button onClick={() => handleEdit(post.id)} className="btn btn-sm btn-outline-info me-2">
                    Editar
                  </button>
                  <button onClick={() => handleDelete(post.id)} className="btn btn-sm btn-outline-danger">
                    Eliminar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};