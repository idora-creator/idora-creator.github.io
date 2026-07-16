import type { Village, Team, PracticePlan } from '../types';
import { NEED_CATEGORY_LABELS } from '../types';

const API_URL = 'https://api.deepseek.com/chat/completions';
const MODEL = 'deepseek-chat';

function buildSystemPrompt(villages: Village[], teams: Team[]): string {
  const grayCount = villages.filter((v) => v.visitCount === 0).length;
  const totalNeeds = villages.reduce((s, v) => s + v.needs.filter((n) => n.status === 'pending').length, 0);
  const hotVillages = villages.filter((v) => v.visitCount >= 15).slice(0, 5).map((v) => `${v.name}(${v.city})`).join('、');
  const grayVillages = villages.filter((v) => v.visitCount === 0).slice(0, 5).map((v) => `${v.name}(${v.city})`).join('、');
  const teamList = teams.map((t) => `${t.name}(${t.university}, ${t.memberCount}人)`).join('；');

  return `你是"三下乡乡村实践地图智能体平台"的AI助手，帮助高校大学生实践团队与乡村基层精准对接。

## 平台当前数据
- 覆盖乡村：${villages.length} 个（广东省21个地级市）
- 实践空白区域：${grayCount} 个（灰色标记，从未被到访）
- 待解决需求：${totalNeeds} 项
- 热门到访区域：${hotVillages || '无'}
- 急需关注的空白乡村：${grayVillages || '无'}
- 注册队伍：${teamList || '暂无'}

## 你的职责
1. 回答关于三下乡社会实践的问题
2. 引导用户使用平台功能：需求上报、智能匹配、方案生成、创建队伍
3. 根据用户描述推荐合适的乡村或队伍
4. 解答乡村振兴相关政策咨询

## 回复要求
- 简洁有用，不超过200字
- 需要具体建议时引用平台真实数据
- 语气热情但专业
- 如果用户的问题与平台功能无关，友好地引导回正题`;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

let conversationHistory: ChatMessage[] = [];

export function resetConversation() {
  conversationHistory = [];
}

export async function chatWithAI(
  userMessage: string,
  villages: Village[],
  teams: Team[]
): Promise<string> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) return fallbackReply(userMessage);

  // 首次或每次保持系统提示词最新
  if (conversationHistory.length === 0 || conversationHistory.length > 20) {
    conversationHistory = [
      { role: 'system', content: buildSystemPrompt(villages, teams) },
    ];
  }

  conversationHistory.push({ role: 'user', content: userMessage });

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: conversationHistory,
        temperature: 0.7,
        max_tokens: 600,
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const reply = data.choices?.[0]?.message?.content || '抱歉，我暂时无法回答这个问题。';

    conversationHistory.push({ role: 'assistant', content: reply });
    return reply;
  } catch (err) {
    console.error('DeepSeek API 调用失败', err);
    return fallbackReply(userMessage);
  }
}

function fallbackReply(text: string): string {
  const lower = text.toLowerCase();
  if (lower.includes('匹配') || lower.includes('队伍')) return '建议使用左侧「🎯 智能匹配」模块：选择一支实践队伍，系统会根据需求契合度、实践缺口和紧急程度自动推荐最合适的乡村。';
  if (lower.includes('需求') || lower.includes('上报')) return '建议使用左侧「📋 需求上报」模块：选择乡村、填写需求类别和描述，提交后需求会自动进入匹配队列。';
  if (lower.includes('方案') || lower.includes('计划')) return '建议使用左侧「📝 方案生成」模块：选择目标乡村和实践团队，AI会生成包含目标、日程、预算的完整实践方案。';
  return '我可以帮您：\n• 智能匹配 — 为队伍找到最佳实践乡村\n• 需求上报 — 提交乡村基层需求\n• 方案生成 — 一键生成实践方案\n• 创建队伍 — 注册新的实践团队';
}

// ===== AI 方案生成 =====

export async function generatePlanWithAI(
  village: Village,
  team: Team,
  days: number
): Promise<PracticePlan> {
  const apiKey = import.meta.env.VITE_DEEPSEEK_API_KEY;
  if (!apiKey) return generatePlanFallback(village, team, days);

  const needList = village.needs
    .filter((n) => n.status === 'pending')
    .map((n) => `[${NEED_CATEGORY_LABELS[n.category]}|${n.urgency}] ${n.title}：${n.description}`)
    .join('\n');

  const prompt = `你是大学生三下乡社会实践方案策划专家。请根据以下信息生成一份详细的实践方案，严格按JSON格式返回。

## 目标乡村
- 名称：${village.name}
- 位置：${village.province} ${village.city} ${village.county}
- 人口：${village.population}人
- 简介：${village.description}
- 历史到访：${village.visitCount}次${village.visitCount === 0 ? '（实践空白区域，从未被高校团队到访）' : ''}
- 当前待解决需求：
${needList || '暂无特定需求，需要综合调研'}

## 实践团队
- 队名：${team.name}
- 院校：${team.university}
- 人数：${team.memberCount}人
- 技能：${team.skills.join('、') || '综合'}
- 偏好领域：${team.preferredCategories.map((c) => NEED_CATEGORY_LABELS[c]).join('、')}
- 简介：${team.description || '无'}

## 要求
- 实践时长：${days}天
- 生成一份完整的实践方案，包含：实践目标（3-5条）、每日日程安排（${days}天，每天分上午/下午/晚间）、经费预算明细、三阶段时间规划（前期准备/实地实践/后期总结）

请返回纯JSON格式，不要markdown代码块，结构如下：
{
  "title": "方案标题",
  "villageName": "${village.name}",
  "duration": "${days}天",
  "objectives": ["目标1", "目标2", "目标3"],
  "activities": [
    { "day": 1, "morning": "...", "afternoon": "...", "evening": "..." }
  ],
  "budget": {
    "total": 5000,
    "items": [{ "name": "交通费", "amount": 1000 }]
  },
  "schedule": [
    { "phase": "前期准备", "days": "出发前2周", "tasks": ["任务1", "任务2"] }
  ]
}`;

  try {
    const response = await fetch(API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: MODEL,
        messages: [
          { role: 'system', content: '你是社会实践方案策划专家。只返回纯JSON，不要markdown代码块，不要额外解释。' },
          { role: 'user', content: prompt },
        ],
        temperature: 0.8,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) throw new Error(`API error ${response.status}`);

    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content || '';
    // 清理可能的 markdown 代码块标记
    const json = raw.replace(/```json\s*|```\s*/g, '').trim();
    const plan: PracticePlan = JSON.parse(json);
    return plan;
  } catch (err) {
    console.error('AI方案生成失败，使用模板方案', err);
    return generatePlanFallback(village, team, days);
  }
}

function generatePlanFallback(village: Village, team: Team, days: number): PracticePlan {
  const pendingNeeds = village.needs.filter((n) => n.status === 'pending');
  const objectives: string[] = [];
  const activities: PracticePlan['activities'] = [];

  if (pendingNeeds.length > 0) {
    pendingNeeds.slice(0, 3).forEach((n) => {
      objectives.push(`针对"${n.title}"需求，开展${NEED_CATEGORY_LABELS[n.category]}专项服务`);
    });
  } else {
    objectives.push(`了解${village.name}发展现状，开展综合性社会实践调研`);
    objectives.push(`结合${team.university}专业优势，为乡村振兴建言献策`);
  }
  if (village.visitCount === 0) {
    objectives.unshift(`作为首批实践团队，建立${village.name}与高校的合作桥梁`);
  }

  const templates = [
    { morning: '抵达驻地，与村两委座谈，了解村情概况', afternoon: '实地走访，熟悉村落环境与基础设施', evening: '团队内部讨论，细化调研方案' },
    { morning: '分组入户调研，开展问卷调查', afternoon: '走访村小/卫生室/产业基地', evening: '数据整理与日总结会议' },
    { morning: '根据需求类别开展专项服务活动', afternoon: '组织村民参与式工作坊/培训', evening: '与村民联欢交流，增进了解' },
  ];

  for (let d = 0; d < days; d++) {
    const t = templates[d % templates.length];
    activities.push({
      day: d + 1,
      morning: d < 3 ? t.morning : `第${d + 1}天上午专项活动`,
      afternoon: d < 3 ? t.afternoon : `第${d + 1}天下午总结汇报`,
      evening: t.evening,
    });
  }
  if (activities.length > 0) {
    activities[activities.length - 1].afternoon = '成果汇报会：向村两委和村民代表汇报实践成果';
    activities[activities.length - 1].evening = '团队总结与返程准备';
  }

  const budgetItems = [
    { name: '交通费（往返）', amount: 200 * team.memberCount },
    { name: '住宿费', amount: 60 * team.memberCount * days },
    { name: '伙食费', amount: 50 * team.memberCount * days },
    { name: '活动物料费', amount: 500 },
    { name: '保险费用', amount: 15 * team.memberCount },
    { name: '应急备用金', amount: 300 },
  ];

  return {
    title: `"${team.name}"赴${village.province}${village.name}社会实践方案`,
    villageName: village.name,
    duration: `${days}天`,
    objectives,
    activities,
    budget: { total: budgetItems.reduce((s, i) => s + i.amount, 0), items: budgetItems },
    schedule: [
      { phase: '前期准备', days: '出发前2周', tasks: ['联系村委确认行程', '物资采购与方案细化', '团队成员分工与培训', '购买保险，报备学校'] },
      { phase: '实地实践', days: `第1-${days}天`, tasks: ['按日程开展调研与服务活动', '每日记录与影像留存', '中期小结与方案调整'] },
      { phase: '后期总结', days: '返程后2周', tasks: ['撰写实践报告', '成果整理与宣传', '与乡村建立长效联络机制'] },
    ],
  };
}
