import { useState } from 'react';

const ThoughtBoard = () => {
  const questionArr = [
    'How is your day going?',
    'Are you motivated to reach your goals?',
    'Do you love to code?',
    'Do you like jazz?'
  ];

  const [questionIndex, setQuestionIndex] = useState(0);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);

  const handleSubmit = (e) => {
    e.preventDefault();
    const trimmed = message.trim();
    if (!message.trim() === '') return;

    const currentQuestion = questionArr[questionIndex];
    setMessages([...messages, { text: message, question: currentQuestion }]);
    setMessage('');
  
  };

  const handleQuestion = () => {
    setQuestionIndex((prevIndex) => (prevIndex + 1) % questionArr.length);
  };

  return (
    <div className='questions'>
      <h1>{questionArr[questionIndex]}</h1>

    <h3>Your Submitted Messages</h3>
<ul>
  {messages.map((entry, i) => (
    <li key={i}>
      <strong>{entry.question}</strong><br />{entry.text}
    </li>
  ))}
</ul>


      <textarea
        value={message} 
        onChange={(e) => setMessage(e.target.value)}
      />

      <div>
        <button onClick={handleSubmit}>Submit</button>
        <button onClick={handleQuestion}>Next Question</button>
      </div>
    </div>
  );
};

export default ThoughtBoard;
