const express = require('express');
const http = require('http');
const { successResponse, errorResponse, validateRequiredParams, automationPushArticle, generateTxtFile, formatTimestamp, hasEnvVar, getEnvVar, genNewsCollection } = require('../utils');
const { title } = require('process');
const router = express.Router();
const dayjs = require('dayjs');
const https = require('https');
// GET /silichart - 获取硅谷图表配置信息
router.get('/', async (req, res) => {
  res.status(404).json({
    error: 'Not Found',
    message: '请求的资源不存在',
    statusCode: 404
  });
});

// 请求内部API获取新闻数据
const fetchNewsData = ({ endTime, startTime, category = '国内新闻', page = 4 }) => {
  return new Promise((resolve, reject) => {
    const formattedEndTime = endTime ? formatTimestamp(endTime) : formatTimestamp();
    const time = startTime ? startTime : formatTimestamp(dayjs(formattedEndTime).subtract(24 / page, 'hour'));
    const query = {
      title: '',
      author: '',
      url: '',
      category,
      limit: 100,
      page: 1,
      startTime: time,
      endTime: formattedEndTime
    };

    const queryParams = new URLSearchParams(query).toString();
    const url = `https://atoolio.com/folo/search?${queryParams}`;

    https.get(url, (res) => {
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
    }).on('error', (error) => {
      reject(error);
    });
  });
};

// POST /silichart/newssummary - 生成新闻摘要
router.post('/newssummary', async (req, res) => {
  try {
    const { endTime = formatTimestamp(new Date()), category = '国内新闻', page } = req.body;

    // 请求/articles/genguonei 接口获取新闻数据
    const newsData = await fetchNewsData({
      endTime,
      page,
      category
    });
    // 将新闻数据转换为字符串作为content
    const content = JSON.stringify(newsData.data.map(item => ({ content: item.content, title: item.title })));
    console.log('content', content)
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

    // 循环处理每条新闻
    for (let i = 0; i < newsItems.length; i++) {
      const newsItem = newsItems[i];
      const singleNewsContent = JSON.stringify([newsItem]);

      try {
        console.log(`处理第 ${i + 1}/${newsItems.length} 条新闻: ${newsItem.title}`);
        const result = await genNewsCollection(singleNewsContent);

        if (result.success && result.data.choices?.[0]?.message?.content) {
          const summary = result.data.choices[0].message.content;
          summaries.push({
            originalTitle: newsItem.title,
            summary: summary,
            model: result.data.model,
            usage: result.data.usage
          });
          console.log(`第 ${i + 1} 条新闻摘要生成成功`);
        } else {
          console.log(`第 ${i + 1} 条新闻摘要生成失败，已丢弃`);
        }
      } catch (error) {
        console.log(`第 ${i + 1} 条新闻处理异常，已丢弃:`, error.message);
      }
    }

    if (summaries.length > 0) {
      // 将所有摘要合并为一个字符串
      const allSummaries = summaries.map(item => item.summary).join('\n\n');

      const response = successResponse({
        summaries: summaries,
        totalProcessed: newsItems.length,
        successCount: summaries.length,
        endTime: endTime || null
      }, `新闻摘要生成完成，成功 ${summaries.length}/${newsItems.length} 条`);

      console.log(`所有摘要生成完成，成功 ${summaries.length} 条`);

      // 将所有摘要传递给automationPushArticle
      await automationPushArticle(allSummaries);

      res.json(response);
    } else {
      res.status(500).json(errorResponse('所有新闻摘要生成失败'));
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