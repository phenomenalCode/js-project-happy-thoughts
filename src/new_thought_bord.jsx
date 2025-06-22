import React, { useState } from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

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
      console.log("User ID from token:", payload.userId);
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
    if (message.trim() === "") {
      console.warn("⚠️ Message is empty. Submission aborted.");
      return;
    }

    const currentQuestion = questionArr[questionIndex];
    const token = localStorage.getItem("token");

    console.log("📤 Submitting thought...");
    
    console.log("✍️ Message:", message);
    console.log("❓ Question:", currentQuestion);
    console.log("🔐 Token:", token);
    console.log("👤 User ID:", user);

    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify({ message }),
    })
      .then((res) => res.json())
      .then((newThought) => {
         console.log("✅ New thought submit:", newThought);
        const thoughtWithUser = {
          _id: newThought._id,
          message: newThought.message,
          hearts: newThought.hearts ?? 0,
          createdAt: newThought.createdAt ?? new Date(),
          category: newThought.category ?? "General",
          tags: newThought.tags ?? [],
          user: newThought.user ?? user,
        };
window.dispatchEvent(new Event('thoughtAdded'));

        const frontEndThought = {
          ...thoughtWithUser,
          question: currentQuestion, // UI only
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
      sx={{
        border: "2px solid black",
        backgroundColor: "#eaeaeae6",
        padding: 3,
        borderRadius: 2,
        maxWidth: "600px",
        margin: "auto",
        textAlign: "center",
        fontSize: "1.5rem",
        boxShadow: "5px 8px rgba(0, 0, 0, 10)",
      }}
    >
      <Typography variant="h4" gutterBottom>
        {questionArr[questionIndex]}
      </Typography>

      <Typography variant="h6" gutterBottom>
        Your Submitted Messages
      </Typography>
      <ul>
        {messages.map((entry, i) => (
          <li key={i}>
            <strong>{entry.question}</strong>
            <br />
            {entry.message}
          </li>
        ))}
      </ul>

      <TextField
        fullWidth
        variant="outlined"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        sx={{ marginBottom: 2 }}
      />

      <Box display="flex" justifyContent="center" gap={2}>
        <Button
          variant="contained"
          disabled={!user || message.trim() === ""}
          sx={{
            backgroundColor: "#fc7685",
            borderRadius: "99999px",
            "&:hover": { backgroundColor: "#e05568" },
          }}
          onClick={handleSubmit}
        >
          Send a happy thought❤️
        </Button>
        <Button
          sx={{
            backgroundColor: "#fc7685",
            color: "white",
            borderRadius: "99999px",
            "&:hover": { backgroundColor: "#e05568" },
          }}
          onClick={handleQuestion}
        >
          Next Question
        </Button>
      </Box>
    </Box>
  );
};

export default NewThoughtBoard;
