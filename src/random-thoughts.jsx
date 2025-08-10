import React, { useEffect, useState } from "react";
import { Button, Box, Typography } from "@mui/material";

/**
 * RandomThoughts
 * Props:
 *  - likedSet: Set (or similar) containing liked thought IDs
 *  - setLikedSet: setter to replace likedSet (parent is responsible for storing a Set)
 */
const RandomThoughts = ({ likedSet, setLikedSet }) => {
  const [thoughts, setThoughts] = useState([]);

  const fetchRandomThoughts = async () => {
    try {
      const res = await fetch("https://js-project-happy-thoughts.onrender.com/thoughts");
      if (!res.ok) throw new Error(`Fetch error: ${res.status}`);
      const data = await res.json();
      const shuffled = data.sort(() => 0.5 - Math.random());
      setThoughts(shuffled.slice(0, 4));
    } catch (err) {
      console.error("Error fetching thoughts:", err);
    }
  };

  const handleLike = async (thoughtId) => {
    if (!thoughtId) return;
    if (likedSet && typeof likedSet.has === "function" && likedSet.has(thoughtId)) return;

    const token = localStorage.getItem("token");
    if (!token) {
      console.error("No token found. Please log in to like thoughts.");
      return;
    }

    // optimistic increment 
    setThoughts((prev) =>
      prev.map((t) => (t && t._id === thoughtId ? { ...t, hearts: (t.hearts || 0) + 1 } : t))
    );

    try {
      const res = await fetch(
        `https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}/like`,
        {
          method: "PATCH",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!res.ok) throw new Error(`Like failed: ${res.status}`);
      const updated = await res.json();

      // merge server response 
      setThoughts((prev) =>
        prev.map((t) => (t && t._id === thoughtId ? { ...t, ...updated, user: t.user || updated.user } : t))
      );

      // Persist likedThoughts and update parent set
      const currentLiked = JSON.parse(localStorage.getItem("likedThoughts")) || [];
      const updatedLiked = [...new Set([...currentLiked, updated._id])];
      localStorage.setItem("likedThoughts", JSON.stringify(updatedLiked));
      setLikedSet(new Set(updatedLiked));
    } catch (err) {
     
      console.error("Like error:", err);
    }
  };

  useEffect(() => {
    fetchRandomThoughts();
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
      role="region"
      aria-labelledby="random-thoughts-heading"
    >
      <Typography variant="h4" component="h3" textAlign="center" gutterBottom id="random-thoughts-heading">
        Random Thoughts
      </Typography>

      {thoughts.length > 0 ? (
        thoughts.map((thought) => {
          if (!thought || !thought._id) return null;
          const liked = !!(likedSet && typeof likedSet.has === "function" && likedSet.has(thought._id));

          return (
            <Box
              key={thought._id}
              p={2}
              mb={2}
              border="1px solid #ddd"
              borderRadius="8px"
              role="article"
              aria-label={`Thought message with ${thought.hearts ?? 0} hearts`}
            >
              <Typography aria-label="Number of hearts">❤️ {thought.hearts ?? 0}</Typography>
              <Typography aria-label="Thought message">{thought.message}</Typography>

              <Button
                variant="contained"
                onClick={() => handleLike(thought._id)}
                disabled={likedSet.has(thought._id)}
                sx={{
                  mt: 1,
                  backgroundColor: "#c62839",
                  "&:hover": { backgroundColor: "#971a26" },
                }}
                aria-label={likedSet.has(thought._id) ? "You already liked this thought" : "Like this thought"}
              >
                {likedSet.has(thought._id) ? "Liked" : "💖 Like"}
              </Button>
            </Box>
          );
        })
      ) : (
        <Typography>No thoughts available</Typography>
      )}

      <Box textAlign="center" mt={2}>
        <Button
          variant="outlined"
          onClick={fetchRandomThoughts}
          sx={{
            backgroundColor: "#ffb6c1",
            color: "#e60026",
            border: "2px solid #e60026",
            padding: "0.75rem 1.5rem",
            fontSize: "1rem",
            borderRadius: "0.5rem",
            marginTop: "1rem",
            transition: "all 0.3s ease",
            "&:hover": {
              backgroundColor: "#ffc8d4",
              color: "#a3001b",
            },
          }}
          aria-label="Refresh random thoughts"
        >
          Refresh Thoughts
        </Button>
      </Box>
    </Box>
  );
};

export default RandomThoughts;
