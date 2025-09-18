// File: src/front/pages/ErrorPage.jsx
import { useRouteError } from "react-router-dom";

export const ErrorPage = () => {
  const error = useRouteError();

  return (
    <div className="hero-bg text-white d-flex flex-column justify-content-center align-items-center min-vh-100 text-center px-3">
      <h1 className="display-3 fw-bold">Oops!</h1>
      <p className="lead">Something went wrong...</p>
      <div className="text-warning mb-4">
        {error?.statusText || error?.message || "Unknown error"}
      </div>

      <div className="d-flex gap-3">
        <a href="/" className="btn btn-gitwise">Back to Home</a>
        <button className="btn btn-outline-light" onClick={() => window.location.reload()}>
          Reload Page
        </button>
      </div>

      <p className="text-secondary mt-4 small">If the issue persists, please contact support or try again later.</p>
    </div>
  );
};