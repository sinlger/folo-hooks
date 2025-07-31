const express = require('express');
const http = require('http');
const { successResponse, errorResponse, validateRequiredParams, formatTimestamp, hasEnvVar, getEnvVar, genNewsCollection } = require('../utils');
const { title } = require('process');
const router = express.Router();

// GET /silichart - 获取硅谷图表配置信息
router.get('/', (req, res) => {
  try {
    const response = successResponse({
      apiUrl: getEnvVar('SILI_CHART_URL', 'https://api.siliconflow.cn/v1/chat/completions'),
      hasApiKey: hasEnvVar('SILI_API_KEY')
    }, '硅谷图表API配置');

    res.json(response);
  } catch (error) {
    res.status(500).json(errorResponse('获取配置信息失败', error.message));
  }
});

// 请求内部API获取新闻数据
const fetchNewsData = (endTime) => {
  return new Promise((resolve, reject) => {
    const queryParams = new URLSearchParams({
      endTime: endTime,
      limit: 100,
      page: 1
    }).toString();

    const options = {
      hostname: 'localhost',
      port: process.env.PORT || 3000,
      path: `/articles/genguonei?${queryParams}`,
      method: 'GET'
    };

    const req = http.request(options, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        try {
          const jsonData = JSON.parse(data);
          resolve(jsonData);
        } catch (error) {
          reject(new Error('解析响应数据失败'));
        }
      });
    });

    req.on('error', (error) => {
      reject(error);
    });

    req.end();
  });
};

// POST /silichart/newssummary - 生成新闻摘要
router.post('/newssummary', async (req, res) => {
  try {
    const { endTime = formatTimestamp(new Date()) } = req.body;

    // 请求/articles/genguonei 接口获取新闻数据
    const newsData = await fetchNewsData(endTime);
    // 将新闻数据转换为字符串作为content
    const content = JSON.stringify(newsData.data.map(item => ({ content: item.content, title: item.title })));

    // 检查API配置
    if (!hasEnvVar('SILI_API_KEY')) {
      return res.status(500).json(errorResponse('API密钥未配置', null, 500));
    }

    if (!hasEnvVar('SILI_CHART_URL')) {
      return res.status(500).json(errorResponse('API URL未配置', null, 500));
    }
    // 调用genNewsCollection生成新闻摘要
    const result = await genNewsCollection(content);
    
    if (result.success) {
      const response = successResponse({
        summary: result.data.choices?.[0]?.message?.content || '摘要生成失败',
        originalContent: content,
        endTime: endTime || null,
        model: result.data.model,
        usage: result.data.usage
      }, '新闻摘要生成成功');

      res.json(response);
    } else {
      res.status(500).json(errorResponse('新闻摘要生成失败', result.error));
    }

  } catch (error) {
    res.status(500).json(errorResponse('新闻摘要生成失败', error.message));
  }
});

module.exports = router;