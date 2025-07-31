/**
 * 通用工具方法文件
 * 包含项目中常用的工具函数和辅助方法
 */

const dayjs = require('dayjs');

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

module.exports = {
  formatTimestamp,
  successResponse,
  errorResponse,
  validateRequiredParams,
  safeJsonParse,
  delay,
  generateRandomString,
  hasEnvVar,
  getEnvVar
};