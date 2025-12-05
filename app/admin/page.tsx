'use client';

import { useState } from 'react';

export default function Admin() {
  const [password, setPassword] = useState('');
  const [text, setText] = useState('');
  const [showForm, setShowForm] = useState(false);

  async function handleLogin() {
    const res = await fetch('/api/admin-auth', {
      method: 'POST',
      body: JSON.stringify({ password }),
      headers: { 'Content-Type': 'application/json' },
    });
    if (res.ok) {
      setShowForm(true);
    } else {
      alert('Wrong password!');
    }
  }

  if (!showForm) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <input
          type="password"
          placeholder="Admin Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyPress={(e) => {
            if (e.key === 'Enter') {
              handleLogin();
            }
          }}
          className="p-2 border rounded"
        />
        <button
          onClick={handleLogin}
          className="ml-2 bg-purple-700 text-white py-2 px-4 rounded"
        >
          Login
        </button>
      </div>
    );
  }

  async function seed() {
    await fetch('/api/confess', { method: 'POST', body: JSON.stringify({ text }) });
    alert('Seeded!');
    setText('');
  }

  return (
    <div className="p-8">
      <h1>Admin: Seed the Hive</h1>
      <textarea value={text} onChange={(e) => setText(e.target.value)} placeholder="Paste confession" className="w-full p-2 border mb-2" />
      <button onClick={seed} className="bg-green-500 text-white p-2 rounded">Seed</button>
    </div>
  );
}