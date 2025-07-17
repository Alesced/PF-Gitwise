import { useEffect } from "react";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";

// Importar el componente para mostrar íconos
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
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
                    <h2 className="section-title text-center fw-bold mb-1">FIND THE BEST PLAN FOR YOU</h2>
                    <h3 className=" text-center mb-5">And sign up now to select it</h3>
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
                                    <li className="pb-2">• Basic AI search (limited)</li>{/* Se agrego un padding para nivelar el texto */}
                                </ul>
                                <p className="plan-price mt-5">$0.00</p>{/* Se agrego un Margin top para nivelar el boton */}
                                <Link to="/free" className="plan-button btn btn-outline-primary">SIGN UP HERE</Link>
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
                                <p className="plan-price">$5.99/month</p>
                                <Link to="/premium" className="plan-button btn btn-outline-primary">SIGN UP HERE</Link>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};


