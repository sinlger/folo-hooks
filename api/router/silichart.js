const express = require('express');
const http = require('http');
const { successResponse, errorResponse, validateRequiredParams, generateTxtFile, formatTimestamp, hasEnvVar, getEnvVar, genNewsCollection } = require('../utils');
const { title } = require('process');
const router = express.Router();

// GET /silichart - 获取硅谷图表配置信息
router.get('/', async (req, res) => {
  await generateTxtFile('text.txt', `## 四川盆地发现首个页岩油田\n- 四川盆地首次发现页岩油田，复兴油田探明石油储量超2000万吨、天然气123.52亿立方米，标志着该地区“富气少油”格局取得重大突破。\n\n## 中国将发放建国以来首次普惠式育儿现金补贴\n- 中共中央、国务院公布育儿补贴方案，2025年起对三岁以下婴幼儿每年发放3600元补贴，旨在减轻生育负担，应对少子化挑战。\n\n## 中国能源局推进大功率充电设施建设改造\n- 为缓解节假日新能源汽车充电难问题，中国能源局正制定政策，推动在高速公路服务区等场景布局大功率充电设施，提升充电网络服务质量。\n\n## 北京洪灾死亡44人 其中密云一养老中心31人遇难\n- 北京强降雨致44人遇难、9人失联，密云太师屯镇一养老中心因未在转移预案内，洪水来袭时31名老人不幸遇难，暴露极端天气应对漏洞。\n\n## 中国7月制造业PMI跌至49.3 连续四个月在萎缩区间\n- 7月制造业采购经理指数（PMI）降至49.3，连续四个月低于荣枯线，受生产淡季及洪涝灾害影响，制造业景气水平继续回落。\n\n## 中国恒大集团料将8月被港交所除牌\n- 恒大因未能提交可行债务重组方案，已停牌逾18个月，预计将被港交所除牌，凸显中国房地产行业持续低迷与企业债务重组困境。\n\n## 中国官媒：中国对中美经贸磋商抱有百分百诚意\n- 新华社发表时评称，中美经贸关系本质是互利共赢，中方愿以百分百诚意推进磋商，但强调对话必须平等，坚决维护发展权利。\n\n## 中国网信办就H20晶片风险约谈英伟达\n- 针对英伟达H20芯片被曝存在后门安全风险，中国网信办依法约谈企业，要求说明情况并提交证明材料，以保障网络安全与数据安全。\n\n## 京东将斥资22亿欧元收购德国消费电子产品零售商\n- 京东宣布以22亿欧元收购德国Ceconomy公司，获得万得城（MediaMarkt）和土星（Saturn）品牌，加速拓展欧洲消费电子零售市场。\n\n## 中国驻日使馆：日本社会出现排外情绪 已提出交涉\n- 两名中国公民在东京遭持械袭击重伤，中国驻日使馆紧急交涉并提醒在日同胞加强防范，敦促日方保护中国公民安全与合法权益。\n\n## 中国官方提醒中国公民近期谨慎赴日旅游\n- 因俄罗斯堪察加半岛强震引发海啸，日本多地发布预警，中国外交部提醒公民近期谨慎赴日，远离沿海高风险区域，注意人身安全。\n\n## 中国中东问题特使：呼吁推动早日全面解决巴勒斯坦问题\n- 中国政府中东问题特使翟隽在联合国会议提出五点建议，呼吁国际社会推动加沙停火、落实“两国方案”，实现巴以问题全面公正解决。\n\n## 港府要求高才通子女居港两年 才享有本地学费资助\n- 香港修订资助政策，通过“高才通”计划赴港的内地人才子女须居港满两年方可享本地生学费资助，防止“考试移民”占用本地教育资源。\n\n## 佛山开展全市七天成蚊消杀行动\n- 佛山启动为期七天的全市成蚊消杀行动，全面清理孳生地，应对基孔肯雅热疫情扩散，全市已报告近五千例病例，防疫形势严峻。\n\n## 佛山深夜公告：启动突发公共卫生事件Ⅲ级响应\n- 广东佛山因基孔肯雅热疫情严峻，宣布启动突发公共卫生事件三级响应，疫情主要集中在顺德区，美国CDC考虑发布赴华旅行健康通知。\n\n## 美媒：FBI在新西兰设办事处 对抗中国在太平洋影响力\n- FBI在新西兰惠灵顿设立独立办公室，旨在加强与新西兰合作，共同应对中国在印太地区的影响力扩张及跨国安全威胁。\n\n## 中国兵器装备集团原副总经理刘卫东被双开\n- 刘卫东因严重违纪违法被开除党籍和公职，通报指其“靠企吃企”、收受贿赂，利用职权为他人谋利，涉嫌犯罪问题已移送检察机关。\n\n## 中国驻新大使：新加坡企业是最懂中国的\n- 中国驻新加坡大使曹忠明表示，数字转型、人工智能、绿色发展等领域是外资重点方向，称赞新加坡企业“最懂中国”，鼓励加强合作。\n\n## 梁文道回应播客被大陆平台下架：暂时禁言 司空见惯\n- 梁文道回应其付费播客《八分半》被多平台下架，称属“暂时禁言15天”，强调不会猜测原因，相关内容将在禁期后恢复。\n\n## 上海警方：网传上海LV“巨轮”被淹视频是伪造\n- 上海警方通报，台风期间多人伪造并传播“LV巨轮被淹”等虚假视频，已对六名造谣者行政拘留，呼吁公众不传谣、不信谣。\n\n## 中国古刹少林寺“网红方丈”释永信被查 新住持上任后多项收费取消\n- 少林寺前住持释永信因涉嫌刑事犯罪被查，新住持上任后，平安香、扫码布施等争议收费项目已取消，方丈室及纪念碑被遮挡。\n\n## 中国将推动中俄联合军演 不针对第三方\n- 中俄将于8月在符拉迪沃斯托克附近举行“海上联合-2025”军演，中方强调演习不针对第三方，旨在深化战略协作，维护地区和平稳定。\n\n## 台艺人朱孝天称望两岸赶快统一 陆委会：尊重个人立场\n- 朱孝天在直播中表示“希望两岸尽快统一”，引发两岸热议，台湾陆委会回应称其属个人立场，予以尊重，与“武统”言论性质不同。\n\n## 美共和党重量级参议员将率团访台\n- 美国参议院军事委员会主席威克将于8月率国会代表团访台，此举被视为对台支持信号，此前美方已取消与台防长会面并限制赖清德过境。\n\n## 中国山西省大同市一辆中巴遇险失联 已有10人遇难\n- 山西大同一辆中巴因强降雨遇险，14人失联，截至7月30日已确认10人遇难，救援仍在进行，全省防汛应急响应已提升至三级。\n\n## 彭博：美承诺给台最佳关税率 台官员解读约与日本15%一致\n- 美国对台关税谈判接近尾声，承诺给予“最佳税率”，台方推测将与日本15%税率一致，但最终决定权在特朗普，投资换关税成关键。\n\n## 台美已完成关税技术性磋商 正研议联合声明\n- 台美完成关税技术性磋商，在关税、非关税障碍、供应链韧性等议题达成共识，正研拟联合声明，等待美国政府最终决策。\n\n## 中国国家统计局：7月非制造业PMI回落至50.1\n- 7月非制造业商务活动指数为50.1，环比下降0.4点，服务业和建筑业景气均有所回落，经济复苏基础仍需巩固。\n\n## 中国官方发布通知 提醒公民谨慎赴日旅游\n- 因日本受强震海啸影响，中国外交部发布提醒，呼吁公民近期谨慎赴日，已在日人员远离海边，关注预警信息，确保安全。\n\n## 中国电商巨头京东将收购德国万得城母公司\n- 京东将以22亿欧元收购德国Ceconomy集团，整合万得城和土星千余家门店，强化其在欧洲消费电子零售市场的布局与竞争力。\n\n## 中国外交部促日采取有效措施保障中国公民安全\n- 针对在日中国公民遭袭事件，中国外交部敦促日方彻查案件、严惩凶手，并采取有效措施保障在日中国人的安全与合法权益。\n\n## 中国国家互联网信息办公室约谈英伟达\n- 因H20芯片被曝存在安全风险，中国网信办依据相关法律约谈英伟达，要求其说明漏洞后门问题并提交证明材料。\n\n## 澳门前立法议员区锦新被拘 涉勾结境外势力危害国安\n- 澳门前议员区锦新因涉嫌长期勾结境外反华组织、危害国家安全被拘捕，或为澳门首例触犯《维护国家安全法》的案件。\n\n## 释永信在香港先后出任五公司董事\n- 少林寺前住持释永信在香港担任五家公司董事，其中两家公司已被启动剔除程序，其在港商业活动引发关注。\n\n## 艺人朱孝天“希望两岸尽快统一”言论引争议\n- 朱孝天在直播中表达“希望两岸统一”观点，称大陆生活美好，颠覆其早年认知，言论在台湾引发激烈争论，褒贬不一。\n\n## 中国古刹少林寺换新住持 收费乱象已整改\n- 少林寺更换新住持后，多项此前遭诟病的收费项目如“平安香”“扫码布施”已被取消，寺院管理趋于规范化。\n\n## 中国国家统计局公布7月PMI数据\n- 7月制造业PMI降至49.3，非制造业PMI为50.1，双双回落，反映经济复苏动能有所减弱，需进一步政策支持巩固回升势头。`)
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