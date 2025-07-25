import { loadStripe } from '@stripe/stripe-js';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51RnmUFFYN6tLpF6krG0ijTd317Me09EBq0wApfnSnTBWdGzibJnhdcWkzFPKmLl8qbqEHSFQ86CyN7RWiWD8eaWv00yY5lFqfy');

const StripeCheckout = () => {
  const [error, setError] = useState(null);
  const [amount, setAmount] = useState(1000); // Monto por defecto: $10.00
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const stripe = await stripePromise;
      const response = await fetch('/create-stripe-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ amount, currency: 'usd' }),
      });

      if (!response.ok) throw new Error(await response.text());
      
      const { sessionId } = await response.json();
      const { error: stripeError } = await stripe.redirectToCheckout({ sessionId });
      
      if (stripeError) throw stripeError;
    } catch (err) {
      setError(err.message);
    }
  };

  if (error) {
    return (
      <div className="error-container">
        <h3>Error</h3>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Reintentar</button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="checkout-form">
      <label>
        Monto (en centavos):
        <input
          type="number"
          value={amount}
          onChange={(e) => setAmount(Number(e.target.value))}
          min="100"
          step="100"
        />
      </label>
      <button type="submit">Donar ${amount / 100}</button>
    </form>
  );
};

export default StripeCheckout;