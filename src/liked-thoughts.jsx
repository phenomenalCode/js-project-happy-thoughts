import React from 'react';

const LikedThoughts = ({ likedSet, allThoughts }) => {
  const likedThoughts = allThoughts.filter((t) => likedSet.has(t._id));

  return (
    <div className="liked-thoughts">
      <h2>Liked Thoughts</h2>
      {likedThoughts.length > 0 ? (
        likedThoughts.map((thought) => (
          <div key={thought._id}>
            <p>❤️ {thought.hearts}</p>
            <p>{thought.message}</p>
          </div>
        ))
      ) : (
        <p>No liked thoughts yet!</p>
      )}
    </div>
  );
};

export default LikedThoughts;
