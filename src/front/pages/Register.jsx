import { useState } from "react";
import { useNavigate } from "react-router-dom";
import isotipo from "../assets/img/isotipo.png";

import bannerImg from "../assets/img/mohammad-rahmani-_Fx34KeqIEw-unsplash.jpg";

export const Register = () => {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    stack: "",
    level: "",
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        alert("Account created successfully.");
        navigate("/profile");
      } else {
        alert("Error creating account.");
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="vh-100 vw-100 d-flex overflow-hidden">
      <div className="d-none d-md-block w-50">
        <img
          src={bannerImg}
          alt="Registration Banner"
          className="img-fluid vh-100"
          style={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      <div className="w-100 w-md-50 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="p-5" style={{ width: "100%", maxWidth: "500px" }}>
          <div className="text-center mb-4">
            <img src={isotipo} alt="GitWise logo" width="50" />
            <h4 className="mt-3">
              Create your <span style={{ color: "#2563eb" }}><strong>GitWise</strong></span> account
            </h4>
            <p className="text-secondary">
              Join the community, share projects and grow with other developers.
            </p>
          </div>

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="first_name"
                  placeholder="First name"
                  className="form-control bg-light border-0"
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="last_name"
                  placeholder="Last name"
                  className="form-control bg-light border-0"
                  onChange={handleChange}
                  required
                />
              </div>
            </div>

            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            <select
              name="stack"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            >
              <option value="">Select your main stack</option>
              <option value="frontend">Frontend</option>
              <option value="backend">Backend</option>
              <option value="fullstack">Fullstack</option>
            </select>

            <select
              name="level"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            >
              <option value="">Developer level</option>
              <option value="junior">Junior</option>
              <option value="semi-senior">Semi-Senior</option>
              <option value="senior">Senior</option>
            </select>

            <button type="submit" className="btn btn-primary w-100 mt-3">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};