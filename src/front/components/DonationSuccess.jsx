import { Link } from 'react-router-dom';

const DonationSuccess = () => (
  <div className="donation-success">
    <h2>¡Exit Donation! 💖</h2>
    <p>Thank you for your generosity, your support help us to grow.</p>
    <Link to="/" className="home-link">Volver al inicio</Link>
  </div>
);

export default DonationSuccess;