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
		title: "Free",
		features: [
			"Unlimited repositories (basic public or private)",
			"Community and collaborative support",
			"Up to 2,000 minutes of CI/CD per month",
			"Basic AI search (limited)",
			
		],
		priceMonthly: 3.99,
		priceAnnual: 47.88
	},
	{
		title: "Premium",
		features: [
			"Everything in the Free plan, plus:",
			"Unlimited CI/CD or with increased minutes",
			"Advanced AI-powered search, expanded responses (GPT-4 or Claude)",
			"Advanced insights and metrics: repository insights, code analyzers, required reviewers",
			"Priority support and email chat"
		],
		priceMonthly: 5.99,
		priceAnnual: 71.88
	},
	
];

// Este componente es la vista principal (landing page)
// Muestra el título, una imagen y las cards con los planes
export const Home = () => {
	return (
		<>
		<div className="bg-dark">
		<div className="container gap-2 pt-3">
				<div className="d-flex gap-2 align-items-center justify-content-center">
					<button className="btn btn-gitwise btn-sm">Contact</button>
					<button className="btn btn-gitwise btn-sm">Sing up</button>
					<button className="btn btn-gitwise btn-sm">Sing in</button>
					
				</div>
			</div>
			{/* Sección superior con título, descripción e imagen */}
			<div className="pt-3" >
				
				<div className="d-flex justify-content-center ">
					<img
					src='https://i.postimg.cc/tJg1Kmbq/isotipo.png'
					border='0'
					alt='Imagen ilustrativa'
					style={{ maxWidth: "30%", height: "auto" }}
				/>
				</div>
				<div>
					<div className="container py-3">
						<h2 className="text-center fw-bold mb-4 text-light">Don’t Search. Ask. Find. Code.</h2>

						<p className="lead text-light">
							<strong>A social network for developers inspired by GitHub</strong>, where you can share projects, collaborate with other programmers, and engage in technical discussions.
						</p>

						<p className="text-light">
							What makes it unique is its <strong>AI-powered search engine</strong>, capable of understanding natural language and returning smart, contextualized results.
							You don’t need to know the exact repository name anymore—just ask like you’re talking to another developer and find what you need.
						</p>

						<div className="mt-4 text-center">
  <ul className="list-unstyled text-light d-flex justify-content-center gap-4 flex-wrap">
    <li className="d-flex flex-column align-items-center text-center" style={{ maxWidth: "200px" }}>
      <img src="https://cdn-icons-png.flaticon.com/512/6840/6840478.png" alt="" style={{ width: "80px", height: "auto" }} />
      <strong className="mt-2">Create and manage technical profiles</strong>
    </li>
    <li className="d-flex flex-column align-items-center text-center" style={{ maxWidth: "200px" }}>
      <img src="https://cdn-icons-png.flaticon.com/512/5072/5072860.png" alt="" style={{ width: "80px", height: "auto" }} />
      <strong className="mt-2">Publish and explore community projects</strong>
    </li>
    <li className="d-flex flex-column align-items-center text-center" style={{ maxWidth: "200px" }}>
      <img src="https://cdn-icons-png.flaticon.com/512/10169/10169718.png" alt="" style={{ width: "80px", height: "auto" }} />
      <strong className="mt-2">Follow developers and discover trends</strong>
    </li>
    <li className="d-flex flex-column align-items-center text-center" style={{ maxWidth: "200px" }}>
      <img src="https://sdmntpreastus2.oaiusercontent.com/files/00000000-f2e0-61f6-8c75-e01400d516e0/raw?se=2025-07-02T21%3A52%3A08Z&sp=r&sv=2024-08-04&sr=b&scid=cdf12429-6dca-5318-8cba-4c3719dea646&skoid=a3412ad4-1a13-47ce-91a5-c07730964f35&sktid=a48cca56-e6da-484e-a814-9c849652bcb3&skt=2025-07-02T15%3A11%3A03Z&ske=2025-07-03T15%3A11%3A03Z&sks=b&skv=2024-08-04&sig=3M%2BEZkWQSvCV73/5p8SJQed2U6/nQHijggkXCmPADlQ%3D" alt="" style={{ width: "80px", height: "auto" }} />
      <strong className="mt-2">Search for projects, technologies, or collaborators using AI</strong>
    </li>
  </ul>
</div>

					</div>

				</div>

			</div>



			{/* Sección de planes premium */}
			<div className="container py-5 ">
				{/* Título de la sección */}
				<div className="text-center mb-4">
					<h2 className="fw-bold text-light">CHOOSE THE BEST PLAN FOR YOU</h2>
					<p className="text-light">SAVE UP TO 30%</p>
				</div>

				{/* Aquí renderizamos las cards usando Bootstrap Grid */}
				<div className="row d-flex justify-content-center">
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
											<li key={i}>• <strong>{feature}</strong></li>
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
									<button className="btn btn-gitwise  mt-3">
										CHOOSE THIS PLAN
									</button>
								</div>
							</div>
						</div>
					))}
				</div>
			</div>
			</div>
		</>
	);
};

