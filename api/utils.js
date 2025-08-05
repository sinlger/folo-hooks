/**
 * 通用工具方法文件
 * 包含项目中常用的工具函数和辅助方法
 */
const { chromium } = require('playwright');
// 加载环境变量
require('dotenv').config();
const https = require('https');
const dayjs = require('dayjs');
const path = require('path');
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
    req.setTimeout(1000 * 60 * 5);

    // 发送请求数据
    req.write(requestData);
    req.end();
  });
}


// 自动化录入文章标题的函数
async function autoInputArticleTitle(page, title) {
  console.log(`开始自动录入文章标题: ${title}`);

  // 常见的文章标题输入框选择器
  const titleSelectors = [
    'input[placeholder*="标题"]',
    'textarea[placeholder*="请输入文章标题（2～30个字）"]',
    'input[placeholder*="title"]',
    'input[name="title"]',
    'input[id="title"]',
    '.title-input',
    '.article-title',
    'textarea[placeholder*="标题"]',
    '[data-testid*="title"]',
    '.editor-title',
    '.post-title'
  ];

  let titleInput = null;

  // 尝试找到标题输入框
  for (const selector of titleSelectors) {
    try {
      titleInput = await page.locator(selector).first();
      if (await titleInput.isVisible()) {
        console.log(`找到标题输入框: ${selector}`);
        break;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  if (titleInput && await titleInput.isVisible()) {
    try {
      // 清空现有内容并输入新标题
      await titleInput.click();
      await page.waitForTimeout(200); // 等待焦点稳定
      // 逐字输入标题
      for (let i = 0; i < title.length; i++) {
        await titleInput.type(title[i]);
        await page.waitForTimeout(50); // 每个字之间等待50毫秒
      }
      console.log('文章标题录入成功!');
      return true;
    } catch (error) {
      console.log('录入标题时出错:', error.message);
      return false;
    }
  } else {
    console.log('未找到标题输入框，可能需要等待页面完全加载或手动定位');
    return false;
  }
}

// 自动化录入完整文章的函数
async function autoInputArticle(page, articleData) {
  console.log('开始自动录入文章内容...');

  const { title, content, tags = [], category = '' } = articleData;

  // 首先录入标题
  const titleSuccess = await autoInputArticleTitle(page, title);
  if (!titleSuccess) {
    console.log('标题录入失败，继续尝试录入内容...');
  }
  // 等待一下让页面稳定
  await page.waitForTimeout(1000);
  // 插入图片
  const imageSucces = await autoInsertImage(page)
  if (!imageSucces) {
    console.log('插入图片失败');
  }
  // 等待一下让页面稳定
  await page.waitForTimeout(1000);

  // 录入文章内容
  const contentSuccess = await inputArticleContent(page, content);

  // 录入标签（如果有）
  if (tags.length > 0) {
    await inputArticleTags(page, tags);
  }

  // 录入分类（如果有）
  if (category) {
    await inputArticleCategory(page, category);
  }

  console.log('文章录入完成!');
  return { titleSuccess, contentSuccess };
}

// 录入文章内容的函数
async function inputArticleContent(page, content) {
  console.log('开始录入文章内容...');

  try {
    // 先点击div.ProseMirror
    const proseMirrorElement = await page.locator('div.ProseMirror').first();
    if (await proseMirrorElement.isVisible()) {
      console.log('成功点击ProseMirror编辑器');
      // 输入内容 - 一个字一个字输入
      for (let i = 0; i < content.length; i++) {
        await proseMirrorElement.type(content[i]);
        await page.waitForTimeout(100); // 每个字之间等待100毫秒
      }
      console.log('文章内容录入成功!');
      return true;
    } else {
      console.log('ProseMirror编辑器不可见');
      return false;
    }
  } catch (error) {
    console.log('点击ProseMirror编辑器失败:', error.message);
    return false;
  }
}
// 插入图片
async function autoInsertImage(page) {
  console.log('开始选择图片')

  try {
    const proseMirrorElement = await page.locator('div.ProseMirror').first();
    if (await proseMirrorElement.isVisible()) {
      await proseMirrorElement.click();
      await page.waitForTimeout(1000);
      // 确保焦点在编辑器上，然后触发Ctrl+P
      await proseMirrorElement.focus();
      await page.waitForTimeout(500);
      await page.keyboard.down('Control');
      await page.keyboard.press('KeyP');
      await page.keyboard.up('Control');
      await page.waitForTimeout(1000);
      const myImageElement = await page.locator('div.byte-tabs-header-title:has-text("我的素材")');
      await myImageElement.click();
      await page.waitForTimeout(1000);
      const fristImage = await page.locator('div.resource-item-img').first();
      await fristImage.click();
      await page.waitForTimeout(1000);
      const submitImage = await page.locator('button.byte-btn.byte-btn-primary.byte-btn-size-large.byte-btn-shape-square:has(span:text("确定"))').first();
      await submitImage.click();
      await page.waitForTimeout(5000);
      return true;
    }
  } catch (error) {
    console.log('点击ProseMirror编辑器失败:', error.message);
    return false;
  }
}

// 录入文章标签的函数
async function inputArticleTags(page, tags) {
  console.log('开始录入文章标签...');

  const tagSelectors = [
    'input[placeholder*="标签"]',
    'input[placeholder*="tag"]',
    'input[name="tags"]',
    'input[id="tags"]',
    '.tag-input',
    '.tags-input'
  ];

  for (const selector of tagSelectors) {
    try {
      const tagInput = await page.locator(selector).first();
      if (await tagInput.isVisible()) {
        console.log(`找到标签输入框: ${selector}`);
        await tagInput.click();
        await tagInput.fill(tags.join(', '));
        console.log('标签录入成功!');
        return true;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  console.log('未找到标签输入框');
  return false;
}

// 录入文章分类的函数
async function inputArticleCategory(page, category) {
  console.log('开始设置文章分类...');

  const categorySelectors = [
    'select[name="category"]',
    'select[id="category"]',
    '.category-select',
    '.category-dropdown'
  ];

  for (const selector of categorySelectors) {
    try {
      const categorySelect = await page.locator(selector).first();
      if (await categorySelect.isVisible()) {
        console.log(`找到分类选择器: ${selector}`);
        await categorySelect.selectOption({ label: category });
        console.log('分类设置成功!');
        return true;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  console.log('未找到分类选择器');
  return false;
}

async function automationPushArticle(articleContent) {
  console.log('执行文章录入流程');
  // 设置用户数据目录路径
  const userDataDir = path.join(process.cwd(), 'user-data');
  console.log('启动本地默认浏览器并指定用户数据目录')
  // 启动本地默认浏览器并指定用户数据目录
  const browser = await chromium.launchPersistentContext(userDataDir, {
    headless: false, // headless: false 表示显示浏览器界面
    viewport: null, // 设置为null以使用全屏模式
    channel: 'msedge', // 使用本地安装的Edge浏览器
    args: [
      '--start-maximized', // 启动时最大化窗口
      '--disable-blink-features=AutomationControlled',
      '--disable-infobars',
      '--no-first-run',
      '--disable-infobars',
      '--no-default-browser-check',
      '--disable-web-security',
      '--disable-extensions-except',
      '--disable-features=VizDisplayCompositor',
      '--disable-blink-features=AutomationControlled',
      '--disable-plugins-discovery',
      '--no-first-run',
      '--disable-default-apps',
      "--exclude-switches=enable-automation"
    ]
  });

  // 获取默认页面（launchPersistentContext会自动创建一个页面）
  const page = browser.pages()[0] || await browser.newPage();
  console.log('隐藏自动化特征')
  // 隐藏自动化特征
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => undefined,
    });

    delete navigator.__proto__.webdriver;
  });

  // 打开百度网站
  await page.goto('https://www.toutiao.com');

  // 等待页面加载完成
  await page.waitForLoadState('domcontentloaded');
  console.log('已成功打开百度网站');
  // 尝试多种可能的写文章按钮选择器
  const writeButtonSelectors = [
    'a[href*="write"]',
    'a[href*="create"]',
    'a[href*="publish"]',
    'button:has-text("写文章")',
    'a:has-text("写文章")',
    'button:has-text("发布")',
    'a:has-text("发布")',
    'button:has-text("创作")',
    'a:has-text("创作")',
    '[data-testid*="write"]',
    '.write-btn',
    '.create-btn',
    '.publish-btn'
  ];

  let writeButton = null;
  for (const selector of writeButtonSelectors) {
    try {
      writeButton = await page.locator(selector).first();
      if (await writeButton.isVisible()) {
        console.log(`找到写文章按钮: ${selector}`);
        break;
      }
    } catch (e) {
      // 继续尝试下一个选择器
    }
  }

  // 如果没有找到写文章按钮，暂停流程
  if (!writeButton || !(await writeButton.isVisible())) {
    console.log('未找到写文章按钮，保持浏览器打开状态，请手动登录后重试');
    return;
  }

  if (writeButton && await writeButton.isVisible()) {
    console.log('点击写文章按钮...');

    // 监听新页面打开事件
    const [newPage] = await Promise.all([
      browser.waitForEvent('page'),
      writeButton.click()
    ]);

    console.log('写文章页面已在新标签页中打开！');
    console.log('新页面URL:', newPage.url());

    // 等待新页面加载
    await newPage.waitForLoadState('networkidle');

    // 自动录入完整文章
    const articleData = {
      title: '我的第一篇自动化文章',
      content: `${articleContent}`
    };
    await autoInputArticle(newPage, articleData);

    console.log('停止操作，浏览器将保持打开状态');
    // 浏览器保持打开，不执行关闭操作
  } else {
    console.log('未找到写文章按钮，可能需要登录或按钮位置发生变化');
    console.log('页面将保持打开状态，请手动查找写文章按钮');
    console.log('浏览器将在30秒后自动关闭...');
    await page.waitForTimeout(30000);
  }
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
  genNewsCollection,
  automationPushArticle
};