const express = require('express');
const http = require('http');
const { successResponse, errorResponse, validateRequiredParams, automationPushArticle, generateTxtFile, formatTimestamp, hasEnvVar, getEnvVar, genNewsCollection } = require('../utils');
const { title } = require('process');
const router = express.Router();

// GET /silichart - 获取硅谷图表配置信息
router.get('/', async (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '请求的资源不存在',
    statusCode: 404
  });
});

// 请求内部API获取新闻数据
const fetchNewsData = (endTime) => {
  return new Promise((resolve, reject) => {
    const queryParams = new URLSearchParams({
      endTime: endTime,
      limit: 5,
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
    console.log('content',content)
    // 检查API配置
    if (!hasEnvVar('SILI_API_KEY')) {
      return res.status(500).json(errorResponse('API密钥未配置', null, 500));
    }

    if (!hasEnvVar('SILI_CHART_URL')) {
      return res.status(500).json(errorResponse('API URL未配置', null, 500));
    }
    // 解析新闻数据
    const newsItems = JSON.parse(content);
    const summaries = [];
    const errors = [];
    
    // 循环处理每条新闻
    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i];
      const singleNewsContent = JSON.stringify([newsItem]);
      
      try {
        console.log(`处理第 ${i + 1}/${newsItems.length} 条新闻: ${newsItem.title}`);
        const result = await genNewsCollection(singleNewsContent);
        
        if (result.success) {
          const summary = result.data.choices?.[0]?.message?.content || '摘要生成失败';
          summaries.push({
            originalTitle: newsItem.title,
            summary: summary,
            model: result.data.model,
            usage: result.data.usage
          });
          console.log(`第 ${i + 1} 条新闻摘要生成成功`);
        } else {
          errors.push({
            title: newsItem.title,
            error: result.error
          });
          console.error(`第 ${i + 1} 条新闻摘要生成失败:`, result.error);
        }
      } catch (error) {
        errors.push({
          title: newsItem.title,
          error: error.message
        });
        console.error(`第 ${i + 1} 条新闻处理异常:`, error.message);
      }
    }
    
    if (summaries.length > 0) {
      // 将所有摘要合并为一个字符串
      const allSummaries = summaries.map(item => item.summary).join('\n\n');
      
      const response = successResponse({
        summaries: summaries,
        totalProcessed: newsItems.length,
        successCount: summaries.length,
        errorCount: errors.length,
        errors: errors,
        endTime: endTime || null
      }, `新闻摘要生成完成，成功 ${summaries.length}/${newsItems.length} 条`);
      
      console.log(`所有摘要生成完成，成功 ${summaries.length} 条，失败 ${errors.length} 条`);
      
      // 将所有摘要传递给automationPushArticle
      await automationPushArticle(allSummaries);
      
      res.json(response);
    } else {
      res.status(500).json(errorResponse('所有新闻摘要生成失败', errors));
    }

  } catch (error) {
    res.status(500).json(errorResponse('新闻摘要生成失败', error.message));
  }
});

router.post('/test', async (req, res) => {
  await automationPushArticle('# 我是标题')
  const response = successResponse({
    summary: '操作成功'
  }, '新闻摘要生成成功');
  res.json(response);
})
module.exports = router;