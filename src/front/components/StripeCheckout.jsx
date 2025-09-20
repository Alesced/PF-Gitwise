export const handleStripeCheckout = async (amount = 10) => {
  try {
    // Usa la variable de entorno para la URL del frontend
    const frontendUrl = import.meta.env.VITE_FRONTEND_URL || window.location.origin;
    
    console.log("Frontend URL:", frontendUrl);

    const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/create-stripe-session`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        amount: amount * 100,
        currency: 'usd',
        frontend_url: frontendUrl  
      }),
    });

    if (!response.ok) {
      throw new Error('Network response was not ok');
    }

    const { url } = await response.json();
    window.location.href = url;
  } catch (error) {
    console.error("Error al procesar donación:", error);
    window.location.href = '/donation-cancel';
  }
};