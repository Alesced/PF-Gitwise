// File: src/front/pages/Login.jsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";
import bannerImg from "../assets/img/ferenc-almasi-oCm8nPkE40k-unsplash.jpg";
import { toast } from "react-toastify";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!form.email || !form.password) {
      toast.error("Email and password are required.");
      return;
    }

    if (!isValidEmail(form.email)) {
      toast.error("Please enter a valid email address.");
      return;
    }

    if (form.password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }

    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      const data = await res.json();

      if (!res.ok) {
        toast.error(data.error || "Invalid email or password.");
        return;
      }

      localStorage.setItem("token", data.token);
      localStorage.setItem("user", JSON.stringify(data.user));

      dispatch({
        type: "set_user",
        payload: { user: data.user, token: data.token },
      });

      toast.success("Login successful!");
      navigate("/profile");
    } catch (err) {
      console.error(err);
      toast.error("Error logging in.");
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
              Sign in to <span style={{ color: "#2563eb" }}><strong>GitWise</strong></span>
            </h4>
            <p className="text-secondary">
              Discover inspiring projects and connect with developers like you.
            </p>
          </div>
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
            <button type="submit" className="btn btn-primary w-100 mb-3">
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};