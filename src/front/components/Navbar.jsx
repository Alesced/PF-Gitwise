import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav className="navbar navbar-light bg-dark pb-4">
			<div className="container d-flex align-items-center gap-2 mt-3">
				<Link to="/" className="text-decoration-none">
					<span className="navbar-brand mb-0 h1"><img src="https://i.postimg.cc/PprL8yXy/texto-de-logo.png" alt="" /></span>

				</Link>
				<div className="d-flex gap-2">
					<button className="btn btn-outline-light btn-sm">Home</button>
					<button className="btn btn-outline-light btn-sm">Proyects</button>
					<button className="btn btn-outline-light btn-sm">Community</button>
					<button className="btn btn-outline-light btn-sm">IA</button>
					<button className="btn btn-outline-light btn-sm">Profile</button>
					<button className="btn btn-outline-light btn-sm">Signup</button>
					<button className="btn btn-outline-light btn-sm">Contact</button>
				</div>
			</div>
		</nav>
	);
};


