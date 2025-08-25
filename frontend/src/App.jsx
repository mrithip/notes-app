import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Signup from "./components/Signup";
import Login from "./components/Login";
import Notes from "./components/Notes";
import { useEffect, useState } from "react";

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem('access_token');
    if (token) {
      setIsAuthenticated(true);
    }
    setLoading(false);
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <Router>
      <Routes>
        <Route 
          path="/signup" 
          element={!isAuthenticated ? <Signup /> : <Navigate to="/notes" />} 
        />
        <Route 
          path="/login" 
          element={!isAuthenticated ? <Login setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/notes" />} 
        />
        <Route 
          path="/notes" 
          element={isAuthenticated ? <Notes setIsAuthenticated={setIsAuthenticated} /> : <Navigate to="/login" />} 
        />
        <Route 
          path="/" 
          element={<Navigate to={isAuthenticated ? "/notes" : "/login"} />} 
        />
      </Routes>
    </Router>
  );
}

export default App;