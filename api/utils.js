/**
 * 通用工具方法文件
 * 包含项目中常用的工具函数和辅助方法
 */

// 加载环境变量
require('dotenv').config();

const https = require('https');
const dayjs = require('dayjs');
const { gennewsprompt } = require('./prompt/prompt');

/**
 * 格式化时间戳
 * @param {Date|string|number} date - 日期对象、字符串或时间戳
 * @param {string} format - 格式化模式，默认为 'YYYY-MM-DD HH:mm:ss'
 * @returns {string} 格式化后的时间字符串
 */
function formatTimestamp(date = new Date(), format = 'YYYY-MM-DD HH:mm:ss') {
  return dayjs(date).format(format);
}

/**
 * 生成统一的成功响应格式
 * @param {any} data - 响应数据
 * @param {string} message - 响应消息
 * @returns {object} 标准化的成功响应对象
 */
function successResponse(data = null, message = '操作成功') {
  return {
    success: true,
    message,
    data,
    timestamp: formatTimestamp()
  };
}

/**
 * 生成统一的错误响应格式
 * @param {string} message - 错误消息
 * @param {any} error - 错误详情
 * @param {number} code - 错误代码
 * @returns {object} 标准化的错误响应对象
 */
function errorResponse(message = '操作失败', error = null, code = 500) {
  const response = {
    success: false,
    message,
    timestamp: formatTimestamp()
  };

  if (error) {
    response.error = error;
  }

  if (code !== 500) {
    response.code = code;
  }

  return response;
}

/**
 * 验证必需参数
 * @param {object} params - 参数对象
 * @param {string[]} requiredFields - 必需字段数组
 * @returns {object|null} 如果验证失败返回错误对象，成功返回null
 */
function validateRequiredParams(params, requiredFields) {
  const missingFields = [];

  for (const field of requiredFields) {
    if (!params[field] || params[field].toString().trim() === '') {
      missingFields.push(field);
    }
  }

  if (missingFields.length > 0) {
    return errorResponse(
      `缺少必要参数: ${missingFields.join(', ')}`,
      { missingFields },
      400
    );
  }

  return null;
}

/**
 * 安全的JSON解析
 * @param {string} jsonString - JSON字符串
 * @param {any} defaultValue - 解析失败时的默认值
 * @returns {any} 解析结果或默认值
 */
function safeJsonParse(jsonString, defaultValue = null) {
  try {
    return JSON.parse(jsonString);
  } catch (error) {
    console.warn('JSON解析失败:', error.message);
    return defaultValue;
  }
}

/**
 * 延迟执行函数
 * @param {number} ms - 延迟毫秒数
 * @returns {Promise} Promise对象
 */
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * 生成随机字符串
 * @param {number} length - 字符串长度
 * @param {string} chars - 可选字符集
 * @returns {string} 随机字符串
 */
function generateRandomString(length = 8, chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789') {
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

/**
 * 检查环境变量是否存在
 * @param {string} varName - 环境变量名
 * @returns {boolean} 是否存在
 */
function hasEnvVar(varName) {
  return process.env[varName] !== undefined && process.env[varName] !== '';
}

/**
 * 获取环境变量值，支持默认值
 * @param {string} varName - 环境变量名
 * @param {any} defaultValue - 默认值
 * @returns {any} 环境变量值或默认值
 */
function getEnvVar(varName, defaultValue = null) {
  return process.env[varName] || defaultValue;
}
/**
 * 生成新闻摘要的异步方法
 * @param {string} userContent - 用户输入的新闻内容
 * @param {string} systemPrompt - 系统提示词，默认使用gennewsprompt
 * @returns {Promise<object>} 返回API响应结果
 */
async function genNewsCollection(userContent, systemPrompt = gennewsprompt) {
  return new Promise((resolve, reject) => {
    // 验证必要参数
    if (!userContent) {
      reject(new Error('用户内容不能为空'));
      return;
    }

    // 验证环境变量
    const apiKey = getEnvVar('SILI_API_KEY');
    const apiUrl = getEnvVar('SILI_CHART_URL');
    
    if (!apiKey || !apiUrl) {
      reject(new Error('缺少必要的环境变量: SILI_API_KEY 或 SILI_CHART_URL'));
      return;
    }

    const requestData = JSON.stringify({
      model: 'Qwen/Qwen3-235B-A22B-Instruct-2507',
      stream: false,
      max_tokens: 8192,
      temperature: 0.6,
      messages: [
        {
          role: 'system',
          content: systemPrompt
        },
        {
          role: 'user',
          content: userContent
        }
      ]
    });

    const options = {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        'User-Agent': 'folo-hooks/1.0.0'
      }
    };

    const url = new URL(apiUrl);
    const requestOptions = {
      hostname: url.hostname,
      port: url.port || (url.protocol === 'https:' ? 443 : 80),
      path: url.pathname,
      method: options.method,
      headers: options.headers
    };

    const req = https.request(requestOptions, (res) => {
      const chunks = [];
      let totalLength = 0;
      
      // 设置响应编码
      res.setEncoding('utf8');
      
      res.on('data', (chunk) => {
        chunks.push(chunk);
        totalLength += chunk.length;
        
        // 防止响应过大（限制为10MB）
        if (totalLength > 10 * 1024 * 1024) {
          req.destroy();
          reject(new Error('响应数据过大'));
          return;
        }
      });
      
      res.on('end', () => {
        try {
          // 使用数组join比字符串拼接更高效
          const data = chunks.join('');
          
          if (!data) {
            reject(new Error('响应数据为空'));
            return;
          }
          
          const response = JSON.parse(data);
          
          if (res.statusCode >= 200 && res.statusCode < 300) {
            resolve({
              success: true,
              data: response,
              statusCode: res.statusCode,
              timestamp: formatTimestamp(),
              responseSize: totalLength
            });
          } else {
            reject(new Error(`API请求失败: ${res.statusCode} - ${response.error?.message || '未知错误'}`));
          }
        } catch (parseError) {
          reject(new Error(`响应解析失败: ${parseError.message}`));
        }
      });
    });

    req.on('error', (error) => {
      reject(new Error(`请求失败: ${error.message}`));
    });

    req.on('timeout', () => {
      req.destroy();
      reject(new Error('请求超时'));
    });

    // 设置超时时间为90秒
    req.setTimeout(1000*60*5);
    
    // 发送请求数据
    req.write(requestData);
    req.end();
  });
}
module.exports = {
  formatTimestamp,
  successResponse,
  errorResponse,
  validateRequiredParams,
  safeJsonParse,
  delay,
  generateRandomString,
  hasEnvVar,
  getEnvVar,
  gennewsprompt,
  genNewsCollection
};