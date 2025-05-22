
import React, { useState, useEffect } from "react";


import NewThoughtBoard from "./new_thought_bord.jsx"
import OlderThoughts from "./older_thoughts.jsx"
import LikedThoughts from "./liked-thoughts.jsx"
import RandomThoughts from "./random-thoughts.jsx"
export const App = () => {
  const [likedThoughts, setLikedThoughts] = useState([]);
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('likedThoughts')) || [];
    setLikedThoughts(new Set(stored.map(t => t._id)));
  }, []);
  return (
    <>
      <h1>Happy Thoughts</h1>
      <h2>Share your happy thoughts with us!</h2>
      <div className="container">
        <NewThoughtBoard />
        <OlderThoughts 
          likedThoughts={likedThoughts} 
          setLikedThoughts={setLikedThoughts} 
        />
        <LikedThoughts likedThoughts={likedThoughts} />
        <RandomThoughts /> {/* If you want to show random thoughts */}
      </div>
    </>
  );
};
export default App
// import React, { useState, useEffect } from 'react';