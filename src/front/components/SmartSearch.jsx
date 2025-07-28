import { useEffect, useState } from "react"
import { color, motion } from "framer-motion"
import { toast } from "react-toastify"
import { FavoriteButton } from "../components/FavoriteButton";
// import isotipo from "../assets/img/isotipo.png"; <-- no longer needed


const SmartSearch = () => {
    const [userRequest, setUserRequest] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [debug, setDebug] = useState(null)
    const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")
    const token = localStorage.getItem("token")
    const [posts, setPosts] = useState([]) // para que se traiga todos los posts para poder referenciar
    const [OgPost, setOgPost] = useState(null) // ahí sí el post específico original del botón que se hunde

    const fetchOgPost = (post_id) => {
        const foundPost = posts.find((p) => p.id == post_id) // == y no === para que no dé error por tipo por si ponemos algún "(e.target.value)" que devolvería el id en string
        if (!foundPost) {
            toast.error("Original post not found")
            return
        }
        setOgPost(foundPost)
    }
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
                        {post.description && <span className="text-white">{post.description}</span>}
                    </div>
                    <div className="d-flex justify-content-between align-items-center mt-3">
                        <a href={post.repo_URL} target="_blank" rel="noreferrer" className="btn btn-gitwise btn-sm">View GitHub</a>
                        <div className="d-flex gap-2 align-items-center">
                            <FavoriteButton postId={post.id} whiteText={true} />
                        </div>
                    </div>
                </div>
            </motion.div >
        );
    }
    const handleSearch = async () => {
        console.log("Posting to:", `${BASE_URL}/api/smart-search`)
        if (!userRequest.trim()) return toast.error("Please ask a question, so we can help you find what you need :)")
        setLoading(true)
        setResults([])
        setDebug(null)

        try {
            const response = await fetch(`${BASE_URL}/api/smart-search`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                    ...(token && { "Authorization": `Bearer ${token}` })
                },
                body: JSON.stringify({ user_request: userRequest })
            })
            const data = await response.json()
            setResults(data.results || [])
            setDebug(data.dev_debug || {})
        } catch (error) {
            console.error("Smart search failed", error)
            toast.error("Something went wrong with smart search")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        const fetchAllPosts = async () => {
            try {
                const response1 = await fetch(`${BASE_URL}/api/posts?page=1`, {
                    headers: {
                        ...(token && { "Authorization": `Bearer ${token}` })
                    }
                })
                const data1 = await response1.json()

                const response2 = await fetch(`${BASE_URL}/api/posts?page=2`, {
                    headers: {
                        ...(token && { "Authorization": `Bearer ${token}` })
                    }
                })
                const data2 = await response2.json()

                setPosts([...data1.posts, ...data2.posts])

            } catch (error) {
                console.error("failed to fetch full posts", error)
                toast.error("Could not load original post data")
            }
        }
        fetchAllPosts()
    }, [])
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
                    />
                    <button
                        type="button"
                        className="btn btn-gitwise s-search-btn"
                        onClick={handleSearch}
                        disabled={loading}
                    >
                        {loading ? "Searching for you..." : "Ask away!"}
                    </button>
                    {/* <button className="sadly-rejected-btn" style={{
                    boxShadow: `0 0 8px rgba(135, 90, 224, 0.93),
      0 0 13px rgba(84, 0, 252, 0.6),
      0 0 20px rgba(54, 255, 201, 0.84),
      0 0 30px rgba(194, 10, 194, 0.3)`, borderRadius: '30px'
                }}><img
                        src={isotipo}
                        alt="GitWise logo"
                        width="40"
                        padding="0"
                        type="button"
                        onClick={handleSearch}
                        disabled={loading}
                    /></button> */}

                </div>
            </div>
            {results.length > 0 && (
                <div className="w-100 px-md-5 mt-4">
                    <h4 className="text-white mb-3">Results</h4>
                    <div className="row row-cols-1 row-cols-md-2 row-cols-lg-3 g-4">
                        {results.map((post, index) => (
                            <motion.div
                                key={post.post_id}
                                className="col"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: index * 0.05 }}
                            >
                                <div className="icon-box h-100 d-flex flex-column justify-content-between bg-dark text-light p-3 border border-secondary rounded">
                                    <h5>{`Post #${post.post_id}`}</h5>
                                    {/* <h5>{`${post.title}`}</h5> */}
                                    <p className="text-white small">{post.justification}</p>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mt-auto">
                                        <span className="badge bg-secondary">{post.relevance}</span>
                                        <span className="badge bg-info">Score: {post.fit_score}</span>
                                        <button className="btn btn-gitwise" onClick={() => fetchOgPost(post.post_id)}>View Post</button>
                                        {OgPost?.id == post.post_id && (
                                            <div className="row w-100 mb-3">
                                                <h4 className="text-white mb-2"> OG Post </h4>
                                                <div className="row">
                                                    {renderCard(OgPost)}
                                                </div>
                                            </div>
                                        )}
                                        {/* // (
                                        //     <div className="mt-1 p-1 border border-light rounded bg-black text white">
                                        //         <h6 className="fw-bold"> Original Post</h6>
                                        //         <p className="mb-1">{OgPost.description}</p>
                                        //         <a href={OgPost.repo_URL} className="btn btn-gitwise btn-sm" target="_blank" rel="noreferrer">
                                        //             Go to GH Repo
                                        //         </a>
                                            </div>

                                        )} */}
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )
            }

            {
                debug && (
                    <details className="mt-4 text-sm text-gray-500 w-100 px-md-5">
                        <summary className="cursor-pointer">Dev Debug</summary>
                        <pre className="whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
                    </details>
                )
            }
        </div >
    )
}
export default SmartSearch