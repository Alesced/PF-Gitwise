import { loadStripe } from '@stripe/stripe-js';

const stripePromise = loadStripe('pk_test_51RnmUFFYN6tLpF6krG0ijTd317Me09EBq0wApfnSnTBWdGzibJnhdcWkzFPKmLl8qbqEHSFQ86CyN7RWiWD8eaWv00yY5lFqfy');

export const handleStripeCheckout = async (amount = 10) => {
  try {
    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-stripe-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100, // Convierte dólares a centavos
        currency: 'usd',
        frontend_url: window.location.origin // <-- Agrega esto
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { url } = await response.json();
    window.open(url, '_blank', 'noopener,noreferrer');
  } catch (error) {
    console.error("Error al procesar donación:", error);
    window.location.href = '/donation-cancel';
  }
};