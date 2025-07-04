import { Link, useParams } from "react-router-dom";
import PropTypes from "prop-types";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { CommentSection } from "../components/CommentSection";

export const Single = props => {
  const { store } = useGlobalReducer();
  const { theId } = useParams();
  const singleTodo = store.todos.find(todo => todo.id === parseInt(theId));

  const currentUser = store?.user?.username || "guest"; // <- Asume que tienes `user` en el store

  return (
    <div className="container text-center text-white">
      <h1 className="display-4">Todo: {singleTodo?.title}</h1>
      <hr className="my-4" />

      <Link to="/">
        <span className="btn btn-primary btn-lg" role="button">
          Back home
        </span>
      </Link>

      {/* 🗨️ Comment section */}
      <div className="mt-5">
        <CommentSection postId={theId} currentUser={currentUser} />
      </div>
    </div>
  );
};

Single.propTypes = {
  match: PropTypes.object
};