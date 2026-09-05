import { getCuteLineArtUrl } from './utils/avatars';

export interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
  image?: string; // Base64 image data
}

export const AI_SYSTEM_INSTRUCTION = `
你是【真心 / RealHeart】的内置 AI。
你的身份：统一、无名、无角色。
你的语气：极简、中性、高冷但有力量。绝对禁止使用“亲爱的”、“宝贝”、“姐妹”等土味称呼。

你的核心逻辑：
1. 证据库逻辑：你必须调取用户提供的历史记录（包括之前的对话内容、日记记录、截图分析结果）进行“致命一击”。
2. 触发机制：只有当用户表现出极度不理智（如：反复纠结一个海王、自我怀疑、想要回头、恋爱脑发作）时，你才主动介入并进行严厉提醒。
3. 表达方式：不要安慰，要用数据和事实说话。

例子：
错误：“亲爱的别难过，他不值得。”
正确：“根据你 3 月 10 日的记录，他已经用同样的理由骗过你三次了。现在回头，数据预测结局不会有任何改变。”
`;

export interface UserProfile {
  uid: string;
  displayName: string;
  gender: 'male' | 'female' | 'other' | 'non-binary';
  orientation: 'male' | 'female' | 'both' | 'other' | 'hetero' | 'bi' | 'straight';
  mbti: string;
  personality: string;
  partnerPreferences: string;
  answers: Record<number, string>;
  createdAt: string;
  avatarUrl?: string;
  bio?: string;
  tags?: string[];
  lookingFor?: string;
  university?: string;
  degree?: string;
  pr_plan?: string;
  residence?: string;
  final_status?: string;
  time_in_aus?: string;
  mode?: 'dating' | 'friends';
  zodiac?: string;
  soul_report?: {
    tags: string[];
    traits: string[];
  };
}

export interface ChatSession {
  id: string;
  participants: string[];
  last_message: string;
  last_timestamp: any;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  text?: string;
  imageUrl?: string;
  timestamp: any;
  type?: 'text' | 'voice' | 'image';
  duration?: number;
}

export interface TarotCard {
  name: string;
  image: string;
  meaning: string;
}

export interface TarotReading {
  id: string;
  question: string;
  mode: 'single' | 'three';
  cards: TarotCard[];
  interpretation: string;
  timestamp: number;
}

export interface GuardianLog {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: number;
}

export interface DiaryEntry {
  id: string;
  date: string;
  title: string;
  content: string;
  userEdit?: string;
  moodScore: number;
  images?: string[];
  type?: 'regular' | 'guardian_summary' | 'guardian_log';
  guardianLogs?: GuardianLog[];
}

export interface Profile {
  id: string;
  wechatId: string;
  mbti: string;
  answers: Record<number, string>;
  realHeartValue: number;
}

export const TAROT_CARDS: TarotCard[] = [
  // Major Arcana
  { name: "愚者", image: "🃏", meaning: "新的开始，冒险，纯真" },
  { name: "魔术师", image: "🪄", meaning: "创造力，行动力，潜能" },
  { name: "女祭司", image: "🌙", meaning: "直觉，潜意识，神秘" },
  { name: "皇后", image: "👑", meaning: "丰饶，母性，自然" },
  { name: "皇帝", image: "🏛️", meaning: "权威，结构，稳定" },
  { name: "教皇", image: "⛪", meaning: "传统，信仰，教育" },
  { name: "恋人", image: "❤️", meaning: "选择，结合，价值观" },
  { name: "战车", image: "🛡️", meaning: "意志，胜利，控制" },
  { name: "力量", image: "🦁", meaning: "勇气，耐性，内在力量" },
  { name: "隐士", image: "🏮", meaning: "内省，孤独，寻求真理" },
  { name: "命运之轮", image: "🎡", meaning: "变化，周期，命运" },
  { name: "正义", image: "⚖️", meaning: "公平，真理，法律" },
  { name: "倒吊人", image: "⚓", meaning: "牺牲，新视角，等待" },
  { name: "死亡", image: "💀", meaning: "结束，转变，新生" },
  { name: "节制", image: "🧪", meaning: "平衡，融合，节制" },
  { name: "恶魔", image: "😈", meaning: "束缚，欲望，成瘾" },
  { name: "高塔", image: "⚡", meaning: "剧变，灾难，觉醒" },
  { name: "星星", image: "⭐", meaning: "希望，灵感，宁静" },
  { name: "月亮", image: "🌕", meaning: "不安，幻想，直觉" },
  { name: "太阳", image: "☀️", meaning: "快乐，成功，活力" },
  { name: "审判", image: "🎺", meaning: "觉醒，重生，决定" },
  { name: "世界", image: "🌍", meaning: "完成，旅行，圆满" },

  // Wands (Action, Passion, Energy)
  { name: "权杖一", image: "🪄", meaning: "灵感，新机会，创造力" },
  { name: "权杖二", image: "🪄", meaning: "规划，决定，远见" },
  { name: "权杖三", image: "🪄", meaning: "扩张，展望，合作" },
  { name: "权杖四", image: "🪄", meaning: "庆祝，和谐，稳定" },
  { name: "权杖五", image: "🪄", meaning: "竞争，冲突，挑战" },
  { name: "权杖六", image: "🪄", meaning: "胜利，认可，自信" },
  { name: "权杖七", image: "🪄", meaning: "防御，坚持，勇气" },
  { name: "权杖八", image: "🪄", meaning: "迅速，行动，消息" },
  { name: "权杖九", image: "🪄", meaning: "韧性，警惕，坚持" },
  { name: "权杖十", image: "🪄", meaning: "压力，负担，责任" },
  { name: "权杖侍从", image: "🪄", meaning: "探索，热情，消息" },
  { name: "权杖骑士", image: "🪄", meaning: "冲动，冒险，行动" },
  { name: "权杖皇后", image: "🪄", meaning: "自信，热情，社交" },
  { name: "权杖国王", image: "🪄", meaning: "领导力，愿景，企业家精神" },

  // Cups (Emotions, Relationships, Intuition)
  { name: "圣杯一", image: "🍷", meaning: "爱，新感情，直觉" },
  { name: "圣杯二", image: "🍷", meaning: "伙伴关系，吸引力，联系" },
  { name: "圣杯三", image: "🍷", meaning: "友谊，庆祝，社区" },
  { name: "圣杯四", image: "🍷", meaning: "冥想，冷淡，重新评估" },
  { name: "圣杯五", image: "🍷", meaning: "失落，悲伤，遗憾" },
  { name: "圣杯六", image: "🍷", meaning: "怀旧，纯真，分享" },
  { name: "圣杯七", image: "🍷", meaning: "幻想，选择，白日梦" },
  { name: "圣杯八", image: "🍷", meaning: "离开，寻求真理，放弃" },
  { name: "圣杯九", image: "🍷", meaning: "满足，愿望实现，快乐" },
  { name: "圣杯十", image: "🍷", meaning: "幸福，家庭，圆满" },
  { name: "圣杯侍从", image: "🍷", meaning: "敏感，创意，消息" },
  { name: "圣杯骑士", image: "🍷", meaning: "浪漫，理想主义，邀请" },
  { name: "圣杯皇后", image: "🍷", meaning: "直觉，同情，治愈" },
  { name: "圣杯国王", image: "🍷", meaning: "情感平衡，控制，慷慨" },

  // Swords (Intellect, Conflict, Communication)
  { name: "宝剑一", image: "⚔️", meaning: "突破，清晰，正义" },
  { name: "宝剑二", image: "⚔️", meaning: "僵局，逃避，选择" },
  { name: "宝剑三", image: "⚔️", meaning: "心碎，痛苦，分离" },
  { name: "宝剑四", image: "⚔️", meaning: "休息，恢复，沉思" },
  { name: "宝剑五", image: "⚔️", meaning: "冲突，失败，自私" },
  { name: "宝剑六", image: "⚔️", meaning: "过渡，离开，缓解" },
  { name: "宝剑七", image: "⚔️", meaning: "欺骗，逃避，背叛" },
  { name: "宝剑八", image: "⚔️", meaning: "束缚，无助，受限" },
  { name: "宝剑九", image: "⚔️", meaning: "焦虑，噩梦，绝望" },
  { name: "宝剑十", image: "⚔️", meaning: "背叛，终结，失败" },
  { name: "宝剑侍从", image: "⚔️", meaning: "好奇，警觉，沟通" },
  { name: "宝剑骑士", image: "⚔️", meaning: "行动，急躁，智力" },
  { name: "宝剑皇后", image: "⚔️", meaning: "独立，清晰，客观" },
  { name: "宝剑国王", image: "⚔️", meaning: "权威，逻辑，真理" },

  // Pentacles (Material, Work, Finance)
  { name: "星币一", image: "🪙", meaning: "繁荣，新机会，表现" },
  { name: "星币二", image: "🪙", meaning: "平衡，适应，优先顺序" },
  { name: "星币三", image: "🪙", meaning: "团队合作，技能，学习" },
  { name: "星币四", image: "🪙", meaning: "控制，稳定，占有欲" },
  { name: "星币五", image: "🪙", meaning: "贫困，孤立，不安全" },
  { name: "星币六", image: "🪙", meaning: "慷慨，分享，平衡" },
  { name: "星币七", image: "🪙", meaning: "耐心，评估，奖励" },
  { name: "星币八", image: "🪙", meaning: "学徒，勤奋，精通" },
  { name: "星币九", image: "🪙", meaning: "独立，奢侈，自给自足" },
  { name: "星币十", image: "🪙", meaning: "财富，遗产，家庭" },
  { name: "星币侍从", image: "🪙", meaning: "雄心，勤奋，机会" },
  { name: "星币骑士", image: "🪙", meaning: "可靠，耐心，努力工作" },
  { name: "星币皇后", image: "🪙", meaning: "务实，安全，慷慨" },
  { name: "星币国王", image: "🪙", meaning: "成功，纪律，丰富" },
];

export type QuestionType = 'text' | 'choice' | 'age' | 'birthday' | 'mbti' | 'hobbies' | 'date';

export interface SquareQuestion {
  id: number;
  question: string;
  category: string;
  type: QuestionType;
  options?: string[];
  gradient?: number;
}

export const MBTI_TYPES = [
  { code: 'INTJ', name: '建筑师', emoji: '♟️', color: 'bg-purple-900/40' },
  { code: 'INTP', name: '逻辑学家', emoji: '🔬', color: 'bg-purple-900/40' },
  { code: 'ENTJ', name: '指挥官', emoji: '👑', color: 'bg-purple-900/40' },
  { code: 'ENTP', name: '辩论家', emoji: '💡', color: 'bg-purple-900/40' },
  { code: 'INFJ', name: '提倡者', emoji: '🕊️', color: 'bg-green-900/40' },
  { code: 'INFP', name: '调停者', emoji: '🌸', color: 'bg-green-900/40' },
  { code: 'ENFJ', name: '主人公', emoji: '🌟', color: 'bg-green-900/40' },
  { code: 'ENFP', name: '活动家', emoji: '🎉', color: 'bg-green-900/40' },
  { code: 'ISTJ', name: '检查员', emoji: '📋', color: 'bg-blue-900/40' },
  { code: 'ISFJ', name: '守卫者', emoji: '🛡️', color: 'bg-blue-900/40' },
  { code: 'ESTJ', name: '总经理', emoji: '💼', color: 'bg-blue-900/40' },
  { code: 'ESFJ', name: '执政官', emoji: '🤝', color: 'bg-blue-900/40' },
  { code: 'ISTP', name: '鉴赏家', emoji: '🛠️', color: 'bg-yellow-900/40' },
  { code: 'ISFP', name: '探险家', emoji: '🎨', color: 'bg-yellow-900/40' },
  { code: 'ESTP', name: '企业家', emoji: '🚀', color: 'bg-yellow-900/40' },
  { code: 'ESFP', name: '表演者', emoji: '🎭', color: 'bg-yellow-900/40' },
];

export const DATING_QUESTIONS: SquareQuestion[] = [
  // 第 0 梯度：基础档案
  { id: 100, gradient: 0, question: "性别", category: "基础档案", type: 'choice', options: ['男', '女', 'Non-binary'] },
  { id: 101, gradient: 0, question: "取向", category: "基础档案", type: 'choice', options: ['寻男生', '寻女生', '不限'] },
  { id: 102, gradient: 0, question: "生日", category: "基础档案", type: 'date' },
  { id: 103, gradient: 0, question: "MBTI", category: "基础档案", type: 'mbti' },
  { id: 104, gradient: 0, question: "来澳时长", category: "基础档案", type: 'choice', options: ['1年内', '1-3年', '3-5年', '5年以上'] },

  // 第 1 梯度：学业与生存
  { id: 105, gradient: 1, question: "就读院校", category: "学业与生存", type: 'choice', options: ['Unimelb', 'Monash', 'RMIT', 'Deakin', 'Swinburne', '其他'] },
  { id: 106, gradient: 1, question: "学历阶段", category: "学业与生存", type: 'choice', options: ['本科', '硕士', '博士', '已毕业Working'] },
  { id: 107, gradient: 1, question: "身份规划", category: "学业与生存", type: 'choice', options: ['死磕PR拿身份', '随缘待几年', '坚定回国'] },
  { id: 108, gradient: 1, question: "居住区域", category: "学业与生存", type: 'choice', options: ['City', 'South Yarra', 'Clayton', 'Box Hill', '其他'] },
  { id: 109, gradient: 1, question: "Final 状态", category: "学业与生存", type: 'choice', options: ['图书馆卷王(提前复习)', '24小时战神(最后突击)'] },

  // 第 2 梯度：金钱与人品
  { id: 110, gradient: 2, question: "首次约会谁买单？", category: "生活观", type: 'choice', options: ['坚持AA', '谁提议谁请客', '轮流请'] },
  { id: 111, gradient: 2, question: "朋友借100块的态度", category: "生活观", type: 'choice', options: ['立刻转账', '找理由拒绝并怀疑友谊', '询问原因再定'] },
  { id: 112, gradient: 2, question: "消费偏好", category: "生活观", type: 'choice', options: ['攒钱买名牌包表', '花钱吃遍墨尔本Brunch'] },
  { id: 113, gradient: 2, question: "街头扶老人反应", category: "生活观", type: 'choice', options: ['立刻冲上去', '先确认安全/录像再行动', '帮打000不靠近'] },
  { id: 114, gradient: 2, question: "收到丑但贵的礼物", category: "生活观", type: 'choice', options: ['违心夸奖并背出去', '直接告诉对方不好看并退货'] },
  { id: 115, gradient: 2, question: "家务分工", category: "生活观", type: 'choice', options: ['眼里容不下头发的洁癖', '袜子攒一周再洗的随性派'] },

  // 第 3 梯度：情感底线
  { id: 116, gradient: 3, question: "对前任数量(10+)看法", category: "情感底线", type: 'choice', options: ['经验丰富懂人心', '对待感情不走心'] },
  { id: 117, gradient: 3, question: "前任断联态度", category: "情感底线", type: 'choice', options: ['彻底互删消失', '躺在好友位不打扰', '还能做朋友'] },
  { id: 118, gradient: 3, question: "是否支持互看手机？", category: "情感底线", type: 'choice', options: ['支持(建立信任)', '反对(侵犯隐私)'] },
  { id: 119, gradient: 3, question: "吵架处理方式", category: "情感底线", type: 'choice', options: ['当场说清楚不隔夜', '暂时冷战各自冷静', '等对方先哄'] },
  { id: 120, gradient: 3, question: "出轨无法原谅项", category: "情感底线", type: 'choice', options: ['精神出轨', '肉体出轨', '都一样严重'] },
  { id: 121, gradient: 3, question: "异性边界", category: "情感底线", type: 'choice', options: ['恋爱后绝不与异性单独吃饭', '提前报备可以见面', '问心无愧不需要解释'] },

  // 第 4 梯度：性格与实战
  { id: 122, gradient: 4, question: "社交能量", category: "深度匹配", type: 'choice', options: ['离了朋友会死的E人', '需要独自充电的I人'] },
  { id: 123, gradient: 4, question: "依恋类型", category: "深度匹配", type: 'choice', options: ['事事报备型', '彼此独立互不干涉型'] },
  { id: 124, gradient: 4, question: "安慰方式", category: "深度匹配", type: 'choice', options: ['讲道理分析解决办法', '先抱抱安慰情绪'] },
  { id: 125, gradient: 4, question: "情绪稳定性", category: "深度匹配", type: 'choice', options: ['在车站被凶会委屈很久', '瞬间骂回去并翻篇'] },
  { id: 126, gradient: 4, question: "生病需求", category: "深度匹配", type: 'choice', options: ['希望对方跨城来照顾', '只要口头叮嘱喝水就好'] },
  { id: 127, gradient: 4, question: "为爱改变", category: "深度匹配", type: 'choice', options: ['会为了爱情改变留澳/回国计划', '绝不妥协'] },
  { id: 128, gradient: 4, question: "突发状况担当", category: "深度匹配", type: 'choice', options: ['自驾爆胎会尝试自己换', '焦虑埋怨', '冷静等待救援并安抚对方'] },
  { id: 129, gradient: 4, question: "家庭参与度", category: "深度匹配", type: 'choice', options: ['重大决定100%听父母的', '50-50参考', '自己完全掌控'] },

  // 第 5 梯度：真心告白
  { id: 130, gradient: 5, question: "恋爱状态", category: "真心告白", type: 'choice', options: ['母单(没谈过)', '谈过1-2次', '资深选手'] },
  { id: 132, gradient: 5, question: "在墨尔本的哪一个瞬间，让你最想找个人分享生活？(限20字以上)", category: "真心告白", type: 'text' },
];

export const FRIENDS_QUESTIONS: SquareQuestion[] = [
  // 第 0 梯度：基础档案
  { id: 200, gradient: 0, question: "性别", category: "基础档案", type: 'choice', options: ['男', '女', 'Non-binary'] },
  { id: 201, gradient: 0, question: "想找什么样的搭子？", category: "基础档案", type: 'choice', options: ['饭搭子', '运动搭子', '学习搭子', '旅游搭子', '纯聊天'] },
  { id: 202, gradient: 0, question: "生日", category: "基础档案", type: 'date' },
  { id: 203, gradient: 0, question: "MBTI", category: "基础档案", type: 'mbti' },
  { id: 204, gradient: 0, question: "来澳时长", category: "基础档案", type: 'choice', options: ['1年内', '1-3年', '3-5年', '5年以上'] },

  // 第 1 梯度：学业与生存
  { id: 205, gradient: 1, question: "就读院校", category: "学业与生存", type: 'choice', options: ['Unimelb', 'Monash', 'RMIT', 'Deakin', 'Swinburne', '其他'] },
  { id: 206, gradient: 1, question: "学历阶段", category: "学业与生存", type: 'choice', options: ['本科', '硕士', '博士', '已毕业Working'] },
  { id: 207, gradient: 1, question: "居住区域", category: "学业与生存", type: 'choice', options: ['City', 'South Yarra', 'Clayton', 'Box Hill', '其他'] },
  { id: 208, gradient: 1, question: "Final 状态", category: "学业与生存", type: 'choice', options: ['图书馆卷王', '24小时战神'] },
  { id: 209, gradient: 1, question: "学习习惯", category: "学业与生存", type: 'choice', options: ['喜欢安静自习', '喜欢讨论交流'] },

  // 第 2 梯度：社交与爱好
  { id: 210, gradient: 2, question: "周末通常怎么过？", category: "社交爱好", type: 'choice', options: ['宅家打游戏/看剧', '出门Brunch/逛街', '户外徒步/运动', '蹦迪/喝酒'] },
  { id: 211, gradient: 2, question: "社交频率", category: "社交爱好", type: 'choice', options: ['每天都要见人', '一周一次', '一月一次', '随缘'] },
  { id: 212, gradient: 2, question: "是否抽烟/喝酒？", category: "社交爱好", type: 'choice', options: ['都不', '只喝酒', '只抽烟', '都来点'] },
  { id: 213, gradient: 2, question: "喜欢的音乐类型", category: "社交爱好", type: 'choice', options: ['流行/K-pop', '摇滚/民谣', '电子/说唱', '古典/爵士'] },
  { id: 214, gradient: 2, question: "运动习惯", category: "社交爱好", type: 'choice', options: ['健身房常客', '偶尔跑跑步', '生命在于静止'] },
  { id: 215, gradient: 2, question: "你的兴趣标签", category: "社交爱好", type: 'hobbies' },

  // 第 3 梯度：友谊观
  { id: 216, gradient: 3, question: "朋友借100块的态度", category: "友谊观", type: 'choice', options: ['立刻转账', '找理由拒绝', '询问原因再定'] },
  { id: 217, gradient: 3, question: "约会迟到容忍度", category: "友谊观", type: 'choice', options: ['15分钟内', '半小时内', '只要提前说多久都行', '绝不容忍'] },
  { id: 218, gradient: 3, question: "冲突处理方式", category: "友谊观", type: 'choice', options: ['直接沟通解决', '冷战慢慢疏远', '找中间人调解'] },
  { id: 219, gradient: 3, question: "社交偏好", category: "友谊观", type: 'choice', options: ['喜欢热闹的大群', '喜欢深度1对1'] },
  { id: 220, gradient: 3, question: "秘密分享", category: "友谊观", type: 'choice', options: ['守口如瓶', '只跟最亲近的人说', '大喇叭'] },
  { id: 221, gradient: 3, question: "当朋友遇到困难", category: "友谊观", type: 'choice', options: ['提供实际帮助', '提供情绪价值', '默默陪伴'] },

  // 第 4 梯度：搭子实战
  { id: 222, gradient: 4, question: "火锅口味", category: "搭子实战", type: 'choice', options: ['无辣不欢', '清汤/番茄', '菌汤/养生'] },
  { id: 223, gradient: 4, question: "旅行风格", category: "搭子实战", type: 'choice', options: ['特种兵式打卡', '佛系躺平度假', '深度体验当地'] },
  { id: 224, gradient: 4, question: "是否接受拼车/拼单？", category: "搭子实战", type: 'choice', options: ['非常欢迎', '看情况', '不喜欢跟人拼'] },
  { id: 232, gradient: 4, question: "最后，用一句话形容你理想的友谊？", category: "真心告白", type: 'text' },
];

export const SQUARE_QUESTIONS = DATING_QUESTIONS;

export const mockUsers: UserProfile[] = [
  {
    uid: 'mock-user-1',
    displayName: '林深见鹿',
    gender: 'female',
    orientation: 'hetero',
    mbti: 'ENFP',
    personality: '热情、充满好奇心、喜欢探索新事物',
    partnerPreferences: '有责任感、能一起疯的人',
    answers: { 
      100: '女',
      101: '寻男生',
      102: '2000-10-12',
      103: 'ENFP',
      104: '1-3年',
      105: 'Unimelb', 
      106: '硕士', 
      107: '随缘待几年',
      108: 'City',
      109: '24小时战神(最后突击)',
      110: '谁提议谁请客',
      111: '询问原因再定',
      112: '花钱吃遍墨尔本Brunch',
      113: '立刻冲上去',
      114: '直接告诉对方不好看并退货',
      116: '对待感情不走心',
      117: '彻底互删消失',
      118: '支持(建立信任)',
      119: '当场说清楚不隔夜',
      120: '精神出轨',
      122: '离了朋友会死的E人',
      123: '事事报备型',
      124: '先抱抱安慰情绪',
      127: '会为了爱情改变留澳/回国计划',
      132: '在Yarra River边看日落的时候，真的很想有个人一起分享这份宁静。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('猫咪'),
    university: '墨大 (Unimelb)',
    degree: '硕士',
    pr_plan: '随缘，待几年回国',
    residence: 'City',
    mode: 'dating',
    soul_report: {
      tags: ['24岁', '来澳1-3年', '墨大', '硕士', '计划回国', 'City', 'RMIT', '来澳洲3年', '最后 24 小时爆发的“全能战神”', '“在Yarra River边看日落的时候，真的很想有个人一起分享这份宁静。”'],
      traits: ['体验派', '重情重义', '情绪价值拉满', '顶级 E 人']
    }
  },
  {
    uid: 'mock-user-2',
    displayName: '极光',
    gender: 'male',
    orientation: 'hetero',
    mbti: 'INTJ',
    personality: '理性、独立、喜欢深度思考',
    partnerPreferences: '聪明、有主见',
    answers: { 
      100: '男',
      101: '寻女生',
      102: '1997-01-05',
      103: 'INTJ',
      104: '3-5年',
      105: 'Monash', 
      106: '本科', 
      107: '死磕PR拿身份',
      108: 'Clayton',
      109: '图书馆卷王(提前复习)',
      110: '坚持 AA',
      111: '立刻转账',
      112: '攒钱买名牌包表',
      113: '先确认安全/录像再行动',
      114: '违心夸奖并背出去',
      116: '经验丰富懂人心',
      117: '躺在好友位不打扰',
      118: '反对(侵犯隐私)',
      119: '暂时冷战各自冷静',
      120: '肉体出轨',
      122: '需要独自充电的I人',
      123: '彼此独立互不干涉型',
      124: '讲道理分析解决办法',
      127: '绝不妥协',
      132: '一个人在图书馆熬夜赶due，看着窗外凌晨的墨尔本，觉得有点孤独。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('修狗'),
    university: '莫纳什 (Monash)',
    degree: '本科',
    pr_plan: '死磕 PR 拿身份',
    residence: 'Clayton',
    mode: 'dating',
    soul_report: {
      tags: ['27岁', '来澳3年以上', '莫纳什', '本科', '坚定拿PR', 'Clayton', 'Monash', '来澳洲5年', '提前两周复习的“图书馆钉子户”', '“一个人在图书馆熬夜赶due，看着窗外凌晨的墨尔本，觉得有点孤独。”'],
      traits: ['理性消费', '边界感强', '独立清醒', '深度 I 人']
    }
  },
  {
    uid: 'mock-user-3',
    displayName: '夏日微风',
    gender: 'female',
    orientation: 'hetero',
    mbti: 'ISFP',
    personality: '温柔、随和、热爱艺术',
    partnerPreferences: '体贴、懂得欣赏生活',
    answers: { 
      100: '女',
      101: '寻男生',
      102: '2002-03-15',
      103: 'ISFP',
      104: '1年内',
      105: 'RMIT', 
      106: '本科', 
      107: '坚定回国',
      108: 'South Yarra',
      109: '24小时战神(最后突击)',
      110: '谁提议谁请客',
      111: '立刻转账',
      112: '花钱吃遍墨尔本Brunch',
      113: '先确认安全/录像再行动',
      114: '违心夸奖并背出去',
      116: '对待感情不走心',
      117: '彻底互删消失',
      118: '支持(建立信任)',
      119: '当场说清楚不隔夜',
      120: '精神出轨',
      122: '需要独自充电的I人',
      123: '事事报备型',
      124: '先抱抱安慰情绪',
      127: '绝不妥协',
      132: '在NGV看展的时候，看到一幅很感动的画，转头却发现无人可以诉说。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('兔兔'),
    university: 'RMIT',
    degree: '本科',
    pr_plan: '坚定回国发展',
    residence: 'South Yarra',
    mode: 'dating',
    soul_report: {
      tags: ['22岁', '来澳1年内', 'RMIT', '本科', '计划回国', 'South Yarra', 'RMIT', '来澳洲1年', '最后 24 小时爆发的“全能战神”', '“在NGV看展的时候，看到一幅很感动的画，转头却发现无人可以诉说。”'],
      traits: ['体验派', '重情重义', '情绪价值拉满', '深度 I 人']
    }
  },
  {
    uid: 'mock-user-4',
    displayName: '墨尔本晴',
    gender: 'male',
    orientation: 'hetero',
    mbti: 'ENFJ',
    personality: '开朗、乐于助人、团队领袖',
    partnerPreferences: '善良、有共同语言',
    answers: { 
      100: '男',
      101: '寻女生',
      102: '1999-06-20',
      103: 'ENFJ',
      104: '3-5年',
      105: 'RMIT', 
      106: '硕士', 
      107: '死磕PR拿身份',
      108: 'City',
      109: '图书馆卷王(提前复习)',
      110: '轮流请',
      111: '立刻转账',
      112: '花钱吃遍墨尔本Brunch',
      113: '立刻冲上去',
      114: '违心夸奖并背出去',
      116: '经验丰富懂人心',
      117: '躺在好友位不打扰',
      118: '支持(建立信任)',
      119: '当场说清楚不隔夜',
      120: '都一样严重',
      122: '离了朋友会死的E人',
      123: '事事报备型',
      124: '先抱抱安慰情绪',
      127: '会为了爱情改变留澳/回国计划',
      132: '在Docklands看烟火的时候，身边都是成双成对的人，那一刻最想有个伴。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('星星'),
    university: 'RMIT',
    degree: '硕士',
    pr_plan: '死磕 PR 拿身份',
    residence: 'City',
    mode: 'dating',
    soul_report: {
      tags: ['25岁', '来澳3-5年', 'RMIT', '硕士', '坚定拿PR', 'City', 'RMIT', '来澳洲4年', '提前复习的“图书馆卷王”', '“在Docklands看烟火的时候，身边都是成双成对的人，那一刻最想有个伴。”'],
      traits: ['社交达人', '责任感强', '情绪稳定', '顶级 E 人']
    }
  },
  {
    uid: 'mock-user-5',
    displayName: '不吃香菜',
    gender: 'female',
    orientation: 'hetero',
    mbti: 'INFP',
    personality: '理想主义、敏感、富有同情心',
    partnerPreferences: '灵魂契合、懂我的人',
    answers: { 
      100: '女',
      101: '寻男生',
      102: '2001-11-11',
      103: 'INFP',
      104: '1-3年',
      105: 'Deakin', 
      106: '本科', 
      107: '随缘待几年',
      108: 'Burwood',
      109: '24小时战神(最后突击)',
      110: '谁提议谁请客',
      111: '询问原因再定',
      112: '攒钱买名牌包表',
      113: '帮打000不靠近',
      114: '直接告诉对方不好看并退货',
      116: '对待感情不走心',
      117: '彻底互删消失',
      118: '支持(建立信任)',
      119: '当场说清楚不隔夜',
      120: '精神出轨',
      122: '需要独自充电的I人',
      123: '彼此独立互不干涉型',
      124: '先抱抱安慰情绪',
      127: '绝不妥协',
      132: '下雨天一个人躲在咖啡馆里写日记，看着窗外的行人，突然很想被理解。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('太阳'),
    university: '迪肯 (Deakin)',
    degree: '本科',
    pr_plan: '随缘待几年',
    residence: 'Burwood',
    mode: 'dating',
    soul_report: {
      tags: ['23岁', '来澳1-3年', '迪肯', '本科', '随缘待几年', 'Burwood', 'Deakin', '来澳洲2年', '最后 24 小时战神', '“下雨天一个人躲在咖啡馆里写日记，看着窗外的行人，突然很想被理解。”'],
      traits: ['理想主义', '内心丰富', '独立自主', '深度 I 人']
    }
  },
  {
    uid: 'mock-user-6',
    displayName: '阿强',
    gender: 'male',
    orientation: 'hetero',
    mbti: 'ISTP',
    personality: '务实、冷静、动手能力强',
    partnerPreferences: '简单直接、不作的人',
    answers: { 
      100: '男',
      101: '寻女生',
      102: '1998-08-18',
      103: 'ISTP',
      104: '5年以上',
      105: 'Swinburne', 
      106: '本科', 
      107: '死磕PR拿身份',
      108: 'Box Hill',
      109: '24小时战神(最后突击)',
      110: '坚持 AA',
      111: '找理由拒绝并怀疑友谊',
      112: '攒钱买名牌包表',
      113: '帮打000不靠近',
      114: '直接告诉对方不好看并退货',
      116: '经验丰富懂人心',
      117: '躺在好友位不打扰',
      118: '反对(侵犯隐私)',
      119: '暂时冷战各自冷静',
      120: '肉体出轨',
      122: '需要独自充电的I人',
      123: '彼此独立互不干涉型',
      124: '讲道理分析解决办法',
      127: '绝不妥协',
      132: '修好了坏掉的台灯，却发现没人可以炫耀的时候，觉得生活缺了点什么。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('雪花'),
    university: '斯威本 (Swinburne)',
    degree: '本科',
    pr_plan: '死磕 PR 拿身份',
    residence: 'Box Hill',
    mode: 'dating',
    soul_report: {
      tags: ['26岁', '来澳5年以上', '斯威本', '本科', '坚定拿PR', 'Box Hill', 'Swinburne', '来澳洲6年', '24小时战神', '“修好了坏掉的台灯，却发现没人可以炫耀的时候，觉得生活缺了点什么。”'],
      traits: ['务实派', '动手达人', '冷静理智', '深度 I 人']
    }
  },
  {
    uid: 'mock-friend-1',
    displayName: '墨尔本小锦鲤',
    gender: 'female',
    orientation: 'both',
    mbti: 'ENFP',
    personality: '活泼开朗，喜欢探店和户外',
    partnerPreferences: '寻找志同道合的饭搭子',
    answers: { 
      200: '女',
      201: '饭搭子',
      202: '2001-05-20',
      203: 'ENFP',
      204: '1-3年',
      205: 'Unimelb',
      206: '硕士',
      207: 'City',
      208: '24小时战神',
      210: '出门Brunch/逛街',
      232: '墨尔本最好吃的Brunch我都想去试试！'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('咖啡'),
    university: 'Unimelb',
    residence: 'City',
    mode: 'friends',
    soul_report: {
      tags: ['来澳洲2年', 'Unimelb', 'City', '寻饭搭子', '“墨尔本最好吃的Brunch我都想去试试！”'],
      traits: ['社交达人', '精致生活家']
    }
  },
  {
    uid: 'mock-friend-2',
    displayName: '行走的代码',
    gender: 'male',
    orientation: 'both',
    mbti: 'INTP',
    personality: '沉迷编程，偶尔也想出门透气',
    partnerPreferences: '寻找学习或运动搭子',
    answers: { 
      200: '男',
      201: '学习搭子',
      202: '1999-11-11',
      203: 'INTP',
      204: '3-5年',
      205: 'Monash',
      206: '本科',
      207: 'Clayton',
      208: '图书馆卷王',
      210: '户外徒步/运动',
      232: '有没有人一起去Clayton图书馆卷一下？'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('云朵'),
    university: 'Monash',
    residence: 'Clayton',
    mode: 'friends',
    soul_report: {
      tags: ['来澳洲4年', 'Monash', 'Clayton', '寻学习搭子', '“有没有人一起去Clayton图书馆卷一下？”'],
      traits: ['学术卷王', '理性派']
    }
  },
  {
    uid: 'mock-friend-3',
    displayName: '猫本流浪者',
    gender: 'female',
    orientation: 'both',
    mbti: 'ISFP',
    personality: '喜欢摄影和旅行，随性而活',
    partnerPreferences: '寻找旅游搭子',
    answers: { 
      200: '女',
      201: '旅游搭子',
      202: '2000-08-08',
      203: 'ISFP',
      204: '1年内',
      205: 'RMIT',
      206: '本科',
      207: 'South Yarra',
      208: '24小时战神',
      210: '户外徒步/运动',
      232: '想去大洋路自驾，缺个会拍照的队友。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: getCuteLineArtUrl('幽灵'),
    university: 'RMIT',
    residence: 'South Yarra',
    mode: 'friends',
    soul_report: {
      tags: ['来澳洲1年', 'RMIT', 'South Yarra', '寻旅游搭子', '“想去大洋路自驾，缺个会拍照的队友。”'],
      traits: ['特种兵驴友', '感性派']
    }
  }
];
