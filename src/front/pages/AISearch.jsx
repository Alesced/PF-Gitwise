// File: src/front/pages/AISearch.jsx
import { useState } from "react";
import { motion } from "framer-motion";

export const AISearch = () => {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);

  const mockAIResults = [
    {
      id: 1,
      title: "React Portfolio Template",
      description: "A modern portfolio built with React and TailwindCSS.",
      reason: "Matches your interest in React and frontend development.",
      github: "https://github.com/example/react-portfolio"
    },
    {
      id: 2,
      title: "Python API Boilerplate",
      description: "A clean and scalable structure for building REST APIs with Flask.",
      reason: "You mentioned building REST APIs.",
      github: "https://github.com/example/python-api"
    },
    {
      id: 3,
      title: "SQL Query Practice",
      description: "A repo full of challenges to improve your SQL skills.",
      reason: "Helpful for strengthening your backend/database skills.",
      github: "https://github.com/example/sql-practice"
    },
    {
      id: 4,
      title: "Node.js Chat Server",
      description: "Real-time chat server built with Node.js and Socket.io.",
      reason: "Great for real-time messaging experience.",
      github: "https://github.com/example/node-chat-server"
    },
    {
      id: 5,
      title: "E-commerce UI",
      description: "A sleek e-commerce user interface using React.",
      reason: "Perfect for designing product pages and checkout flows.",
      github: "https://github.com/example/ecommerce-ui"
    }
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    setLoading(true);

    // Simulación de llamada IA
    setTimeout(() => {
      setResults(mockAIResults.slice(0, 4)); // solo 4 resultados
      setLoading(false);
    }, 1500);
  };

  return (
    <div className="bg-black text-white min-vh-100 p-5">
      <div className="text-center mb-5">
        <h1 className="display-4" style={{ color: "#2563eb" }}>
          AI Search Assistant
        </h1>
        <p className="lead text-secondary">
          Describe what you're looking for and get 4 quick, curated repo matches.
        </p>
      </div>

      <form
        className="d-flex mb-5 gap-3 justify-content-center"
        onSubmit={handleSearch}
      >
        <input
          type="text"
          placeholder="e.g., Build a portfolio with React and Tailwind"
          className="form-control bg-dark text-white border-secondary w-50"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          required
        />
        <button
          type="submit"
          className="btn px-4"
          style={{ backgroundColor: "#2563eb", color: "white" }}
        >
          Search
        </button>
      </form>

      {loading && (
        <div className="text-center text-info">
          <p className="fs-5">Thinking with AI... Please wait 🤖</p>
        </div>
      )}

      {!loading && results.length > 0 && (
        <div className="container">
          <div className="row row-cols-1 row-cols-md-2 g-4">
            {results.map((repo) => (
              <motion.div
                key={repo.id}
                className="col"
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
              >
                <div className="card bg-dark text-white h-100 shadow-lg border border-primary">
                  <div className="card-body">
                    <h5 className="card-title" style={{ color: "#2563eb" }}>
                      {repo.title}
                    </h5>
                    <p className="card-text">{repo.description}</p>
                    <small className="text-info">{repo.reason}</small>
                  </div>
                  <div className="card-footer bg-transparent border-0">
                    <a
                      href={repo.github}
                      target="_blank"
                      rel="noreferrer"
                      className="btn btn-sm"
                      style={{ backgroundColor: "#2563eb", color: "white" }}
                    >
                      View on GitHub
                    </a>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};