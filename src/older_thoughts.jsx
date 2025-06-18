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
  const [likedThoughts, setLikedThoughts] = useState(new Set());
  const [loading, setLoading] = useState(true);
  const [editOpen, setEditOpen] = useState(false);
  const [editText, setEditText] = useState("");
  const [editId, setEditId] = useState(null);

  const currentUserId = getCurrentUserIdFromToken();

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
    if (!thoughtId || likedThoughts.has(thoughtId)) return;

    setThoughts(prevThoughts =>
      prevThoughts.map(thought =>
        thought._id === thoughtId ? { ...thought, hearts: thought.hearts + 1 } : thought
      )
    );

    fetch(`https://happy-thoughts-api-4ful.onrender.com/thoughts/${thoughtId}/like`, {
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
        const updatedLiked = [...currentLiked, updatedThought];
        localStorage.setItem('likedThoughts', JSON.stringify(updatedLiked));
        setLikedThoughts(new Set(updatedLiked.map(t => t._id)));
      });
  };

  const handleEdit = (thought) => {
    setEditText(thought.message);
    setEditId(thought._id);
    setEditOpen(true);
  };

  const handleEditSave = () => {
    const token = localStorage.getItem("token");

    fetch(`https://happy-thoughts-api-4ful.onrender.com/thoughts/${editId}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message: editText }),
    })
      .then(res => res.json())
      .then(updated => {
        setThoughts(prev =>
          prev.map(thought =>
            thought._id === editId ? { ...thought, message: updated.message } : thought
          )
        );
        setEditOpen(false);
        setEditText("");
        setEditId(null);
      })
      .catch(err => console.error("Failed to edit:", err));
  };

  const handleDelete = (thoughtId) => {
    fetch(`https://happy-thoughts-api-4ful.onrender.com/thoughts/${thoughtId}`, {
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
  }, []);
console.log(thoughts);

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
                 <Box key={ thought.message} p={2} mb={2} border="1px solid #ddd" borderRadius="8px">
                   <Typography>❤️ {thought.hearts}</Typography>
                   <Typography>{thought.message}</Typography>
       

            <Button
              variant="contained"
              onClick={() => handleLike(thought._id)}
              disabled={!thought._id || likedThoughts.has(thought._id)}
              sx={{ mt: 1, backgroundColor: 'pink', '&:hover': { backgroundColor: '#fc7685' } }}
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
  sx={{ mr: 1 }}
  variant="outlined"
  disabled={!(thought && thought._id)}
>
  Edit
</Button>

<Button
  onClick={() => handleDelete(thought._id)}
  color="error"
  variant="outlined"
  disabled={!(thought && thought._id)}
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
            value={editText}
            onChange={(e) => setEditText(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setEditOpen(false)}>Cancel</Button>
          <Button onClick={handleEditSave} variant="contained">Save</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default OlderThoughts;
