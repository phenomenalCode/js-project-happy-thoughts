// const SubmitThought = ({ thought, setThoughts }) => {
//     const [message, setMessage] = useState('');
//     const [thoughts, setThoughts] = useState([]);

//   const handleSubmit = (e) => {
//     e.preventDefault();}
//     const Arr = [...thoughts, message];
//     setThoughts(thoughts);  
//     <container><div><h1>How is your day going?</h1>
//     <p>{message}</p>
//     <text value={message} onChange={(e) => setMessage(e.target.value)} ></text> 
// <button onClick={handleSubmit}>Submit</button></div>
// </container>}

import { useState } from 'react'; // Importing React's useState hook for state management

const SubmitThought = ({ thoughts, setThoughts }) => {
    // Local state to store the message input
    const [message, setMessage] = useState('');

    // Function that handles form submission
    const handleSubmit = (e) => {
        e.preventDefault();

        // Trim to remove extra spaces; prevent empty submissions
        if (message.trim() === '') return;

        // Update the array of thoughts by adding the new message
        setThoughts([...thoughts, message]);

        // Clear the input field after submission
        setMessage(message);
    };

    return (
        <div> {/* Wrapper div for styling and structure */}
            <h1>How is your day going?</h1>

            {/* Display the currently typed message (before submission) */}
            <p>{message}</p>

            {/* Input field where the user enters their thought */}
            <textarea 
                value={message} // Controlled component: React manages its value
                onChange={(e) => setMessage(e.target.value)} // Update state as user types
            />

            {/* Submit button to add the thought */}
            <button onClick={handleSubmit}>Submit</button>
        </div>
    )};
export default SubmitThought;
