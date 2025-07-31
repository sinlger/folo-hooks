const express = require('express');
const { successResponse, errorResponse, validateRequiredParams, formatTimestamp, hasEnvVar, getEnvVar } = require('../utils');
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

// POST /silichart/newssummary - 生成新闻摘要
router.post('/newssummary', (req, res) => {
  try {
    // 验证必需参数
    const validation = validateRequiredParams(req.body, ['url', 'endTime']);
    if (validation) {
      return res.status(400).json(validation);
    }

    const { url, endTime } = req.body;
    
    // 检查API配置
    if (!hasEnvVar('SILI_API_KEY')) {
      return res.status(500).json(errorResponse('API密钥未配置', null, 500));
    }
    
    if (!hasEnvVar('SILI_CHART_URL')) {
      return res.status(500).json(errorResponse('API URL未配置', null, 500));
    }

    // 模拟新闻摘要生成（实际项目中这里应该调用真实的API）
    const mockSummary = `基于URL: ${url} 和结束时间: ${endTime} 生成的新闻摘要内容...`;
    
    const response = successResponse({
      summary: mockSummary,
      url: url,
      endTime: endTime
    }, '新闻摘要生成成功');
    
    res.json(response);
    
  } catch (error) {
    res.status(500).json(errorResponse('生成摘要失败', error.message));
  }
});

module.exports = router;