import { Link } from "react-router-dom";

export const Navbar = () => {

	return (
		<nav id="nav" className="navbar navbar pb-4 ">
			<div className="container gap-2 mt-3 justify-content-center">
				
				<div className="d-flex gap-2 align-items-center">
					<button className="btn btn-outline-light btn-sm">Contact</button>
					<button className="btn btn-outline-light btn-sm">Sing up</button>
					<button className="btn btn-outline-light btn-sm">Sing in</button>
					
				</div>
			</div>
		</nav>
	);
};


