const express = require('express');
const cors = require('cors');
const swaggerUi = require('swagger-ui-express');
const swaggerDocument = require('./swagger.json');
const foloRouter = require('./router/folo');
const articlesRouter = require('./router/articles');
const silichartRouter = require('./router/silichart');

// 引入定时任务
require('./scheduler');

const app = express();

app.use(cors());

// 设置Swagger UI路由
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(express.json({ extended: false }));

// 使用folo路由
app.use('/folo', foloRouter);

// 使用articles路由
app.use('/articles', articlesRouter);

// 使用silichart路由
app.use('/silichart', silichartRouter);

app.get('/api', (req, res) => {
  res.send('Folo Webhook Receiver API is running.');
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