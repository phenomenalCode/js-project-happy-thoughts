import React, { useState, useEffect } from "react";

const RandomThoughts = () => {
  const [thoughts, setThoughts] = useState([]);

  // Fetch random thoughts function
  const fetchRandomThoughts = () => {
    fetch("https://happy-thoughts-ux7hkzgmwa-uc.a.run.app/thoughts")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        const randomFour = shuffled.slice(0, 4);
        setThoughts(randomFour);
      })
      .catch((error) => console.error("Error fetching thoughts:", error));
  };

  // Fetch thoughts when component mounts
  useEffect(() => {
    fetchRandomThoughts();
  }, []); // Empty dependency array ensures this runs only once on mount

  return (
    <div className="olderthoughts">
      <div className="random-thoughts">
        <h2>Random Thoughts</h2>
        {thoughts.length > 0 ? (
          thoughts.map((thought) => (
            <div key={thought._id}>
              <p>❤️ {thought.hearts}</p>
              <p>{thought.message}</p>
              
            </div>
          ))
        ) : (
          <p>No thoughts available</p>
        )}
        <button className="refresh-button" onClick={fetchRandomThoughts}>Refresh</button>
      </div>
    </div>
  );
};

export default RandomThoughts;
