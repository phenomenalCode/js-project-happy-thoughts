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
import LikedThoughts from "./liked-thoughts.jsx";
const NewThoughtBoard = lazy(() => import("./new_thought_bord.jsx"));
const OlderThoughts = lazy(() => import("./older_thoughts.jsx"));
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
  const [likedSet, setLikedSet] = useState(new Set());
  const [loadingThoughts, setLoadingThoughts] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  const [isPending, startUpdate] = useTransition();

  const fetchThoughts = async () => {
    setLoadingThoughts(true);
    try {
      const res = await fetch("https://js-project-happy-thoughts.onrender.com/thoughts");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      startUpdate(() => setThoughts(sorted));
      setLoadingThoughts(false);
      return sorted;
    } catch (e) {
      console.error("Error fetching thoughts:", e);
      setLoadingThoughts(false);
      return [];
    }
  };

  // Load likedSet from localStorage after fetching thoughts, syncing IDs
  const loadLikedSet = (fetchedThoughts, userId) => {
    const storedLikes = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    const validIds = new Set(fetchedThoughts.map(t => t._id || t.id));
    const filteredLikes = storedLikes.filter(id => validIds.has(id));
    setLikedSet(new Set(filteredLikes));
  };

  // On login: save token, fetch thoughts, then set likedSet
  const handleLogin = async (newToken) => {
    localStorage.setItem("token", newToken);
    setToken(newToken);

    const userId = getCurrentUserIdFromToken(newToken);
    const fetchedThoughts = await fetchThoughts();
    loadLikedSet(fetchedThoughts, userId);
  };

  const handleLogout = () => {
    const userId = getCurrentUserIdFromToken(token);
    if (userId) {
      localStorage.setItem(`likedThoughts_${userId}`, JSON.stringify([...likedSet]));
    }
    localStorage.removeItem("token");
    setToken(null);
    setLikedSet(new Set());
    setThoughts([]);
  };

  // On mount or token change, fetch thoughts and likedSet if token exists
  useEffect(() => {
    if (token) {
      (async () => {
        const userId = getCurrentUserIdFromToken(token);
        const fetchedThoughts = await fetchThoughts();
        loadLikedSet(fetchedThoughts, userId);
      })();

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

  // Show loading indicator until thoughts are loaded
  if (loadingThoughts) {
    return (
      <main
        className="container"
        aria-label="Main content"
        style={{ minHeight: "600px", padding: "2rem", textAlign: "center" }}
      >
        <p>Loading thoughts…</p>
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

      <main className="container" aria-label="Main content" style={{ minHeight: "600px" }}>
        <Suspense fallback={<div style={{ minHeight: 300 }}>Loading NewThoughtBoard…</div>}>
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
