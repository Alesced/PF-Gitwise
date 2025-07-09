import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { FaUserTie, FaProjectDiagram, FaUsers, FaSearch } from "react-icons/fa";

<<<<<<< HEAD
export const Home = () => {
  const { store, dispatch } = useGlobalReducer();

  useEffect(() => {
    const loadMessage = async () => {
      try {
        const backendUrl = import.meta.env.VITE_BACKEND_URL;
        if (!backendUrl) throw new Error("VITE_BACKEND_URL is not defined");
        const response = await fetch(backendUrl + "/api/hello");
        const data = await response.json();
        if (response.ok) dispatch({ type: "set_hello", payload: data.message });
      } catch (error) {
        console.error("Error loading message:", error.message);
      }
    };
    loadMessage();
  }, []);

  return (
    <div className="text-white bg-black min-vh-100">
      <section className="text-center py-5 px-3">
        <h1 className="display-5 fw-bold text-light">Don’t Search. Ask. Find. Code.</h1>
        <p className="fs-5 mt-3">
          A <strong>social network for developers</strong> inspired by GitHub, where you can share projects,
          collaborate, and explore ideas with AI-powered guidance.
        </p>
        <p className="text-secondary">
          What makes it unique? An <strong>AI-powered search engine</strong> that understands natural language and gives contextual suggestions.
        </p>

        {!store.user && (
          <div className="mt-4 d-flex justify-content-center gap-3">
            <Link to="/login" className="btn btn-outline-primary px-4">Login</Link>
            <Link to="/register" className="btn btn-primary px-4">Sign Up</Link>
          </div>
        )}
      </section>

      <section className="container py-4">
        <div className="row text-center">
          <div className="col-md-3">
            <FaUserTie size={40} className="mb-2 text-primary" />
            <h6>Create & manage developer profiles</h6>
          </div>
          <div className="col-md-3">
            <FaProjectDiagram size={40} className="mb-2 text-primary" />
            <h6>Publish & explore community projects</h6>
          </div>
          <div className="col-md-3">
            <FaUsers size={40} className="mb-2 text-primary" />
            <h6>Follow developers & discover trends</h6>
          </div>
          <div className="col-md-3">
            <FaSearch size={40} className="mb-2 text-primary" />
            <h6>Search projects using AI</h6>
          </div>
        </div>
      </section>
=======
// Importar los íconos que vas a usar
import { faUserGear, faProjectDiagram, faUsers, faMagnifyingGlass } from "@fortawesome/free-solid-svg-icons";




// Este componente es la vista principal (landing page)
// Muestra el título, una imagen y las cards con los planes
export const Home = () => {
	return (
		<>
			<div className="">


				{/* Sección superior con título, descripción  */}
				<div className="pt-3" >

					<div className="d-flex justify-content-center ">
					</div>
					<div>
						<div className="container text-center py-5">
							{/* titulo principal */}
							<h1 className="main-title">Don’t Search. Ask. Find. Code.</h1>

							{/* subtitulo del main */}
							<p className="main-subtitle">
								<strong>A social network for developers</strong> inspired by GitHub, where you can share projects, collaborate, and explore ideas with <strong>AI-powered guidance</strong>.
							</p>

							{/* descripcion del main */}
							<p className="main-description">
								What makes it unique? An <strong>AI-powered search engine</strong> that understands natural language and gives contextual suggestions.
							</p>
							{/* iconos y texto */}
							<div className="container py-5">
								<div className="row text-center text-light">
									{/* icono 1 */}
									<div className="col-6 col-md-3 mb-4">
										<FontAwesomeIcon icon={faUserGear} className="feature-icon" />
										<p className="mt-2 fw-semibold">Create & manage developer profiles</p>
									</div>

									{/* icono 2 */}
									<div className="col-6 col-md-3 mb-4">
										<FontAwesomeIcon icon={faProjectDiagram} className="feature-icon" />
										<p className="mt-2 fw-semibold">Publish & explore community projects</p>
									</div>

									{/* icono 3 */}
									<div className="col-6 col-md-3 mb-4">
										<FontAwesomeIcon icon={faUsers} className="feature-icon" />
										<p className="mt-2 fw-semibold">Follow developers & discover trends</p>
									</div>

									{/* icono 4 */}
									<div className="col-6 col-md-3 mb-4">
										<FontAwesomeIcon icon={faMagnifyingGlass} className="feature-icon" />
										<p className="mt-2 fw-semibold">Search projects using AI</p>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>



				<div className="container py-5">
					{/* Título principal */}
					<h2 className="section-title text-center fw-bold mb-1">CHOOSE THE BEST PLAN FOR YOU</h2>
					<p className="section-subtitle text-center mb-5">SAVE UP TO 30%</p>

					{/* Contenedor de los planes */}
					<div className="row justify-content-center">
						{/* Plan Free */}
						<div className="col-12 col-md-5 mb-4">
							<div className="plan-card text-center">
								<h5 className="plan-title-1">FREE</h5>
								<ul className="plan-features list-unstyled mt-3 mb-4 text-start mx-auto">
									<li>• Unlimited repositories (basic public or private)</li>
									<li>• Community and collaborative support</li>
									<li>• Up to 2,000 minutes of CI/CD per month</li>
									<li className="pb-2">• Basic AI search (limited)</li>
								</ul>
								<p className="plan-price mt-5">12x $0.00/month</p>
								<button className="plan-button btn btn-outline-primary">CHOOSE THIS PLAN</button>
							</div>
						</div>

						{/* Plan Premium */}
						<div className="col-12 col-md-5 mb-4">
							<div className="plan-card text-center">
								<h5 className="plan-title-2">PREMIUM</h5>
								<ul className="plan-features list-unstyled mt-3 mb-4 text-start mx-auto">
									<li>• All Free plan features</li>
									<li>• Unlimited CI/CD minutes</li>
									<li>• Advanced AI (GPT-4 or Claude)</li>
									<li>• Advanced repo insights and metrics</li>
									<li>• Priority support</li>
								</ul>
								<p className="plan-price">12x $5.99/month</p>
								<button className="plan-button btn btn-outline-primary">CHOOSE THIS PLAN</button>
							</div>
						</div>
					</div>
				</div>


			</div>
		</>
	);
};
>>>>>>> f7eab0d18cd1190cf7a6b93fec65f2ed2b275ae6

      <section className="container py-5">
        <h3 className="text-center mb-4">Choose the Best Plan for You</h3>
        <div className="row justify-content-center gap-4">
          <div className="col-md-5 border p-4 rounded bg-dark text-white">
            <h4 className="text-info">Free</h4>
            <ul>
              <li>Unlimited public/private repositories</li>
              <li>Community and collaboration tools</li>
              <li>2,000 minutes/month of CI/CD</li>
              <li>Basic AI search (limited)</li>
            </ul>
            <p><strong>$3.99/month</strong> • Billed annually</p>
            <button className="btn btn-outline-primary w-100">Choose Free Plan</button>
          </div>
          <div className="col-md-5 border p-4 rounded bg-dark text-white">
            <h4 className="text-warning">Premium</h4>
            <ul>
              <li>All Free plan features</li>
              <li>Unlimited CI/CD minutes</li>
              <li>Advanced AI (GPT-4 or Claude)</li>
              <li>Advanced repo insights & metrics</li>
              <li>Priority support</li>
            </ul>
            <p><strong>$5.99/month</strong> • Billed annually</p>
            <button className="btn btn-primary w-100">Choose Premium Plan</button>
          </div>
        </div>
      </section>
    </div>
  );
};