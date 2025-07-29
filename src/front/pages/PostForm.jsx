import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { FaCode, FaLevelUpAlt, FaGithub, FaPencilAlt } from "react-icons/fa";

export const PostForm = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const editingPost = location.state !== null;

  const [form, setForm] = useState({
    title: "",
    description: "",
    stack: "",
    level: "",
    github: ""
  });

  useEffect(() => {
    if (editingPost) {
      setForm(editingPost);
    }
  }, [editingPost]);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (editingPost) {
      console.log("Updating project:", form);
      alert("Project updated successfully.");
    } else {
      console.log("Creating new project:", form);
      alert("Project created successfully.");
    }
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-black text-white p-5">
      <form
        className="bg-dark p-5 rounded shadow-lg w-100"
        style={{ maxWidth: "600px" }}
        onSubmit={handleSubmit}
      >
        <div className="d-flex align-items-center mb-4">
          <FaPencilAlt size={28} className="me-2 text-primary" />
          <h3 className="m-0" style={{ color: "#2563eb" }}>
            {editingPost ? "Edit Your Project" : "Share a New Project"}
          </h3>
        </div>

        {editingPost && (
          <button
            type="button"
            className="btn btn-outline-light bg-danger btn-sm align-right"
            onClick={() => navigate("/admin")}
          >
            x
          </button>
        )

        }

        <p className="text-muted mb-4">
          {editingPost
            ? "Update the information about your project to keep it relevant."
            : "Fill in the details below to publish your project and share it with the community."}
        </p>

        <label className="form-label">Project Title</label>
        <input
          type="text"
          name="title"
          placeholder="e.g., Portfolio Website"
          className="form-control mb-3 bg-light border-0"
          value={form.title}
          onChange={handleChange}
          required
        />

        <label className="form-label">Description</label>
        <textarea
          name="description"
          placeholder="Brief summary of what your project does..."
          className="form-control mb-3 bg-light border-0"
          rows="4"
          value={form.description}
          onChange={handleChange}
          required
        />

        <div className="row">
          <div className="col-md-6">
            <label className="form-label">
              <FaCode className="me-1" />
              Main Stack
            </label>
            <select
              name="stack"
              className="form-select mb-3 bg-light border-0"
              value={form.stack}
              onChange={handleChange}
              required
            >
              <option value="">Select technology</option>
              <option value="HTML">HTML</option>
              <option value="JavaScript">JavaScript</option>
              <option value="React">React</option>
              <option value="Python">Python</option>
              <option value="SQL">SQL</option>
            </select>
          </div>
          <div className="col-md-6">
            <label className="form-label">
              <FaLevelUpAlt className="me-1" />
              Developer Level
            </label>
            <select
              name="level"
              className="form-select mb-3 bg-light border-0"
              value={form.level}
              onChange={handleChange}
              required
            >
              <option value="">Select level</option>
              <option value="STUDENT">Student</option>
              <option value="JUNIOR_DEV">Junior Developer</option>
              <option value="MID_DEV">Mid Developer</option>
              <option value="SENIOR_DEV">Senior Developer</option>
            </select>
          </div>
        </div>

        <label className="form-label">
          <FaGithub className="me-1" />
          GitHub Link
        </label>
        <input
          type="url"
          name="github"
          placeholder="https://github.com/yourproject"
          className="form-control mb-4 bg-light border-0"
          value={form.github}
          onChange={handleChange}
          required
        />

        <button
          type="submit"
          className="btn w-100 py-2"
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          {editingPost ? "Update Project" : "Publish Project"}
        </button>
      </form>
    </div>
  );
};