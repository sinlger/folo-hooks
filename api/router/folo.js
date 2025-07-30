const express = require('express');
const https = require('https');
const router = express.Router();

// 代理请求到本地的搜索接口
router.get('/search', (req, res) => {
  const queryParams = new URLSearchParams(req.query).toString();
  const url = `https://atoolio.com/folo/search?${queryParams}`;

  https.get(url, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  }).on('error', (error) => {
    res.status(500).json({ error: '代理请求失败', message: error.message });
  });
});

module.exports = router;