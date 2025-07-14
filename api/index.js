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

  // Log the structured data to the console
  console.log('--- New Entry ---');
  console.log(`Title: ${entry.title}`);
  console.log(`URL: ${entry.url}`);
  console.log(`Feed: ${feed.title}`);
  console.log('-----------------');

  // Create a simplified object for logging
  const displayData = {
    '标题': entry.title,
    '链接': entry.url,
    '来源': feed.title,
    '发布时间': new Date(entry.publishedAt).toLocaleString(),
    '作者': entry.author
  };

  // You can do something with displayData here, like saving to a database.
  console.log(displayData);

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