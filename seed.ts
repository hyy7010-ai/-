import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.VITE_SUPABASE_URL || 'https://davgzdedqhkgmydzvvcy.supabase.co';
const supabaseAnonKey = process.env.VITE_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRhdmd6ZGVkcWhrZ215ZHp2dmN5Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQwNTc1ODEsImV4cCI6MjA4OTYzMzU4MX0.tdJFt8l-4siMS3ljUJjBSBBDi4hJwhzMKR4ZQPXddrI';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

const mockUsers = [
  {
    uid: 'mock-user-1',
    displayName: '林深见鹿',
    gender: 'female',
    orientation: 'hetero',
    mbti: 'ENFP',
    personality: '热情、充满好奇心、喜欢探索新事物',
    partnerPreferences: '有责任感、能一起疯的人',
    answers: { 
      1: '墨大 (Unimelb)', 
      2: '硕士', 
      3: '随缘，待几年回国',
      4: 'City',
      5: '最后 24 小时爆发的“全能战神”',
      6: '谁提议谁请客',
      7: '找理由拒绝并怀疑这段友谊',
      8: '花钱吃遍墨尔本顶级 Brunch',
      9: '立刻冲上去扶',
      10: '直接要求退货',
      11: '对待感情不走心',
      12: '绝对不能接受',
      13: '支持互看手机建立信任',
      14: '当场说清楚',
      15: '精神出轨绝对无法原谅',
      16: 'ENFP',
      17: '离了朋友会死的“顶级 E 人”',
      18: '事事有交代的报备型',
      19: '先抱抱安慰情绪',
      20: '容易为了爱情放弃计划',
      21: '在Yarra River边看日落的时候，真的很想有个人一起分享这份宁静。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/seed/mock1/200/200',
    university: '墨大 (Unimelb)',
    degree: '硕士',
    pr_plan: '随缘，待几年回国',
    soul_report: {
      tags: ['墨大 (Unimelb) · 硕士 · 随缘，待几年回国', 'City', '最后 24 小时爆发的“全能战神”'],
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
      1: '莫纳什 (Monash)', 
      2: '本科', 
      3: '死磕 PR 拿身份',
      4: 'Clayton',
      5: '提前两周复习的“图书馆钉子户”',
      6: '坚持 AA',
      7: '立刻转账',
      8: '省钱买名牌包/表',
      9: '先确认环境安全再行动',
      10: '违心夸奖',
      11: '经验丰富',
      12: '能接受',
      13: '觉得这是侵犯隐私',
      14: '各自冷静（冷战）',
      15: '肉体出轨绝对无法原谅',
      16: 'INTJ',
      17: '需要独自充电的“深度 I 人”',
      18: '彼此独立的互不干涉型',
      19: '讲道理分析解决办法',
      20: '绝对不会为了爱情改变计划',
      21: '一个人在图书馆熬夜赶due，看着窗外凌晨的墨尔本，觉得有点孤独。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/seed/mock2/200/200',
    university: '莫纳什 (Monash)',
    degree: '本科',
    pr_plan: '死磕 PR 拿身份',
    soul_report: {
      tags: ['莫纳什 (Monash) · 本科 · 死磕 PR 拿身份', 'Clayton', '提前两周复习的“图书馆钉子户”'],
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
      1: 'RMIT', 
      2: '本科', 
      3: '坚定回国发展',
      4: 'South Yarra',
      5: '最后 24 小时爆发的“全能战神”',
      6: '谁提议谁请客',
      7: '立刻转账',
      8: '花钱吃遍墨尔本顶级 Brunch',
      9: '先确认环境安全再行动',
      10: '违心夸奖',
      11: '对待感情不走心',
      12: '绝对不能接受',
      13: '支持互看手机建立信任',
      14: '当场说清楚',
      15: '精神出轨绝对无法原谅',
      16: 'ISFP',
      17: '需要独自充电的“深度 I 人”',
      18: '事事有交代的报备型',
      19: '先抱抱安慰情绪',
      20: '绝对不会为了爱情改变计划',
      21: '在NGV看展的时候，看到一幅很感动的画，转头却发现无人可以诉说。'
    },
    createdAt: new Date().toISOString(),
    avatarUrl: 'https://picsum.photos/seed/mock3/200/200',
    university: 'RMIT',
    degree: '本科',
    pr_plan: '坚定回国发展',
    soul_report: {
      tags: ['RMIT · 本科 · 坚定回国发展', 'South Yarra', '最后 24 小时爆发的“全能战神”'],
      traits: ['体验派', '重情重义', '情绪价值拉满', '深度 I 人']
    }
  }
];

async function seed() {
  console.log('Seeding mock users...');
  for (const user of mockUsers) {
    const { data, error } = await supabase
      .from('profiles')
      .upsert(user);
    if (error) {
      console.error('Error inserting user:', user.uid, error);
    } else {
      console.log('Inserted user:', user.uid);
    }
  }
  console.log('Done!');
}

seed();
