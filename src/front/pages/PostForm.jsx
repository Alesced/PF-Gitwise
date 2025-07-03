// File: src/front/pages/PostForm.jsx
import { useState, useEffect } from "react";
import { useLocation } from "react-router-dom";

export const PostForm = () => {
  const location = useLocation();
  const editingPost = location.state || null;

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
        className="bg-dark p-4 rounded shadow w-100"
        style={{ maxWidth: "500px" }}
        onSubmit={handleSubmit}
      >
        <h4 className="mb-4" style={{ color: "#2563eb" }}>
          {editingPost ? "Edit Project" : "Create Project"}
        </h4>

        <input
          type="text"
          name="title"
          placeholder="Title"
          className="form-control mb-3 bg-light border-0"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Description"
          className="form-control mb-3 bg-light border-0"
          rows="3"
          value={form.description}
          onChange={handleChange}
          required
        />

        <select
          name="stack"
          className="form-select mb-3 bg-light border-0"
          value={form.stack}
          onChange={handleChange}
          required
        >
          <option value="">Main Technology</option>
          <option value="HTML">HTML</option>
          <option value="JavaScript">JavaScript</option>
          <option value="React">React</option>
          <option value="Python">Python</option>
          <option value="SQL">SQL</option>
        </select>

        <select
          name="level"
          className="form-select mb-3 bg-light border-0"
          value={form.level}
          onChange={handleChange}
          required
        >
          <option value="">Developer Level</option>
          <option value="STUDENT">STUDENT</option>
          <option value="JUNIOR_DEV">JUNIOR_DEV</option>
          <option value="MID_DEV">MID_DEV</option>
          <option value="SENIOR_DEV">SENIOR_DEV</option>
        </select>

        <input
          type="url"
          name="github"
          placeholder="GitHub Link"
          className="form-control mb-3 bg-light border-0"
          value={form.github}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn w-100" style={{ backgroundColor: "#2563eb", color: "white" }}>
          {editingPost ? "Update" : "Save"} Project
        </button>
      </form>
    </div>
  );
};