import { useState } from "react";
import { motion } from "framer-motion";
import { toast } from "react-toastify";
import { FavoriteButton } from "../components/FavoriteButton";
import useGlobalReducer from "../hooks/useGlobalReducer";

const SmartSearch = () => {
    const { store } = useGlobalReducer();
    const { allPosts: posts } = store;
    const [userRequest, setUserRequest] = useState("");
    const [results, setResults] = useState([]);
    const [loading, setLoading] = useState(false);
    const [debug, setDebug] = useState(null);
    const [error, setError] = useState(null);
    const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "");
    const [OgPost, setOgPost] = useState(null);
    const token = store.token;

    const fetchOgPost = (post_id) => {
        const foundPost = posts.find((p) => p.id == post_id);
        if (!foundPost) {
            toast.error("Original post not found");
            return;
        }
        setOgPost(foundPost);
    };
    
    const renderCard = (post) => {
        if (!post) return null;

        return (
            <motion.div
                className="col"
                key={post.id}
                initial={{ opacity: 0, y: 50 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4 }}
            >
                <div className="icon-box h-100 d-flex flex-column justify-content-between">
                    <div>
                        <h5 className="text-white">{post.title}</h5>
                        <p className="text-white">{post.description}</p>
                        {post.stack && <span className="badge bg-secondary me-2">{post.stack}</span>}
                        {post.level && <span className="badge bg-info">{post.level}</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">View GitHub</a>
                        <div className="d-flex gap-2 align-items-center">
                            <FavoriteButton postId={post.id} whiteText={true} />
                        </div>
                    </div>
                </div>
            </motion.div>
        );
    };

    const handleSearch = async () => {
        if (!userRequest.trim()) {
            toast.error("Please ask a question, so we can help you find what you need :)");
            return;
        }
        
        setLoading(true);
        setResults([]);
        setDebug(null);
        setError(null);

        try {
            const response = await fetch(`${BASE_URL}/api/smart-search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ 
                    user_request: userRequest,
                    user_tags: store.user?.stack || null
                })
            });
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            
            // Verificar si la respuesta tiene la estructura esperada
            if (data.results) {
                setResults(data.results);
            } else {
                setResults([]);
            }
            
            if (data.dev_debug) {
                setDebug(data.dev_debug);
            }
            
        } catch (error) {
            console.error("Smart search failed", error);
            setError("Something went wrong with smart search");
            toast.error("Something went wrong with smart search");
        } finally {
            setLoading(false);
        }
    };

    const handleKeyPress = (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    return (
        <div className="container-fluid hero-bg min-vh-100 py-1 px-3 d-flex flex-column align-items-center text-white">
            <div className="w-100 w-md-75 w-lg-50 text-center">
                <h2 className="hero-title mb-1"> <span className="wise">Smart</span> Search</h2>
                <p className="hero-subtitle mb-4">
                    If you could describe your project in one line, what would you say? Let our AI do the hard work
                </p>
                <div className="d-flex flex-wrap justify-content-center gap-2 mb-4">
                    <input
                        type="text"
                        className="form-control bg-dark text-white border-secondary flex-grow-1"
                        style={{ maxWidth: "500px" }}
                        placeholder="Ask naturally what you need"
                        value={userRequest}
                        onChange={e => setUserRequest(e.target.value)}
                        onKeyPress={handleKeyPress}
                        disabled={loading}
                    />
                    <button
                        type="button"
                        className="btn btn-gitwise s-search-btn"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? (
                            <>
                                <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                                Searching for you...
                            </>
                        ) : "Ask away!"}
                    </button>
                </div>
            </div>

            {error && (
                <div className="alert alert-danger w-100 w-md-75 w-lg-50" role="alert">
                    {error}
                </div>
            )}

            {results.length > 0 && (
                <div className="w-100 px-md-5 mt-4">
                    <h4 className="text-white mb-3">Results</h4>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {results.map((result, index) => (
                            <motion.div
                                key={result.post_id}
                                className="col"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <div className="icon-box h-100 d-flex flex-column justify-content-between bg-dark text-light p-3 border border-secondary rounded">
                                    <div>
                                        <h5>{`Post #${result.post_id}`}</h5>
                                        <p className="text-white small">{result.justification}</p>
                                    </div>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mt-auto">
                                        <span className="badge bg-secondary">{result.relevance}</span>
                                        <span className="badge bg-info">Score: {result.fit_score}</span>
                                        <button 
                                            className="btn btn-gitwise btn-sm" 
                                            onClick={() => fetchOgPost(result.post_id)}
                                        >
                                            View Post
                                        </button>
                                    </div>
                                </div>
                                
                                {OgPost?.id == result.post_id && (
                                    <motion.div
                                        className="mt-3"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        transition={{ duration: 0.3 }}
                                    >
                                        <h5 className="text-white mb-2">Original Post</h5>
                                        {renderCard(OgPost)}
                                    </motion.div>
                                )}
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {results.length === 0 && !loading && userRequest && (
                <div className="alert alert-info w-100 w-md-75 w-lg-50 mt-4" role="alert">
                    No results found. Try different keywords or check your search query.
                </div>
            )}

            {debug && (
                <details className="mt-4 w-100 px-md-5">
                    <summary className="cursor-pointer text-white">Dev Debug Info</summary>
                    <pre className="whitespace-pre-wrap bg-dark p-3 rounded mt-2 text-white">
                        {JSON.stringify(debug, null, 2)}
                    </pre>
                </details>
            )}
        </div>
    );
};

export default SmartSearch;