import { useEffect, useState } from 'react';
import { Box, Typography, Button } from '@mui/material';

const OlderThoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  const [likedThoughts, setLikedThoughts] = useState(new Set());
  const [loading, setLoading] = useState(true);

  const fetchThoughts = () => {
    
    setLoading(true);
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
      .then(res => res.json())
      .then(data => {
        const sortedByTime = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setThoughts(sortedByTime.slice(0, 4));
        setLoading(false);
      });
  };

  const handleLike = (thoughtId) => {
    if (likedThoughts.has(thoughtId)) return;

    setThoughts(prevThoughts =>
      prevThoughts.map(thought =>
        thought._id === thoughtId ? { ...thought, hearts: thought.hearts + 1 } : thought
      )
    );

    fetch(`
https://happy-thoughts-api-4ful.onrender.com/thoughts/${thoughtId}/like`, {
      method: 'POST'
    })
      .then(res => res.json())
      .then(updatedThought => {
        setThoughts(prevThoughts =>
          prevThoughts.map(thought =>
            thought._id === thoughtId ? updatedThought : thought
          )
        );

        const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
        if (!currentLiked.some(t => t._id === thoughtId)) {
          const updatedLiked = [...currentLiked, updatedThought];
          localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
          setLikedThoughts(new Set(updatedLiked.map(t => t._id)));
        }
      });
  };

  useEffect(() => {
    fetchThoughts();
    const liked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
    setLikedThoughts(new Set(liked.map(thought => thought._id)));
  }, []);

  return (
    <Box
      sx={{
        borderRadius: '1rem',
        boxShadow: '5px 8px rgba(0, 0, 0, 10)',
        fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
        maxWidth: 600,
        margin: '2rem auto',
        padding: 2,
        backgroundColor: '#eaeaeae6',
      }}
    >
      <Typography variant="h4" textAlign="center" gutterBottom>
        Recent Server Thoughts
      </Typography>
      {loading ? (
        <Typography textAlign="center">Loading thoughts...</Typography>
      ) : (
        thoughts.map(thought => (
          <Box key={thought._id} p={2} mb={2} border="1px solid #ddd" borderRadius="8px">
            <Typography>❤️ {thought.hearts}</Typography>
            <Typography>{thought.message}</Typography>
            <Button
  variant="contained"
  onClick={() => handleLike(thought._id)}
  disabled={likedThoughts.has(thought._id)}
  sx={{ mt: 1, backgroundColor: 'pink', '&:hover': { backgroundColor: '#fc7685' } }}
>
  {likedThoughts.has(thought._id) ? 'Liked' : '💖 Like'}
</Button>
          </Box>
        ))
      )}
    </Box>
  );
};

export default OlderThoughts;
