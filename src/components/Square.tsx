import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Heart, ShieldCheck, MessageSquare, ChevronRight, UserCheck, Sparkles, Book, Users, LogIn, RotateCw, Flag, Gamepad2, User, LayoutGrid, Ghost, MapPin, Globe, Map, Gift, BookOpen, Coffee, Car, Mic, MicOff, Play, CheckCircle2, Trophy, UserPlus, FileText, Zap, Compass, CheckSquare, Handshake, Repeat, Calendar, Tent, Sun, Image as ImageIcon, Edit3, Dices, X, Send, Maximize2, Minimize2 } from 'lucide-react';
import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer } from 'recharts';
import { DATING_QUESTIONS, FRIENDS_QUESTIONS, UserProfile, ChatSession, MBTI_TYPES, mockUsers } from '../types';
import { useAuth } from '../App';
import { db } from '../firebase';
import { collection, query, where, limit, getDocs, setDoc, updateDoc, doc, arrayContains } from 'firebase/firestore';
import { getCuteLineArtUrl } from '../utils/avatars';

const HOBBIES_LIST = [
  "健身", "跑步", "游泳", "瑜伽", "篮球", "足球", "羽毛球", "网球", "滑板", "滑雪", "冲浪", "潜水", "攀岩", "徒步", "露营", "骑行",
  "阅读", "写作", "画画", "摄影", "书法", "手账", "烹饪", "烘焙", "品茶", "咖啡", "调酒", "乐器", "唱歌", "跳舞", "听音乐", "看电影", "追剧", "动漫", "游戏", "电竞", "桌游", "剧本杀", "密室逃脱", "逛街", "探店", "旅行", "看展", "看演唱会", "看话剧", "脱口秀",
  "养宠物", "种花", "手工", "DIY", "编程", "投资", "理财", "冥想", "心理学", "哲学", "历史", "天文", "占星", "塔罗", "二次元", "汉服", "Lolita", "Cosplay", "剪辑", "自媒体", "志愿者", "公益"
];

const getZodiacInfo = (month: number, day: number) => {
  if ((month === 3 && day >= 21) || (month === 4 && day <= 19)) return { name: '白羊座', icon: '♈︎' };
  if ((month === 4 && day >= 20) || (month === 5 && day <= 20)) return { name: '金牛座', icon: '♉︎' };
  if ((month === 5 && day >= 21) || (month === 6 && day <= 21)) return { name: '双子座', icon: '♊︎' };
  if ((month === 6 && day >= 22) || (month === 7 && day <= 22)) return { name: '巨蟹座', icon: '♋︎' };
  if ((month === 7 && day >= 23) || (month === 8 && day <= 22)) return { name: '狮子座', icon: '♌︎' };
  if ((month === 8 && day >= 23) || (month === 9 && day <= 22)) return { name: '处女座', icon: '♍︎' };
  if ((month === 9 && day >= 23) || (month === 10 && day <= 23)) return { name: '天秤座', icon: '♎︎' };
  if ((month === 10 && day >= 24) || (month === 11 && day <= 22)) return { name: '天蝎座', icon: '♏︎' };
  if ((month === 11 && day >= 23) || (month === 12 && day <= 21)) return { name: '射手座', icon: '♐︎' };
  if ((month === 12 && day >= 22) || (month === 1 && day <= 19)) return { name: '摩羯座', icon: '♑︎' };
  if ((month === 1 && day >= 20) || (month === 2 && day <= 18)) return { name: '水瓶座', icon: '♒︎' };
  if ((month === 2 && day >= 19) || (month === 3 && day <= 20)) return { name: '双鱼座', icon: '♓︎' };
  return { name: '未知星座', icon: '✨' };
};

const MbtiBadge = ({ mbti, className = "" }: { mbti: string, className?: string }) => {
  const mbtiGroups: Record<string, string> = {
    'Architect': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Logician': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Commander': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Debater': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'Advocate': 'bg-emerald-500/20 text-neon-green border-emerald-500/30',
    'Mediator': 'bg-emerald-500/20 text-neon-green border-emerald-500/30',
    'Protagonist': 'bg-emerald-500/20 text-neon-green border-emerald-500/30',
    'Campaigner': 'bg-emerald-500/20 text-neon-green border-emerald-500/30',
    'Logistician': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Defender': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Executive': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Consul': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'Virtuoso': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Adventurer': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Entrepreneur': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'Entertainer': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
  };

  const mbtiName = MBTI_TYPES.find(t => t.code === mbti.toUpperCase())?.name || mbti;
  const colorClass = Object.entries(mbtiGroups).find(([name]) => mbtiName.includes(name))?.[1] || 'bg-white/10 text-white/60 border-white/10';

  return (
    <div className={`px-2 py-0.5 rounded-md border text-[10px] font-mono font-bold tracking-wider ${colorClass} ${className}`}>
      {mbti}
    </div>
  );
};

export default function Square({ 
  onNavigate, 
  onSelectChat, 
  socialMode = 'dating', 
  onSocialModeChange, 
  step = 'intro', 
  onStepChange, 
  questionIndex = 0,
  onQuestionIndexChange,
  answers = {},
  onAnswersChange,
  showFriends1v1 = false,
  setShowFriends1v1,
  renderHeader
}: { 
  onNavigate: (mode: 'home' | 'sanctuary' | 'square' | 'messages') => void, 
  onSelectChat?: (id: string, otherUser: UserProfile) => void,
  socialMode?: 'dating' | 'friends',
  onSocialModeChange?: (mode: 'dating' | 'friends') => void,
  step?: 'intro' | 'challenge-intro' | 'challenge' | 'challenge-complete' | 'build-profile' | 'ready-to-match' | 'waiting-match' | 'review' | 'matching' | 'friends-home',
  onStepChange?: (step: 'intro' | 'challenge-intro' | 'challenge' | 'challenge-complete' | 'build-profile' | 'ready-to-match' | 'waiting-match' | 'review' | 'matching' | 'friends-home') => void,
  questionIndex?: number,
  onQuestionIndexChange?: (index: number) => void,
  answers?: Record<number, string>,
  onAnswersChange?: (answers: Record<number, string>) => void,
  showFriends1v1?: boolean,
  setShowFriends1v1?: (show: boolean) => void,
  renderHeader?: () => React.ReactNode
}) {
  const { user, profile, signIn, refreshProfile, setProfile, setShowAuthModal, setShowProfileModal } = useAuth();
  const [showMatchNotification, setShowMatchNotification] = useState(false);
  
  useEffect(() => {
    if (step === 'waiting-match') {
      setShowMatchNotification(false);
      const timer = setTimeout(() => {
        setShowMatchNotification(true);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [step]);

  useEffect(() => {
    setShowFriends1v1(false);
  }, [socialMode]);

  const questions = socialMode === 'friends' ? FRIENDS_QUESTIONS : DATING_QUESTIONS;

  const content = {
    dating: {
      slogan: "三观契合，是灵魂最深处的共振。",
      description: "这里没有快餐式的“左滑右滑”。我们通过深度三观预审，在数据与灵魂的交汇处，为你寻找真正的共鸣。",
      features: [
        { id: 'match', title: "开启灵魂匹配", desc: "30余道真实生活场景题", icon: Sparkles, color: "text-sunset-orange", bg: "bg-sunset-orange/20", content: "不是问你喜欢什么类型，而是真实场景下你会怎么做。AI根据你的答案计算五维契合度，为你推荐真正契合的人。" }
      ],
      accent: "text-aurora-pink",
      gradient: "from-aurora-pink to-sunset-orange",
      glow: "bg-aurora-pink"
    },
    friends: {
      slogan: "",
      description: "不论是饭搭子、运动搭子还是旅游搭子，在这里找到真正合拍的人。",
      features: [
        { id: 'friendship', title: "找同频朋友", desc: "深度价值匹配", icon: Users, color: "text-neon-green", bg: "bg-neon-green/20", content: "不论是饭搭子、看展搭子，还是周末游，通过深度价值匹配找到同频伙伴。" }
      ],
      accent: "text-neon-green",
      gradient: "from-neon-green to-cyan-400",
      glow: "bg-neon-green"
    }
  };

  const currentContent = content[socialMode];

  const [buildName, setBuildName] = useState(user?.user_metadata?.full_name || '探索者');
  const [buildAvatar, setBuildAvatar] = useState(user?.user_metadata?.avatar_url || getCuteLineArtUrl('星星'));

  const getSelectedGender = () => {
    if (socialMode === 'friends') {
      if (answers[200] === '男') return 'male';
      if (answers[200] === '女') return 'female';
      return 'other';
    } else {
      if (answers[100] === '男') return 'male';
      if (answers[100] === '女') return 'female';
      return 'other';
    }
  };

  const setStep = (newStep: 'intro' | 'challenge-intro' | 'challenge' | 'challenge-complete' | 'build-profile' | 'ready-to-match' | 'waiting-match' | 'review' | 'matching' | 'friends-home') => {
    if (onStepChange) onStepChange(newStep);
  };

  const setCurrentQuestion = (newIndex: number | ((prev: number) => number)) => {
    if (onQuestionIndexChange) {
      if (typeof newIndex === 'function') {
        onQuestionIndexChange(newIndex(questionIndex));
      } else {
        onQuestionIndexChange(newIndex);
      }
    }
  };

  const setAnswers = (newAnswers: Record<number, string> | ((prev: Record<number, string>) => Record<number, string>)) => {
    if (onAnswersChange) {
      if (typeof newAnswers === 'function') {
        onAnswersChange(newAnswers(answers));
      } else {
        onAnswersChange(newAnswers);
      }
    }
  };
  const [notification, setNotification] = useState<{ message: string, type: 'success' | 'info' } | null>(null);

  const showNotification = (message: string, type: 'success' | 'info' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const [matches, setMatches] = useState<UserProfile[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(false);
  const [initiatingChat, setInitiatingChat] = useState<string | null>(null);
  const [sessionMbti, setSessionMbti] = useState<string | null>(null);
  const [selectedProfile, setSelectedProfile] = useState<UserProfile | null>(null);
  const [selectedTags, setSelectedTags] = useState<string[]>([]);
  const [selectedFriendCategory, setSelectedFriendCategory] = useState<string>('');
  const [showFriendTypeModal, setShowFriendTypeModal] = useState(false);
  const [friendsMatchType, setFriendsMatchType] = useState<'1v1' | 'group'>('1v1');
  const [groupChatMessagesByCat, setGroupChatMessagesByCat] = useState<Record<string, {id: number, text: string, sender: string, avatar: string, isMe: boolean, timestamp: string}[]>>({
    '🍜 饭搭子': [
      { id: 1, text: '有人周末想一起去探店吃火锅吗？', sender: 'Lily', avatar: '🍲', isMe: false, timestamp: new Date(Date.now() - 3600000 * 2).toISOString() },
      { id: 2, text: '听起来不错，算我一个', sender: 'Me', avatar: 'Me', isMe: true, timestamp: new Date(Date.now() - 3600000).toISOString() }
    ],
    '🏃 运动搭子': [
      { id: 1, text: '明早 Albert Park 晨跑有人吗？最好配速 6 分钟的。', sender: 'Tom', avatar: '🏃', isMe: false, timestamp: new Date(Date.now() - 3600000 * 4).toISOString() }
    ],
    '✈️ 旅游搭子': [
      { id: 1, text: '圣诞节去塔州，有老司机带带自驾的吗？', sender: 'Kevin', avatar: '🚗', isMe: false, timestamp: new Date(Date.now() - 3600000 * 24).toISOString() },
      { id: 2, text: '我们车里还差一个人哦，可以拼！', sender: 'Alice', avatar: '💃', isMe: false, timestamp: new Date(Date.now() - 3600000 * 23.5).toISOString() }
    ],
    '📚 学习搭子': [
      { id: 1, text: 'Clayton 图书馆有没有人在的，求占个座...', sender: 'Bob', avatar: '📖', isMe: false, timestamp: new Date(Date.now() - 3600000 * 5).toISOString() }
    ],
    '💬 纯聊天': [
      { id: 1, text: '今天天气有点闷热啊，有人下课去喝奶茶吗', sender: 'Chloe', avatar: '🧋', isMe: false, timestamp: new Date(Date.now() - 3600000 * 1).toISOString() }
    ]
  });
  
  const formatMessageTime = (ts: string | undefined) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    let datePrefix = `${date.getMonth() + 1}月${date.getDate()}日`;

    if (isToday) {
      return `${datePrefix} ${timeStr}`;
    } else if (isYesterday) {
      return `昨天 ${datePrefix} ${timeStr}`;
    } else {
      return `${datePrefix} ${timeStr}`;
    }
  };
  const [groupChatInput, setGroupChatInput] = useState('');
  const [isChatExpanded, setIsChatExpanded] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3000);
  };

  // Define currentQuestion from prop
  const currentQuestion = questionIndex;

  const [birthYear, setBirthYear] = useState('2000');
  const [birthMonth, setBirthMonth] = useState('1');
  const [birthDay, setBirthDay] = useState('1');
  const [selectedHobbies, setSelectedHobbies] = useState<string[]>([]);
  const [textInput, setTextInput] = useState('');

  const handleAnswer = async (answer: string) => {
    console.log(`[Square] Answering question ${questions[currentQuestion].id}:`, answer);
    const nextAnswers = { ...answers, [questions[currentQuestion].id]: answer };
    setAnswers(nextAnswers);
    
    if (questions[currentQuestion].type === 'mbti') {
      setSessionMbti(answer);
    }
    
    const isAllAnswered = Object.keys(nextAnswers).length === questions.length;

    if (currentQuestion === questions.length - 1 || isAllAnswered) {
      console.log('[Square] Questionnaire complete or modified. Moving to review.');
      setStep('review');
    } else {
      setCurrentQuestion(prev => prev + 1);
    }
  };

  const generateSoulReport = (answers: Record<number, string>) => {
    const tags = [];
    const traits = [];
    
    if (socialMode === 'friends') {
      // Friends Mode Report
      if (answers[204]) tags.push(`来澳${answers[204]}`);
      if (answers[202]) {
        const parts = answers[202].split(/[月日]/);
        if (parts.length >= 2) {
          const zodiac = getZodiacInfo(parseInt(parts[0]), parseInt(parts[1]));
          tags.push(zodiac.name);
        }
      }
      if (answers[205]) tags.push(answers[205]);
      if (answers[206]) tags.push(answers[206]);
      if (answers[201]) tags.push(`寻${answers[201]}`);
      if (answers[207]) tags.push(answers[207]);
      
      if (answers[208] === '图书馆卷王') traits.push('学术卷王');
      if (answers[208] === '24小时战神') traits.push('极限挑战者');
      if (answers[209] === '喜欢讨论交流') traits.push('交流型学霸');
      if (answers[210] === '宅家打游戏/看剧') traits.push('宅家星人');
      if (answers[210] === '出门Brunch/逛街') traits.push('精致生活家');
      if (answers[211] === '每天都要见人') traits.push('社交达人');
      if (answers[214] === '健身房常客') traits.push('自律达人');
      if (answers[222] === '无辣不欢') traits.push('重口味星人');
      if (answers[223] === '特种兵式打卡') traits.push('特种兵驴友');
    } else {
      // Dating Mode Report
      // Group 0: Basic Info
      if (answers[104]) tags.push(`来澳${answers[104]}`);
      if (answers[102]) {
        const parts = answers[102].split(/[月日]/);
        if (parts.length >= 2) {
          const zodiac = getZodiacInfo(parseInt(parts[0]), parseInt(parts[1]));
          tags.push(zodiac.name);
        }
      }
      if (answers[105]) tags.push(answers[105]);
      if (answers[106]) tags.push(answers[106]);
      if (answers[107]) tags.push(answers[107]);
      if (answers[108]) tags.push(answers[108]);
      
      // Group 1: Traits
      if (answers[109] && answers[109].includes('24小时')) traits.push('全能战神');
      if (answers[110] === '坚持AA') traits.push('独立自主');
      if (answers[112] === '花钱吃遍墨尔本Brunch') traits.push('体验派');
      if (answers[113] === '立刻冲上去') traits.push('重情重义');
      if (answers[116] === '经验丰富懂人心') traits.push('情感专家');
      if (answers[118] === '支持(建立信任)') traits.push('坦诚相待');
      if (answers[122] === '离了朋友会死的E人') traits.push('顶级 E 人');
      if (answers[123] === '事事报备型') traits.push('安全感拉满');
      if (answers[124] === '先抱抱安慰情绪') traits.push('情绪价值拉满');
    }

    return { tags, traits };
  };

  const confirmReview = () => {
    console.log('[Square] Review confirmed. Final answers:', answers);
    setStep('build-profile');
  };

  const handleChallengeComplete = async (finalAnswers: Record<number, string>) => {
    // Use existing MBTI from profile if available, otherwise default to '未知'
    let mbti = sessionMbti || profile?.mbti || '未知';
    
    let gender = profile?.gender || 'other';
    let orientation = profile?.orientation || 'other';
    let university = profile?.university || '';
    let degree = profile?.degree || '';
    let pr_plan = profile?.pr_plan || '';
    let residence = profile?.residence || '';

    if (socialMode === 'friends') {
      if (finalAnswers[200] === '男') gender = 'male';
      else if (finalAnswers[200] === '女') gender = 'female';
      else if (finalAnswers[200] === 'Non-binary') gender = 'non-binary';
      
      mbti = finalAnswers[203] || mbti;
      university = finalAnswers[205] || '';
      degree = finalAnswers[206] || '';
      orientation = 'both'; // Default for friends mode
      pr_plan = 'any';
      residence = finalAnswers[207] || '';
    } else {
      if (finalAnswers[100] === '男') gender = 'male';
      else if (finalAnswers[100] === '女') gender = 'female';
      else if (finalAnswers[100] === 'Non-binary') gender = 'non-binary';

      if (finalAnswers[101] === '寻男生') orientation = 'male';
      else if (finalAnswers[101] === '寻女生') orientation = 'female';
      else if (finalAnswers[101] === '不限') orientation = 'both';

      mbti = finalAnswers[103] || mbti;
      university = finalAnswers[105] || '';
      degree = finalAnswers[106] || '';
      pr_plan = finalAnswers[107] || '';
      residence = finalAnswers[108] || '';
    }

    console.log('[Square] Final MBTI to save:', mbti);
    
    const soulReport = generateSoulReport(finalAnswers);

    // Merge answers to keep other modes' answers
    const mergedAnswers = { ...(profile?.answers || {}), ...finalAnswers };

    // Save answers to profile
    const updatedProfileData: UserProfile = { 
      ...(profile || {
        uid: user?.id || 'guest-user',
        displayName: buildName,
        gender: 'other',
        orientation: 'other',
        personality: '',
        partnerPreferences: '',
        createdAt: new Date().toISOString(),
        avatarUrl: buildAvatar
      }),
      displayName: buildName || profile?.displayName || '探索者',
      avatarUrl: buildAvatar || profile?.avatarUrl || getCuteLineArtUrl('星星'),
      answers: mergedAnswers,
      mbti: mbti,
      gender: gender as any,
      orientation: orientation as any,
      university,
      degree,
      pr_plan,
      residence,
      soul_report: soulReport,
      mode: socialMode,
      zodiac: soulReport.tags.find(t => t.endsWith('座')) || ''
    };
    
    console.log('[Square] Updating profile with:', updatedProfileData);

    if (user && user.id !== 'demo-user-123') {
      try {
        await setDoc(doc(db, 'profiles', user.uid || user.id), {
            displayName: updatedProfileData.displayName,
            avatarUrl: updatedProfileData.avatarUrl,
            answers: mergedAnswers, 
            mbti: mbti,
            gender: gender,
            orientation: orientation,
            university: updatedProfileData.university,
            degree: updatedProfileData.degree,
            pr_plan: updatedProfileData.pr_plan,
            residence: updatedProfileData.residence,
            soul_report: updatedProfileData.soul_report,
            mode: socialMode,
            zodiac: updatedProfileData.zodiac
          }, { merge: true });
        
        await refreshProfile();
        findMatches(updatedProfileData);
      } catch (err) {
        console.error('[Square] Error updating profile:', err);
        // Fallback to local update if firebase fails
        setProfile(updatedProfileData);
        findMatches(updatedProfileData);
      }
    } else {
      // Update local profile for demo/guest user
      console.log('[Square] Guest/Demo user detected, skipping Supabase update.');
      setProfile(updatedProfileData);
      findMatches(updatedProfileData);
    }
  };

  const findMatches = async (currentProfile?: UserProfile) => {
    const activeProfile = currentProfile || profile;
    if (!activeProfile) return;
    setLoadingMatches(true);

    try {
      const profilesRef = collection(db, 'profiles');
      let qBuilder = [];
      qBuilder.push(where('uid', '!=', user?.uid || user?.id || ''));
      qBuilder.push(where('mode', '==', socialMode));

      // For dating mode, apply gender/orientation filters
      if (socialMode === 'dating') {
        if (activeProfile.orientation === 'male') {
          qBuilder.push(where('gender', '==', 'male'));
        } else if (activeProfile.orientation === 'female') {
          qBuilder.push(where('gender', '==', 'female'));
        }
        // If orientation is 'both', we don't filter by gender
      }

      const q = query(profilesRef, ...qBuilder, limit(10));
      const querySnapshot = await getDocs(q);
      const realUsers = querySnapshot.docs.map(doc => doc.data() as UserProfile);

      const potentialMatches = realUsers && realUsers.length > 0 
        ? realUsers 
        : mockUsers.filter(u => {
            if (u.mode !== socialMode) return false;
            if (socialMode === 'dating') {
              if (activeProfile.orientation === 'male') return u.gender === 'male';
              if (activeProfile.orientation === 'female') return u.gender === 'female';
            }
            return true;
          });

      let matchesWithScores = potentialMatches.map(u => ({
        user: u,
        score: calculateMatch(u, activeProfile).score
      }));
      
      if (socialMode === 'friends' && selectedFriendCategory !== '💬 纯聊天') {
        matchesWithScores = matchesWithScores.sort(() => Math.random() - 0.5);
      } else {
        matchesWithScores = matchesWithScores.sort((a, b) => b.score - a.score);
        if (socialMode === 'friends' && selectedFriendCategory === '💬 纯聊天') {
          matchesWithScores = matchesWithScores.filter(m => m.score >= 75);
        }
      }

      setMatches(matchesWithScores.map(m => m.user));
    } catch (err) {
      console.error('[Square] Error finding matches:', err);
      // Fallback to mock users
      let potentialMatches = mockUsers.filter(u => u.mode === socialMode);
      
      let matchesWithScores = potentialMatches.map(u => ({
        user: u,
        score: calculateMatch(u, activeProfile).score
      }));
      
      if (socialMode === 'friends' && selectedFriendCategory !== '💬 纯聊天') {
        matchesWithScores = matchesWithScores.sort(() => Math.random() - 0.5);
      } else {
        matchesWithScores = matchesWithScores.sort((a, b) => b.score - a.score);
        if (socialMode === 'friends' && selectedFriendCategory === '💬 纯聊天') {
          matchesWithScores = matchesWithScores.filter(m => m.score >= 75);
        }
      }

      setMatches(matchesWithScores.map(m => m.user));
    } finally {
      setLoadingMatches(false);
    }
  };

  const startChat = async (targetUser: UserProfile) => {
    if (!user) {
      showNotification('请先登录以发起对话', 'info');
      return;
    }
    
    setInitiatingChat(targetUser.uid);
    console.log('[Square] Initiating chat with:', targetUser.uid);

    try {
      // Fallback for mock users
      if (targetUser.uid.startsWith('mock')) {
        const mockChatId = `mock-chat-${user.id}-${targetUser.uid}`;
        if (onSelectChat) {
          onSelectChat(mockChatId, targetUser);
        }
        return;
      }

      // Check if chat already exists
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', user.uid || user.id));
      const querySnapshot = await getDocs(q);
      
      let existingChat = null;
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data.participants && data.participants.includes(targetUser.uid)) {
          existingChat = { id: doc.id, ...data };
        }
      });

      if (existingChat) {
        if (onSelectChat) {
          onSelectChat(existingChat.id, targetUser);
        }
      } else {
        const newChatRef = doc(collection(db, 'chats'));
        await setDoc(newChatRef, {
            participants: [user.uid || user.id, targetUser.uid],
            last_message: '',
            last_timestamp: new Date().toISOString(),
          });
        
        if (onSelectChat) {
          onSelectChat(newChatRef.id, targetUser);
        }
      }
    } catch (error) {
      console.error('Error starting chat:', error);
      showNotification('发起对话失败，请稍后重试', 'info');
    } finally {
      setInitiatingChat(null);
    }
  };

  const calculateMatch = (target: UserProfile, currentProfile?: UserProfile) => {
    const me = currentProfile || profile;
    if (!me) return { score: 70, insight: '', radarData: [] };

    let score = 70;
    
    // 1. MBTI 兼容性 (20%)
    if (me.mbti && target.mbti) {
      if (me.mbti === target.mbti) score += 10;
      // 这里可以添加更复杂的 MBTI 兼容矩阵，目前先用简单逻辑
    }
    
    // 2. 标签重合度 (15%)
    const myTags = me.soul_report?.tags || [];
    const otherTags = target.soul_report?.tags || [];
    const overlap = myTags.filter(t => otherTags.includes(t));
    score += Math.min(overlap.length * 3, 15);

    // 3. 核心答案映射 (45%) - 真实的价值观共振
    const myAnswers = me.answers || {};
    const targetAnswers = target.answers || {};
    let answerOverlapCount = 0;
    let totalCompared = 0;

    const relevantQuestions = socialMode === 'friends' ? [208, 209, 210, 211, 214, 222, 223] : [110, 112, 113, 116, 118, 122, 123, 124];
    
    relevantQuestions.forEach(qId => {
      if (myAnswers[qId] && targetAnswers[qId]) {
        totalCompared++;
        if (myAnswers[qId] === targetAnswers[qId]) {
          answerOverlapCount++;
        }
      }
    });

    let answerRatio = 0;
    if (totalCompared > 0) {
      answerRatio = answerOverlapCount / totalCompared;
      score += answerRatio * 45;
    }

    // 4. 定位与背景 (20%)
    if (me.university && target.university && me.university === target.university) score += 5;
    if (me.residence && target.residence && me.residence === target.residence) score += 5;
    if (me.pr_plan && target.pr_plan && me.pr_plan === target.pr_plan) score += 10;

    const insights = socialMode === 'friends' 
      ? [
          answerOverlapCount >= 3 ? '你们在生活选择上高度默契' : '你们的社交节奏非常合拍',
          '在墨尔本的生活态度很接近',
          overlap.length > 0 ? `有共同的兴趣标签：${overlap[0]}` : '灵魂频率相似'
        ]
      : [
          answerRatio > 0.6 ? '你们的三观竟然惊人地一致' : '你们对未来的规划非常有默契',
          '在金钱观 and 消费习惯上很契合',
          `灵魂共鸣点：${overlap[0] || '三观契合'}`
        ];

    // 生成真实的雷达图数据
    const radarSubjects = socialMode === 'friends'
      ? ['社交观', '学业观', '生活节奏', 'MBTI契合', '兴趣重合']
      : ['金钱观', '家庭观', '事业心', '情绪价值', '生活品味'];

    const radarData = radarSubjects.map((subject, idx) => {
      let val = 60;
      if (idx === 0) val = answerOverlapCount >= 2 ? 90 : 70; // 社交/金钱观
      if (idx === 1) val = (me.university === target.university) ? 95 : 75; // 学业/家庭
      if (idx === 2) val = (me.residence === target.residence) ? 90 : 70; // 节奏/事业
      if (idx === 3) val = (me.mbti === target.mbti) ? 95 : 75; // MBTI/情绪
      if (idx === 4) val = overlap.length > 1 ? 95 : 80; // 兴趣/品味
      
      return {
        subject,
        A: Math.min(val + Math.floor(Math.random() * 5), 100),
        fullMark: 100
      };
    });

    return {
      score: Math.min(Math.round(score), 99),
      insight: insights[Math.floor(Math.random() * insights.length)],
      radarData
    };
  };

  const soulQuotes = [
    "“在这个快餐时代，我想和你慢慢来。”",
    "“三观契合，是灵魂最深处的共振。”",
    "“最好的爱情，是两个灵魂的久别重逢。”",
    "“我们不寻找‘完美’，我们寻找‘契合’。”",
    "“真心，是通往另一个灵魂唯一的门票。”"
  ];
  const [dailyQuote] = useState(soulQuotes[Math.floor(Math.random() * soulQuotes.length)]);

  return (
    <div className="flex-1 flex flex-col w-full overflow-y-auto scrollbar-hide relative bg-transparent">
      <AnimatePresence>
        {toastMessage && (
          <motion.div
            initial={{ opacity: 0, y: -20, x: '-50%' }}
            animate={{ opacity: 1, y: 0, x: '-50%' }}
            exit={{ opacity: 0, y: -20, x: '-50%' }}
            className="fixed top-10 left-1/2 z-[200] bg-white text-black px-6 py-3 rounded-full shadow-2xl font-medium text-sm flex items-center gap-2"
          >
            <CheckCircle2 size={16} className="text-neon-green" />
            {toastMessage}
          </motion.div>
        )}
      </AnimatePresence>
      {renderHeader?.()}
      <div className="flex-1 flex flex-col w-full max-w-[1800px] mx-auto px-4 md:px-8 gap-2 pt-0 md:pt-2 pb-32">
        <AnimatePresence mode="wait">
        {step === 'intro' && (
          <motion.div
            key="intro"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full flex-1 flex flex-col justify-start pb-8 pt-0 md:pt-2"
          >
              <div className="flex flex-col items-center justify-center text-center space-y-2 md:space-y-4 mb-2 -mt-4">
              <div className="space-y-2 max-w-3xl flex flex-col items-center">
              <div className="inline-flex py-1 px-4 mb-1 rounded-full bg-white/5 border border-white/10 text-white/70 text-[9px] md:text-[10px] font-medium tracking-wider">
                专为澳洲华人设计 · 仅限墨尔本 · {socialMode === 'friends' ? '认真找搭子交友的地方' : '认真找对象朋友的地方'}
              </div>
              <div className="relative w-16 h-16 mx-auto flex items-center justify-center mb-2">
                <div className={`absolute inset-0 ${currentContent.glow} rounded-full opacity-20 blur-xl animate-pulse`} />
                <motion.div 
                  animate={{ 
                    scale: [1, 1.05, 1],
                  }}
                  transition={{ 
                    duration: 4, 
                    repeat: Infinity,
                    ease: "easeInOut"
                  }}
                  className="relative z-10 w-10 h-10 rounded-2xl bg-white/5 backdrop-blur-2xl flex items-center justify-center border border-white/10 shadow-2xl"
                >
                  {socialMode === 'friends' ? <Users className={currentContent.accent} size={20} /> : <Heart className={currentContent.accent} size={20} fill="currentColor" />}
                </motion.div>
              </div>

              <div className="space-y-1.5">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className={`text-[9px] md:text-[10px] uppercase tracking-[0.5em] ${currentContent.accent} font-bold`}
                >
                  {currentContent.slogan}
                </motion.div>
                <h1 className="text-3xl md:text-5xl font-serif italic tracking-tighter text-white drop-shadow-2xl py-1">
                  {socialMode === 'friends' ? '找到你的墨尔本同频伙伴' : '真心广场'}
                </h1>
                <p className="text-[10px] md:text-xs text-white/40 leading-relaxed font-light px-8 max-w-xl mx-auto">
                  {currentContent.description}
                </p>
              </div>
            </div>

            {/* Social Mode Toggle */}
            {onSocialModeChange && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="flex p-1 rounded-full backdrop-blur-2xl shadow-xl bg-white/5 border border-white/10 mt-3"
              >
                <button 
                  onClick={() => onSocialModeChange('dating')}
                  className={`px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 ${socialMode === 'dating' ? 'bg-gradient-to-r from-aurora-pink to-sunset-orange text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <Heart size={14} className={socialMode === 'dating' ? 'animate-pulse' : ''} /> 恋爱模式
                </button>
                <button 
                  onClick={() => onSocialModeChange('friends')}
                  className={`px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 ${socialMode === 'friends' ? 'bg-gradient-to-r from-neon-green to-emerald-500 text-white shadow-lg' : 'text-white/40 hover:text-white hover:bg-white/5'}`}
                >
                  <Users size={14} /> 交友模式
                </button>
              </motion.div>
            )}

            {user && profile?.answers && questions.some(q => profile.answers[q.id]) && (
              <div className="flex flex-col items-center gap-4 w-full max-w-md mx-auto mt-6">
                <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="md:col-span-1 glass p-7 rounded-[2.8rem] space-y-5 relative overflow-hidden group border border-white/10 shadow-2xl hover:border-white/20 transition-all duration-500">
                    <div className="absolute top-0 right-0 p-8 opacity-[0.02] group-hover:opacity-[0.05] transition-opacity rotate-12 duration-1000 pointer-events-none">
                      <Sparkles size={100} />
                    </div>
                    <div className="text-center space-y-1 relative z-10">
                      <h3 className="text-xl font-serif italic text-white tracking-wide">灵魂档案</h3>
                      <p className="text-[10px] text-white/30 uppercase tracking-[0.2em] font-bold">Soul Identity Established</p>
                    </div>
                    
                    {profile.soul_report && (
                      <div className="space-y-4 relative z-10">
                        <div className="flex flex-wrap justify-center gap-2">
                          {profile.soul_report.tags.slice(0, 4).map(tag => (
                            <span key={tag} className="px-3 py-1 rounded-full bg-white/5 border border-white/5 text-[10px] text-white/60 font-medium hover:bg-white/10 transition-colors">
                              {tag}
                            </span>
                          ))}
                        </div>
                        <div className="flex flex-wrap justify-center gap-2">
                          {profile.soul_report.traits.slice(0, 2).map(trait => (
                            <span key={trait} className="px-3 py-1 rounded-full bg-aurora-pink/5 border border-aurora-pink/10 text-[10px] text-aurora-pink/80 font-bold uppercase tracking-wider">
                              #{trait}
                            </span>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="pt-2 flex flex-col gap-3 relative z-10">
                      <button
                        onClick={() => setStep('matching')}
                        className="w-full py-4 bg-gradient-to-br from-aurora-pink to-sunset-orange text-white font-bold rounded-2xl transition-all duration-500 shadow-xl hover:shadow-aurora-pink/20 hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-3 text-xs uppercase tracking-[0.2em]"
                      >
                        <Users size={18} /> 进入匹配中心
                      </button>
                      <button
                        onClick={() => {
                          setStep('challenge-intro');
                          setCurrentQuestion(0);
                          setAnswers({});
                          setSessionMbti(null);
                        }}
                        className="w-full py-1 text-white/20 hover:text-white/50 text-[9px] font-bold uppercase tracking-[0.2em] transition-all duration-300"
                      >
                        重新开启灵魂挑战
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Feature Highlight - Single Action Card */}
            <div className="flex flex-col items-center w-full max-w-xl mx-auto pt-2 pb-0">
                 <div className="flex flex-col items-center w-full">
                   <div className="flex flex-wrap justify-center gap-4 w-full mt-2 max-w-4xl">
                     {currentContent.features.map((feature, idx) => (
                      <motion.div 
                        key={feature.id}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.5 + idx * 0.04 }}
                        className="relative group w-full md:w-auto rounded-[2rem] transition-all duration-300 bg-white/5 border border-white/5 flex flex-col gap-3 items-center text-center shadow-lg p-6 max-w-md"
                      >
                        <div className={`w-12 h-12 rounded-2xl ${feature.bg} flex items-center justify-center ${feature.color} mb-1 shadow-inner group-hover:scale-110 transition-transform duration-500`}>
                          <feature.icon size={24} />
                        </div>
                        <h4 className="text-white font-serif italic text-lg md:text-xl tracking-wide">{feature.title}</h4>
                        <p className="text-[10px] text-white/60 tracking-[0.2em] uppercase font-bold">
                          {feature.desc}
                        </p>
                        <p className="text-[11px] md:text-xs text-white/40 leading-relaxed">
                          {feature.content}
                        </p>
                      </motion.div>
                     ))}
                   </div>
                   
                   <motion.button
                     initial={{ opacity: 0, y: 10 }}
                     animate={{ opacity: 1, y: 0 }}
                     transition={{ delay: 0.8 }}
                     onClick={() => {
                        if (!user) setShowAuthModal(true);
                        else if (profile?.answers && questions.some(q => profile.answers[q.id])) {
                          setStep(socialMode === 'friends' ? 'friends-home' : 'matching');
                        }
                        else {
                          setStep('challenge-intro');
                          setCurrentQuestion(0);
                          setAnswers({});
                        }
                     }}
                     className={`mt-4 px-16 py-4 bg-gradient-to-r ${currentContent.gradient} text-white font-bold text-sm md:text-base tracking-[0.2em] rounded-full shadow-lg hover:shadow-xl hover:scale-105 active:scale-95 transition-all duration-300 flex items-center justify-center gap-2`}
                   >
                     {socialMode === 'friends' ? '开始找搭子' : '开始匹配'} <ChevronRight size={18} />
                   </motion.button>

                   <button
                     onClick={() => {
                        if (!user) {
                           setShowAuthModal(true);
                           return;
                        }
                        const testAnswers: Record<number, string> = {};
                        questions.forEach((q) => {
                          if (q.type === 'choice' && q.options) testAnswers[q.id] = q.options[0];
                          else if (q.type === 'text') testAnswers[q.id] = '大概就是一个人在家听着歌，看着窗外的落日，突然很想有个人能懂我的心情吧。';
                          else if (q.type === 'mbti') testAnswers[q.id] = 'ENFP';
                          else if (q.type === 'date') testAnswers[q.id] = '1月1日';
                          else if (q.type === 'hobbies') testAnswers[q.id] = '看电影,健身,听音乐';
                          else testAnswers[q.id] = '测试答案';
                        });
                        setAnswers(testAnswers);
                        setStep('build-profile');
                     }}
                     className="flex items-center justify-center gap-1.5 text-[9px] text-white/30 hover:text-white/80 uppercase tracking-widest transition-colors mt-8"
                   >
                     <Zap size={10} className="text-aurora-pink" /> 一键快进 (仅供演示)
                   </button>
                 </div>
            </div>

            {/* Footer Notice */}
            <div className="pt-20 pb-12 text-center opacity-30">
              <p className="text-[8px] md:text-[10px] text-white uppercase tracking-[0.4em] font-light">
                &copy; 2026 RealHeart · 反快餐恋爱辅助工具
              </p>
            </div>
          </div>
          </motion.div>
        )}

        {step === 'friends-home' && (
          <motion.div
            key="friends-home"
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.02 }}
            className="w-full flex-1 flex flex-col justify-center items-center pb-20 pt-12 md:pt-24"
          >
            <div className="space-y-4 max-w-3xl text-center mb-8">
              <h1 className="text-3xl md:text-5xl font-serif italic tracking-tighter text-white drop-shadow-2xl py-1">
                你想寻找什么样的搭子？
              </h1>
              <p className="text-xs text-white/50 tracking-widest uppercase">Select your next journey</p>
            </div>
            
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 md:gap-4 w-full mt-6 max-w-5xl px-4">
              {[
                { id: 'eat', label: '🍜 饭搭子', desc: '唯有美食与爱不可辜负' },
                { id: 'sports', label: '🏃 运动搭子', desc: '挥洒汗水，强健体魄' },
                { id: 'travel', label: '✈️ 旅游搭子', desc: '读万卷书，行万里路' },
                { id: 'study', label: '📚 学习搭子', desc: '共同进步，自律自由' },
                { id: 'chat', label: '💬 纯聊天', desc: '分享日常，闲鱼时刻' }
              ].map((tag, idx) => (
                 <motion.div
                   key={tag.id}
                   initial={{ opacity: 0, y: 10 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.2 + idx * 0.05 }}
                   onClick={() => {
                     setSelectedFriendCategory(tag.label);
                     
                     if (tag.id === 'chat') {
                       setStep('matching');
                     } else {
                       setShowFriendTypeModal(true);
                     }
                   }}
                   className="relative group w-full cursor-pointer rounded-[2rem] transition-all duration-300 bg-white/5 hover:bg-white/10 border border-white/5 hover:border-white/20 flex flex-col gap-3 py-6 px-4 items-center text-center shadow-lg hover:shadow-xl hover:scale-105 hover:-translate-y-1 active:scale-95"
                 >
                   <h3 className="text-xl md:text-2xl font-bold tracking-wide whitespace-nowrap text-white group-hover:text-neon-green transition-colors">{tag.label}</h3>
                   <p className="text-[10px] md:text-xs text-white/50 tracking-widest uppercase mt-auto leading-relaxed max-w-[120px]">{tag.desc}</p>
                 </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {step === 'challenge-intro' && (
          <motion.div
            key="challenge-intro"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col items-center justify-center pt-0 pb-48 max-w-2xl mx-auto w-full px-4 text-center space-y-12"
          >
            <div>
              {socialMode === 'friends' ? (
                <Users size={48} className="mx-auto text-neon-green mb-4" />
              ) : (
                <Heart size={48} className="mx-auto text-aurora-pink mb-4" />
              )}
              <h2 className="text-3xl md:text-5xl font-serif italic text-white tracking-widest mb-4">开始你的灵魂档案</h2>
              <p className="text-sm md:text-base text-white/60 leading-relaxed px-4">接下来大概需要10-15分钟，没有对错之分，选你真实的想法。认真填的人才能遇到认真的人。</p>
            </div>

            <div className="w-full max-w-sm mx-auto space-y-4 text-left glass p-8 rounded-[2.5rem]">
              {[
                '认真填写才能被认真对待',
                '你的答案决定匹配质量',
                '随时可以修改答案'
              ].map((item, i) => (
                <div key={i} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full ${currentContent.glow}/20 flex items-center justify-center shrink-0`}>
                    <CheckCircle2 size={12} className={currentContent.accent} />
                  </div>
                  <span className="text-sm text-white/80">{item}</span>
                </div>
              ))}
            </div>

            <div className="w-full max-w-sm mx-auto space-y-6">
              <button 
                onClick={() => setStep('challenge')}
                className={`w-full py-4 rounded-full bg-gradient-to-r ${currentContent.gradient} text-white text-sm font-bold uppercase tracking-widest shadow-lg ${currentContent.glow}/20 hover:scale-[1.02] transition-transform`}
              >
                我准备好了，开始 →
              </button>
              
              <button 
                onClick={() => {
                  const testAnswers: Record<number, string> = {};
                  questions.forEach((q) => {
                    if (q.type === 'choice' && q.options) {
                      testAnswers[q.id] = q.options[0];
                    } else if (q.type === 'text') {
                      testAnswers[q.id] = '大概就是一个人在家听着歌，看着窗外的落日，突然很想有个人能懂我的心情吧。';
                    } else if (q.type === 'mbti') {
                      testAnswers[q.id] = 'ENFP';
                    } else if (q.type === 'date') {
                      testAnswers[q.id] = '1月1日';
                    } else if (q.type === 'hobbies') {
                       testAnswers[q.id] = '看电影,健身,听音乐';
                    } else {
                      testAnswers[q.id] = '测试答案';
                    }
                  });
                  setAnswers(testAnswers);
                  setStep('build-profile');
                }}
                className={`w-full py-4 rounded-xl ${currentContent.glow}/10 hover:${currentContent.glow}/20 border border-white/10 ${currentContent.accent} text-xs font-bold uppercase tracking-widest transition-all mb-4 flex justify-center items-center gap-2`}
              >
                ⚡ 快速匹配体验 (一键跳过测试)
              </button>

              <p className="text-[9px] text-white/30 uppercase tracking-[0.2em] leading-relaxed">
                题目分为六个部分：
                <br /><br />
                基础档案 · 学业与生存 · 生活观<br />
                情感底线 · 深度匹配 · 真心告白
              </p>
            </div>
          </motion.div>
        )}

        {step === 'challenge' && (
          <motion.div
            key="challenge"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="flex-1 flex flex-col justify-start pt-4 md:pt-6 pb-32 max-w-[1400px] mx-auto w-full space-y-8 px-4 md:px-12 lg:px-20"
          >
            <div className="space-y-6">
              <div className="flex justify-between items-end">
                <div className="space-y-3 flex-1 max-w-3xl">
                  <span className="text-[10px] uppercase tracking-[0.4em] text-white/40 font-medium">挑战进度</span>
                  <div className="flex gap-2 w-full">
                    {questions.map((_, i) => (
                      <div key={i} className={`h-[2px] flex-1 transition-all duration-700 ${i <= currentQuestion ? 'bg-white shadow-[0_0_8px_rgba(255,255,255,0.8)]' : 'bg-white/10'}`} />
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <button 
                    onClick={() => {
                      if (Object.keys(answers).length === questions.length) {
                        setStep('review');
                      } else {
                        setStep('intro');
                      }
                    }}
                    className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                  >
                    {Object.keys(answers).length === questions.length ? '返回预览' : '退出'}
                  </button>
                  <span className="px-5 py-2 rounded-full text-white/60 text-xs uppercase tracking-[0.2em]">
                    {questions[currentQuestion].category}
                  </span>
                </div>
              </div>
              
              <div className="space-y-4">
                <h2 className="text-3xl md:text-4xl font-serif italic font-light leading-tight tracking-wide text-white/90">
                  {questions[currentQuestion].question}
                </h2>
              </div>
            </div>

            <div className="space-y-6">
              {questions[currentQuestion].type === 'text' && (
                <>
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                    <textarea
                      value={textInput}
                      onChange={(e) => setTextInput(e.target.value)}
                      placeholder="比如：第一次一个人在St Kilda看日落，身边没有人可以分享，那一刻突然很想有个人陪着..."
                      className="relative w-full h-48 md:h-64 bg-black/60 backdrop-blur-2xl p-8 md:p-10 rounded-3xl outline-none text-base md:text-lg lg:text-xl text-white/80 placeholder:text-white/20 transition-all resize-none shadow-2xl leading-relaxed font-light custom-scrollbar border border-white/10 focus:border-white/20"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && !e.shiftKey) {
                          e.preventDefault();
                          if (textInput.length >= 20) {
                            handleAnswer(textInput);
                            setTextInput('');
                          }
                        }
                      }}
                    />
                    <div className={`absolute bottom-6 right-8 text-xs font-mono tracking-widest ${textInput.length >= 20 ? 'text-neon-green' : 'text-white/40'}`}>
                      {textInput.length} / 20+
                    </div>
                  </div>
                  <div className="flex justify-between items-center px-6">
                    <div className="flex items-center gap-6">
                      {currentQuestion > 0 && (
                        <button 
                          onClick={() => setCurrentQuestion(prev => prev - 1)}
                          className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                        >
                          &lt; 上一题
                        </button>
                      )}
                      <p className="text-xs text-white/30 uppercase tracking-[0.2em]">Shift + Enter 换行</p>
                    </div>
                    <button 
                      disabled={textInput.length < 20}
                      className="text-xs text-white/50 uppercase tracking-[0.2em] flex items-center gap-2 hover:text-white/80 transition-colors disabled:opacity-30 disabled:cursor-not-allowed" 
                      onClick={() => {
                        if (textInput.length >= 20) {
                          handleAnswer(textInput);
                          setTextInput('');
                        }
                      }}
                    >
                      确认并继续 <ChevronRight size={14} />
                    </button>
                  </div>
                </>
              )}

              {questions[currentQuestion].type === 'choice' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row gap-4">
                    {questions[currentQuestion].options?.map((opt, i) => {
                      const isAcademic = questions[currentQuestion].category === '学业与生存';
                      return (
                        <motion.button
                          initial={{ opacity: 0, y: 10 }}
                          animate={{ opacity: 1, y: 0 }}
                          transition={{ 
                            duration: 0.4,
                            ease: "easeOut",
                            delay: i * 0.1 
                          }}
                          whileTap={{ scale: 0.98 }}
                          key={opt}
                          onClick={() => handleAnswer(opt)}
                          className={`flex-1 py-4 md:py-5 rounded-2xl text-base md:text-lg font-sans transition-all border ${
                            answers[questions[currentQuestion].id] === opt
                              ? 'bg-white text-black font-medium shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white'
                              : 'bg-transparent text-white/90 hover:bg-white/5 border-white/10'
                          }`}
                        >
                          {opt}
                        </motion.button>
                      );
                    })}
                  </div>
                  <div className="flex justify-between items-center px-6">
                    {currentQuestion > 0 && (
                      <button 
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                      >
                        &lt; 上一题
                      </button>
                    )}
                  </div>
                </div>
              )}

              {questions[currentQuestion].type === 'age' && (
                <div className="space-y-8">
                  <div className="relative group">
                    <div className="absolute -inset-[1px] bg-gradient-to-r from-white/10 via-white/20 to-white/10 rounded-3xl opacity-0 group-focus-within:opacity-100 transition-opacity duration-700" />
                    <input
                      type="number"
                      placeholder="输入你的年龄"
                      className="relative w-full bg-black/60 backdrop-blur-2xl p-8 md:p-10 rounded-3xl outline-none text-2xl md:text-3xl text-center text-white placeholder:text-white/20 transition-all shadow-2xl font-light border border-white/10 focus:border-white/20"
                      onChange={(e) => {
                        const ageVal = parseInt(e.target.value);
                        if (!isNaN(ageVal)) {
                          setBirthYear((new Date().getFullYear() - ageVal).toString());
                        } else {
                          setBirthYear('');
                        }
                      }}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const val = (e.target as HTMLInputElement).value;
                          if (val) {
                            const ageVal = parseInt(val);
                            const year = new Date().getFullYear() - ageVal;
                            handleAnswer(`${val}岁 (${year}年出生)`);
                          }
                        }
                      }}
                    />
                  </div>
                  {birthYear && birthYear !== '2000' && (
                    <div className="text-center text-white/60">
                      <p className="text-sm uppercase tracking-widest mb-2">出生年份</p>
                      <p className="text-4xl font-light">{birthYear}年</p>
                    </div>
                  )}
                  <div className="flex items-center justify-between">
                    {currentQuestion > 0 && (
                      <button 
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                      >
                        &lt; 上一题
                      </button>
                    )}
                    <button
                      onClick={() => {
                        const input = document.querySelector('input[type="number"]') as HTMLInputElement;
                        if (input && input.value) {
                          const ageVal = parseInt(input.value);
                          const year = new Date().getFullYear() - ageVal;
                          handleAnswer(`${input.value}岁 (${year}年出生)`);
                        }
                      }}
                      className="text-xs uppercase tracking-[0.2em] transition-colors text-white hover:text-white/80"
                    >
                      确认 &gt;
                    </button>
                  </div>
                </div>
              )}

              {questions[currentQuestion].type === 'date' && (
                <div className="space-y-8">
                  <div className="flex gap-4">
                    <select 
                      value={birthMonth} 
                      onChange={(e) => setBirthMonth(e.target.value)}
                      className="flex-1 bg-black/60 backdrop-blur-2xl p-6 rounded-3xl text-white/80 outline-none appearance-none text-center text-2xl border border-white/10 focus:border-white/20"
                    >
                      {Array.from({length: 12}, (_, i) => i + 1).map(month => (
                        <option key={month} value={month}>{month}月</option>
                      ))}
                    </select>
                    <select 
                      value={birthDay} 
                      onChange={(e) => setBirthDay(e.target.value)}
                      className="flex-1 bg-black/60 backdrop-blur-2xl p-6 rounded-3xl text-white/80 outline-none appearance-none text-center text-2xl border border-white/10 focus:border-white/20"
                    >
                      {Array.from({length: 31}, (_, i) => i + 1).map(day => (
                        <option key={day} value={day}>{day}日</option>
                      ))}
                    </select>
                  </div>
                  
                  {birthMonth && birthDay && (
                    <div className="text-center text-white/60">
                      <p className="text-sm uppercase tracking-widest mb-2">你的星座</p>
                      <div className="flex items-center justify-center gap-2">
                        <span className="text-3xl font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50">{getZodiacInfo(parseInt(birthMonth), parseInt(birthDay)).icon}</span>
                        <span className="text-2xl font-light">{getZodiacInfo(parseInt(birthMonth), parseInt(birthDay)).name}</span>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center justify-between">
                    {currentQuestion > 0 && (
                      <button 
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                      >
                        &lt; 上一题
                      </button>
                    )}
                    <button
                      onClick={() => {
                        handleAnswer(`${birthMonth}月${birthDay}日`);
                      }}
                      className="text-xs uppercase tracking-[0.2em] transition-colors text-white hover:text-white/80"
                    >
                      确认 &gt;
                    </button>
                  </div>
                </div>
              )}

              {questions[currentQuestion].type === 'mbti' && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3 content-start">
                    {MBTI_TYPES.map((mbti, i) => (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3,
                          ease: "easeOut",
                          delay: i * 0.02 
                        }}
                        whileTap={{ scale: 0.98 }}
                        key={mbti.code}
                        onClick={() => handleAnswer(mbti.code)}
                        className={`p-4 rounded-2xl transition-all flex flex-col items-center justify-center gap-2 border ${
                          answers[questions[currentQuestion].id] === mbti.code
                            ? 'bg-white text-black shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white' 
                            : 'bg-black/40 text-white/80 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        <span className="text-2xl">{mbti.emoji}</span>
                        <span className="font-mono font-bold text-lg">{mbti.code}</span>
                        <span className="text-xs opacity-60">{mbti.name}</span>
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    {currentQuestion > 0 && (
                      <button 
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                      >
                        &lt; 上一题
                      </button>
                    )}
                  </div>
                </div>
              )}

              {questions[currentQuestion].type === 'hobbies' && (
                <div className="space-y-6">
                  <div className="flex flex-wrap gap-3 h-[300px] overflow-y-auto pr-2 custom-scrollbar content-start">
                    {HOBBIES_LIST.map((hobby, i) => (
                      <motion.button
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ 
                          duration: 0.3,
                          ease: "easeOut",
                          delay: i * 0.01 
                        }}
                        whileTap={{ scale: 0.98 }}
                        key={hobby}
                        onClick={() => {
                          if (selectedHobbies.includes(hobby)) {
                            setSelectedHobbies(prev => prev.filter(h => h !== hobby));
                          } else {
                            setSelectedHobbies(prev => [...prev, hobby]);
                          }
                        }}
                        className={`px-6 py-3 rounded-full transition-all text-sm md:text-base font-sans border ${
                          selectedHobbies.includes(hobby) 
                            ? 'bg-white text-black font-medium shadow-[0_0_15px_rgba(255,255,255,0.5)] border-white' 
                            : 'bg-transparent text-white/80 hover:bg-white/10 border-white/10'
                        }`}
                      >
                        {hobby}
                      </motion.button>
                    ))}
                  </div>
                  <div className="flex items-center justify-between">
                    {currentQuestion > 0 && (
                      <button 
                        onClick={() => setCurrentQuestion(prev => prev - 1)}
                        className="text-xs text-white/30 uppercase tracking-[0.2em] hover:text-white transition-colors"
                      >
                        &lt; 上一题
                      </button>
                    )}
                    <motion.button
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      onClick={() => {
                        if (selectedHobbies.length > 0) {
                          handleAnswer(selectedHobbies.join(', '));
                        }
                      }}
                      disabled={selectedHobbies.length === 0}
                      className={`text-xs uppercase tracking-[0.2em] transition-colors ${
                        selectedHobbies.length > 0 
                          ? 'text-white hover:text-white/80' 
                          : 'text-white/30 cursor-not-allowed'
                      }`}
                    >
                      确认选择 ({selectedHobbies.length}) &gt;
                    </motion.button>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {step === 'build-profile' && (
          <motion.div
            key="build-profile"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center max-w-2xl md:max-w-4xl mx-auto w-full px-4 text-center py-2 shrink-0 mb-10 md:mb-[15vh]"
          >
            <div className="space-y-1 mb-2">
              <h2 className="text-xl md:text-2xl font-serif italic text-white tracking-wide">创建档案</h2>
              <p className="text-[10px] text-white/50 tracking-wider">选择一个符号作为你的代号</p>
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-[2rem] p-4 md:p-5 space-y-4 relative">
                {/* Avatar Selection */}
                <div className="flex flex-col items-center gap-4">
                  <div className="relative group">
                    <img 
                      src={buildAvatar} 
                      alt="Avatar" 
                      className="w-24 h-24 rounded-full object-contain bg-white p-4 border-2 border-white/20 group-hover:border-white/50 transition-colors shadow-[0_0_15px_rgba(255,255,255,0.1)]"
                    />
                  </div>
                  
                  <div className="w-full flex-col flex items-center">
                    <div className="grid grid-cols-6 sm:grid-cols-8 md:grid-cols-10 gap-3 md:gap-4 bg-black/20 p-5 md:p-6 rounded-[2rem] border border-white/5 w-full justify-items-center">
                      {(
                        ['猫咪', '修狗', '兔兔', '松鼠', '老鼠', '仓鼠', '小鸟', '乌龟', '小鱼', '树叶', '四叶草', '音乐', '相机', '礼物', '火箭', '毛毛虫', '蜗牛', '羽毛', '船锚', '幽灵', '星星', '月亮', '太阳', '云朵', '雪花', '闪电', '爱心', '笑脸', '火花', '咖啡']
                      ).map(seed => {
                        const url = getCuteLineArtUrl(seed);
                        
                        return (
                          <button
                            key={seed}
                            onClick={() => setBuildAvatar(url)}
                            className={`w-12 h-12 md:w-14 md:h-14 rounded-full overflow-hidden transition-all duration-300 relative bg-white flex items-center justify-center p-2.5 ${
                              buildAvatar === url ? 'ring-4 ring-aurora-pink shadow-[0_0_15px_rgba(255,107,107,0.5)] scale-[1.15] z-10' : 'opacity-70 hover:opacity-100 hover:scale-110 ring-2 ring-transparent'
                            }`}
                          >
                            <img src={url} alt={seed} className="w-full h-full object-contain" />
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Name Input */}
                <div className="w-full">
                    <input
                      type="text"
                      value={buildName}
                      onChange={(e) => setBuildName(e.target.value)}
                      placeholder="给自己起个好听的名字"
                      className="w-full bg-black/60 border border-white/10 focus:border-white/30 rounded-2xl p-3 text-white text-sm outline-none transition-colors text-center"
                    />
                </div>
            </div>

            <button 
              onClick={async () => {
                await handleChallengeComplete(answers);
                setStep(socialMode === 'friends' ? 'friends-home' : 'matching');
              }}
              className="mt-4 w-full py-3 md:py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white text-sm font-bold uppercase tracking-widest rounded-full shadow-lg shadow-aurora-pink/20 hover:scale-[1.02] transition-transform"
            >
              确认档案并继续 →
            </button>
          </motion.div>
        )}

        {step === 'ready-to-match' && (
          <motion.div
            key="ready-to-match"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center max-w-sm mx-auto w-full px-4 text-center space-y-12 pb-48 pt-0"
          >
            <div className="space-y-4">
              <h2 className="text-3xl md:text-4xl font-serif italic text-transparent bg-clip-text bg-gradient-to-br from-white to-white/50 tracking-wide">
                准备就绪
              </h2>
              <p className="text-xs text-white/50 tracking-wider">
                你的灵魂档案已在星海中点亮
              </p>
            </div>

            <div className="relative group cursor-pointer" onClick={() => setStep(socialMode === 'friends' ? 'friends-home' : 'matching')}>
              <motion.div 
                animate={{ scale: [1, 1.1, 1], opacity: [0.3, 0.6, 0.3] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[-40px] rounded-full bg-gradient-to-r from-aurora-pink/30 to-sunset-orange/30 blur-2xl group-hover:blur-3xl transition-all"
              />
              <div className="w-48 h-48 md:w-56 md:h-56 rounded-full bg-black/50 border border-white/20 backdrop-blur-xl flex flex-col items-center justify-center relative z-10 shadow-[0_0_50px_rgba(255,107,107,0.2)] group-hover:scale-105 group-hover:border-aurora-pink/50 transition-all overflow-hidden cursor-pointer gap-2">
                <Sparkles size={40} className="text-aurora-pink mb-2" />
                <span className="text-lg font-bold tracking-widest text-white">开始匹配</span>
                <span className="text-[10px] text-white/40 uppercase tracking-widest">匹配3位高契合度灵魂</span>
              </div>
            </div>
            
            <p className="text-[10px] text-white/30 tracking-widest uppercase">
              点击即可随机匹配
            </p>
          </motion.div>
        )}

        {step === 'challenge-complete' && (
          <motion.div
            key="challenge-complete"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 text-center space-y-10 pb-32"
          >
            <div className="relative mt-8">
              <motion.div 
                animate={{ rotate: 360 }}
                transition={{ duration: 10, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-40px] rounded-full border border-aurora-pink/30 border-dashed opacity-50"
              />
              <motion.div 
                animate={{ rotate: -360 }}
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-[-60px] rounded-full border border-sunset-orange/20 border-dotted opacity-30"
              />
              <div className="w-24 h-24 rounded-full bg-gradient-to-tr from-aurora-pink/30 to-sunset-orange/30 flex items-center justify-center p-1 blur-sm absolute inset-0" />
              <div className="w-24 h-24 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(255,107,107,0.3)]">
                <Sparkles size={36} className="text-aurora-pink" />
              </div>
            </div>

            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide">你的灵魂档案已生成 ✓</h2>
              <p className="text-[10px] md:text-xs text-white/60 tracking-wider">正在为你寻找契合度90%以上的用户...</p>
              <p className="text-[10px] md:text-xs text-white/40 tracking-wider uppercase">我们会认真为你筛选，不将就</p>
            </div>

            <div className="w-full bg-white/5 border border-white/10 rounded-3xl p-6 md:p-8 space-y-6 text-left">
               <div className="space-y-2">
                 <h3 className="text-lg font-bold text-white tracking-wide flex items-center gap-2"><User size={18} className="text-aurora-pink"/> 让对方更了解你</h3>
                 <p className="text-[10px] md:text-xs text-white/50">主页越完整，匹配质量越好</p>
               </div>
               <button 
                 onClick={() => {
                   setShowProfileModal(true);
                 }}
                 className="w-full py-4 bg-white/10 hover:bg-white/20 border border-white/10 text-white text-[10px] md:text-xs font-bold uppercase tracking-widest rounded-2xl transition-all flex items-center justify-center gap-2"
               >
                 完善我的主页 →
               </button>
            </div>

            <div className="flex flex-col w-full items-center gap-4 pt-4">
              <button 
                onClick={() => {
                  setStep('waiting-match');
                }}
                className="w-full py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white text-sm font-bold uppercase tracking-widest rounded-full shadow-lg shadow-aurora-pink/20 hover:scale-[1.02] transition-transform"
              >
                开启灵魂匹配 →
              </button>
            </div>
          </motion.div>
        )}

        {step === 'waiting-match' && (
          <motion.div
            key="waiting-match"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 1.05 }}
            className="flex-1 flex flex-col items-center justify-center max-w-lg mx-auto w-full px-4 text-center space-y-12 pb-48 pt-0"
          >
            <div className="relative">
              <motion.div 
                animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
                transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
                className="absolute inset-[-40px] rounded-full bg-aurora-pink/10 blur-xl"
              />
              <div className="w-24 h-24 rounded-full bg-black border border-white/20 flex items-center justify-center relative z-10 shadow-[0_0_50px_rgba(255,107,107,0.2)]">
                <MapPin size={36} className="text-aurora-pink/50 animate-pulse" />
              </div>
            </div>
            
            <div className="space-y-4">
              <h2 className="text-2xl md:text-3xl font-serif italic text-white tracking-wide">你的档案已提交</h2>
              <p className="text-xs md:text-sm text-white/60 tracking-wider">正在为你寻找契合的人...</p>
              <p className="text-[10px] text-white/40 tracking-wider uppercase">有新匹配时我们会通知你</p>
            </div>
            
            <AnimatePresence>
              {showMatchNotification && (
                <motion.div 
                   initial={{ y: 20, opacity: 0 }}
                   animate={{ y: 0, opacity: 1 }}
                   className="w-full bg-[#111] backdrop-blur-md border border-aurora-pink/30 shadow-[0_0_30px_rgba(255,107,107,0.15)] rounded-3xl p-6 cursor-pointer hover:bg-white/5 transition-colors absolute bottom-10"
                   onClick={() => {
                     setStep(socialMode === 'friends' ? 'friends-home' : 'matching');
                     setTimeout(() => {
                       handleChallengeComplete(answers);
                     }, 0);
                   }}
                >
                   <div className="flex items-center gap-4">
                      <div className="w-12 h-12 rounded-full bg-aurora-pink/20 flex items-center justify-center shrink-0">
                         <Sparkles size={20} className="text-aurora-pink" />
                      </div>
                      <div className="text-left flex-1">
                         <h4 className="text-sm font-bold text-white mb-1">🎉 你有一个新的灵魂契合！</h4>
                         <p className="text-[10px] text-aurora-pink uppercase tracking-widest break-words whitespace-normal line-clamp-1 overflow-visible">契合度93% · 点击查看</p>
                      </div>
                   </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.div>
        )}

        {step === 'review' && (
          <motion.div
            key="review"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="flex-1 flex flex-col max-w-2xl mx-auto w-full space-y-4 pt-4 md:pt-6"
          >
            <div className="text-center space-y-2">
              <h2 className="text-2xl font-serif italic text-white">确认你的灵魂档案</h2>
              <p className="text-[10px] text-white/40 uppercase tracking-widest">请核对以下信息，这将决定你的匹配结果</p>
            </div>

            <div className="glass p-8 rounded-[2.5rem] space-y-6 max-h-[450px] overflow-y-auto scrollbar-hide border border-white/10">
              {questions.map((q, idx) => (
                <div key={q.id} className="space-y-2 pb-4">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase tracking-widest text-white/40">问题 {idx + 1}</span>
                    <button 
                      onClick={() => {
                        setStep('challenge');
                        setCurrentQuestion(idx);
                      }}
                      className="text-[10px] text-aurora-pink hover:underline"
                    >
                      修改
                    </button>
                  </div>
                  <p className="text-sm font-medium text-white/80">{q.question}</p>
                  <p className="text-lg text-sunset-orange font-light">
                    {answers[q.id] || '未填写'}
                  </p>
                </div>
              ))}
            </div>

            <div className="flex justify-center gap-4">
              <button 
                onClick={() => {
                  setStep('challenge-intro');
                  setCurrentQuestion(0);
                  setAnswers({});
                  setSessionMbti(null);
                }}
                className="px-8 py-4 bg-white/5 rounded-full text-white/60 hover:text-white transition-all"
              >
                重新开始
              </button>
              <button 
                onClick={confirmReview}
                className="px-12 py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white rounded-full font-bold shadow-xl hover:scale-105 transition-all flex items-center gap-2"
              >
                <Sparkles size={18} />
                确认并开启匹配
              </button>
            </div>
          </motion.div>
        )}

        {step === 'matching' && (
          <motion.div
            key="matching"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex-1 flex flex-col min-h-0 pt-4"
          >
            {/* Main Content Area */}
            <div className="flex-1 flex flex-col min-h-0">
              <motion.div
                key="match-content"
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
                className="flex-1 space-y-6 overflow-y-auto scrollbar-hide pr-2 mt-2"
              >
                    {/* Match List Section */}
                    {socialMode === 'friends' && (
                      <div className="flex overflow-x-auto scrollbar-hide gap-3 px-1 pb-2">
                        {[
                          { id: 'eat', label: '🍜 饭搭子' },
                          { id: 'sports', label: '🏃 运动搭子' },
                          { id: 'travel', label: '✈️ 旅游搭子' },
                          { id: 'study', label: '📚 学习搭子' },
                          { id: 'chat', label: '💬 纯聊天' }
                        ].map(tag => (
                          <button
                            key={tag.id}
                            onClick={() => {
                              setSelectedFriendCategory(tag.label);
                              if (tag.label === '💬 纯聊天') {
                                setFriendsMatchType('1v1');
                              }
                              findMatches(); // Re-trigger match loading
                            }}
                            className={`flex-shrink-0 px-5 py-2.5 rounded-full text-xs font-bold uppercase tracking-widest transition-all duration-300 border ${
                              selectedFriendCategory === tag.label || (!selectedFriendCategory && tag.id === 'eat')
                                ? 'bg-neon-green/20 border-neon-green/50 text-neon-green shadow-lg shadow-neon-green/10'
                                : 'bg-white/5 border-white/10 text-white/50 hover:bg-white/10 hover:text-white'
                            }`}
                          >
                            {tag.label}
                          </button>
                        ))}
                      </div>
                    )}
                    <div className="flex-1 flex flex-col gap-4">
                      <div className="flex flex-col md:flex-row md:items-center justify-between px-1 gap-4">
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium text-white">
                            {socialMode === 'friends' 
                               ? (friendsMatchType === 'group' ? '同频交流群组' : '你的同频伙伴') 
                               : '灵魂匹配推荐'}
                          </h3>
                          <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] text-white/40 uppercase tracking-widest">
                            {socialMode === 'friends' && friendsMatchType === 'group' ? '百人在线互动' : `${Math.min(matches.length, 3)} 位契合者`}
                          </span>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {socialMode === 'friends' && selectedFriendCategory !== '💬 纯聊天' && (
                            <div className="flex bg-white/5 rounded-full p-1 border border-white/10">
                              <button
                                onClick={() => {
                                  setFriendsMatchType('1v1');
                                  findMatches();
                                }}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                  friendsMatchType === '1v1' ? 'bg-neon-green text-black' : 'text-white/40 hover:text-white'
                                }`}
                              >
                                1v1 组队
                              </button>
                              <button
                                onClick={() => {
                                  setFriendsMatchType('group');
                                  findMatches();
                                }}
                                className={`px-4 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest transition-colors ${
                                  friendsMatchType === 'group' ? 'bg-neon-green text-black' : 'text-white/40 hover:text-white'
                                }`}
                              >
                                大群交流
                              </button>
                            </div>
                          )}

                          <button 
                            onClick={() => findMatches()}
                            className="text-[10px] uppercase tracking-widest text-white/40 hover:text-white transition-colors"
                          >
                            重新匹配
                          </button>
                        </div>
                      </div>

                      {loadingMatches ? (
                        <div className="flex-1 flex flex-col items-center justify-center py-32 gap-8 relative overflow-hidden">
                          <div className="relative w-48 h-48 flex items-center justify-center">
                            <motion.div 
                              animate={{ rotate: 360 }}
                              transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                              className={`absolute inset-0 border-2 border-dashed rounded-full opacity-20 ${currentContent.accent}`}
                            />
                            <motion.div 
                              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
                              transition={{ duration: 2, repeat: Infinity }}
                              className={`absolute inset-4 rounded-full blur-2xl ${currentContent.glow}`}
                            />
                            <div className="relative z-10 flex flex-col items-center gap-2">
                              <Sparkles className={currentContent.accent} size={32} />
                              <div className="flex gap-1">
                                {[0, 1, 2].map(i => (
                                  <motion.div
                                    key={i}
                                    animate={{ height: [4, 12, 4] }}
                                    transition={{ duration: 0.6, repeat: Infinity, delay: i * 0.1 }}
                                    className={`w-1 rounded-full ${currentContent.glow}`}
                                  />
                                ))}
                              </div>
                            </div>
                          </div>
                          <div className="text-center space-y-2 relative z-10">
                            <h3 className="text-xl font-serif italic text-white">正在共振灵魂...</h3>
                            <p className="text-[10px] uppercase tracking-[0.4em] text-white/30">Deep Sync in Progress</p>
                          </div>
                        </div>
                      ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pb-20">
                      {socialMode === 'friends' && friendsMatchType === 'group' ? (
                        <>
                          {isChatExpanded && (
                            <motion.div 
                              initial={{ opacity: 0 }}
                              animate={{ opacity: 1 }}
                              exit={{ opacity: 0 }}
                              className="fixed inset-0 bg-black/40 backdrop-blur-xl z-[90]" 
                              onClick={() => setIsChatExpanded(false)}
                            />
                          )}
                          <div className={`col-span-1 md:col-span-2 lg:col-span-3 transition-all duration-300 ${isChatExpanded ? 'fixed inset-4 md:inset-10 z-[100]' : ''}`}>
                            <motion.div
                              initial={{ opacity: 0, scale: 0.95 }}
                              animate={{ opacity: 1, scale: 1 }}
                              className={`bg-[#1a1a1a] border border-white/10 rounded-3xl overflow-hidden flex flex-col shadow-2xl relative ${isChatExpanded ? 'h-full' : 'h-[500px]'}`}
                            >
                            <div className="p-4 border-b border-white/5 flex items-center justify-between bg-white/5 backdrop-blur-md">
                               <div className="flex items-center gap-3">
                                 <div className="w-10 h-10 rounded-full bg-neon-green/20 flex items-center justify-center border border-neon-green/30">
                                   <Users size={20} className="text-neon-green" />
                                 </div>
                                 <div className="flex flex-col">
                                   <h3 className="text-white font-bold">{selectedFriendCategory} 交流群</h3>
                                   <span className="text-[10px] text-neon-green flex items-center gap-1">
                                      <span className="w-1.5 h-1.5 bg-neon-green rounded-full animate-pulse" /> 124人在线
                                   </span>
                                 </div>
                               </div>
                               <button 
                                 onClick={() => setIsChatExpanded(!isChatExpanded)}
                                 className="p-2 bg-white/5 hover:bg-white/10 rounded-full text-white/60 hover:text-white transition-colors"
                               >
                                 {isChatExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                               </button>
                            </div>
                            
                            <div className="flex-1 p-4 overflow-y-auto flex flex-col gap-4 bg-black/20">
                               <div className="flex justify-center mb-4">
                                 <span className="text-[10px] text-white/30 bg-black/40 px-3 py-1 rounded-full uppercase tracking-widest">
                                   Welcome to the {selectedFriendCategory} Space
                                 </span>
                               </div>
                               
                               {(groupChatMessagesByCat[selectedFriendCategory] || groupChatMessagesByCat['🍜 饭搭子']).map(msg => (
                                 <div key={msg.id} className={`flex gap-3 items-end ${msg.isMe ? 'flex-row-reverse mt-2' : ''}`}>
                                    <div 
                                      className={`w-8 h-8 rounded-full flex-shrink-0 flex items-center justify-center text-xs border ${msg.isMe ? 'bg-neon-green/20 border-neon-green/30 text-neon-green cursor-default' : 'bg-aurora-pink/20 border-aurora-pink/30 text-white cursor-pointer hover:scale-110 transition-transform'}`}
                                      title={!msg.isMe ? "加好友" : undefined}
                                      onClick={() => {
                                        if (!msg.isMe) {
                                          showToast(`已向 ${msg.sender} 发送好友申请`);
                                        }
                                      }}
                                    >
                                      {msg.avatar}
                                    </div>
                                    <div className="flex flex-col gap-1 max-w-[80%]">
                                      <div className={`flex items-center gap-2 ${msg.isMe ? 'justify-end' : 'justify-start'}`}>
                                        <span className={`text-[10px] ${msg.isMe ? 'text-neon-green' : 'text-white/60'}`}>{msg.sender}</span>
                                        <span className="text-[9px] text-white/30">{formatMessageTime(msg.timestamp)}</span>
                                      </div>
                                      <div className={`${msg.isMe ? 'bg-neon-green/10 border-neon-green/20 text-neon-green rounded-2xl rounded-br-none' : 'bg-white/5 border-white/5 text-white/90 rounded-2xl rounded-bl-none'} p-3 border text-sm shadow-lg`}>
                                        {msg.text}
                                      </div>
                                    </div>
                                 </div>
                               ))}
                            </div>
                            
                            <div className="p-4 bg-[#151515] border-t border-white/5 flex items-center gap-3">
                               <input 
                                 type="text" 
                                 placeholder="说点什么..." 
                                 value={groupChatInput}
                                 onChange={(e) => setGroupChatInput(e.target.value)}
                                 onKeyDown={(e) => {
                                   if (e.key === 'Enter' && groupChatInput.trim()) {
                                      const now = new Date();
                                      const currentMessages = groupChatMessagesByCat[selectedFriendCategory] || groupChatMessagesByCat['🍜 饭搭子'];
                                      setGroupChatMessagesByCat({
                                        ...groupChatMessagesByCat,
                                        [selectedFriendCategory || '🍜 饭搭子']: [...currentMessages, {
                                          id: Date.now(),
                                          text: groupChatInput.trim(),
                                          sender: profile?.name || 'Me',
                                          avatar: 'Me',
                                          isMe: true,
                                          timestamp: now.toISOString()
                                        }]
                                      });
                                      setGroupChatInput('');
                                   }
                                 }}
                                 className="flex-1 bg-black/40 border border-white/10 rounded-full py-3 px-5 text-sm text-white focus:outline-none focus:border-neon-green/50 transition-colors"
                               />
                               <button 
                                 onClick={() => {
                                   if (groupChatInput.trim()) {
                                      const now = new Date();
                                      const currentMessages = groupChatMessagesByCat[selectedFriendCategory] || groupChatMessagesByCat['🍜 饭搭子'];
                                      setGroupChatMessagesByCat({
                                        ...groupChatMessagesByCat,
                                        [selectedFriendCategory || '🍜 饭搭子']: [...currentMessages, {
                                          id: Date.now(),
                                          text: groupChatInput.trim(),
                                          sender: profile?.name || 'Me',
                                          avatar: 'Me',
                                          isMe: true,
                                          timestamp: now.toISOString()
                                        }]
                                      });
                                      setGroupChatInput('');
                                   }
                                 }}
                                 className={`p-3 rounded-full hover:scale-105 active:scale-95 transition-all shadow-[0_0_15px_rgba(185,255,102,0.3)] ${groupChatInput.trim() ? 'bg-neon-green text-black' : 'bg-white/10 text-white/30 cursor-not-allowed shadow-none'}`}
                                 disabled={!groupChatInput.trim()}
                               >
                                 <Send size={18} />
                               </button>
                            </div>
                          </motion.div>
                        </div>
                        </>
                      ) : (
                        matches.slice(0, 3).map((match, i) => {
                        const { score: matchScore, insight, radarData } = calculateMatch(match, profile || undefined);
                        return (
                          <motion.div
                            key={match.uid}
                            whileHover={{ y: -4, scale: 1.02 }}
                            onClick={() => setSelectedProfile(match)}
                            className="glass p-5 rounded-3xl flex flex-col gap-4 relative overflow-hidden group transition-all duration-500 border border-white/10 hover:border-white/20 cursor-pointer"
                          >
                            <div className="absolute top-0 right-0 p-4 opacity-[0.03] group-hover:opacity-[0.08] transition-opacity rotate-12 group-hover:rotate-0 duration-700">
                              {socialMode === 'friends' ? <UserPlus size={100} /> : <Heart size={100} />}
                            </div>
                            
                            <div className="flex items-center gap-4">
                              <div className="relative">
                                <div className={`absolute inset-0 ${socialMode === 'friends' ? 'bg-neon-green' : 'bg-gradient-to-tr from-aurora-pink to-sunset-orange'} rounded-xl blur-md opacity-20 group-hover:opacity-40 transition-opacity`} />
                                <div className="relative w-12 h-12 rounded-xl bg-white/5 flex items-center justify-center transition-colors overflow-hidden">
                                  {match.avatarUrl ? (
                                    <img src={match.avatarUrl} alt={match.displayName} className="w-full h-full object-cover" />
                                  ) : (
                                    <UserCheck size={24} className="text-white/40 group-hover:text-white/80 transition-colors" />
                                  )}
                                </div>
                              </div>
                              <div>
                                <h4 className="text-base font-medium tracking-tight text-white">{match.displayName}</h4>
                                <div className="flex items-center gap-2">
                                  <div className={`w-1.5 h-1.5 rounded-full ${socialMode === 'friends' ? 'bg-neon-green' : 'bg-aurora-pink'}`} />
                                  <p className="text-xs text-white/60 tracking-wider uppercase">{match.gender === 'male' ? '男生' : '女生'}</p>
                                  {match.mbti && (
                                    <>
                                      <span className="text-white/20">•</span>
                                      <p className={`text-xs ${socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'} font-mono tracking-wider`}>{match.mbti}</p>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>

                            <div className="flex flex-wrap gap-2">
                              {match.residence && (
                                <span className={`px-2 py-1 rounded-lg ${match.residence === profile?.residence ? (socialMode === 'friends' ? 'bg-neon-green/20 text-neon-green' : 'bg-aurora-pink/20 text-aurora-pink') : 'bg-white/5 text-white/60'} text-[10px] flex items-center gap-1`}>
                                  <MapPin size={10} /> {match.residence} {match.residence === profile?.residence && '(同城)'}
                                </span>
                              )}
                              {socialMode === 'friends' && match.university === profile?.university && (
                                <span className="px-2 py-1 rounded-lg bg-neon-green/10 text-[10px] text-neon-green flex items-center gap-1">
                                  🎓 {match.university} 同校
                                </span>
                              )}
                              {socialMode === 'friends' && (
                                <span className="px-2 py-1 rounded-lg bg-white/5 text-[10px] text-white/60 flex items-center gap-1">
                                  {(() => {
                                    const type = match.answers?.[201] || '纯聊天';
                                    if (type.includes('饭') || type.includes('eat')) return `🍜 ${type}`;
                                    if (type.includes('运动') || type.includes('sport')) return `🏃 ${type}`;
                                    if (type.includes('游') || type.includes('travel')) return `✈️ ${type}`;
                                    if (type.includes('学') || type.includes('study')) return `📚 ${type}`;
                                    return `💬 ${type}`;
                                  })()}
                                </span>
                              )}
                            </div>

                            <div className="space-y-4">
                              <div className="flex justify-between items-center text-[10px] uppercase tracking-[0.2em] font-bold text-white/40">
                                <span>灵魂契合度 (Soul Match)</span>
                                <span className="text-white/60 text-lg">{matchScore}%</span>
                              </div>
                              <div className="h-1.5 w-2/3 mx-auto bg-white/5 rounded-full overflow-hidden">
                                <motion.div 
                                  initial={{ width: 0 }}
                                  animate={{ width: `${matchScore}%` }}
                                  transition={{ duration: 1.5, delay: i * 0.1 }}
                                  className={`h-full bg-gradient-to-r ${currentContent.gradient} shadow-[0_0_10px_rgba(255,100,200,0.3)]`}
                                />
                              </div>

                              {/* Soul Radar Chart */}
                              <div className="h-48 w-full -mx-4">
                                <ResponsiveContainer width="100%" height="100%">
                                  <RadarChart cx="50%" cy="50%" outerRadius="60%" data={radarData}>
                                    <PolarGrid stroke="rgba(255,255,255,0.05)" />
                                    <PolarAngleAxis dataKey="subject" tick={{ fill: 'rgba(255,255,255,0.4)', fontSize: 10 }} />
                                    <Radar
                                      name="Match"
                                      dataKey="A"
                                      stroke={socialMode === 'friends' ? '#00FF00' : '#FF64C8'}
                                      fill={socialMode === 'friends' ? '#00FF00' : '#FF64C8'}
                                      fillOpacity={0.3}
                                    />
                                  </RadarChart>
                                </ResponsiveContainer>
                              </div>

                              {/* Soul Insight */}
                              <div className="bg-white/5 rounded-2xl p-4 transition-colors">
                                <div className="flex items-center gap-2 mb-2">
                                  <Sparkles size={12} className={currentContent.accent} />
                                  <span className={`text-[8px] uppercase tracking-widest font-bold ${currentContent.accent}`}>
                                    {socialMode === 'friends' ? '搭子洞察' : '灵魂洞察'}
                                  </span>
                                </div>
                                <p className="text-xs text-white/80 leading-relaxed italic">
                                  {socialMode === 'friends' ? '你们都喜欢周末出门探索墨尔本' : `“${insight}”`}
                                </p>
                              </div>

                              <div className="relative">
                                <div className={`absolute -left-3 top-0 bottom-0 w-0.5 ${socialMode === 'friends' ? 'bg-neon-green/50' : 'bg-sunset-orange/50'} rounded-full`} />
                                <p className="text-sm text-white/80 line-clamp-3 italic leading-relaxed pl-2">
                                  “{match.personality || '这个用户很神秘，还没有写下性格描述...'}”
                                </p>
                              </div>

                              <div className="bg-white/5 rounded-2xl p-4 mt-2 space-y-3">
                                <div>
                                  <span className={`text-[10px] ${currentContent.accent} font-bold uppercase tracking-widest`}>破冰问题：</span>
                                  <p className="text-xs text-white/90 leading-relaxed mt-1">
                                    {socialMode === 'friends'
                                      ? '你们都想找饭搭子，最近有没有想去的餐厅？'
                                      : '根据你们的共同答案，系统为你们准备了一个问题：可以聊聊为什么吗？'}
                                  </p>
                                </div>
                                <div className="flex gap-2 pt-3 border-t border-white/5">
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      if (!initiatingChat) startChat(match);
                                    }}
                                    disabled={initiatingChat === match.uid}
                                    className={`flex-1 py-3 ${socialMode === 'friends' ? 'bg-neon-green text-black' : 'bg-aurora-pink text-white'} rounded-xl text-xs font-bold uppercase tracking-[0.1em] hover:opacity-90 transition-opacity flex items-center justify-center gap-2 shadow-lg`}
                                  >
                                    打个招呼 →
                                  </button>
                                  <button
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      showNotification('已跳过');
                                    }}
                                    className="px-6 py-3 bg-white/5 rounded-xl text-xs text-white/60 hover:text-white transition-colors uppercase tracking-[0.1em]"
                                  >
                                    跳过
                                  </button>
                                </div>
                              </div>
                            </div>
                          </motion.div>
                        );
                      })
                      )}
                      {socialMode === 'friends' && friendsMatchType === 'group' && null}
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Profile Modal */}
      <AnimatePresence>
        {/* Notification Toast */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: 50, x: '-50%' }}
              animate={{ opacity: 1, y: 0, x: '-50%' }}
              exit={{ opacity: 0, y: 20, x: '-50%' }}
              className="fixed bottom-12 left-1/2 z-[200] px-6 py-3 rounded-2xl bg-white/10 backdrop-blur-2xl border border-white/20 shadow-2xl flex items-center gap-3"
            >
              <div className={`w-2 h-2 rounded-full ${notification.type === 'success' ? 'bg-neon-green' : 'bg-aurora-pink'} animate-pulse`} />
              <span className="text-xs font-bold text-white tracking-widest uppercase">{notification.message}</span>
            </motion.div>
          )}
        </AnimatePresence>

        {selectedProfile && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-6 bg-black/80 backdrop-blur-sm"
            onClick={() => setSelectedProfile(null)}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className="glass w-full max-w-lg rounded-[2.5rem] overflow-hidden border border-white/20 shadow-2xl max-h-[90vh] flex flex-col"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-40 md:h-48">
                <img 
                  src={selectedProfile.avatarUrl || `https://picsum.photos/seed/${selectedProfile.uid}/600/400`} 
                  alt={selectedProfile.displayName}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />
                <button 
                  onClick={() => setSelectedProfile(null)}
                  className="absolute top-4 right-4 w-8 h-8 rounded-full bg-black/40 backdrop-blur-md flex items-center justify-center text-white/60 hover:text-white transition-colors"
                >
                  <RotateCw className="rotate-45" size={16} />
                </button>
              </div>

              <div className="p-6 md:p-8 -mt-8 relative z-10 space-y-6">
                <div className="flex items-end justify-between">
                  <div className="space-y-1">
                    <h3 className="text-2xl font-bold text-white tracking-tight">{selectedProfile.displayName}</h3>
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-widest ${selectedProfile.gender === 'male' ? 'bg-blue-500/20 text-blue-400' : 'bg-pink-500/20 text-pink-400'}`}>
                        {selectedProfile.gender === 'male' ? '男生' : '女生'}
                      </span>
                      <span className="px-2 py-0.5 rounded-full bg-white/5 text-[9px] font-bold uppercase tracking-widest text-white/60">
                        {selectedProfile.mbti || '未知'}
                      </span>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[9px] uppercase tracking-widest text-white/40 font-bold mb-0.5">灵魂契合度</div>
                    <div className="text-3xl font-serif italic text-sunset-orange">
                      {calculateMatch(selectedProfile, profile || undefined).score}%
                    </div>
                  </div>
                </div>

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <LayoutGrid size={12} className="text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">灵魂标签 · Soul Tags</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedProfile.soul_report?.tags.map((tag, idx) => (
                      <span 
                        key={idx}
                        className="px-3 py-1.5 rounded-xl bg-white/10 border border-white/20 text-[11px] text-white/90 font-medium hover:bg-white/20 transition-colors"
                      >
                        {tag}
                      </span>
                    ))}
                    {selectedProfile.university && (
                      <span className="px-3 py-1.5 rounded-xl bg-neon-green/10 border border-neon-green/20 text-[11px] text-neon-green font-bold">
                        🎓 {selectedProfile.university}
                      </span>
                    )}
                  </div>
                </div>

                {(selectedProfile.answers && (selectedProfile.answers[132] || selectedProfile.answers[232])) && (
                  <div className="space-y-3">
                    <div className="flex items-center gap-2">
                      {socialMode === 'friends' ? <Users size={12} className="text-neon-green" /> : <Heart size={12} className="text-aurora-pink" />}
                      <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">
                        {socialMode === 'friends' ? '交友宣言 · Friend Statement' : '真心告白 · True Confession'}
                      </span>
                    </div>
                    <div className={`${socialMode === 'friends' ? 'bg-neon-green/5 border-neon-green/10' : 'bg-aurora-pink/5 border-aurora-pink/10'} rounded-[1.5rem] p-4 border`}>
                      <p className="text-xs text-white/90 leading-relaxed font-medium">
                        “{selectedProfile.answers[132] || selectedProfile.answers[232]}”
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <User size={12} className="text-white/40" />
                    <span className="text-[9px] uppercase tracking-widest font-bold text-white/40">性格描述 · Personality</span>
                  </div>
                  <div className="bg-white/5 rounded-[1.5rem] p-4 border border-white/5">
                    <p className="text-xs text-white/70 leading-relaxed italic">
                      “{selectedProfile.personality || '这个用户很神秘，还没有写下性格描述...'}”
                    </p>
                  </div>
                </div>

                <div className="flex gap-4 pt-1">
                  <button 
                    onClick={() => {
                      if (!initiatingChat) startChat(selectedProfile);
                    }}
                    disabled={!!initiatingChat}
                    className="flex-1 py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange rounded-[1.5rem] text-xs font-bold uppercase tracking-[0.2em] text-white shadow-xl shadow-aurora-pink/20 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {initiatingChat ? (
                      <RotateCw size={16} className="animate-spin" />
                    ) : (
                      <MessageSquare size={16} />
                    )}
                    <span className="relative z-10">{initiatingChat ? '启动中...' : '发起对话'}</span>
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Friend Type Modal */}
      <AnimatePresence>
        {showFriendTypeModal && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
          >
            <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setShowFriendTypeModal(false)} />
            <motion.div 
              initial={{ opacity: 0, scale: 0.9, y: 20 }} 
              animate={{ opacity: 1, scale: 1, y: 0 }} 
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative bg-[#1A1A1A] border border-white/10 rounded-[2rem] p-8 max-w-sm w-full shadow-2xl flex flex-col gap-6"
            >
              <button 
                onClick={() => setShowFriendTypeModal(false)} 
                className="absolute top-4 right-4 text-white/40 hover:text-white bg-white/5 rounded-full p-2 transition-all"
              >
                <X size={16} />
              </button>
              
              <div className="text-center space-y-2 mt-4">
                <div className="w-16 h-16 rounded-3xl bg-neon-green/10 flex items-center justify-center mx-auto mb-4 border border-neon-green/20">
                  <span className="text-3xl">{selectedFriendCategory.split(' ')[0]}</span>
                </div>
                <h3 className="text-xl md:text-2xl font-bold text-white tracking-wide">{selectedFriendCategory.split(' ')[1]}</h3>
                <p className="text-[10px] text-white/50 uppercase tracking-widest pt-2">选择你的探索方式</p>
              </div>

              <div className="flex flex-col gap-3 mt-4">
                <button 
                  onClick={() => {
                    setShowFriendTypeModal(false);
                    setFriendsMatchType('1v1');
                    if (profile?.answers && questions.some(q => profile.answers[q.id])) setStep('matching');
                    else {
                      setStep('challenge-intro');
                      setCurrentQuestion(0);
                      setAnswers({});
                    }
                  }} 
                  className="w-full py-4 bg-neon-green/10 hover:bg-neon-green/20 border border-neon-green/30 rounded-2xl text-neon-green font-bold text-sm uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2 group"
                >
                  单独匹配 (1v1)
                  <ChevronRight size={16} className="group-hover:translate-x-1 transition-transform" />
                </button>
                
                {selectedFriendCategory !== '💬 纯聊天' && (
                  <button 
                    onClick={() => {
                      setShowFriendTypeModal(false);
                      setFriendsMatchType('group');
                      if (profile?.answers && questions.some(q => profile.answers[q.id])) setStep('matching');
                      else {
                        setStep('challenge-intro');
                        setCurrentQuestion(0);
                        setAnswers({});
                      }
                    }} 
                    className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl text-white font-bold text-[11px] uppercase tracking-[0.2em] transition-all"
                  >
                    加入群聊 (Group)
                  </button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      </div>
    </div>
  );
}
