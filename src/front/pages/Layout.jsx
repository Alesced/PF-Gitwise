import { Outlet } from "react-router-dom";
import ScrollToTop from "../components/ScrollToTop";
import { Navbar } from "../components/Navbar";
import { Footer } from "../components/Footer";

<<<<<<< HEAD
// Base layout component with navbar, footer and scroll-to-top
export const Layout = () => {
  return (
    <div className="d-flex flex-column min-vh-100">
      <ScrollToTop>
        <Navbar />
        <main className="flex-grow-1">
          <Outlet />
        </main>
        <Footer />
      </ScrollToTop>
    </div>
  );
};
=======
// Base component that maintains the navbar and footer throughout the page and the scroll to top functionality..
export const Layout = () => {
    return (
        <ScrollToTop>
            <Navbar />
                <Outlet />
            <Footer />
        </ScrollToTop>
    )
}
>>>>>>> f7eab0d18cd1190cf7a6b93fec65f2ed2b275ae6
