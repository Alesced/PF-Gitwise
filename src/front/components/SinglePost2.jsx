// File: src/front/pages/SinglePost2.jsx
import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { CommentSection } from "../components/CommentSection";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const SinglePost2 = () => {
  // Obtenemos el ID del post de los parámetros de la URL
  const { theId } = useParams();
  // Obtenemos el store y las acciones del hook global
  const { store} = useGlobalReducer();

  // Mantenemos el estado de carga local para este componente
  const [loading, setLoading] = useState(true);
  const [post, setPost] = useState(null);

  useEffect(() => {
    // Definimos una función asíncrona para obtener los datos del post
    const fetchPost = async () => {
      if (!theId) return;
      setLoading(true);
      try {
        // En lugar de llamar a la API directamente, llamamos a una acción global.
        // Asumimos que esta acción ya existirá y manejará la llamada a la API.
        const fetchedPost = await actions.fetchSinglePost(theId);
        setPost(fetchedPost);
      } catch (error) {
        console.error("Failed to load post:", error);
        // Aquí podrías despachar una acción para manejar un error global
      } finally {
        setLoading(false);
      }
    };
    fetchPost();
  }, [theId, actions]); // La dependencia 'actions' asegura que el efecto se ejecute si las acciones cambian

  if (loading) {
    return (
      <div className="container text-white text-center py-5">
        Loading...
      </div>
    );
  }

  if (!post) {
    return (
      <div className="container text-white text-center mt-5">
        <h2>Post not found</h2>
        <Link to="/posts" className="btn btn-secondary mt-3">Go back</Link>
      </div>
    );
  }

  return (
    <div className="container text-white py-5">
      <Link to="/posts" className="btn btn-outline-light mb-4">← Back to Posts</Link>

      <div className="card bg-dark text-white p-4 shadow-lg">
        <h2 style={{ color: "#2563eb" }}>{post.title}</h2>
        <p className="text-secondary">{post.description}</p>
        <p>
          <strong>Stack:</strong> {post.stack} | {" "} <strong>Level:</strong> {post.level}
        </p>

        <div className="d-flex gap-2 my-3">
          {/* Añadimos el componente LikeButton */}
          <FavoriteButton postId={post.id} />
          {/* El `LikeButton` ya es funcional, pero lo agregamos aquí para completar el UI */}
          <a
            href={post.repo_URL}
            target="_blank"
            rel="noreferrer"
            className="btn btn-sm btn-primary"
          >
            View on GitHub
          </a>
        </div>
      </div>

      <div className="mt-5">
        {/* Pasamos solo el postId, ya que CommentSection puede obtener el resto del store */}
        <CommentSection postId={post.id} />
      </div>
    </div>
  );
};
