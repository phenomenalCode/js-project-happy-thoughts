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

const NewThoughtBoard = lazy(() => import("./new_thought_bord.jsx"));
const OlderThoughts = lazy(() => import("./older_thoughts.jsx"));
const RandomThoughts = lazy(() => import("./random-thoughts.jsx"));
const LikedThoughts = lazy(() => import("./liked-thoughts.jsx"));

const getCurrentUserIdFromToken = (token) => {
  if (!token) return null;
  try {
    const base64 = token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/");
    const payload = JSON.parse(atob(base64));
    console.log("Decoded token payload:", payload);
    return payload.userId || payload.id || null;
  } catch (e) {
    console.error("Failed to decode token", e);
    return null;
  }
};

export const App = () => {
  const [token, setToken] = useState(localStorage.getItem("token"));
  const [thoughts, setThoughts] = useState([]);

  // Initialize likedSet from localStorage for current user
  const [likedSet, setLikedSet] = useState(() => {
    const token = localStorage.getItem("token");
    const userId = getCurrentUserIdFromToken(token);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    console.log("Initial likedSet from localStorage:", stored);
    return new Set(stored);
  });

  console.log("Current likedSet state:", likedSet);

  const [loadingThoughts, setLoading] = useState(false);
  const [showRegisterModal, setShowModal] = useState(false);
  const [isPending, startUpdate] = useTransition();

  const fetchThoughts = async () => {
    setLoading(true);
    try {
      const res = await fetch("https://js-project-happy-thoughts.onrender.com/thoughts");
      const data = await res.json();
      const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
      console.log("Fetched and sorted thoughts:", sorted);
      startTransition(() => setThoughts(sorted));
      return sorted;
    } catch (e) {
      console.error("Error fetching thoughts:", e);
      return [];
    } finally {
      setLoading(false);
    }
  };

  // Fetch thoughts on token change, but DO NOT sync or clear likedSet here
  useEffect(() => {
    if (!token) {
      console.log("No token, skipping fetch.");
      return;
    }

    (async () => {
      const userId = getCurrentUserIdFromToken(token);
      console.log("useEffect running with userId:", userId);
      await fetchThoughts();
    })();

    // Preload lazy components during idle time
    window.requestIdleCallback?.(() => {
      import("./new_thought_bord.jsx");
      import("./older_thoughts.jsx");
      import("./liked-thoughts.jsx");
      import("./random-thoughts.jsx");
    });
  }, [token]);

  const handleLogin = (newToken) => {
    console.log("handleLogin called with newToken:", newToken);
    localStorage.setItem("token", newToken);

    // Reset likedSet from localStorage on login
    const userId = getCurrentUserIdFromToken(newToken);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    setLikedSet(new Set(stored));

    setToken(newToken);
  };

  const handleLogout = () => {
    const userId = getCurrentUserIdFromToken(token);
    console.log("handleLogout called for userId:", userId);
    if (userId) {
      console.log("Saving likedSet to localStorage:", [...likedSet]);
      localStorage.setItem(`likedThoughts_${userId}`, JSON.stringify([...likedSet]));
    }
    localStorage.removeItem("token");
    setToken(null);
    setThoughts([]);
    setLikedSet(new Set());
  };

  // ...rest of your JSX with conditional rendering and Suspense components unchanged

  return !token ? (
    <main className="auth-container" aria-label="Authentication" style={{ minHeight: 600 }}>
      {/* Login and Register UI */}
    </main>
  ) : loadingThoughts ? (
    <main
      className="container"
      aria-label="Loading thoughts"
      style={{ minHeight: 600, padding: 32, textAlign: "center" }}
    >
      <p>Loading thoughts…</p>
    </main>
  ) : (
    <>
      <header aria-label="Page header">
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <p tabIndex={0}>Share your happy thoughts with us!</p>
        <button onClick={handleLogout} aria-label="Log out" type="button">
          Logout
        </button>
      </header>

      {isPending && (
        <div role="status" aria-live="polite">
          Updating thoughts…
        </div>
      )}

      <main className="container" aria-label="Main content" style={{ minHeight: 600 }}>
        <Suspense fallback={<div style={{ minHeight: 200 }}>Loading new…</div>}>
          <NewThoughtBoard prependThought={(nt) => setThoughts((p) => [nt, ...p])} />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 600 }}>Loading older…</div>}>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 400 }}>Loading liked…</div>}>
          <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
        </Suspense>

        <Suspense fallback={<div style={{ minHeight: 400 }}>Loading random…</div>}>
          <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
        </Suspense>
      </main>
    </>
  );
};

export default App;
