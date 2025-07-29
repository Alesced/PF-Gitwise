// File: src/front/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";
import bannerImg from "../assets/img/ferenc-almasi-oCm8nPkE40k-unsplash.jpg";
import Alert from "react-bootstrap/Alert";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });
  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setStatus(null);
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    if (!form.email || !form.password) {
      return setStatus({ type: "danger", message: "Email and password are required." });
    }

    if (!isValidEmail(form.email)) {
      return setStatus({ type: "danger", message: "Please enter a valid email address." });
    }

    if (form.password.length < 6) {
      return setStatus({ type: "danger", message: "Password must be at least 6 characters." });
    }

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        return setStatus({ type: "danger", message: data.error || "Invalid email or password." });
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "set_user",
        payload: { user: data.user, token: data.token },
      });

      setStatus({ type: "success", message: "Login successful! Redirecting..." });
      setTimeout(() => navigate("/profile"), 1500);
    } catch (err) {
      console.error(err);
      setStatus({ type: "danger", message: "Error logging in." });
    }
  };

  return (
    <div className="vh-100 vw-100 d-flex overflow-hidden">
      <div className="d-none d-md-block w-50">
        <img src={bannerImg} alt="Login Banner" className="img-fluid vh-100" style={{ objectFit: "cover", width: "100%" }} />
      </div>
      <div className="w-100 w-md-50 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="p-5" style={{ width: "100%", maxWidth: "400px" }}>
          <div className="text-center mb-4">
            <img src={isotipo} alt="GitWise logo" width="50" />
            <h4 className="mt-3">
              Sign in to <span style={{ color: "#7b5bff" }}><strong>GitWise</strong></span>
            </h4>
            <p className="text-secondary">
              Discover inspiring projects and connect with developers like you.
            </p>
          </div>

          {status && (
            <Alert variant={status.type} className="text-center">
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control mb-3 bg-light border-0"
              onChange={handleChange}
              required
            />
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control mb-4 bg-light border-0"
              onChange={handleChange}
              required
            />
            <button type="submit" className="btn btn-gitwise w-100 mb-3">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};