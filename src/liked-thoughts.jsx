import React from 'react';

const LikedThoughts = ({ likedSet, allThoughts }) => {
  const likedThoughts = allThoughts.filter((t) => likedSet.has(t._id));

  return (
    <section
      className="liked-thoughts"
      aria-labelledby="liked-thoughts-heading"
      role="region"
    >
      <h2 id="liked-thoughts-heading" tabIndex="0">Liked Thoughts</h2>

      {likedThoughts.length > 0 ? (
        <ul aria-label="List of liked thoughts">
          {likedThoughts.map((thought) => (
            <li key={thought._id}>
              <p>
                <span role="img" aria-label="heart">❤️</span> {thought.hearts}
              </p>
              <p>{thought.message}</p>
            </li>
          ))}
        </ul>
      ) : (
        <p tabIndex="0">No liked thoughts yet!</p>
      )}
    </section>
  );
};

export default LikedThoughts;
