import { useState, useEffect } from "react";

export const CommentSection = ({ postId, currentUser }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");

  useEffect(() => {
    // Aquí podrías traer los comentarios reales desde el backend usando el postId
    const mockComments = [
      { id: 1, author: "albertdcm", content: "This is a great project!" },
      { id: 2, author: "natydev", content: "Interesting use of the stack." },
    ];
    setComments(mockComments);
  }, [postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newEntry = {
      id: comments.length + 1,
      author: currentUser,
      content: newComment.trim(),
    };

    setComments([newEntry, ...comments]);
    setNewComment("");
  };

  const handleDelete = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  return (
    <div className="bg-dark text-white p-4 rounded mt-5">
      <h5 style={{ color: "#2563eb" }}>Comments</h5>

      <div className="mb-3">
        <textarea
          className="form-control bg-black text-white border-secondary"
          rows="3"
          placeholder="Write a comment..."
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
        />
        <button
          className="btn btn-primary mt-2"
          onClick={handleAddComment}
          disabled={!newComment.trim()}
        >
          Post Comment
        </button>
      </div>

      {comments.length === 0 ? (
        <p className="text-secondary">No comments yet.</p>
      ) : (
        <ul className="list-unstyled">
          {comments.map((comment) => (
            <li key={comment.id} className="mb-3 border-bottom pb-2">
              <p className="mb-1">
                <strong>{comment.author}</strong>: {comment.content}
              </p>
              {comment.author === currentUser && (
                <button
                  className="btn btn-sm btn-outline-danger"
                  onClick={() => handleDelete(comment.id)}
                >
                  Delete
                </button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};