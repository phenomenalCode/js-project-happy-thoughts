import { useEffect, useState } from 'react';
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
    return payload.id || payload.userId;
  } catch (err) {
    console.error("Failed to decode token", err);
    return null;
  }
};

const OlderThoughts = () => {
  const [thoughts, setThoughts] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);
  const [likedThoughts, setLikedThoughts] = useState(() => {
  const stored = JSON.parse(localStorage.getItem('likedThoughts')) || [];
  return new Set(stored);
});

  const currentUserId = getCurrentUserIdFromToken();

  const fetchThoughts = () => {
    setLoading(true);
    fetch("https://js-project-happy-thoughts.onrender.com/thoughts")
      .then(res => res.json())
      .then(data => {
        const sortedByTime = data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setThoughts(sortedByTime);
        setLoading(false);
      });
  };

  // const handleLike = (thoughtId) => {
  //   if (!thoughtId || likedThoughts.has(thoughtId)) return;
   
  //   setThoughts(prev =>
  //     prev.map(t =>
  //       t._id === thoughtId ? { ...t, hearts: t.hearts + 1 } : t
  //     )
  //   );

  //   fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}/like`, {
  //     method: 'POST',
  //   })
  //     .then(res => res.json())
  //     .then(updated => {
  //       setThoughts(prev =>
  //         prev.map(t => (t._id === thoughtId ? updated : t))
  //       );
  //       const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
  //       const updatedLiked = [...currentLiked, updated];
  //       localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
  //       setLikedThoughts(new Set(updatedLiked.map(t => t._id)));
  //     });
  // };
  const handleLike = (thoughtId) => {
  if (!thoughtId || likedThoughts.has(thoughtId)) return;

  // Optimistic UI update
  setThoughts(prev =>
    prev.map(t =>
      t._id === thoughtId ? { ...t, hearts: t.hearts + 1 } : t
    )
  );

  fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}/like`, {
    method: 'POST',
  })
    .then(res => res.json())
    .then(updated => {
      // Update UI with correct data from backend
      setThoughts(prev =>
        prev.map(t => (t._id === thoughtId ? updated : t))
      );

      // Save only IDs
      const currentLiked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
      const updatedLiked = [...new Set([...currentLiked, updated._id])];

      localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
      setLikedThoughts(new Set(updatedLiked));
    })
    .catch(err => {
      console.error('Failed to like thought:', err);
    });
};


  const handleEdit = (thought) => {
    if (!thought?._id) return;
    setEditId(thought._id);
    setEditText(thought.message);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    if (!editId || !editText.trim()) return;

    const token = localStorage.getItem("token");
    if (!token) return;

    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${editId.trim()}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: editText }),
    })
      .then((res) => {
        if (res.status === 404) {
          alert("⚠️ This thought no longer exists.");
          setThoughts(prev => prev.filter(t => t._id !== editId));
          setEditOpen(false);
          return null;
        }
        if (!res.ok) throw new Error(`Edit failed: ${res.status}`);
        return res.json();
      })
      .then((updated) => {
        if (!updated) return;
        setThoughts(prev =>
          prev.map(t => (t._id === editId ? { ...t, message: updated.message } : t))
        );
        setEditOpen(false);
        setEditText("");
        setEditId(null);
      })
      .catch(err => console.error("❌ Edit error:", err));
  };

  const handleDelete = (thoughtId) => {
    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${thoughtId}`, {
      method: 'DELETE',
      headers: {
        Authorization: `Bearer ${localStorage.getItem('token')}`,
      }
    }).then(() => {
      setThoughts(prev => prev.filter(t => t._id !== thoughtId));
    });
  };

  useEffect(() => {
    fetchThoughts();
    const liked = JSON.parse(localStorage.getItem('likedThoughts')) || [];
    setLikedThoughts(new Set(liked.map(thought => thought._id)));

    // ✅ Listen for new thoughts added
    const handleThoughtAdded = () => {
      fetchThoughts();
    };

    window.addEventListener('thoughtAdded', handleThoughtAdded);

    return () => {
      window.removeEventListener('thoughtAdded', handleThoughtAdded);
    };
  }, []);

  useEffect(() => {
    if (editOpen) {
      const thoughtToEdit = thoughts.find(t => t._id === editId);
      if (thoughtToEdit) {
        setEditText(thoughtToEdit.message);
      }
    }
  }, [editOpen, editId, thoughts]);

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
                backgroundColor: 'pink',
                '&:hover': { backgroundColor: '#fc7685' },
              }}
            >
              {!thought._id
                ? 'Cannot Like'
                : likedThoughts.has(thought._id)
                ? 'Liked'
                : '💖 Like'}
            </Button>

            <Box mt={1}>
              <Button
                onClick={() => handleEdit(thought)}
                sx={{
                  mr: 1,
                  backgroundColor: '#007BFF',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#0056b3',
                  },
                  '&:disabled': {
                    backgroundColor: '#a6c8ff',
                    color: '#e1e5ea',
                  },
                }}
                variant="outlined"
                disabled={!thought._id}
              >
                Edit
              </Button>

              <Button
                onClick={() => handleDelete(thought._id)}
                sx={{
                  backgroundColor: '#dc3545',
                  color: '#FFFFFF',
                  '&:hover': {
                    backgroundColor: '#a71d2a',
                  },
                  '&:disabled': {
                    backgroundColor: '#f5aeb4',
                    color: '#fbe9eb',
                  },
                }}
                variant="outlined"
                disabled={!thought._id}
              >
                Delete
              </Button>
            </Box>
          </Box>
        ))
      )}

      {/* Edit Modal */}
      <Dialog open={editOpen} onClose={() => setEditOpen(false)}>
        <DialogTitle>Edit Thought</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            fullWidth
            variant="standard"
            value={editText ?? ''}
            onChange={(e) => setEditText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button
            onClick={handleEditSave}
            variant="contained"
            disabled={!editId || !editText.trim()}
          >
            Save
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OlderThoughts;
