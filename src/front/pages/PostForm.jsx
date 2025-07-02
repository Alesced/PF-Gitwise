// File: src/front/pages/PostForm.jsx
import { useState } from "react";

export const PostForm = () => {
  const [form, setForm] = useState({
    title: "",
    description: "",
    stack: "",
    level: "",
    github: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Formulario enviado:", form);
    alert("Proyecto guardado correctamente.");
  };

  return (
    <div className="min-vh-100 d-flex justify-content-center align-items-center bg-black text-white p-5">
      <form
        className="bg-dark p-4 rounded shadow w-100"
        style={{ maxWidth: "500px" }}
        onSubmit={handleSubmit}
      >
        <h4 className="mb-4" style={{ color: "#2563eb" }}>
          Crear / Editar Proyecto
        </h4>

        <input
          type="text"
          name="title"
          placeholder="Título"
          className="form-control mb-3 bg-light border-0"
          value={form.title}
          onChange={handleChange}
          required
        />

        <textarea
          name="description"
          placeholder="Descripción"
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
          <option value="">Tecnología principal</option>
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
          <option value="">Nivel de desarrollador</option>
          <option value="STUDENT">STUDENT</option>
          <option value="JUNIOR_DEV">JUNIOR_DEV</option>
          <option value="MID_DEV">MID_DEV</option>
          <option value="SENIOR_DEV">SENIOR_DEV</option>
        </select>

        <input
          type="url"
          name="github"
          placeholder="Link GitHub"
          className="form-control mb-3 bg-light border-0"
          value={form.github}
          onChange={handleChange}
          required
        />

        <button type="submit" className="btn w-100" style={{ backgroundColor: "#2563eb", color: "white" }}>
          Guardar Proyecto
        </button>
      </form>
    </div>
  );
};