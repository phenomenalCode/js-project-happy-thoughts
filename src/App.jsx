import React, { useState, useEffect, lazy, Suspense } from "react";
import NewThoughtBoard from "./new_thought_bord.jsx";
import OlderThoughts from "./older_thoughts.jsx";
import RegisterForm from "./registration.jsx";
import LoginForm from "./login.jsx";

// Lazy load non-critical components
const LikedThoughts = lazy(() => import("./liked-thoughts.jsx"));
const RandomThoughts = lazy(() => import("./random-thoughts.jsx"));

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
      // Preload background components to reduce delay once shown
      import("./liked-thoughts.jsx");
      import("./random-thoughts.jsx");
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
      <main className="auth-container" aria-label="Authentication section" style={{ minHeight: "600px" }}>
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <h2 tabIndex={0}>Please log in to share and see thoughts</h2>
        <LoginForm onLogin={handleLogin} />
        <button
          onClick={() => setShowRegisterModal(true)}
          aria-haspopup="dialog"
          aria-expanded={showRegisterModal}
          aria-controls="registration-dialog"
          type="button"
        >
          Register
        </button>

        {showRegisterModal && (
          <div
            className="modal-overlay"
            role="dialog"
            aria-modal="true"
            aria-labelledby="register-heading"
            id="registration-dialog"
            onClick={() => setShowRegisterModal(false)}
            style={{
              position: "fixed",
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
            }}
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              role="document"
              style={{
                background: "white",
                padding: "1rem",
                borderRadius: "8px",
                maxWidth: "400px",
                width: "90%",
                minHeight: "300px",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                position: "relative",
              }}
            >
              <button
                className="close-button"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close registration form"
                type="button"
                style={{
                  position: "absolute",
                  top: "8px",
                  right: "8px",
                  background: "transparent",
                  border: "none",
                  fontSize: "1.5rem",
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
              <h3 id="register-heading" tabIndex={-1}>
                Register
              </h3>
              <RegisterForm />
            </div>
          </div>
        )}
      </main>
    );
  }

  return (
    <>
      <header aria-label="Page header">
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <p tabIndex={0}>Share your happy thoughts with us!</p>
        <button onClick={handleLogout} aria-label="Log out" type="button">
          Logout
        </button>
      </header>

      <main className="container" aria-label="Main content">
        <section aria-labelledby="new-thoughts-heading" style={{ minHeight: "200px" }}>
          <h2 id="new-thoughts-heading" className="visually-hidden">
            New Thoughts
          </h2>
          <NewThoughtBoard prependThought={(newThought) => setThoughts((prev) => [newThought, ...prev])} />
        </section>

        <section aria-labelledby="older-thoughts-heading" style={{ minHeight: "600px" }}>
          <h2 id="older-thoughts-heading" className="visually-hidden">
            Older Thoughts
          </h2>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </section>

        <section aria-labelledby="liked-thoughts-heading" style={{ minHeight: "400px" }}>
          <h2 id="liked-thoughts-heading" className="visually-hidden">
            Liked Thoughts
          </h2>
          <Suspense fallback={<div className="skeleton" style={{ height: "200px" }} />}>
            <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
          </Suspense>
        </section>

        <section aria-labelledby="random-thoughts-heading" style={{ minHeight: "400px" }}>
          <h2 id="random-thoughts-heading" className="visually-hidden">
            Random Thoughts
          </h2>
          <Suspense fallback={<div className="skeleton" style={{ height: "200px" }} />}>
            <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
          </Suspense>
        </section>
      </main>
    </>
  );
};

export default App;
