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
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState('');
  const [editId, setEditId] = useState(null);
  const currentUserId = getCurrentUserIdFromToken();

  const handleLike = (thoughtId) => {
    if (!thoughtId || likedSet.has(thoughtId)) return;

    const token = localStorage.getItem('token');
    if (!token) return;

    setThoughts((prev) =>
      prev.map((t) =>
        t._id === thoughtId ? { ...t, hearts: (t.hearts || 0) + 1 } : t
      )
    );

    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}/like`, {
      method: 'PATCH',
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((updatedThought) => {
        setThoughts((prev) =>
          prev.map((t) =>
            t._id === thoughtId
              ? { ...t, ...updatedThought, user: t.user || updatedThought.user }
              : t
          )
        );
        const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
        const updatedLiked = [...new Set([...currentLiked, updatedThought._id])];
        localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
        setLikedSet(new Set(updatedLiked));
      })
      .catch(console.error);
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
    if (!token) return;

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
      role="region"
      aria-labelledby="recent-thoughts-heading"
    >
      <Typography
        variant="h4"
        textAlign="center"
        gutterBottom
        id="recent-thoughts-heading"
      >
        Recent Server Thoughts
      </Typography>

      {thoughts.length === 0 ? (
        <Typography textAlign="center">No thoughts yet.</Typography>
      ) : (
        thoughts
          .filter(Boolean)
          .map((thought) => {
            const ownerId =
              typeof thought.user === 'string' ? thought.user : thought.user?._id;
            const isOwner = ownerId === currentUserId;

            return (
              <Box
                key={thought._id}
                p={2}
                mb={2}
                border="1px solid #ddd"
                borderRadius="8px"
                role="article"
                aria-label={`Thought message with ${thought.hearts || 0} hearts`}
              >
                <Typography aria-label="Number of hearts">❤️ {thought.hearts}</Typography>
                <Typography aria-label="Thought message">{thought.message}</Typography>

                <Button
                  variant="contained"
                  disabled={likedSet.has(thought._id)}
                  onClick={() => handleLike(thought._id)}
                  sx={{
                    mt: 1,
                    backgroundColor: 'pink',
                    '&:hover': { backgroundColor: '#fc7685' },
                  }}
                  aria-label={
                    likedSet.has(thought._id)
                      ? 'Already liked'
                      : `Like thought: ${thought.message}`
                  }
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
                    aria-label={
                      isOwner ? `Edit thought: ${thought.message}` : 'Edit disabled'
                    }
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
                    aria-label={
                      isOwner ? `Delete thought: ${thought.message}` : 'Delete disabled'
                    }
                  >
                    Delete
                  </Button>
                </Box>
              </Box>
            );
          })
      )}

      <Dialog
        open={editOpen}
        onClose={() => setEditOpen(false)}
        aria-labelledby="edit-thought-dialog-title"
      >
        <DialogTitle id="edit-thought-dialog-title">Edit Thought</DialogTitle>
        <DialogContent>
          <TextField
            fullWidth
            multiline
            minRows={2}
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
            autoFocus
            aria-label="Edit thought message"
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)} aria-label="Cancel edit">
            Cancel
          </Button>
          <Button onClick={handleEditSave} variant="contained" aria-label="Save edited thought">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OlderThoughts;
