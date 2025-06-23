import React, { useEffect, useState } from 'react'
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
} from '@mui/material'

const getCurrentUserIdFromToken = () => {
  const token = localStorage.getItem('token')
  if (!token) return null
  try {
    const payload = JSON.parse(atob(token.split('.')[1]))
    return payload.userId || payload.id
  } catch {
    return null
  }
}

const OlderThoughts = () => {
  const [thoughts, setThoughts] = useState([])
  const [loading, setLoading] = useState(true)
  const [editOpen, setEditOpen] = useState(false)
  const [editText, setEditText] = useState('')
  const [editId, setEditId] = useState(null)
  const [likedSet, setLikedSet] = useState(() => {
    const stored = JSON.parse(localStorage.getItem('likedThoughts')) || []
    return new Set(stored)
  })

  const currentUserId = getCurrentUserIdFromToken()

  useEffect(() => {
    fetch('https://js-project-happy-thoughts.onrender.com/thoughts')
      .then(r => r.json())
      .then(data => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setThoughts(sorted)
        setLoading(false)
      })
  }, [])

  const handleLike = id => {
    if (likedSet.has(id)) return
    setThoughts(prev =>
      prev.map(t => (t._id === id ? { ...t, hearts: t.hearts + 1 } : t))
    ) 
    fetch(
      `https://js-project-happy-thoughts.onrender.com/thoughts/${id}/like`,
      { method: 'PATCH' }
    ).then(updated => {
        setThoughts(prev =>
          prev.map(t => (t._id === id ? updated : t))
        )
        const newLiked = new Set(likedSet)
        newLiked.add(id)
        setLikedSet(newLiked)
        localStorage.setItem(
          'likedThoughts',
          JSON.stringify([...newLiked])
        )
      })
      .catch(console.error)
  }

  const handleEditSave = () => {
    const token = localStorage.getItem('token')
    if (!token || !editText.trim()) return
    fetch(
      `https://js-project-happy-thoughts.onrender.com/thoughts/${editId}`,
      {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ message: editText }),
      }
    )
      .then(r => r.json())
      .then(updated =>
        setThoughts(prev =>
          prev.map(t =>
            t._id === editId ? { ...t, message: updated.message } : t
          )
        )
      )
      .finally(() => {
        setEditOpen(false)
        setEditText('')
        setEditId(null)
      })
      .catch(console.error)
  }

  const handleDelete = id => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(
      `https://js-project-happy-thoughts.onrender.com/thoughts/${id}`,
      {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${token}` },
      }
    ).then(() => {
      setThoughts(prev => prev.filter(t => t._id !== id))
    })
  }

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
        thoughts.map(thought => {
          const ownerId =
            typeof thought.user === 'object'
              ? thought.user._id
              : thought.user
          const isOwner = ownerId === currentUserId

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
                    setEditId(thought._id)
                    setEditText(thought.message)
                    setEditOpen(true)
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
          )
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
            onChange={e => setEditText(e.target.value)}
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
  )
}

export default OlderThoughts
