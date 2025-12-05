'use client';

import { useState } from 'react';

export default function Home() {
  const [text, setText] = useState('');
  const [message, setMessage] = useState('');

  async function submitConfession() {
    const res = await fetch('/api/confess', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ text }),
    });
    if (res.ok) {
      setMessage('Confession submitted! Check the wall to see if it unlocks.');
      setText('');
    } else {
      setMessage('Try again.');
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-100 to-blue-100 flex flex-col items-center justify-center p-4">
      <h1 className="text-5xl font-bold mb-8 text-gray-800">ConfessHive 🐝</h1>
      <p className="text-xl mb-6 text-center max-w-md">Share anonymous confessions that only appear when 100 people agree.</p>
      <div className="w-full max-w-md">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="I just... (e.g., ate an entire pizza alone)"
          className="w-full p-4 border border-gray-300 rounded-lg mb-4 resize-none h-24 focus:outline-none focus:ring-2 focus:ring-purple-500"
          maxLength={280}
        />
        <button
          onClick={submitConfession}
          className="w-full bg-purple-600 text-white py-3 rounded-lg font-semibold hover:bg-purple-700 transition"
        >
          Confess Anonymously
        </button>
      </div>
      {message && <p className="mt-4 text-green-600">{message}</p>}
      <a href="/wall" className="mt-8 text-purple-600 hover:underline">View the Hive</a>
    </div>
  );
}