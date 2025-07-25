import { Link } from 'react-router-dom';

const DonationCancel = () => (
  <div className="donation-cancel">
    <h2>Donación no completada</h2>
    <p>El proceso de pago fue cancelado. ¿Quieres intentarlo de nuevo?</p>
    <Link to="/checkout" className="retry-link">Reintentar</Link>
  </div>
);

export default DonationCancel;