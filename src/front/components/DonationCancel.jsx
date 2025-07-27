import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DonationCancel = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000); // 3 segundos
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="donation-cancel">
      <h2>Donación no completada</h2>
      <p>El proceso de pago fue cancelado. ¿Quieres intentarlo de nuevo?</p>
      <p>Serás redirigido al inicio en unos segundos...</p>
    </div>
  );
};

export default DonationCancel;