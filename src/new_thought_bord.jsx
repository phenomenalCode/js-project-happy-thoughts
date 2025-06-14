import { useState } from "react";
import React from "react";
import { Box, Button, TextField, Typography } from "@mui/material";

const NewThoughtBoard = () => {
  const questionArr = [
    "How is your day going?",
    "Are you motivated to reach your goals?",
    "Do you love to code?",
    "Do you like jazz?",
  ];
  const [messages, setMessages] = useState([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [message, setMessage] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (message.trim() === "") return;

    const currentQuestion = questionArr[questionIndex];
    setMessages([...messages, { text: message, question: currentQuestion }]);
    setMessage("");

    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message }),
    });
  };

  const handleQuestion = () => {
    setQuestionIndex((prevIndex) => (prevIndex + 1) % questionArr.length);
  };

  return (
    <Box
      sx={{
        border: "2px solid black",
        backgroundColor: "#eaeaeae6", // Updated background color to grey
        padding: 3,
        borderRadius: 2,
        maxWidth: "600px",
        margin: "auto",
        textAlign: "center",
        fontSize: "1.5rem",
        boxShadow:  "5px 8px rgba(0, 0, 0, 10)",
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
            {entry.text}
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
        <Button  variant="contained"
  sx={{
    backgroundColor: "#fc7685", 
    borderRadius:"99999",// Ensures button is pink
    "&:hover": { backgroundColor: "#secondary" }, // Slightly darker pink on hover
  }} onClick={handleSubmit}>
          Send a happy thought❤️
        </Button>
        <Button sx={{
          backgroundColor: "#fc7685",
          color: "white", 
          borderRadius:"99999",// Ensures button is pink
          "&:hover": { backgroundColor: "#secondary" }, // Slightly darker pink on hover
        }} onClick={handleQuestion}>
          Next Question
        </Button>
      </Box>
    </Box>
  );
};

export default NewThoughtBoard;