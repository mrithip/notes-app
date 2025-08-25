import { useState } from "react";
import axios from "axios";
import { Link, useNavigate } from "react-router-dom";

function Login({ setIsAuthenticated }) {
    const [username, setUsername] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState("");
    const navigate = useNavigate();

    const handleLogin = async (e) => {
        e.preventDefault();
        setError("");

        try {
            const response = await axios.post("http://127.0.0.1:8000/api/auth/login/", {
                username,
                password
            });
            
            localStorage.setItem('access_token', response.data.access);
            localStorage.setItem('refresh_token', response.data.refresh);
            setIsAuthenticated(true);
            navigate("/notes");
        } catch (err) {
            if (err.response && err.response.data) {
                setError(err.response.data.detail || "Login failed");
            } else {
                setError("Login failed. Please try again.");
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gray-100">
            <div className="bg-white p-8 rounded-lg shadow-md w-96">
                <h1 className="text-2xl font-bold mb-6 text-center text-gray-800">Log In</h1>
                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}
                <form onSubmit={handleLogin}>
                    <div className="mb-4">
                        <input
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="text"
                            placeholder="Username"
                            value={username}
                            onChange={e => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <input
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={e => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button
                        type="submit"
                        className="w-full bg-blue-600 text-white py-2 rounded-md hover:bg-blue-700 transition duration-300"
                    >
                        Log In
                    </button>
                </form>
                <p className="mt-4 text-center text-gray-600">
                    Don't have an account?{" "}
                    <Link to="/signup" className="text-blue-600 hover:underline">
                        Sign Up
                    </Link>
                </p>
            </div>
        </div>
    );
}

export default Login;