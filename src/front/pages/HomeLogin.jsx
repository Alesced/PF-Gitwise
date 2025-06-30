import React from "react";

const HomeLogin = () => {
    return (
        <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-light">
            <div className="text-center mb-4">
                <img
                    src="https://i.postimg.cc/G4bYTCQ5/Gitwise-logopng.png"
                    alt="Logo GitWise"
                    style={{ width: "100px", height: "100px" }}
                />
                <h1 className="mt-3">Welcome GitWise</h1>
                <p className="text-muted">
                    Connect, share, and collaborate with other developers.</p>
            </div>

            <div className="card p-4 shadow-sm" style={{ width: "100%", maxWidth: "400px" }}>
                <form>
                    <div className="mb-3">
                        <label className="form-label">Email</label>
                        <input type="email" className="form-control" placeholder="tuemail@ejemplo.com" />
                    </div>
                    <div className="mb-3">
                        <label className="form-label">Password</label>
                        <input type="password" className="form-control" placeholder="••••••••" />
                    </div>
                    <button type="button" className="btn btn-dark w-100">Login</button>
                </form>
                <div className="text-center mt-3">
                    <small className="text-muted">Don't have an account? <a href="#">Register</a></small>
                </div>
            </div>
        </div>
    );
};

export default HomeLogin;