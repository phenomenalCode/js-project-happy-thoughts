import React, { useState, useEffect, Suspense } from "react";

// Eagerly load critical components
import LoginForm from "./login.jsx";
import RegisterForm from "./registration.jsx";
import NewThoughtBoard from "./new_thought_bord.jsx";
import OlderThoughts from "./older_thoughts.jsx";

// Lazy load non-critical
const LikedThoughts = React.lazy(() => import("./liked-thoughts.jsx"));
const RandomThoughts = React.lazy(() => import("./random-thoughts.jsx"));

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
    const userId = getCurrentUserIdFromToken(token);
    const stored = JSON.parse(localStorage.getItem(`likedThoughts_${userId}`)) || [];
    return new Set(stored);
  });

  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Prevent scroll jump when modal opens
  useEffect(() => {
    if (showRegisterModal) {
      document.body.style.overflow = "hidden";
      document.body.style.position = "fixed";
      document.body.style.width = "100%";
    } else {
      document.body.style.overflow = "";
      document.body.style.position = "";
      document.body.style.width = "";
    }
  }, [showRegisterModal]);

  useEffect(() => {
    if (token) {
      fetch("https://js-project-happy-thoughts.onrender.com/thoughts")
        .then((res) => res.json())
        .then((data) => {
          const sorted = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
          setThoughts(sorted);
        })
        .catch(console.error);
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

  const sectionStyle = { minHeight: "400px", marginBottom: "2rem" };

  if (!token) {
    return (
      <main className="container" aria-label="Main content">
        <section style={sectionStyle} aria-labelledby="new-thoughts-heading">
          <h2 id="new-thoughts-heading" className="visually-hidden">New Thoughts</h2>
          <NewThoughtBoard prependThought={(newThought) => setThoughts([newThought, ...thoughts])} />
        </section>

        <section style={sectionStyle} aria-labelledby="older-thoughts-heading">
          <h2 id="older-thoughts-heading" className="visually-hidden">Older Thoughts</h2>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </section>

        <section style={sectionStyle} aria-labelledby="liked-thoughts-heading">
          <h2 id="liked-thoughts-heading" className="visually-hidden">Liked Thoughts</h2>
          <Suspense fallback={<div>Loading liked thoughts...</div>}>
            <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
          </Suspense>
        </section>

        <section style={sectionStyle} aria-labelledby="random-thoughts-heading">
          <h2 id="random-thoughts-heading" className="visually-hidden">Random Thoughts</h2>
          <Suspense fallback={<div>Loading random thoughts...</div>}>
            <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
          </Suspense>
        </section>
      </main>
    );
  }

  return (
    <>
      <header>
        <h1 tabIndex={0}>Happy Thoughts</h1>
        <p tabIndex={0}>Share your happy thoughts with us!</p>
        <button onClick={handleLogout} aria-label="Log out">Logout</button>
      </header>

      <main className="container" aria-label="Main content">
        <section style={sectionStyle} aria-labelledby="new-thoughts-heading">
          <h2 id="new-thoughts-heading" className="visually-hidden">New Thoughts</h2>
          <NewThoughtBoard prependThought={(newThought) => setThoughts([newThought, ...thoughts])} />
        </section>

        <section style={sectionStyle} aria-labelledby="older-thoughts-heading">
          <h2 id="older-thoughts-heading" className="visually-hidden">Older Thoughts</h2>
          <OlderThoughts
            thoughts={thoughts}
            setThoughts={setThoughts}
            likedSet={likedSet}
            setLikedSet={setLikedSet}
          />
        </section>

        <section style={sectionStyle} aria-labelledby="liked-thoughts-heading">
          <h2 id="liked-thoughts-heading" className="visually-hidden">Liked Thoughts</h2>
          <Suspense fallback={<div>Loading liked thoughts...</div>}>
            <LikedThoughts likedSet={likedSet} allThoughts={thoughts} />
          </Suspense>
        </section>

        <section style={sectionStyle} aria-labelledby="random-thoughts-heading">
          <h2 id="random-thoughts-heading" className="visually-hidden">Random Thoughts</h2>
          <Suspense fallback={<div>Loading random thoughts...</div>}>
            <RandomThoughts likedSet={likedSet} setLikedSet={setLikedSet} />
          </Suspense>
        </section>
      </main>
    </>
  );
};

export default App;
