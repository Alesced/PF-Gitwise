import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { FavoriteButton } from "../components/FavoriteButton";
import { CommentSection } from "../components/CommentSection";
import useGlobalReducer from "../hooks/useGlobalReducer";

export const SinglePost2 = () => {
    const { theId } = useParams()
    const [state] = useGlobalReducer()
    //   not possible to even post without being logged in(not even with postman)
    const currentUser = state.user.username

    const [post, setPost] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        async function showPost() {
            try {
                const token = localStorage.getItem("token")
                const response = await fetch(`{import.meta.env.VITE_BACKEND_URL}` + "/api/posts/<int:post_id>", {
                    method: "GET",
                    headers: {
                        Authorization: `Bearer ${token}`
                    }
                })
                if (!response.ok) throw new Error(`Fetch error: ${response.status}`)
                const data = await response.json()
                //singles out el post
                setPost(data.post || data.posts?.[0] || data)
            } catch (error) {
                console.error("Failed to load post:", error)
            } finally {
                setLoading(false)
            }
        }
        showPost()
    }, [theId])

    if (loading) {
        return (
            <div className="container text-white text center py-5">
                Loading...
            </div>
        )
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
                    <FavoriteButton postId={post.id} />
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
                <CommentSection postId={post.id} currentUser={currentUser} />
            </div>
        </div>
    );
};