// File: src/front/pages/Posts2.jsx
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { FavoriteButton } from "../components/FavoriteButton";
import { Link } from "react-router-dom";
import useGlobalReducer from "../hooks/useGlobalReducer";
import { SinglePost2 } from "../components/SinglePost2";

export const Posts2 = () => {
    const [posts, setPosts] = useState([]);
    const [currentPage, setCurrentPage] = useState(1);
    const [stackFilter, setStackFilter] = useState("");
    const [levelFilter, setLevelFilter] = useState("");
    const postsPerPage = 6;

    useEffect(() => {
        async function showPosts() {
            try {
                // que coja el token en header
                // const token = localStorage.getItem("token")
                const response = await fetch(`${import.meta.env.VITE_BACKEND_URL}/api/posts`, {
                    method: "GET",
                    // headers: {
                    //     Authorization: `Bearer ${token}}`
                    // }
                })

                if (!response.ok) throw new Error(`Fetch error: ${response.status}`)
                const data = await response.json();
                setPosts(data.posts)
            } catch (error) {
                console.error("Failed to show posts:", error)
            }
        }
        showPosts()
    }, [])

    const filteredPosts = posts.filter(post =>
        (!stackFilter || post.stack === stackFilter) &&
        (!levelFilter || post.level === levelFilter)
    )

    const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
    const indexOfLastPost = currentPage * postsPerPage;
    const indexOfFirstPost = indexOfLastPost - postsPerPage;
    const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

    return (
        <div className="min-vh-100 p-5" style={{ backgroundColor: "#0d0d0d" }}>
            {/* to filter */}
            <h2 className="text-white mb-4">All Posts</h2>

            <div className="d-flex gap-3 mb-4">
                <select
                    className="form-select bg-dark text-white border-secondary"
                    value={stackFilter}
                    onChange={e => {
                        setStackFilter(e.target.value)
                        setCurrentPage(1)
                    }}
                >
                    {/* faltaba stacks */}
                    <option value="">All Stacks</option>
                    {[...new Set(posts.map(p => p.stack))].map(stack => (
                        <option key={stack} value={stack}>{stack}</option>
                    ))}
                </select>
                <select
                    className="form-select bg-dark text-white border-secondary"
                    value={levelFilter}
                    onChange={e => {
                        setLevelFilter(e.target.value)
                        setCurrentPage(1) // for the first page
                    }}
                >
                    <option value="">All Levels</option>
                    {[...new Set(posts.map(p => p.level))].map(level => (
                        <option key={level} value={level}>{level}</option>
                    ))}
                </select>
            </div>

            {/* the posts catalogue */}

            <div className="row row-cols-1 row-cols-md-3 g-4">
                {currentPosts.map(post => (
                    <motion.div
                        className="col"
                        key={post.id}
                        initial={{ opacity: 0, y: 50 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                    >
                        <div className="card bg-black text-white h-100 shadow">
                            <div className="card-body d-flex flex-column justify-content-between">
                                <div>
                                    <h5 className="card-title" style={{ color: "#2563eb" }}>{post.title}</h5>
                                    <p className="card-text">{post.description}</p>
                                    <span className="badge bg-secondary me-2">{post.stack}</span>
                                    <span className="badge bg-info">{post.level}</span>
                                </div>

                                {/* <Link to={`/ single / ${ post.id }`} className="btn btn-outline-light btn-sm mt-3 w-100">
                                    View details
                                </Link> */}
                            </div>

                            <div className="card-footer bg-transparent border-0 d-flex justify-content-between align-items-center">
                                <a
                                    href={post.repo_URL}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="btn btn-sm"
                                    style={{ backgroundColor: "#2563eb", color: "white" }}
                                >
                                    View GitHub
                                </a>
                                <div className="d-flex gap-2">
                                    <FavoriteButton postId={post.id} />
                                </div>
                            </div>
                        </div>
                    </motion.div>
                ))}
            </div>

            <div className="d-flex justify-content-center mt-4 gap-2">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
                    <button
                        key={page}
                        className={`btn btn - sm ${page === currentPage ? "btn-primary" : "btn-outline-secondary"}`}
                        onClick={() => setCurrentPage(page)}
                    >
                        {page}
                    </button>
                ))}
            </div>
        </div>
    );
};