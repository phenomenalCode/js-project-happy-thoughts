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
    if (!token) return console.error('No token found. Please log in.');

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
      .then((updated) => {
        setThoughts((prev) =>
          prev.map((t) =>
            t._id === thoughtId
              ? { ...t, ...updated, user: t.user || updated.user }
              : t
          )
        );

        const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
        const updatedLiked = [...new Set([...currentLiked, updated._id])];
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
    if (!token) return console.error('No token found. Please log in.');

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
      component="section"
      aria-labelledby="recent-thoughts-heading"
      role="region"
      sx={{
        borderRadius: '1rem',
        boxShadow: '5px 8px rgba(0,0,0,0.1)',
        maxWidth: 600,
        margin: '2rem auto',
        padding: 2,
        backgroundColor: '#eaeaeae6',
          minHeight: '400px'
      }}
    >
      <Typography
        variant="h4"
        textAlign="center"
        gutterBottom
        id="recent-thoughts-heading"
        component="h2"
      >
        Recent Server Thoughts
      </Typography>

      {loading ? (
        <Typography textAlign="center">Loading thoughts...</Typography>
      ) : (
        thoughts.filter(Boolean).map((thought) => {
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
              minHeight="120px"
              aria-label={`Thought by ${thought.user?.username || 'user'}`}
              role="article"
            >
              <Typography variant="h6" component="h3" aria-label="Heart count">
                ❤️ {thought.hearts}
              </Typography>
              <Typography>{thought.message}</Typography>

              <Button
                variant="contained"
                disabled={likedSet.has(thought._id)}
                onClick={() => handleLike(thought._id)}
                aria-label={
                  likedSet.has(thought._id)
                    ? 'You already liked this thought'
                    : 'Like this thought'
                }
                sx={{
                  mt: 1,
                backgroundColor: "#c62839", // Darker red for better contrast
borderRadius: "99999px",
"&:hover": {
  backgroundColor: "#a61d2e" // Darker on hover
},

                }}
              >
                {likedSet.has(thought._id) ? 'Liked' : '💖 Like'}
              </Button>

              <Box mt={1} display="flex" gap={1}>
                <Button
                  variant="outlined"
                  disabled={!isOwner}
                  onClick={() => {
                    setEditId(thought._id);
                    setEditText(thought.message);
                    setEditOpen(true);
                  }}
                  aria-label="Edit your thought"
                  sx={{
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
                  aria-label="Delete your thought"
                  sx={{
                    backgroundColor: '#78000c',
                    color: '#fff',
                    '&:hover': { backgroundColor: '#510008' },
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
          <Button onClick={handleEditSave} variant="contained" aria-label="Save changes">
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OlderThoughts;
