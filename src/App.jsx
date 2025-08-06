import React, { useState, useEffect, Suspense } from "react";

// Lazy load components
const NewThoughtBoard = React.lazy(() => import("./new_thought_bord.jsx"));
const OlderThoughts = React.lazy(() => import("./older_thoughts.jsx"));
const LikedThoughts = React.lazy(() => import("./liked-thoughts.jsx"));
const RandomThoughts = React.lazy(() => import("./random-thoughts.jsx"));
const RegisterForm = React.lazy(() => import("./registration.jsx"));
const LoginForm = React.lazy(() => import("./login.jsx"));

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

  // ------------- AUTH STATE UI ------------- //
  if (!token) {
    return (
      <main className="auth-container" aria-label="Authentication">
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <p tabIndex={0}>Please log in to share and see thoughts</p>

        <Suspense fallback={<div>Loading login...</div>}>
          <LoginForm onLogin={handleLogin} />
        </Suspense>

        <button
          onClick={() => setShowRegisterModal(true)}
          aria-haspopup="dialog"
          aria-controls="registration-dialog"
          aria-expanded={showRegisterModal}
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
          >
            <div
              className="modal-content"
              onClick={(e) => e.stopPropagation()}
              role="document"
            >
              <button
                className="close-button"
                onClick={() => setShowRegisterModal(false)}
                aria-label="Close registration"
              >
                ×
              </button>
              <h3 id="register-heading">Register</h3>
              <Suspense fallback={<div>Loading registration form...</div>}>
                <RegisterForm />
              </Suspense>
            </div>
          </div>
        )}
      </main>
    );
  }

  // ------------- MAIN APP UI ------------- //
  return (
    <>
      <header aria-label="Page header">
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <p tabIndex={0}>Share your happy thoughts with us!</p>
        <button onClick={handleLogout} aria-label="Log out">
          Logout
        </button>
      </header>

      <main className="container" aria-label="Main content">
        <section aria-labelledby="new-thoughts-heading">
          <h2 id="new-thoughts-heading" className="visually-hidden">
            New Thoughts
          </h2>
          <Suspense fallback={<div>Loading new thoughts...</div>}>
            <NewThoughtBoard
              prependThought={(newThought) => setThoughts((prev) => [newThought, ...prev])}
            />
          </Suspense>
        </section>

        <section aria-labelledby="older-thoughts-heading">
          <h2 id="older-thoughts-heading" className="visually-hidden">
            Older Thoughts
          </h2>
          <Suspense fallback={<div>Loading older thoughts...</div>}>
            <OlderThoughts
              thoughts={thoughts}
              setThoughts={setThoughts}
              likedSet={likedSet}
              setLikedSet={setLikedSet}
            />
          </Suspense>
        </section>

        <section aria-labelledby="liked-thoughts-heading">
          <h2 id="liked-thoughts-heading" className="visually-hidden">
            Liked Thoughts
          </h2>
          <Suspense fallback={<div>Loading liked thoughts...</div>}>
            <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
          </Suspense>
        </section>

        <section aria-labelledby="random-thoughts-heading">
          <h2 id="random-thoughts-heading" className="visually-hidden">
            Random Thoughts
          </h2>
          <Suspense fallback={<div>Loading random thoughts...</div>}>
            <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
          </Suspense>
        </section>
      </main>
    </>
  );
};

export default App;
