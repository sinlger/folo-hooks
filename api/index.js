const express = require('express');
const app = express();

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

  // Create a structured log entry
  const logEntry = {
    message: 'New webhook entry received from Folo Actions',
    entry: {
      title: entry.title,
      url: entry.url,
      publishedAt: entry.publishedAt,
      author: entry.author
    },
    feed: {
      title: feed.title
    },
    receivedAt: new Date().toISOString()
  };

  // Log the entire entry as a single JSON string for better readability in Vercel Logs
  console.log(JSON.stringify(logEntry, null, 2));

  res.status(200).send('Webhook received successfully.');
});

// Start the server for local development
if (process.env.NODE_ENV !== 'production') {
  const PORT = process.env.PORT || 3000;
  app.listen(PORT, () => {
    console.log(`Server is running on http://localhost:${PORT}`);
  });
}

// Export the app for Vercel
module.exports = app;