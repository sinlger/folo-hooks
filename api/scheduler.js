const schedule = require('node-schedule');
const http = require('http');
const { formatTimestamp } = require('./utils');
const dayjs = require('dayjs');

// 执行genguonei接口的函数
function executeGenguonei() {
  const url = 'http://localhost:3000/articles/genguonei';
  
  console.log(`[${formatTimestamp()}] 开始执行定时任务: genguonei接口`);
  
  http.get(url, (response) => {
    let data = '';
    
    response.on('data', (chunk) => {
      data += chunk;
    });
    
    response.on('end', () => {
      try {
        const result = JSON.parse(data);
        console.log(`[${formatTimestamp()}] 定时任务执行成功，状态码: ${response.statusCode}`);
        console.log(`响应消息: ${result.message || '无消息'}`);
        console.log(`数据长度: ${data.length} 字符`);
      } catch (error) {
        console.log(`[${formatTimestamp()}] 定时任务执行成功，状态码: ${response.statusCode}`);
        console.log(`数据长度: ${data.length} 字符`);
      }
    });
  }).on('error', (error) => {
    console.error(`[${formatTimestamp()}] 定时任务执行失败:`, error.message);
  });
}

// 设置定时任务：每天早上8点执行
schedule.scheduleJob('0 8 * * *', () => {
  console.log('触发早上8点定时任务');
  executeGenguonei();
});

// 设置定时任务：每天晚上20点执行
schedule.scheduleJob('0 20 * * *', () => {
  console.log('触发晚上20点定时任务');
  executeGenguonei();
});

console.log('定时任务已启动:');
console.log('- 每天早上8:00执行genguonei接口');
console.log('- 每天晚上20:00执行genguonei接口');

module.exports = { executeGenguonei };