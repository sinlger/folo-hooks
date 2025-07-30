const express = require('express');
const router = express.Router();
const https = require('https');
const dayjs = require('dayjs');
// 跟国内接口
router.get('/genguonei', (req, res) => {
  const endTime = req.query.endTime ? dayjs(req.query.endTime).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
  const startTime = dayjs(endTime).subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss');
  
  const query = {
    title: req.query.title || '',
    author: req.query.author || '',
    url: req.query.url || '',
    category: '国内新闻',
    limit: req.query.limit || 100,
    page: req.query.page || 1,
    startTime: startTime,
    endTime: endTime
  }
  const queryParams = new URLSearchParams(query).toString();
  const url = `https://atoolio.com/folo/search?${queryParams}`;
  https.get(url, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  }).on('error', (error) => {
    res.status(500).json({ error: '代理请求失败', message: error.message });
  });
});
// 跟国际接口
router.get('/genguoji', (req, res) => {
  const endTime = req.query.endTime ? dayjs(req.query.endTime).format('YYYY-MM-DD HH:mm:ss') : dayjs().format('YYYY-MM-DD HH:mm:ss');
  const startTime = dayjs(endTime).subtract(12, 'hour').format('YYYY-MM-DD HH:mm:ss');
  
  const query = {
    title: req.query.title || '',
    author: req.query.author || '',
    url: req.query.url || '',
    category: '国际新闻',
    limit: req.query.limit || 100,
    page: req.query.page || 1,
    startTime: startTime,
    endTime: endTime
  }
  const queryParams = new URLSearchParams(query).toString();
  const url = `https://atoolio.com/folo/search?${queryParams}`;
  https.get(url, (proxyRes) => {
    res.writeHead(proxyRes.statusCode, proxyRes.headers);
    proxyRes.pipe(res, { end: true });
  }).on('error', (error) => {
    res.status(500).json({ error: '代理请求失败', message: error.message });
  });
});
module.exports = router;