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
    <div className="donation-center">
      <h2>¡Exit Donation!</h2>
      <p>Thank You for your generosity, your support help us to grow.</p>
      <p>You are going to be redirect in a few secons...</p>
    </div>
  );
};

export default DonationSuccess;