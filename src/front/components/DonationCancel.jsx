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
    <div className="donation-center">
      <h2>Donation not completed</h2>
      <p>The process of payment was canceled.</p>
      <p>You are goint to be redirect in a few second...</p>
    </div>
  );
};

export default DonationCancel;