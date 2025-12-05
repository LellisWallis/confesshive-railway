import OpenAI from 'openai';
import pool from '../lib/db';

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function normalizeText(text: string): Promise<string> {
  return text.toLowerCase().replace(/^(i just|i still|today|tonight)/gi, '').trim().replace(/\s+/g, ' ');
}

async function getEmbedding(text: string): Promise<number[]> {
  const response = await openai.embeddings.create({
    model: 'text-embedding-3-small',
    input: text,
  });
  return Array.from(response.data[0].embedding);
}

function cosineSimilarity(a: number[], b: number[]): number {
  const dot = a.reduce((sum, _, i) => sum + a[i] * b[i], 0);
  const magA = Math.sqrt(a.reduce((sum, v) => sum + v * v, 0));
  const magB = Math.sqrt(b.reduce((sum, v) => sum + v * v, 0));
  return magA && magB ? dot / (magA * magB) : 0;
}

export async function matchAndInsertConfession(text: string) {
  const normalized = await normalizeText(text);
  const embedding = await getEmbedding(normalized);

  const client = await pool.connect();
  try {
    // Create table if not exists
    await client.query(`
      CREATE EXTENSION IF NOT EXISTS vector;
      CREATE TABLE IF NOT EXISTS confessions (
        id SERIAL PRIMARY KEY,
        text TEXT NOT NULL,
        normalized_text TEXT,
        embedding VECTOR(1536),
        cluster_id INTEGER REFERENCES confessions(id),
        is_published BOOLEAN DEFAULT FALSE,
        count INTEGER DEFAULT 1,
        unlocked_at TIMESTAMP,
        expires_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
      CREATE INDEX IF NOT EXISTS confessions_embedding_idx ON confessions USING ivfflat (embedding vector_cosine_ops);
    `);

    // Find best match
    const { rows: clusters } = await client.query(
      'SELECT * FROM confessions WHERE cluster_id IS NULL'
    );

    let bestMatch = null;
    let bestSim = 0;
    for (const cluster of clusters) {
      const sim = cosineSimilarity(embedding, (cluster.embedding as any));
      if (sim > 0.87) {
        bestMatch = cluster;
        bestSim = sim;
        break;
      }
    }

    if (bestMatch) {
      // Merge
      await client.query(
        'INSERT INTO confessions (text, normalized_text, embedding, cluster_id) VALUES ($1, $2, $3, $4)',
        [text, normalized, embedding, bestMatch.id]
      );
      const newCount = bestMatch.count + 1;
      await client.query('UPDATE confessions SET count = $1 WHERE id = $2', [newCount, bestMatch.id]);

      if (newCount >= 100 && !bestMatch.is_published) {
        const unlockedAt = new Date();
        const expiresAt = new Date(unlockedAt.getTime() + 24 * 60 * 60 * 1000);
        await client.query(
          'UPDATE confessions SET is_published = TRUE, unlocked_at = $1, expires_at = $2 WHERE id = $3',
          [unlockedAt, expiresAt, bestMatch.id]
        );
      }
    } else {
      // New cluster
      const { rows } = await client.query(
        'INSERT INTO confessions (text, normalized_text, embedding) VALUES ($1, $2, $3) RETURNING *',
        [text, normalized, embedding]
      );
      return rows[0];
    }
  } finally {
    client.release();
  }
}