import { useParams, Link } from "react-router-dom";
import { LikeButton } from "../components/LikeButton";
import { FavoriteButton } from "../components/FavoriteButton";
import { CommentSection } from "../components/CommentSection";
import useGlobalReducer from "../hooks/useGlobalReducer";

const mockPosts = Array.from({ length: 20 }, (_, i) => ({
  id: i + 1,
  title: `Project ${i + 1}`,
  description: "Detailed project description and goals.",
  stack: ["HTML", "JavaScript", "React", "Python", "SQL"][i % 5],
  level: ["STUDENT", "JUNIOR_DEV", "MID_DEV", "SENIOR_DEV"][i % 4],
  github: "https://github.com/example/project"
}));

export const SinglePost = () => {
  const { theId } = useParams();
  const { store } = useGlobalReducer();
  const post = mockPosts.find(p => p.id === parseInt(theId));
  const currentUser = store?.user?.username || "guest";

  if (!post) {
    return (
      <div className="container text-white text-center mt-5">
        <h2>Post not found</h2>
        <Link to="/" className="btn btn-secondary mt-3">Go back</Link>
      </div>
    );
  }

  return (
    <div className="container text-white py-5">
      <Link to="/" className="btn btn-outline-light mb-4">← Back to Posts</Link>

      <div className="card bg-dark text-white p-4 shadow-lg">
        <h2 style={{ color: "#2563eb" }}>{post.title}</h2>
        <p className="text-secondary">{post.description}</p>
        <p>
          <strong>Stack:</strong> {post.stack} | <strong>Level:</strong> {post.level}
        </p>

        <div className="d-flex gap-2 my-3">
          <LikeButton postId={post.id} />
          <FavoriteButton postId={post.id} />
          <a
            href={post.github}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="mt-5">
        <CommentSection postId={post.id} currentUser={currentUser} />
      </div>
    </div>
  );
};