import { useState, useEffect } from "react";

export const CommentSection = ({ postId, currentUser = "albertdcm" }) => {
  const [comments, setComments] = useState([]);
  const [newComment, setNewComment] = useState("");
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  useEffect(() => {
    const mockComments = [
      { id: 1, author: "albertdcm", content: "This is a great project!" },
      { id: 2, author: "natydev", content: "Interesting use of the stack." },
    ];
    setComments(mockComments);
  }, [postId]);

  const handleAddComment = () => {
    if (!newComment.trim()) return;

    const newEntry = {
      id: Date.now(),
      author: currentUser,
      content: newComment.trim(),
    };

    setComments([newEntry, ...comments]);
    setNewComment("");
  };

  const handleDelete = (id) => {
    setComments(comments.filter(comment => comment.id !== id));
  };

  const handleEdit = (id, content) => {
    setEditingId(id);
    setEditText(content);
  };

  const handleUpdate = () => {
    setComments(
      comments.map(comment =>
        comment.id === editingId ? { ...comment, content: editText } : comment
      )
    );
    setEditingId(null);
    setEditText("");
  };

  return (
    <div className="p-4 rounded" style={{ backgroundColor: "#0d0d0d", color: "#fff" }}>
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
            <li key={comment.id} className="mb-3 border-bottom border-secondary pb-2">
              <p className="mb-1">
                <strong>{comment.author}</strong>:{" "}
                {editingId === comment.id ? (
                  <textarea
                    className="form-control bg-black text-white border-secondary mt-2"
                    rows="2"
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                  />
                ) : (
                  comment.content
                )}
              </p>

              {comment.author === currentUser && (
                <div className="mt-2 d-flex gap-2">
                  {editingId === comment.id ? (
                    <>
                      <button
                        className="btn btn-sm btn-success"
                        onClick={handleUpdate}
                        disabled={!editText.trim()}
                      >
                        Save
                      </button>
                      <button
                        className="btn btn-sm btn-secondary"
                        onClick={() => {
                          setEditingId(null);
                          setEditText("");
                        }}
                      >
                        Cancel
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        className="btn btn-sm btn-outline-warning"
                        onClick={() => handleEdit(comment.id, comment.content)}
                      >
                        Edit
                      </button>
                      <button
                        className="btn btn-sm btn-outline-danger"
                        onClick={() => handleDelete(comment.id)}
                      >
                        Delete
                      </button>
                    </>
                  )}
                </div>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};