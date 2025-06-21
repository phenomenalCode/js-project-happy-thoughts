
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
  const [likedThoughts, setLikedThoughts] = useState([]);
  const [showRegisterModal, setShowRegisterModal] = useState(false);

  // Fetch thoughts from server
  const fetchThoughts = () => {
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
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
    const stored = JSON.parse(localStorage.getItem("likedThoughts")) || [];
    setLikedThoughts(new Set(stored.map((t) => t._id)));
  }, [token]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setToken(null);
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
          likedThoughts={likedThoughts}
          setLikedThoughts={setLikedThoughts}
        />
        <LikedThoughts likedThoughts={likedThoughts} />
        <RandomThoughts />
      </div>
    </>
  );
};

export default App;


// import React, { useState, useEffect } from "react";
// import NewThoughtBoard from "./new_thought_bord.jsx";
// import OlderThoughts from "./older_thoughts.jsx";
// import LikedThoughts from "./liked-thoughts.jsx";
// import RandomThoughts from "./random-thoughts.jsx";
// import RegisterForm from "./registration.jsx";
// import LoginForm from "./login.jsx";

// export const App = () => {
//   const [token, setToken] = useState(localStorage.getItem("token"));
//   const [likedThoughts, setLikedThoughts] = useState([]);
//   const [showRegisterModal, setShowRegisterModal] = useState(false);

//   useEffect(() => {
//     const stored = JSON.parse(localStorage.getItem("likedThoughts")) || [];
//     setLikedThoughts(new Set(stored.map((t) => t._id)));
//   }, []);

//   const handleLogout = () => {
//     localStorage.removeItem("token");
//     setToken(null);
//   };

//   const handleLogin = (newToken) => {
//     localStorage.setItem("token", newToken);
//     setToken(newToken);
//   };

//   // If not logged in, show login + register option
//   if (!token) {
//     return (
//       <div className="auth-container">
//         <h1>Happy Thoughts</h1>
//         <h2>Please log in to share and see thoughts</h2>
//         <LoginForm onLogin={handleLogin} />
//         <button onClick={() => setShowRegisterModal(true)}>Register</button>

//         {showRegisterModal && (
//           <div className="modal-overlay" onClick={() => setShowRegisterModal(false)}>
//             <div className="modal-content" onClick={(e) => e.stopPropagation()}>
//               <button className="close-button" onClick={() => setShowRegisterModal(false)}>
//                 &times;
//               </button>
//               <h3>Register</h3>
//               <RegisterForm />
//             </div>
//           </div>
//         )}
//       </div>
//     );
//   }

//   // If logged in, show the main app
//   return (
//     <>
//       <header>
//         <h1>Happy Thoughts</h1>
//         <h2>Share your happy thoughts with us!</h2>
//         <button onClick={handleLogout}>Logout</button>
//       </header>

//       <div className="container">
//         <NewThoughtBoard />
//         <OlderThoughts likedThoughts={likedThoughts} setLikedThoughts={setLikedThoughts} />
//         <LikedThoughts likedThoughts={likedThoughts} />
//         <RandomThoughts />
//       </div>
//     </>
//   );
// };

// export default App;
