import React, { useState, useEffect } from "react";
import NewThoughtBoard from "./new_thought_bord.jsx";
import OlderThoughts from "./older_thoughts.jsx";
import LikedThoughts from "./liked-thoughts.jsx";
import RandomThoughts from "./random-thoughts.jsx";
import RegisterForm from "./registration.jsx";
import LoginForm from "./login.jsx";

const getCurrentUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.userId || payload.id || null;
  } catch (e) {
    console.error("Failed to decode token:", e);
    return null;
  }
};

export const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [thoughts, setThoughts] = useState([]);
  const [likedSet, setLikedSet] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserIdFromToken(token);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    return new Set(stored);
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);

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

  const handleLogin = (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const userId = getCurrentUserIdFromToken(newToken);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    setLikedSet(new Set(stored));
  };

  const handleLogout = () => {
    const userId = getCurrentUserIdFromToken(token);
    if (userId) {
      localStorage.setItem(`likedThoughts_${userId}`, JSON.stringify([...likedSet]));
    }

    localStorage.removeItem("token");
    setToken(null);
    setLikedSet(new Set());
  };

  if (!token) {
    return (
      <main className="auth-container" aria-label="Authentication area">
        <h1>Happy Thoughts</h1>
        <h2>Please log in to share and see thoughts</h2>
        <LoginForm onLogin={handleLogin} aria-label="Login form" />
        <button
          onClick={() => setShowRegisterModal(true)}
          aria-label="Open registration form"
        >
          Register
        </button>

        {showRegisterModal && (
          <div
            className="modal-overlay"
            onClick={() => setShowRegisterModal(false)}
            aria-modal="true"
            role="dialog"
            aria-label="Registration modal"
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              role="document"
            >
              <button
                className="close-button"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close registration form"
              >
                &times;
              </button>
              <h3>Register</h3>
              <RegisterForm aria-label="Register form" />
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      <header aria-label="Site header">
        <h1>Happy Thoughts</h1>
        <h2>Share your happy thoughts with us!</h2>
        <button onClick={handleLogout} aria-label="Logout from application">
          Logout
        </button>
      </header>

      <main className="container" aria-label="Main content area">
        <section aria-label="New Thought Board">
          <NewThoughtBoard
            prependThought={(newThought) => setThoughts((prev) => [newThought, ...prev])}
          />
        </section>

        <section aria-label="Older Thoughts">
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </section>

        <section aria-label="Liked Thoughts">
          <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
        </section>

        <section aria-label="Random Thoughts">
          <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
        </section>
      </main>
    </>
  );
};

export default App;
