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

  const fetchThoughts = () => {
    setLoading(true)
    fetch('https://js-project-happy-thoughts.onrender.com/thoughts')
      .then(r => r.json())
      .then(data => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        )
        setThoughts(sorted)
        setLoading(false)
      })
  }

  const handleLike = id => {
    if (likedSet.has(id)) return
    setThoughts(prev =>
      prev.map(t => (t._id === id ? { ...t, hearts: t.hearts + 1 } : t))
    )
    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${id}/like`, {
      method: 'POST',
    })
      .then(r => r.json())
      .then(updated => {
        setThoughts(prev =>
          prev.map(t => (t._id === id ? updated : t))
        )
        const newLiked = new Set(likedSet).add(id)
        setLikedSet(newLiked)
        localStorage.setItem(
          'likedThoughts',
          JSON.stringify([...newLiked])
        )
      })
      .catch(console.error)
  }

  const handleEdit = thought => {
    setEditId(thought._id)
    setEditText(thought.message)
    setEditOpen(true)
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
      .then(r => {
        if (!r.ok) throw new Error(r.statusText)
        return r.json()
      })
      .then(updated => {
        setThoughts(prev =>
          prev.map(t =>
            t._id === editId ? { ...t, message: updated.message } : t
          )
        )
        setEditOpen(false)
        setEditText('')
        setEditId(null)
      })
      .catch(console.error)
  }

  const handleDelete = id => {
    const token = localStorage.getItem('token')
    if (!token) return
    fetch(`https://js-project-happy-thoughts.onrender.com/thoughts/${id}`, {
      method: 'DELETE',
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setThoughts(prev => prev.filter(t => t._id !== id))
    })
  }

  useEffect(() => {
    fetchThoughts()
  }, [])

  return (
    <Box>
      <Typography variant="h4" align="center">
        Recent Server Thoughts
      </Typography>

      {loading ? (
        <Typography align="center">Loading…</Typography>
      ) : (
        thoughts.map(thought => {
          // normalize user ID
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
                onClick={() => handleLike(thought._id)}
                disabled={likedSet.has(thought._id)}
                sx={{ mt: 1, backgroundColor: 'pink' }}
              >
                {likedSet.has(thought._id) ? 'Liked' : '💖 Like'}
              </Button>

              <Box mt={1}>
                <Button
                  variant="outlined"
                  onClick={() => handleEdit(thought)}
                  disabled={!isOwner}
                  sx={{ mr: 1 }}
                >
                  Edit
                </Button>
                <Button
                  variant="outlined"
                  onClick={() => handleDelete(thought._id)}
                  disabled={!isOwner}
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
            value={editText}
            onChange={e => setEditText(e.target.value)}
            minRows={2}
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
