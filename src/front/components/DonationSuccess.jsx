import { Link } from 'react-router-dom';

const DonationSuccess = () => (
  <div className="donation-success">
    <h2>¡Donación exitosa! 💖</h2>
    <p>Gracias por tu generosidad. Tu apoyo hace la diferencia.</p>
    <Link to="/" className="home-link">Volver al inicio</Link>
  </div>
);

export default DonationSuccess;