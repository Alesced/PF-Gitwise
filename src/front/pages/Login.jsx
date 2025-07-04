import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";

const bannerImg = "https://images.unsplash.com/photo-1581093588401-0505aedd9f85";

export const Login = () => {
  const { dispatch } = useGlobalReducer();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        const data = await res.json();
        dispatch({ type: "set_user", payload: data });
        alert("Login successful!");
        navigate("/profile"); // ✅ redirección al perfil
      } else {
        alert("Invalid email or password.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="vh-100 vw-100 d-flex overflow-hidden">
      {/* Banner image (hidden on small screens) */}
      <div className="d-none d-md-block w-50">
        <img
          src={bannerImg}
          alt="Login Banner"
          className="img-fluid vh-100"
          style={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      {/* Login form */}
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

            <button type="button" className="btn btn-outline-light w-100">
              <i className="fab fa-google me-2"></i> Continue with Google
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};