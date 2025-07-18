import { useState } from "react";                 // Importa el hook useState para manejar el formulario
import { useNavigate } from "react-router-dom";    // Importa useNavigate para redirigir después del registro
import isotipo from "../assets/img/isotipo.png";   // Imagen del logo
import bannerImg from "../assets/img/mohammad-rahmani-_Fx34KeqIEw-unsplash.jpg";  // Imagen del banner

export const Register = () => {
  const navigate = useNavigate();   // Hook para redirigir al usuario después del registro

  // Estado inicial del formulario (usa las propiedades que el backend espera)
  const [form, setForm] = useState({
    name: "",          // Cambio que se hizo en clase con el profe, backend espera "name"
    last_name: "",
    username: "",
    email: "",
    password: ""
  });

  // Esta función actualiza el estado del formulario cuando el usuario escribe
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  // Función que se ejecuta cuando se envía el formulario
  const handleSubmit = async (e) => {
    e.preventDefault();   // Previene que la página se recargue

    try {
      // Envia la información al backend usando fetch
      const res = await fetch(import.meta.env.VITE_BACKEND_URL + "/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),   // Convierte el objeto form a JSON
      });

      if (res.ok) {
        alert("Account created successfully.");  // Muestra alerta si fue exitoso
        navigate("/login");                      // Redirige al login después del registro
      } else {
        const error = await res.json();
        alert(error.error || "Error creating account.");  // Muestra mensaje de error del backend
      }
    } catch (err) {
      console.error(err);
      alert("Error creating account.");  // Error general
    }
  };

  // JSX: Renderiza el formulario y la estructura visual del registro
  return (
    <div className="vh-100 vw-100 d-flex overflow-hidden">
      {/* Columna izquierda: Imagen de fondo */}
      <div className="d-none d-md-block w-50">
        <img
          src={bannerImg}
          alt="Registration Banner"
          className="img-fluid vh-100"
          style={{ objectFit: "cover", width: "100%" }}
        />
      </div>

      {/* Columna derecha: Formulario */}
      <div className="w-100 w-md-50 bg-dark text-white d-flex align-items-center justify-content-center">
        <div className="p-5" style={{ width: "100%", maxWidth: "500px" }}>
          {/* Logo y encabezado */}
          <div className="text-center mb-4">
            <img src={isotipo} alt="GitWise logo" width="50" />
            <h4 className="mt-3">
              Create your <span style={{ color: "#2563eb" }}><strong>GitWise</strong></span> account
            </h4>
            <p className="text-secondary">
              Join the community, share projects and grow with other developers.
            </p>
          </div>

          {/* Formulario de registro */}
          <form onSubmit={handleSubmit}>

            {/* Campos: Nombre y Apellido */}
            <div className="row">
              <div className="col-md-6 mb-2">
                <input
                  type="text"
                  name="name"   // El backend espera el campo como "name"
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

            {/* Campo: Nombre de usuario */}
            <input
              type="text"
              name="username"
              placeholder="Username"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            {/* Campo: Correo electrónico */}
            <input
              type="email"
              name="email"
              placeholder="Email"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            {/* Campo: Contraseña */}
            <input
              type="password"
              name="password"
              placeholder="Password"
              className="form-control my-2 bg-light border-0"
              onChange={handleChange}
              required
            />

            {/* Botón para enviar el formulario */}
            <button type="submit" className="btn btn-primary w-100 mt-3">
              Register
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
