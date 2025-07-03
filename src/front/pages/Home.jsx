import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer.jsx";
import { FaUserTie, FaProjectDiagram, FaUsers, FaSearch } from "react-icons/fa";

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