// File: src/front/pages/Single.jsx
import { useParams, Link } from "react-router-dom";
import { CommentSection } from "../components/CommentSection";
import { LikeButton } from "../components/LikeButton";
import { FavoriteButton } from "../components/FavoriteButton";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const Single = () => {
  const { store } = useGlobalReducer();
  const { theId } = useParams();

  // Simulamos que el ID coincide con los mockPosts o datos reales
  const post = store?.todos?.find(p => p.id === parseInt(theId)) || {
    id: theId,
    title: "Project Not Found",
    description: "No description available.",
    stack: "Unknown",
    level: "Unknown",
    github: "#"
  };

  return (
    <div className="min-vh-100 py-5 px-3 px-md-5" style={{ backgroundColor: "#0d0d0d" }}>
      <div className="container">
        <div className="card bg-black text-white shadow p-4">
          <h2 style={{ color: "#2563eb" }}>{post.title}</h2>
          <p>{post.description}</p>

          <div className="mb-3">
            <span className="badge bg-secondary me-2">{post.stack}</span>
            <span className="badge bg-info">{post.level}</span>
          </div>

          <div className="d-flex align-items-center gap-2 mb-3">
            <a
              href={post.github}
              target="_blank"
              rel="noreferrer"
              className="btn btn-sm"
              style={{ backgroundColor: "#2563eb", color: "white" }}
            >
              View GitHub
            </a>
            <LikeButton postId={post.id} />
            <FavoriteButton postId={post.id} />
          </div>

          <Link to="/posts" className="btn btn-outline-light btn-sm mt-2">
            ← Back to Posts
          </Link>
        </div>

        <div className="mt-5">
          <CommentSection postId={theId} currentUser={store?.user?.username || "guest"} />
        </div>
      </div>
    </div>
  );
};