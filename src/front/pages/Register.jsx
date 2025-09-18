import { useState } from "react";
import { useNavigate } from "react-router-dom";
import isotipo from "../assets/img/isotipo.png";
import bannerImg from "../assets/img/mohammad-rahmani-_Fx34KeqIEw-unsplash.jpg";
import Alert from "react-bootstrap/Alert";
import useGlobalReducer from "../hooks/useGlobalReducer";

// Estos valores deben coincidir con tus Enums de base de datos
const STACKS = ["HTML", "CSS", "JAVASCRIPT", "PYTHON", "SQL"];
const LEVELS = ["student", "junior_dev", "mid_dev", "senior_dev"];

// Función para formatear los valores para visualización
const formatValue = (value) => {
  if (!value) return '';
  
  if (value === "JAVASCRIPT") return "JavaScript";
  if (value === "student") return "Student";
  if (value === "junior_dev") return "Junior Dev";
  if (value === "mid_dev") return "Mid Dev";
  if (value === "senior_dev") return "Senior Dev";
  
  return value;
};

export const Register = () => {
  const navigate = useNavigate();
  const { actions } = useGlobalReducer();
  const [form, setForm] = useState({
    name: "",
    last_name: "",
    username: "",
    email: "",
    password: "",
    stack: "",
    level: ""
  });

  const [status, setStatus] = useState(null);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus(null);

    try {
      const success = await actions.signup(form);
      if (success) {
        setStatus({ type: "success", message: "Account created successfully! Redirecting to login..." });
        setTimeout(() => navigate("/login"), 2000);
      }
    } catch (err) {
      setStatus({ type: "danger", message: "Error creating account." });
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

          {status && (
            <Alert variant={status.type} className="text-center">
              {status.message}
            </Alert>
          )}

          <form onSubmit={handleSubmit}>
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="name"
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
              autoComplete="current-password" 
            />

            <div className="row">
              <div className="col-md-6 mb-2">
                <select
                  name="stack"
                  className="form-select bg-light border-0"
                  onChange={handleChange}
                  required
                  value={form.stack}
                >
                  <option value="">Select Stack</option>
                  {STACKS.map((stack, i) => (
                    <option key={i} value={stack}>{formatValue(stack)}</option>
                  ))}
                </select>
              </div>
              <div className="col-md-6 mb-2">
                <select
                  name="level"
                  className="form-select bg-light border-0"
                  onChange={handleChange}
                  required
                  value={form.level}
                >
                  <option value="">Select Level</option>
                  {LEVELS.map((level, i) => (
                    <option key={i} value={level}>{formatValue(level)}</option>
                  ))}
                </select>
              </div>
            </div>

            <button type="submit" className="btn btn-gitwise w-100 mt-3">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};