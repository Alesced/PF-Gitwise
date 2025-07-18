import { useEffect } from "react";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const SessionInitializer = () => {
  const { dispatch } = useGlobalReducer();   // Accede al store global y al dispatch

  useEffect(() => {
    // Este efecto solo se ejecuta una vez al montar el componente
    // Sirve para recuperar la sesión si existe algo guardado en localStorage.

    const token = localStorage.getItem("token");   // Busca el token guardado (si existe)
    const user = localStorage.getItem("user");     // Busca el usuario guardado (si existe)

    // Si el token y usuario son válidos, restablece la sesión desde el localStorage
    if (token && user && user !== "undefined") {
      dispatch({ type: "set_user", payload: JSON.parse(user) });  // Carga el usuario en el store global
    } else {
      localStorage.removeItem("user");  // Si hay basura o inconsistencia, limpia el localStorage
    }
  }, []);  // El array vacío [] asegura que esto solo corre al montar el componente

  return null;  // Este componente no renderiza nada visualmente, solo ejecuta el efecto
};
