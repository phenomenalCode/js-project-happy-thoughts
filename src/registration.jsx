import { useState } from 'react';

const RegisterForm = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setMessage('');

    try {
      const res = await fetch('https://js-project-happy-thoughts.onrender.com/auth/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.message || 'Registration failed');
      setMessage('🎉 Registered successfully!');
    } catch (err) {
      setMessage(`❌ ${err.message}`);
    }
  };

  return (
    <form onSubmit={handleRegister} aria-labelledby="register-form-title">
      <h2 id="register-form-title">Register</h2>

      <label htmlFor="username-input">Username</label>
      <input
        id="username-input"
        type="text"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        required
        aria-required="true"
        aria-describedby="username-desc"
        placeholder="Enter your username"
      />
      <small id="username-desc" style={{ display: 'block', marginBottom: '1rem' }}>
        Choose a unique username.
      </small>

      <label htmlFor="password-input">Password</label>
      <input
        id="password-input"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
        aria-required="true"
        aria-describedby="password-desc"
        placeholder="Enter your password"
      />
      <small id="password-desc" style={{ display: 'block', marginBottom: '1rem' }}>
        Use at least 6 characters.
      </small>

      <button type="submit" aria-label="Register new account">Register</button>

      {message && (
        <p role={message.startsWith('❌') ? 'alert' : 'status'} aria-live="polite" style={{ marginTop: '1rem' }}>
          {message}
        </p>
      )}
    </form>
  );
};

export default RegisterForm;
