import React, { useState } from "react";
import {
  Box,
  Button,
  TextField,
  Typography,
  List,
  ListItem,
  ListItemText,
} from "@mui/material";

const NewThoughtBoard = ({ prependThought }) => {
  const questionArr = [
    "How is your day going?",
    "Are you motivated to reach your goals?",
    "Do you love to code?",
    "Do you like jazz?",
  ];

  const getCurrentUserIdFromToken = () => {
    const token = localStorage.getItem("token");
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split(".")[1]));
      return payload.userId ?? null;
    } catch {
      return null;
    }
  };

  const user = getCurrentUserIdFromToken();
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const currentQuestion = questionArr[questionIndex];
    const token = localStorage.getItem("token");

    fetch("https://js-project-happy-thoughts.onrender.com/thoughts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((newThought) => {
        const thoughtWithUser = {
          _id: newThought._id,
          message: newThought.message,
          hearts: newThought.hearts ?? 0,
          createdAt: newThought.createdAt ?? new Date(),
          category: newThought.category ?? "General",
          tags: newThought.tags ?? [],
          user: newThought.user ?? user,
        };

        window.dispatchEvent(new Event("thoughtAdded"));

        const frontEndThought = {
          ...thoughtWithUser,
          question: currentQuestion,
        };

        setMessages((prev) => [...prev, frontEndThought]);

        if (prependThought) {
          prependThought(frontEndThought);
        }

        setMessage("");
      })
      .catch((err) => {
        console.error("Failed to submit thought:", err);
      });
  };

  const handleQuestion = () => {
    setQuestionIndex((prevIndex) => (prevIndex + 1) % questionArr.length);
  };

  return (
    <Box
      component="section"
      role="region"
      aria-labelledby="new-thought-heading"
      sx={{
        border: "2px solid black",
        backgroundColor: "#eaeaeae6",
        padding: 3,
        borderRadius: 2,
        maxWidth: 600,
        margin: "auto",
        textAlign: "center",
        fontSize: "1.5rem",
        boxShadow: "5px 8px rgba(0, 0, 0, 0.1)",
      }}
    >
      {/* Fixed heading order */}
      {/* <Typography
        variant="h2"
        gutterBottom
        id="new-thought-heading"
        aria-live="polite"
        sx={{
          minHeight: "3.6rem",
          lineHeight: 1.2,
        }}
      >
        {questionArr[questionIndex]}
      </Typography> */}
      <Typography
  variant="h2"
  gutterBottom
  id="new-thought-heading"
  aria-live="polite"
  sx={{
    minHeight: "3.6rem",
    lineHeight: 1.2,
    fontFamily: 'system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  }}
>
  {questionArr[questionIndex]}
</Typography>


      <Typography variant="h3" gutterBottom>
        Your Submitted Messages
      </Typography>

      <List aria-label="Your submitted thoughts">
        {messages.map((entry, i) => (
          <ListItem key={i} alignItems="flex-start">
            <ListItemText primary={entry.question} secondary={entry.message} />
          </ListItem>
        ))}
      </List>

      <form onSubmit={handleSubmit}>
        <TextField
          fullWidth
          variant="outlined"
          label="Type your message"
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          sx={{ marginBottom: 2 }}
        />

        <Box display="flex" justifyContent="center" gap={2}>
          <Button
            type="submit"
            variant="contained"
            disabled={!user || message.trim() === ""}
            sx={{
              backgroundColor: "#c62839",
              color: "white",
              borderRadius: "99999px",
              "&:hover": {
                backgroundColor: "#a61d2e",
              },
            }}
          >
            Send a happy thought ❤️
          </Button>
          <Button
            type="button"
            onClick={handleQuestion}
            sx={{
              backgroundColor: "#c62839",
              color: "white",
              borderRadius: "99999px",
              "&:hover": {
                backgroundColor: "#a61d2e",
              },
            }}
          >
            Next Question
          </Button>
        </Box>
      </form>
    </Box>
  );
};

export default NewThoughtBoard;