import { useEffect, useState } from "react";
import axios from "axios";
import { useNavigate } from "react-router-dom";

function Notes({ setIsAuthenticated }) {
    const [notes, setNotes] = useState([]);
    const [title, setTitle] = useState("");
    const [content, setContent] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const navigate = useNavigate();

    // Configure axios to include JWT token in requests
    const api = axios.create({
        baseURL: "http://127.0.0.1:8000/api/",
    });

    api.interceptors.request.use(
        (config) => {
            const token = localStorage.getItem('access_token');
            if (token) {
                config.headers.Authorization = `Bearer ${token}`;
            }
            return config;
        },
        (error) => {
            return Promise.reject(error);
        }
    );

    api.interceptors.response.use(
        (response) => response,
        async (error) => {
            const originalRequest = error.config;
            
            if (error.response.status === 401 && !originalRequest._retry) {
                originalRequest._retry = true;
                
                try {
                    const refreshToken = localStorage.getItem('refresh_token');
                    const response = await axios.post("http://127.0.0.1:8000/api/auth/token/refresh/", {
                        refresh: refreshToken
                    });
                    
                    localStorage.setItem('access_token', response.data.access);
                    originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
                    return api(originalRequest);
                } catch (refreshError) {
                    logout();
                    return Promise.reject(refreshError);
                }
            }
            
            return Promise.reject(error);
        }
    );

    useEffect(() => {
        fetchNotes();
    }, []);

    const fetchNotes = async () => {
        try {
            const response = await api.get("notes/");
            setNotes(response.data);
            setLoading(false);
        } catch (err) {
            setError("Failed to fetch notes");
            setLoading(false);
        }
    };

    const addNote = async () => {
        if (!title.trim() || !content.trim()) return;
        
        try {
            const response = await api.post("notes/", { title, content });
            setNotes([...notes, response.data]);
            setTitle("");
            setContent("");
        } catch (err) {
            setError("Failed to add note");
        }
    };

    const deleteNote = async (id) => {
        try {
            await api.delete(`notes/${id}/`);
            setNotes(notes.filter(note => note.id !== id));
        } catch (err) {
            setError("Failed to delete note");
        }
    };

    const logout = () => {
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
        setIsAuthenticated(false);
        navigate("/login");
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-100">
            <div className="container mx-auto px-4 py-8">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">My Notes</h1>
                    <button 
                        onClick={logout}
                        className="bg-red-500 hover:bg-red-600 text-white px-4 py-2 rounded-md transition duration-300"
                    >
                        Logout
                    </button>
                </div>

                {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

                <div className="bg-white rounded-lg shadow-md p-6 mb-8">
                    <h2 className="text-xl font-semibold mb-4">Add New Note</h2>
                    <div className="space-y-4">
                        <input
                            type="text"
                            placeholder="Title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                        <textarea
                            placeholder="Content"
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            className="w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                            rows={4}
                        />
                        <button
                            onClick={addNote}
                            className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-md transition duration-300"
                        >
                            Add Note
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {notes.map((note) => (
                        <div key={note.id} className="bg-white rounded-lg shadow-md p-6">
                            <div className="flex justify-between items-start mb-4">
                                <h3 className="text-lg font-semibold text-gray-800">{note.title}</h3>
                                <button
                                    onClick={() => deleteNote(note.id)}
                                    className="text-red-500 hover:text-red-700"
                                >
                                    Delete
                                </button>
                            </div>
                            <p className="text-gray-600 mb-4">{note.content}</p>
                            <div className="text-sm text-gray-500">
                                Created: {new Date(note.created_at).toLocaleDateString()}
                            </div>
                            <div className="text-sm text-gray-500">
                                Updated: {new Date(note.updated_at).toLocaleDateString()}
                            </div>
                        </div>
                    ))}
                </div>

                {notes.length === 0 && (
                    <div className="text-center text-gray-500 mt-8">
                        No notes yet. Add your first note above!
                    </div>
                )}
            </div>
        </div>
    );
}

export default Notes;