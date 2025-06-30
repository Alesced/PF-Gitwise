import React, { useEffect } from "react"
import rigoImageUrl from "../assets/img/rigo-baby.jpg";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
// Importar el componente para mostrar íconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

// Importar los íconos que vas a usar
import { faUser, faProjectDiagram, faUsers, faSearch } from '@fortawesome/free-solid-svg-icons';


// Este array contiene los distintos planes que se mostrarán en las cards.
// Cada objeto representa un plan y contiene:
// - title: el nombre del plan
// - features: un array de características incluidas
// - priceMonthly: precio mensual
// - priceAnnual: precio total anual
const plans = [
	{
		title: "Pro",
		features: [
			"2 dispositivos a la vez",
			"Resolución Full HD"
		],
		priceMonthly: 3.99,
		priceAnnual: 47.88
	},
	{
		title: "Premium",
		features: [
			"2 dispositivos a la vez",
			"Resolución Full HD",
			"30 descargas para disfrutar offline"
		],
		priceMonthly: 5.99,
		priceAnnual: 71.88
	},
	{
		title: "Business",
		features: [
			"4 dispositivos a la vez",
			"Resolución 4K Ultra HD",
			"Audio Dolby Atmos",
			"100 descargas para disfrutar offline"
		],
		priceMonthly: 7.99,
		priceAnnual: 95.88
	}
];

// Este componente es la vista principal (landing page)
// Muestra el título, una imagen y las cards con los planes
export const Home = () => {
	return (
		<>
			{/* Sección superior con título, descripción e imagen */}
			<div className="d-flex pt-5">
				<img
					src='https://img.freepik.com/vector-premium/grupo-empresarios-ilustracion-trabajo-equipo-portafolio_1073071-40362.jpg'
					border='0'
					alt='Imagen ilustrativa'
				/>
				<div>
					<div className="container my-5">
						<h2 className="text-center fw-bold mb-4">Don’t Search. Ask. Find. Code.</h2>

						<p className="lead">
							<strong>A social network for developers inspired by GitHub</strong>, where you can share projects, collaborate with other programmers, and engage in technical discussions.
						</p>

						<p className="text-muted">
							What makes it unique is its <strong>AI-powered search engine</strong>, capable of understanding natural language and returning smart, contextualized results.
							You don’t need to know the exact repository name anymore—just ask like you’re talking to another developer and find what you need.
						</p>

						<div className="mt-4">
							<ul className="list-unstyled">
								<li>
									<FontAwesomeIcon icon={faUser} className="me-2 text-primary" />
									<strong>Create and manage technical profiles</strong>
								</li>
								<li>
									<FontAwesomeIcon icon={faProjectDiagram} className="me-2 text-success" />
									<strong>Publish and explore community projects</strong>
								</li>
								<li>
									<FontAwesomeIcon icon={faUsers} className="me-2 text-warning" />
									<strong>Follow developers and discover trends</strong>
								</li>
								<li>
									<FontAwesomeIcon icon={faSearch} className="me-2 text-info" />
									<strong>Search for projects, technologies, or collaborators using AI</strong>
								</li>
							</ul>
						</div>

					</div>

					{/* Input centrado para búsqueda o interacción futura */}
					<div className="d-flex justify-content-center mt-3">

						<input
							type="text"
							className="form-control"
							id="exampleInputEmail1"
							aria-describedby="emailHelp"
							style={{ width: "800px" }}
						/>
					</div>
				</div>

			</div>



			{/* Sección de planes premium */}
			<div className="container my-5">
				{/* Título de la sección */}
				<div className="text-center mb-4">
					<h2 className="fw-bold">CHOOSE THE BEST PLAN FOR YOU</h2>
					<p className="text-muted">SAVE UP TO 30%</p>
				</div>

				{/* Aquí renderizamos las cards usando Bootstrap Grid */}
				<div className="row">
					{/* Recorremos el array `plans` con map para generar una card por cada plan */}
					{plans.map((plan, index) => (
						// Cada card ocupa 12 columnas en pantallas pequeñas, y 4 en pantallas medianas o más
						<div key={index} className="col-12 col-md-4 mb-4">
							{/* Card de Bootstrap */}
							<div className="card h-100 shadow-sm">
								{/* Card Body con disposición en columna */}
								<div className="card-body d-flex flex-column">
									{/* Título del plan */}
									<h5 className="card-title text-center fw-bold">{plan.title}</h5>

									{/* Lista de características */}
									<ul className="list-unstyled mt-3 mb-4">
										{plan.features.map((feature, i) => (
											<li key={i}>✔ <strong>{feature}</strong></li>
										))}
									</ul>

									{/* Precio mensual con 2 decimales */}
									<p className="h5 text-center mt-auto">
										12x ${plan.priceMonthly.toFixed(2)}/month
									</p>

									{/* Precio total anual */}
									<p className="text-muted text-center">
										Total annual price ${plan.priceAnnual.toFixed(2)}
									</p>

									{/* Botón para elegir el plan */}
									<button className="btn btn-dark mt-3">
										CHOOSE THIS PLAN
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
		</>
	);
};