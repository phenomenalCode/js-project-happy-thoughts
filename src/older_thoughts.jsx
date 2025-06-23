import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material';

const getCurrentUserIdFromToken = () => {
  const token = localStorage.getItem('token');
  if (!token) return null;
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    return payload.userId || payload.id || null;
  } catch {
    return null;
  }
};

const OlderThoughts = ({ likedSet, setLikedSet, thoughts, setThoughts }) => {
  const [loading, setLoading] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [editId, setEditId] = useState(null);

  const currentUserId = getCurrentUserIdFromToken();

  const handleLike = (thoughtId) => {
    if (!thoughtId || likedSet.has(thoughtId)) return;

    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    // Optimistic UI update
    setThoughts((prevThoughts) =>
      prevThoughts.map((thought) =>
        thought._id === thoughtId
          ? { ...thought, hearts: (thought.hearts || 0) + 1 }
          : thought
      )
    );

    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}/like`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((updatedThought) => {
        setThoughts((prevThoughts) =>
          prevThoughts.map((thought) =>
            thought._id === thoughtId
              ? { ...thought, ...updatedThought, user: thought.user || updatedThought.user }
              : thought
          )
        );

        // Update localStorage and likedSet
        const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
        const updatedLiked = [...new Set([...currentLiked, updatedThought._id])];
        localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
        setLikedSet(new Set(updatedLiked));
      })
      .catch((err) => console.error('Like error:', err));
  };

  const handleEditSave = () => {
    const token = localStorage.getItem('token');
    if (!token || !editText.trim()) return;

    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${editId}`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: editText }),
    })
      .then((res) => res.json())
      .then((updated) => {
        setThoughts((prev) =>
          prev.map((t) => (t._id === editId ? { ...t, message: updated.message } : t))
        );
        setEditOpen(false);
        setEditText('');
        setEditId(null);
      })
      .catch(console.error);
  };

  const handleDelete = (thoughtId) => {
    const token = localStorage.getItem('token');
    if (!token) {
      console.error('No token found. Please log in.');
      return;
    }

    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then(() => {
        setThoughts((prev) => prev.filter((t) => t._id !== thoughtId));
      })
      .catch(console.error);
  };

  return (
    <Box
      sx={{
        borderRadius: '1rem',
        boxShadow: '5px 8px rgba(0,0,0,0.1)',
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
        thoughts
          .filter(Boolean)
          .map((thought) => {
            // Extract ownerId correctly whether thought.user is string or object
            const ownerId = thought.user
              ? typeof thought.user === 'string'
                ? thought.user
                : thought.user._id
              : null;

            const isOwner = ownerId === currentUserId;

            // Debug logs (remove in production)
            // console.log('Thought user:', thought.user, 'OwnerId:', ownerId, 'CurrentUserId:', currentUserId, 'isOwner:', isOwner);

            return (
              <Box
                key={thought._id}
                p={2}
                mb={2}
                border="1px solid #ddd"
                borderRadius="8px"
              >
                <Typography>❤️ {thought.hearts}</Typography>
                <Typography>{thought.message}</Typography>

                <Button
                  variant="contained"
                  disabled={likedSet.has(thought._id)}
                  onClick={() => handleLike(thought._id)}
                  sx={{
                    mt: 1,
                    backgroundColor: 'pink',
                    '&:hover': { backgroundColor: '#fc7685' },
                  }}
                >
                  {likedSet.has(thought._id) ? 'Liked' : '💖 Like'}
                </Button>

                <Box mt={1}>
                  <Button
                    variant="outlined"
                    disabled={!isOwner}
                    onClick={() => {
                      setEditId(thought._id);
                      setEditText(thought.message);
                      setEditOpen(true);
                    }}
                    sx={{
                      mr: 1,
                      backgroundColor: '#007BFF',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#0056b3' },
                      '&:disabled': {
                        backgroundColor: '#a6c8ff',
                        color: '#e1e5ea',
                      },
                    }}
                  >
                    Edit
                  </Button>
                  <Button
                    variant="outlined"
                    disabled={!isOwner}
                    onClick={() => handleDelete(thought._id)}
                    sx={{
                      backgroundColor: '#dc3545',
                      color: '#fff',
                      '&:hover': { backgroundColor: '#a71d2a' },
                      '&:disabled': {
                        backgroundColor: '#f5aeb4',
                        color: '#fbe9eb',
                      },
                    }}
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            );
          })
      )}

      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Thought</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OlderThoughts;
