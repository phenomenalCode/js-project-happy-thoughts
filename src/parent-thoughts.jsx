import { useState, useEffect } from "react";
import NewThoughtBoard from "./NewThoughtBoard";
import OlderThoughts      from "./OlderThoughts";

export default function ThoughtsPage() {
  const [thoughts, setThoughts] = useState([]);

  // fetch the latest 4 thoughts once
  useEffect(() => {
    fetch("https://happy-thoughts-api-4ful.onrender.com/thoughts")
      .then(res => res.json())
      .then(data => {
        const sorted = data.sort(
          (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
        );
        setThoughts(sorted.slice(0, 4));
      });
  }, []);

  return (
    <>
      <NewThoughtBoard
        prependThought={(t) => setThoughts(prev => [t, ...prev.slice(0, 3)])}
      />
      <OlderThoughts
        thoughts={thoughts}
        setThoughts={setThoughts}
      />
    </>
  );
}
