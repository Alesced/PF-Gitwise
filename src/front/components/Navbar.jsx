import { Link } from "react-router-dom";
import logo from "../assets/img/logocompleto.png";

export const Navbar = () => {

  return (
    <nav className="navbar navbar-expand-lg navbar-dark bg-dark px-4">
      <div className="container-fluid">
        <Link to="/" className="navbar-brand d-flex align-items-center">
          <img src={logo} alt="GitWise Logo" style={{ height: "40px" }} className="me-2" />
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          data-bs-toggle="collapse"
          data-bs-target="#navbarNav"
          aria-controls="navbarNav"
          aria-expanded="false"
          aria-label="Toggle navigation"
        >
          <span className="navbar-toggler-icon"></span>
        </button>
        <div className="collapse navbar-collapse" id="navbarNav">
          <ul className="navbar-nav me-auto mb-2 mb-lg-0">
            {/*<li className="nav-item">
              <Link className="nav-link" to="/posts">Proyects</Link>
            </li>*/}
            {/*<li className="nav-item">
              <Link className="nav-link" to="/admin">Admin</Link>
            </li>*/}
            <li className="nav-item">
              <Link className="nav-link" to="/contact">Contact</Link>
            </li>
          </ul>
          <div className="d-flex">
            <Link to="/login" className="btn btn-outline-primary me-2">Login</Link>
            <Link to="/register" className="btn btn-primary">Register</Link>
          </div>
        </div>
      </div>
    </nav>
  );
};

