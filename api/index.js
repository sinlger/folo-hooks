const express = require('express');
const http = require('http');
const { WebSocketServer } = require('ws');

const app = express();
const server = http.createServer(app);
const wss = new WebSocketServer({ server });

// Store connected clients
const clients = new Set();

wss.on('connection', (ws) => {
  console.log('Client connected');
  clients.add(ws);

  ws.on('close', () => {
    console.log('Client disconnected');
    clients.delete(ws);
  });
});

// Function to broadcast data to all clients
function broadcast(data) {
  const jsonData = JSON.stringify(data);
  for (const client of clients) {
    if (client.readyState === client.OPEN) {
      client.send(jsonData);
    }
  }
}

// Vercel can parse the body for us, or we can use express.json()
// For simplicity, we'll assume Vercel handles it or use the built-in middleware.
const path = require('path');

// Serve static files from the 'public' directory
app.use(express.static(path.join(__dirname, '..', 'public')));

app.use(express.json({ extended: false }));

app.get('/api', (req, res) => {
  res.send('Folo Webhook Receiver API is running.');
});

app.post('/api/webhook', (req, res) => {
  console.log('Webhook received:');
  const { entry, feed } = req.body;

  if (!entry || !feed) {
    return res.status(400).send('Invalid webhook payload.');
  }

  // Log the structured data to the console
  console.log('--- New Entry ---');
  console.log(`Title: ${entry.title}`);
  console.log(`URL: ${entry.url}`);
  console.log(`Feed: ${feed.title}`);
  console.log('-----------------');

  // Create a simplified object for the frontend with Chinese keys
  const displayData = {
    '标题': entry.title,
    '链接': entry.url,
    '来源': feed.title,
    '发布时间': new Date(entry.publishedAt).toLocaleString(),
    '作者': entry.author
  };

  // Broadcast the simplified data to all connected WebSocket clients
  broadcast(displayData);

  res.status(200).send('Webhook received successfully.');
});

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  server.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the server for Vercel
module.exports = server;