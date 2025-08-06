import React, {
  useState,
  useEffect,
  lazy,
  Suspense,
  useTransition,
} from "react";
import LoginForm from "./login.jsx";
import RegisterForm from "./registration.jsx";

const NewThoughtBoard = lazy(() => import("./new_thought_bord.jsx"));
const OlderThoughts = lazy(() => import("./older_thoughts.jsx"));
const RandomThoughts = lazy(() => import("./random-thoughts.jsx"));
const LikedThoughts = lazy(() => import("./liked-thoughts.jsx"));

const getCurrentUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    return payload.userId || payload.id || null;
  } catch {
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
  const [loadingThoughts, setLoading] = useState(false);
  const [showRegisterModal, setShowModal] = useState(false);

  const [isPending, startTransition] = useTransition();

  // Fetch thoughts from API
  const fetchThoughts = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://js-project-happy-thoughts.onrender.com/thoughts");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      startTransition(() => setThoughts(sorted));
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // Fetch thoughts on token change (login/logout)
  useEffect(() => {
    if (token) {
      fetchThoughts();
    } else {
      setThoughts([]);
    }
  }, [token]);

  // Preload lazy components once on mount
  useEffect(() => {
    window.requestIdleCallback?.(() => {
      import("./new_thought_bord.jsx");
      import("./older_thoughts.jsx");
      import("./liked-thoughts.jsx");
      import("./random-thoughts.jsx");
    });
  }, []);

  // Persist likedSet on changes
  useEffect(() => {
    const userId = getCurrentUserIdFromToken(token);
    if (userId) {
      localStorage.setItem(`likedThoughts_${userId}`, JSON.stringify([...likedSet]));
    }
  }, [likedSet, token]);

  // On login: save token AND restore likedSet from localStorage
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
    setThoughts([]);
    setLikedSet(new Set());
  };

  if (!token) {
    return (
      <main
        className="auth-container"
        aria-label="Authentication"
        style={{ minHeight: 600 }}
      >
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <h2 tabIndex={0}>Please log in to share and see thoughts</h2>
        <LoginForm onLogin={handleLogin} />
        <button
          onClick={() => setShowModal(true)}
          aria-haspopup="dialog"
          aria-expanded={showRegisterModal}
          aria-controls="registration-dialog"
          type="button"
        >
          Register
        </button>
        {showRegisterModal && (
          <div
            role="dialog"
            aria-modal="true"
            id="registration-dialog"
            aria-labelledby="register-heading"
            className="modal-overlay"
            onClick={() => setShowModal(false)}
            style={{
              position: "fixed",
              inset: 0,
              backgroundColor: "rgba(0,0,0,0.5)",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              zIndex: 1000,
              overflow: "hidden", // prevent scrollbar shift
            }}
          >
            <div
              role="document"
              onClick={(e) => e.stopPropagation()}
              style={{
                background: "#fff",
                padding: 16,
                borderRadius: 8,
                maxWidth: 400,
                width: "90%",
                minHeight: 300,
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                position: "relative",
                minHeight: 300, // reserve space for modal content
              }}
            >
              <button
                onClick={() => setShowModal(false)}
                aria-label="Close registration"
                style={{
                  position: "absolute",
                  top: 8,
                  right: 8,
                  background: "transparent",
                  border: "none",
                  fontSize: 24,
                  cursor: "pointer",
                }}
              >
                &times;
              </button>
              <h3 id="register-heading" tabIndex={-1} style={{ minHeight: 32 }}>
                Register
              </h3>
              <RegisterForm />
            </div>
          </div>
        )}
      </main>
    );
  }

  if (loadingThoughts) {
    return (
      <main
        className="container"
        aria-label="Loading thoughts"
        style={{ height: 600, padding: 32, textAlign: "center" }}
      >
        <p>Loading thoughts…</p>
      </main>
    );
  }

  return (
    <>
      <header aria-label="Page header">
        <h1 tabIndex={0} style={{ minHeight: 48 }}>
          Happy Thoughts
        </h1>
        <p tabIndex={0} style={{ minHeight: 24 }}>
          Share your happy thoughts with us!
        </p>
        <button onClick={handleLogout} aria-label="Log out" type="button">
          Logout
        </button>
      </header>

      {isPending && (
        <div role="status" aria-live="polite">
          Updating thoughts…
        </div>
      )}

      <main
        className="container"
        aria-label="Main content"
        style={{ minHeight: 600 }}
      >
        <Suspense fallback={<div style={{ height: 200 }}>Loading new…</div>}>
          <NewThoughtBoard prependThought={(nt) => setThoughts((p) => [nt, ...p])} />
        </Suspense>

        <Suspense fallback={<div style={{ height: 600 }}>Loading older…</div>}>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </Suspense>

        {/* Render LikedThoughts only if we have thoughts */}
        {thoughts.length > 0 && (
          <Suspense fallback={<div style={{ height: 400 }}>Loading liked…</div>}>
            <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
          </Suspense>
        )}

        <Suspense fallback={<div style={{ height: 400 }}>Loading random…</div>}>
          <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
        </Suspense>
      </main>
    </>
  );
};

export default App;