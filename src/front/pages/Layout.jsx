import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";
import { SessionInitializer } from "../components/SessionInitializer"; // Se agregó este componente 

// Base layout component with navbar, footer and scroll-to-top.
export const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop>
        <SessionInitializer /> 
        <Navbar />
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </ScrollToTop>
    </div>
  );
};

// El SessionInitializer es un componente React diseñado para recuperar automáticamente 
// la sesión del usuario al refrescar la página o reabrir el sitio web.