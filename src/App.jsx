import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  startTransition,
  useTransition,
} from "react";
import LoginForm from "./login.jsx";
import RegisterForm from "./registration.jsx";

// Lazy load all non-critical UI
const NewThoughtBoard  = lazy(() => import("./new_thought_bord.jsx"));
const OlderThoughts    = lazy(() => import("./older_thoughts.jsx"));
const LikedThoughts    = lazy(() => import("./liked-thoughts.jsx"));
const RandomThoughts   = lazy(() => import("./random-thoughts.jsx"));

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
    const t = localStorage.getItem("token");
    const userId = getCurrentUserIdFromToken(t);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    return new Set(stored);
  });
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // startTransition for low-priority updates
  const [isPending, startUpdate] = useTransition();

  const fetchThoughts = () => {
    fetch("https://js-project-happy-thoughts.onrender.com/thoughts")
      .then((res) => res.json())
      .then((data) => {
        startUpdate(() => {
          const sorted = data.sort(
            (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
          );
          setThoughts(sorted);
        });
      })
      .catch(console.error);
  };

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

  useEffect(() => {
    if (token) {
      fetchThoughts();
      // preload lazy chunks during idle time
      window.requestIdleCallback?.(() => {
        import("./new_thought_bord.jsx");
        import("./older_thoughts.jsx");
        import("./liked-thoughts.jsx");
        import("./random-thoughts.jsx");
      });
    }
  }, [token]);

  if (!token) {
    return (
      <main
        className="auth-container"
        aria-label="Authentication section"
        style={{ minHeight: "600px" }}
      >
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <h2 tabIndex={0}>Please log in to share and see thoughts</h2>
        <LoginForm onLogin={handleLogin} />
        <button
          onClick={() => setShowRegisterModal(true)}
          aria-haspopup="dialog"
          aria-expanded={showRegisterModal}
          aria-controls="registration-dialog"
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
        <button onClick={handleLogout} aria-label="Log out">
          Logout
        </button>
      </header>

      {isPending && (
        <div role="status" aria-live="polite" className="loading-indicator">
          Loading thoughts…
        </div>
      )}

      <main className="container" aria-label="Main content">
        <Suspense fallback={<div style={{ minHeight: 200 }}>Loading NewThoughtBoard…</div>}>
          <NewThoughtBoard prependThought={(nt) => setThoughts((p) => [nt, ...p])} />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 600 }}>Loading OlderThoughts…</div>}>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 400 }}>Loading LikedThoughts…</div>}>
          <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 400 }}>Loading RandomThoughts…</div>}>
          <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
        </Suspense>
      </main>
    </>
  );
};

export default App;
