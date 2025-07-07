import { useParams, Link } from "react-router-dom";
import { useEffect, useState } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { CommentSection } from "../components/CommentSection";

export const Single = () => {
  const { theId } = useParams();
  const { store } = useGlobalReducer();
  const currentUser = store?.user?.username || "guest";

  const [project, setProject] = useState(null);

  useEffect(() => {
    // 🧪 Simulación de datos de proyecto (mock temporal)
    const mock = {
      id: theId,
      title: "Real-time Chat App",
      description:
        "A real-time chat application built using Socket.io and Node.js. Supports rooms, emojis, and live status.",
      stack: "Node.js, Express, Socket.io",
      level: "JUNIOR_DEV",
      github: "https://github.com/example/chat-app",
      author: "albertdcm",
      avatar: "https://avatars.githubusercontent.com/u/000000?v=4"
    };

    setProject(mock);
  }, [theId]);

  if (!project) return <div className="text-white p-5">Loading project...</div>;

  return (
    <div className="container py-5 text-white">
      <div className="card bg-dark text-white shadow-lg">
        <div className="card-body">
          <div className="d-flex align-items-center mb-4">
            <img
              src={project.avatar}
              alt="author"
              className="rounded-circle border border-2 border-primary me-3"
              style={{ width: "60px", height: "60px" }}
            />
            <div>
              <h3 className="card-title">{project.title}</h3>
              <p className="text-secondary mb-0">by {project.author}</p>
            </div>
          </div>

          <p>{project.description}</p>

          <div className="mb-3">
            <span className="badge bg-primary me-2">{project.stack}</span>
            <span className="badge bg-warning text-dark">{project.level}</span>
          </div>

          <a
            href={project.github}
            target="_blank"
            rel="noreferrer"
            className="btn btn-outline-info btn-sm"
          >
            View on GitHub
          </a>

          <Link to="/posts" className="btn btn-outline-light btn-sm ms-3">
            ← Back to Projects
          </Link>
        </div>
      </div>

      <div className="mt-5">
        <h4 className="text-info">Comments</h4>
        <CommentSection postId={theId} currentUser={currentUser} />
      </div>
    </div>
  );
};