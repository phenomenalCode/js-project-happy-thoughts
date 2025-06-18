import React, { useState, useEffect } from 'react';

const LikedThoughts = () => {
  const [likedThoughts, setLikedThoughts] = useState([]);

  // Load on mount
  useEffect(() => {
    const stored = JSON.parse(localStorage.getItem('likedThoughts')) || [];
    setLikedThoughts(stored);
  }, []);

  // Refresh handler
  const fetchThoughts = () => {
    const storedLikedThoughts = JSON.parse(localStorage.getItem('likedThoughts')) || [];
    setLikedThoughts(storedLikedThoughts);
  };

  return (
    <div className="liked-thoughts">
      <h2>Liked Thoughts</h2>

      {likedThoughts.length > 0 ? (
        likedThoughts.map((thought, idx) => (
          <div key={thought._id || idx}>
            <p>❤️ {thought.hearts}</p>
            <p>{thought.message}</p>
          </div>
        ))
      ) : (
        <p>No liked thoughts yet!</p>
      )}

      
      <button className="refresh-button" onClick={fetchThoughts}>
        Refresh Liked Thoughts
      </button>
    </div>
  );
};

export default LikedThoughts;
