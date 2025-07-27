import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const DonationSuccess = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => {
      navigate('/');
    }, 3000); // 3 segundos
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="donation-success">
      <h2>¡Donación exitosa! 💖</h2>
      <p>Gracias por tu generosidad, tu apoyo nos ayuda a crecer.</p>
      <p>Serás redirigido al inicio en unos segundos...</p>
    </div>
  );
};

export default DonationSuccess;