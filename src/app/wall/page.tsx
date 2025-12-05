'use client';

import { useEffect, useState } from 'react';

interface Confession {
  id: number;
  text: string;
  count: number;
}

export default function Wall() {
  const [confessions, setConfessions] = useState<Confession[]>([]);

  async function fetchUnlocked() {
    try {
      const res = await fetch('/api/confessions');
      if (res.ok) {
        const data = await res.json();
        setConfessions(data);
      } else {
        setConfessions([]);
      }
    } catch {
      setConfessions([]);
    }
  }

  useEffect(() => {
    fetchUnlocked();
    const interval = setInterval(fetchUnlocked, 30000); // Refresh every 30s
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-4">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">The Hive: Unlocked Confessions</h1>
        <div className="grid gap-4">
          {confessions.map((c) => (
            <div key={c.id} className="bg-white p-6 rounded-lg shadow-md border-l-4 border-purple-500">
              <p className="text-lg mb-2">"{c.text}"</p>
              <p className="text-sm text-gray-600 font-semibold">— {c.count} people (and buzzing...)</p>
              <button className="mt-2 text-purple-600 hover:underline text-sm">Share this</button>
            </div>
          ))}
          {confessions.length === 0 && <p className="text-center text-gray-500">No confessions unlocked yet. Submit yours to start the hive!</p>}
        </div>
      </div>
    </div>
  );
}