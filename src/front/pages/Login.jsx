
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import isotipo from "../assets/img/isotipo.png";
import bannerImg from "../assets/img/ferenc-almasi-oCm8nPkE40k-unsplash.jpg";
import { toast } from "react-toastify";

export const Login = () => {
  // Ahora usamos 'actions' en lugar de 'dispatch' para una mejor legibilidad
  // y para llamar a la acción 'setAuth' que ya tienes definida.
  const { actions } = useGlobalReducer();
  const navigate = useNavigate();

  const [form, setForm] = useState({ email: "", password: "" });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const isValidEmail = (email) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validaciones del formulario
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

     // Llamamos a la acción de login que ya maneja la API y las notificaciones
  const success = await actions.login(form);

  if (success) {
    // Si el login es exitoso, la acción ya habrá actualizado el store.
    // Navegamos al perfil del usuario.
    setTimeout(() => navigate("/profile"), 1000);
  }
  // La acción `actions.login` ya se encarga de mostrar el toast de error en caso de fallo.
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

export default Login;
