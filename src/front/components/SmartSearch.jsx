import { useState } from "react"
import { color, motion } from "framer-motion"
import { toast } from "react-toastify"
import isotipo from "../assets/img/isotipo.png";


const SmartSearch = () => {
    const [userRequest, setUserRequest] = useState("")
    const [results, setResults] = useState([])
    const [loading, setLoading] = useState(false)
    const [debug, setDebug] = useState(null)
    const BASE_URL = import.meta.env.VITE_BACKEND_URL.replace(/\/$/, "")
    const token = localStorage.getItem("token")

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
                        {results.map((post, i) => (
                            <motion.div
                                key={post.post_id}
                                className="col"
                                initial={{ opacity: 0, y: 30 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.3, delay: i * 0.05 }}
                            >
                                <div className="icon-box h-100 d-flex flex-column justify-content-between bg-dark text-light p-3 border border-secondary rounded">
                                    <h5>{`Post #${post.post_id}`}</h5>
                                    <p className="text-white small">{post.justification}</p>
                                    <div className="d-flex flex-wrap align-items-center gap-2 mt-auto">
                                        <span className="badge bg-secondary">{post.relevance}</span>
                                        <span className="badge bg-info">Score: {post.fit_score}</span>
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            )}

            {debug && (
                <details className="mt-4 text-sm text-gray-500 w-100 px-md-5">
                    <summary className="cursor-pointer">Dev Debug</summary>
                    <pre className="whitespace-pre-wrap">{JSON.stringify(debug, null, 2)}</pre>
                </details>
            )}
        </div>
    )
}

export default SmartSearch