import React, { useState, useEffect } from "react";
import NewThoughtBoard from "./new_thought_bord.jsx";
import OlderThoughts from "./older_thoughts.jsx";
import LikedThoughts from "./liked-thoughts.jsx";
import RandomThoughts from "./random-thoughts.jsx";
import RegisterForm from "./registration.jsx";
import LoginForm from "./login.jsx";

export const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [thoughts, setThoughts] = useState([]);
  const [likedSet, setLikedSet] = useState(() => {
    const stored = JSON.parse(localStorage.getItem("likedThoughts")) || [];
    return new Set(stored);
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch thoughts from API
  const fetchThoughts = () => {
    fetch("https://js-project-happy-thoughts.onrender.com/thoughts")
      .then((res) => res.json())
      .then((data) => {
        const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setThoughts(sorted);
      })
      .catch((err) => console.error("Error fetching thoughts:", err));
  };

  useEffect(() => {
    if (token) {
      fetchThoughts();
    }
  }, [token]);

  const handleLogout = () => {
  localStorage.removeItem("token");
  localStorage.removeItem("likedThoughts");  // Clear liked thoughts here
  setToken(null);
  setLikedSet(new Set()); // Reset likedSet in state too
};


  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);
  };

  if (!token) {
    return (
      <div className="auth-container">
        <h1>Happy Thoughts</h1>
        <h2>Please log in to share and see thoughts</h2>
        <LoginForm onLogin={handleLogin} />
        <button onClick={() => setShowRegisterModal(true)}>Register</button>

        {showRegisterModal && (
          <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="close-button" onClick={() => setShowRegisterModal(false)}>
                &times;
              </button>
              <h3>Register</h3>
              <RegisterForm />
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <header>
        <h1>Happy Thoughts</h1>
        <h2>Share your happy thoughts with us!</h2>
        <button onClick={handleLogout}>Logout</button>
      </header>

      <div className="container">
        <NewThoughtBoard
          prependThought={(newThought) => setThoughts((prev) => [newThought, ...prev])}
        />
        <OlderThoughts
  thoughts={thoughts}
  setThoughts={setThoughts}
  likedSet={likedSet}
  setLikedSet={setLikedSet}
/>

        <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
       <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />

      </div>
    </>
  );
};

export default App;
