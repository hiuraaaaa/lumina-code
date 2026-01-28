import { Pool } from 'pg';

// Neon connection
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
  // Enable CORS
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // GET all snippets
    if (req.method === 'GET' && !req.query.id) {
      const result = await pool.query(
        'SELECT * FROM snippets ORDER BY created_at DESC'
      );
      return res.json({ data: result.rows, error: null });
    }

    // GET single snippet
    if (req.method === 'GET' && req.query.id) {
      const result = await pool.query(
        'SELECT * FROM snippets WHERE id = $1',
        [req.query.id]
      );
      return res.json({ data: result.rows[0] || null, error: null });
    }

    // POST create snippet
    if (req.method === 'POST') {
      const { title, tags, code } = req.body;
      
      if (!title || !code) {
        return res.status(400).json({ 
          data: null, 
          error: 'Title and code are required' 
        });
      }

      const result = await pool.query(
        'INSERT INTO snippets (title, tags, code) VALUES ($1, $2, $3) RETURNING *',
        [title, tags, code]
      );
      
      return res.json({ data: result.rows[0], error: null });
    }

    return res.status(405).json({ 
      data: null, 
      error: 'Method not allowed' 
    });

  } catch (err) {
    console.error('Database error:', err);
    return res.status(500).json({ 
      data: null, 
      error: err.message 
    });
  }
}
