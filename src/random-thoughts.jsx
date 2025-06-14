import React, { useState, useEffect } from "react";
import { Button, Box, Typography } from "@mui/material";

const RandomThoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [likedThoughts, setLikedThoughts] = useState(new Set());

  const fetchRandomThoughts = () => {
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
      .then((res) => res.json())
      .then((data) => {
        const shuffled = data.sort(() => 0.5 - Math.random());
        const randomFour = shuffled.slice(0, 4);
        setThoughts(randomFour);
      })
      .catch((error) => console.error("Error fetching thoughts:", error));
  };

  const handleLike = (thoughtId) => {
    if (likedThoughts.has(thoughtId)) return;

    setThoughts((prevThoughts) =>
      prevThoughts.map((thought) =>
        thought._id === thoughtId
          ? { ...thought, hearts: thought.hearts + 1 }
          : thought
      )
    );

    fetch(`https://happy-thoughts-api-4ful.onrender.com/thoughts/${thoughtId}/like`, {
      method: "POST",
    })
      .then((res) => res.json())
      .then((updatedThought) => {
        setThoughts((prevThoughts) =>
          prevThoughts.map((thought) =>
            thought._id === thoughtId ? updatedThought : thought
          )
        );

        const currentLiked = JSON.parse(localStorage.getItem("likedThoughts")) || [];
        if (!currentLiked.some((t) => t._id === thoughtId)) {
          const updatedLiked = [...currentLiked, updatedThought];
          localStorage.setItem("likedThoughts", JSON.stringify(updatedLiked));
          setLikedThoughts(new Set(updatedLiked.map((t) => t._id)));
        }
      });
  };

  useEffect(() => {
    fetchRandomThoughts();
    const liked = JSON.parse(localStorage.getItem("likedThoughts")) || [];
    setLikedThoughts(new Set(liked.map((t) => t._id)));
  }, []);

  return (
    <Box
      sx={{
        borderRadius: "1rem",
        boxShadow: "5px 8px rgba(0, 0, 0, 0.1)",
        fontFamily: "Segoe UI, Tahoma, Geneva, Verdana, sans-serif",
        maxWidth: 600,
        margin: "2rem auto",
        padding: 2,
        backgroundColor: "#f9f9f9",
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom>
        Random Thoughts
      </Typography>
      {thoughts.length > 0 ? (
        thoughts.map((thought) => (
          <Box key={thought._id} p={2} mb={2} border="1px solid #ddd" borderRadius="8px">
            <Typography>❤️ {thought.hearts}</Typography>
            <Typography>{thought.message}</Typography>
            <Button
              variant="contained"
              onClick={() => handleLike(thought._id)}
              disabled={likedThoughts.has(thought._id)}
              sx={{
                mt: 1,
                backgroundColor: "pink",
                "&:hover": { backgroundColor: "#fc7685" },
              }}
            >
              {likedThoughts.has(thought._id) ? "Liked" : "💖 Like"}
            </Button>
          </Box>
        ))
      ) : (
        <Typography>No thoughts available</Typography>
      )}
     
     <Box textAlign="center" mt={2}>
 <Box textAlign="center" mt={2}>
  <Box textAlign="center" mt={2}>
  <Button
    variant="outlined"
    onClick={fetchRandomThoughts}
    sx={{
      backgroundColor: '#ffb6c1',
      color: '#e60026',
      border: '2px solid #e60026',
      padding: '0.75rem 1.5rem',
      fontSize: '1rem',
      borderRadius: '0.5rem',
      cursor: 'pointer',
      marginTop: '1rem',
      display: 'block',
      textAlign: 'center',
      transition: 'background-color 0.3s ease, color 0.3s ease',
      '&:hover': {
        backgroundColor: '#ffc8d4',
        color: '#a3001b',
      }
    }}
  >
     Refresh Thoughts
  </Button>
</Box>

</Box>
</Box>

      </Box>
  );
};

export default RandomThoughts;
