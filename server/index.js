const express = require("express");
const cors = require("cors");
const db = require('./db');
const app = express();

app.use(cors());
app.use(express.json());

// Get all endpoints
app.get('/endpoints', (req, res) => {
  db.all('SELECT * FROM endpoints', [], (err, rows) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    const endpoints = rows.map(row => ({
      id: row.id,
      path: row.path,
      response: JSON.parse(row.response)
    }));
    res.json(endpoints);
  });
});

// Create new mock endpoint
app.post('/create-mock', (req, res) => {
  const { apiPath, mockResponse } = req.body;
  
  if (!apiPath) {
    return res.status(400).json({ error: 'API path is required' });
  }

  try {
    // Ensure mockResponse can be stringified
    const responseStr = JSON.stringify(mockResponse);
    
    const stmt = db.prepare('INSERT INTO endpoints (path, response) VALUES (?, ?)');
    stmt.run(apiPath, responseStr, function(err) {
      if (err) {
        console.error('Database error:', err);
        res.status(500).json({ error: err.message });
        return;
      }
      res.status(200).json({ 
        message: 'Mock endpoint created successfully',
        id: this.lastID 
      });
    });
  } catch (error) {
    console.error('Processing error:', error);
    res.status(400).json({ error: error.message });
  }
});

// Update existing mock endpoint
app.put('/update-mock/:id', (req, res) => {
  const { apiPath, mockResponse } = req.body;
  const { id } = req.params;
  
  if (!apiPath) {
    return res.status(400).json({ error: 'API path is required' });
  }

  const stmt = db.prepare('UPDATE endpoints SET path = ?, response = ? WHERE id = ?');
  stmt.run(apiPath, JSON.stringify(mockResponse), id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Endpoint not found' });
      return;
    }
    res.status(200).json({ message: 'Mock endpoint updated successfully' });
  });
});

// Delete mock endpoint
app.delete('/delete-mock/:id', (req, res) => {
  const { id } = req.params;
  
  const stmt = db.prepare('DELETE FROM endpoints WHERE id = ?');
  stmt.run(id, function(err) {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (this.changes === 0) {
      res.status(404).json({ error: 'Endpoint not found' });
      return;
    }
    res.status(200).json({ message: 'Endpoint deleted successfully' });
  });
});

// Dynamic handler for all GET requests to mock endpoints
app.get('*', (req, res) => {
  const path = req.path;
  db.get('SELECT response FROM endpoints WHERE path = ?', [path], (err, row) => {
    if (err) {
      res.status(500).json({ error: err.message });
      return;
    }
    if (row) {
      return res.json(JSON.parse(row.response));
    }
    res.status(404).json({ error: 'Mock endpoint not found' });
  });
});

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
