import React, { useState, useEffect, createContext, useContext } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShieldCheck, Users, Heart, Sparkles, LogIn, User as UserIcon, MessageSquare, X } from 'lucide-react';
import Square from './components/Square';
import ProfileModal from './components/ProfileModal';
import ChatList from './components/ChatList';
import ChatWindow from './components/ChatWindow';

import { UserProfile } from './types';
import { auth, googleProvider, signInWithPopup, onAuthStateChanged } from './firebase';
import { db } from './firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { getCuteLineArtUrl } from './utils/avatars';

// Error Boundary Component
class ErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean, error: any }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error: any) {
    return { hasError: true, error };
  }

  componentDidCatch(error: any, errorInfo: any) {
    console.error("ErrorBoundary caught an error", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      let errorMessage = "发生了一些错误。";
      
      return (
        <div className="min-h-screen bg-[#050505] flex items-center justify-center p-8 text-center">
          <div className="glass-pink p-12 rounded-[3rem] max-w-md space-y-6">
            <div className="w-20 h-20 rounded-full bg-red-500/10 flex items-center justify-center mx-auto">
              <ShieldCheck className="text-red-500" size={40} />
            </div>
            <h2 className="text-2xl font-serif italic">出错了</h2>
            <p className="text-sm text-white/60 leading-relaxed">{errorMessage}</p>
            <button 
              onClick={() => window.location.reload()}
              className="w-full py-4 bg-white/5 hover:bg-white/10 rounded-2xl text-xs font-bold uppercase tracking-widest transition-all"
            >
              刷新页面
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

// Auth Context
interface AuthContextType {
  user: any | null;
  profile: UserProfile | null;
  loading: boolean;
  signIn: (provider: 'google' | 'wechat') => Promise<void>;
  signOut: () => Promise<void>;
  refreshProfile: () => Promise<void>;
  setProfile: React.Dispatch<React.SetStateAction<UserProfile | null>>;
  setShowAuthModal: (show: boolean) => void;
  setShowProfileModal: (show: boolean) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth 必须在 AuthProvider 中使用');
  return context;
};

export default function App() {
  const [user, setUser] = useState<any | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [isDemo, setIsDemo] = useState(false);

  const fetchProfile = async (uid: string) => {
    if (uid === 'demo-user-123') return;
    try {
      const docRef = doc(db, 'profiles', uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        setProfile(docSnap.data() as UserProfile);
        setShowProfileModal(false);
      } else {
        setProfile(null);
        setShowProfileModal(true);
      }
    } catch (error: any) {
      console.error('Error fetching profile:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      // Just in case we need popup fallback logic
    };
    window.addEventListener('message', handleMessage);

    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        fetchProfile(currentUser.uid);
      } else if (!isDemo) {
        setUser(null);
        setProfile(null);
        setShowProfileModal(false);
      }
      setLoading(false);
    });

    return () => {
      unsubscribe();
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  const signIn = async (provider: 'google' | 'wechat') => {
    try {
      if (provider === 'google') {
        const result = await signInWithPopup(auth, googleProvider);
        if (result.user) {
          setUser(result.user);
          await fetchProfile(result.user.uid);
        }
      } else {
        alert('微信登录暂未接入');
      }
    } catch (error) {
      console.error('Sign in error:', error);
      alert('登录失败，请重试');
    }
  };

  const demoLogin = () => {
    setIsDemo(true);
    setUser({ id: 'demo-user-123', email: 'demo@example.com', user_metadata: { full_name: '体验用户', avatar_url: getCuteLineArtUrl('云朵') } });
    setProfile({
      uid: 'demo-user-123',
      displayName: '体验用户',
      avatarUrl: getCuteLineArtUrl('云朵'),
      bio: '这是一个体验账号，欢迎来到灵魂避难所。',
      mbti: 'INFJ',
      tags: ['音乐', '阅读', '冥想'],
      lookingFor: '寻找有趣的灵魂',
      gender: 'other',
      orientation: 'bi',
      personality: '温和、内省',
      partnerPreferences: '真诚、有趣',
      answers: {},
      createdAt: new Date().toISOString()
    });
    setLoading(false);
  };

  const signOut = async () => {
    if (isDemo) {
      setIsDemo(false);
      setUser(null);
      setProfile(null);
      return;
    }
    try {
      await auth.signOut();
    } catch (error) {
      console.error('Sign out error:', error);
    }
  };

  const refreshProfile = async () => {
    if (user) await fetchProfile(user.uid);
  };

  const [mode, setMode] = useState<'home' | 'square' | 'messages'>('home');
  const [squareStep, setSquareStep] = useState<'intro' | 'challenge-intro' | 'challenge' | 'challenge-complete' | 'build-profile' | 'ready-to-match' | 'waiting-match' | 'review' | 'matching' | 'friends-home'>('intro');
  const [squareQuestionIndex, setSquareQuestionIndex] = useState<number>(0);
  const [squareAnswers, setSquareAnswers] = useState<Record<number, string>>({});
  const [socialMode, setSocialMode] = useState<'dating' | 'friends'>('dating');
  const [showFriends1v1, setShowFriends1v1] = useState(false);
  const [lastMainMode, setLastMainMode] = useState<'square'>('square');
  const [selectedChat, setSelectedChat] = useState<{ id: string; otherUser: UserProfile } | null>(null);

  const handleSetMode = (newMode: 'home' | 'square' | 'messages') => {
    console.log('[App] Setting mode to:', newMode);
    if (newMode === 'square') {
      setLastMainMode(newMode);
    }
    setMode(newMode);
  };

  const navigateToChat = (chatId: string, otherUser: UserProfile) => {
    setSelectedChat({ id: chatId, otherUser });
    handleSetMode('messages');
  };

  const renderHeader = () => (
    <header className="w-full shrink-0 z-50 py-2 relative">
      <div className="max-w-7xl mx-auto px-4 md:px-8 h-12 md:h-16 flex items-center justify-between">
        {/* Left: Home Button */}
        <div className="flex-1 flex items-center pointer-events-auto">
          {mode !== 'home' && (
            <div 
              id="square-nav-btn"
              onClick={() => {
                const homeStep = (user && profile?.answers && Object.keys(profile.answers).length > 0) ? (socialMode === 'friends' ? 'friends-home' : 'matching') : 'intro';
                if (mode === 'square') {
                  setSquareStep(homeStep);
                } else if (mode === 'messages') {
                  setMode('square');
                  setSquareStep(homeStep);
                } else {
                  setMode('home');
                }
              }} 
              className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center cursor-pointer hover:scale-110 transition-transform shadow-lg backdrop-blur-xl border border-white/10"
            >
              <Heart size={18} className={socialMode === 'friends' ? "text-neon-green" : "text-aurora-pink"} fill="currentColor" />
            </div>
          )}
        </div>

        {/* Center: Main Switcher */}
        <div className="flex-none flex justify-center pointer-events-auto">
          {user && profile?.answers && Object.keys(profile.answers).length > 0 && (mode === 'messages' || mode === 'square') && (
            <div className="flex bg-white/5 backdrop-blur-xl p-1 rounded-full border border-white/10">
              <button
                onClick={() => {
                  setSocialMode('dating');
                  setSelectedChat(null);
                  if (mode === 'square') {
                     const homeStep = (user && profile?.answers && Object.keys(profile.answers).length > 0) ? 'matching' : 'intro';
                     setSquareStep(homeStep);
                  }
                }}
                className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                  socialMode === 'dating' 
                    ? 'bg-aurora-pink shadow-[0_0_20px_rgba(255,182,193,0.4)] text-white' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                恋爱模式
              </button>
              <button
                onClick={() => {
                  setSocialMode('friends');
                  setSelectedChat(null);
                  if (mode === 'square') {
                     const homeStep = (user && profile?.answers && Object.keys(profile.answers).length > 0) ? 'friends-home' : 'intro';
                     setSquareStep(homeStep);
                  }
                }}
                className={`px-3 md:px-4 py-1.5 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${
                  socialMode === 'friends' 
                    ? 'bg-neon-green shadow-[0_0_20px_rgba(52,211,153,0.4)] text-black' 
                    : 'text-white/40 hover:text-white/80'
                }`}
              >
                交友模式
              </button>
            </div>
          )}
        </div>

        {/* Right: Auth Bar */}
        <div className="flex-1 flex justify-end pointer-events-auto">
          <div className="flex items-center gap-2">
            {loading ? (
              <div className="w-10 h-10 rounded-full bg-white/5 animate-pulse" />
            ) : user ? (
              <div className="flex items-center gap-2">
                {profile?.answers && Object.keys(profile.answers).length > 0 ? (
                  <>
                    <button 
                      onClick={() => setMode('messages')}
                      className={`relative flex items-center gap-2 px-3 py-1.5 rounded-full backdrop-blur-xl transition-all text-[9px] font-bold uppercase tracking-widest ${mode === 'messages' ? 'bg-aurora-pink/20 text-aurora-pink shadow-[0_0_15px_rgba(255,182,193,0.3)]' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                    >
                      <div className="relative">
                        <MessageSquare size={12} />
                        {mode !== 'messages' && (
                          <div className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full animate-bounce shadow-[0_0_8px_rgba(239,68,68,0.8)] border border-[#0A0A0A]" />
                        )}
                      </div>
                      消息
                    </button>
                    <div 
                      onClick={() => setShowProfileModal(true)}
                      className="cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5 p-0.5 pr-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/5"
                    >
                      <img src={user.photoURL || user.user_metadata?.avatar_url || ''} alt="" className="w-6 h-6 rounded-full object-cover" />
                      <span className="text-[8px] font-bold text-white/60 uppercase tracking-widest">我的主页</span>
                    </div>
                  </>
                ) : (
                  <div className="flex items-center gap-2">
                    <img src={user.photoURL || user.user_metadata?.avatar_url || ''} alt="" className="w-6 h-6 rounded-full object-cover border border-white/10" />
                    <button 
                      onClick={signOut}
                      className="cursor-pointer hover:bg-white/10 transition-colors flex items-center gap-1.5 p-1.5 px-3 rounded-full backdrop-blur-xl bg-white/5 border border-white/5 text-[9px] font-bold text-white/60 uppercase tracking-widest"
                    >
                      退出登录
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center gap-1.5">
                <button 
                  onClick={demoLogin}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-aurora-pink/10 hover:bg-aurora-pink/20 text-aurora-pink rounded-full backdrop-blur-xl transition-all text-[9px] font-bold uppercase tracking-widest"
                >
                  <UserIcon size={12} /> 访客
                </button>
                <button 
                  onClick={() => setShowAuthModal(true)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded-full backdrop-blur-xl transition-all text-[9px] font-bold uppercase tracking-widest border border-white/5"
                >
                  <LogIn size={12} /> Login
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  );

  return (
    <AuthContext.Provider value={{ user, profile, loading, signIn, signOut, refreshProfile, setProfile, setShowAuthModal, setShowProfileModal }}>
      <ErrorBoundary>
        <div className={`h-[100dvh] flex flex-col relative overflow-hidden bg-[#050505] text-white transition-all duration-500`}>
        {/* Background Elements */}
        <div className="fixed top-[-20%] left-[-10%] w-[60%] h-[60%] rounded-full opacity-30 animate-pulse pointer-events-none z-0 blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.4) 0%, rgba(255,140,0,0) 70%)' }} />
        <div className="fixed bottom-[-20%] left-[40%] w-[80%] h-[80%] rounded-full animate-pulse pointer-events-none z-0 blur-[100px]" style={{ background: 'radial-gradient(circle, rgba(255,140,0,0.3) 0%, rgba(255,140,0,0) 70%)' }} />
        <div className="fixed bottom-[-10%] right-[-20%] w-[70%] h-[70%] rounded-full pointer-events-none z-0 blur-[120px]" style={{ background: 'radial-gradient(circle, rgba(46,8,84,0.6) 0%, rgba(46,8,84,0) 70%)' }} />

      {/* Main Content */}
      <main className="flex-1 flex flex-col z-10 relative overflow-hidden">
        <AnimatePresence mode="wait">
          {mode === 'home' ? (
            <motion.div
              key="home"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="h-full w-full overflow-y-auto overflow-x-hidden scrollbar-hide flex flex-col"
            >
              {renderHeader()}
              <div className="flex-1 max-w-7xl w-full mx-auto px-4 md:px-8 space-y-16 pb-32">
                
                {/* Hero Section */}
                <div className="flex flex-col items-center justify-center text-center space-y-6 pt-12 md:pt-20">
                  <div className="inline-flex py-1.5 px-4 rounded-full bg-white/5 border border-white/10 text-white/70 text-[10px] md:text-xs font-medium tracking-wider">
                    专为澳洲华人设计 · 仅限墨尔本 · 认真找对象朋友的地方
                  </div>
                  <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif italic text-transparent bg-clip-text bg-gradient-to-r from-white via-white to-white/70 tracking-tight leading-tight max-w-4xl">
                    不左滑不右滑，<br className="block md:hidden"/>用三观找到真正的人
                  </h1>
                  <p className="text-sm md:text-base text-white/50 max-w-2xl leading-relaxed">
                    这里没有快餐社交。通过30余道真实生活场景题，在数据与真心的交汇处，为你寻找灵魂契合的人。
                  </p>
                  <div className="pt-4 flex flex-col items-center gap-3">
                    <button 
                      onClick={() => handleSetMode('square')}
                      className="px-8 py-4 bg-gradient-to-r from-sunset-orange to-pink-500 rounded-full text-white font-bold tracking-wide hover:shadow-[0_0_30px_rgba(255,107,107,0.4)] transition-all transform hover:-translate-y-1"
                    >
                      开始我的灵魂匹配 →
                    </button>
                    <p className="text-[10px] text-white/40 tracking-wider">
                      免费 · 聊满15天才能加微信 · 认真的人才来
                    </p>
                  </div>
                </div>

                {/* Data Row */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 max-w-4xl mx-auto py-8">
                  {[
                    { value: '30+道', label: '灵魂题目' },
                    { value: '15天', label: '解锁联系方式' },
                    { value: '5维', label: '契合度分析' },
                    { value: '100%', label: '澳洲华人' },
                  ].map((item, i) => (
                    <div key={i} className="flex flex-col items-center justify-center p-6 rounded-2xl glass text-center space-y-2">
                      <span className="text-2xl md:text-3xl font-serif italic text-white/90">{item.value}</span>
                      <span className="text-[10px] md:text-xs text-white/50 tracking-widest uppercase">{item.label}</span>
                    </div>
                  ))}
                </div>

                {/* 2 Core Modules */}
                <div className="grid md:grid-cols-2 gap-6 max-w-4xl mx-auto px-4 md:px-0">
                  {/* Dating Module */}
                  <div 
                    onClick={() => {
                      setSocialMode('dating');
                      if (user && profile?.answers && Object.keys(profile.answers).length > 0) {
                        setSquareStep('matching');
                      } else {
                        setSquareStep('intro');
                      }
                      handleSetMode('square');
                    }}
                    className="flex flex-col p-8 md:p-10 rounded-[2rem] glass group relative overflow-hidden cursor-pointer border border-white/10 hover:border-aurora-pink/50 transition-all duration-500 min-h-[360px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-aurora-pink/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-16 h-16 rounded-2xl bg-aurora-pink/20 flex items-center justify-center text-aurora-pink mb-4 shrink-0 transition-transform group-hover:scale-110">
                        <Heart size={32} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-aurora-pink font-bold tracking-widest uppercase mb-2">核心功能</p>
                        <h3 className="text-3xl font-serif italic mb-4">恋爱匹配</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-light">拒绝快餐社交，基于核心价值观预审，寻找高质量的灵魂契合。</p>
                      </div>
                      <div className="mt-6 flex items-center text-xs font-bold text-aurora-pink uppercase tracking-widest gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        进入匹配 <Heart size={12} />
                      </div>
                    </div>
                  </div>

                  {/* Friends Module */}
                  <div 
                    onClick={() => {
                      setSocialMode('friends');
                      if (user && profile?.answers && Object.keys(profile.answers).length > 0) {
                        setSquareStep('friends-home');
                      } else {
                        setSquareStep('intro');
                      }
                      handleSetMode('square');
                    }}
                    className="flex flex-col p-8 md:p-10 rounded-[2rem] glass group relative overflow-hidden cursor-pointer border border-white/10 hover:border-neon-green/50 transition-all duration-500 min-h-[360px]"
                  >
                    <div className="absolute inset-0 bg-gradient-to-br from-neon-green/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                    <div className="relative z-10 flex flex-col h-full">
                      <div className="w-16 h-16 rounded-2xl bg-neon-green/20 flex items-center justify-center text-neon-green mb-4 shrink-0 transition-transform group-hover:scale-110">
                        <Users size={32} />
                      </div>
                      <div className="flex-1">
                        <p className="text-[10px] text-neon-green font-bold tracking-widest uppercase mb-2">第二核心</p>
                        <h3 className="text-3xl font-serif italic mb-4">交朋友</h3>
                        <p className="text-sm text-white/50 leading-relaxed font-light">不论是饭搭子、看展搭子，还是周末游，通过深度价值匹配找到墨尔本同频伙伴。</p>
                      </div>
                      <div className="mt-6 flex items-center text-xs font-bold text-neon-green uppercase tracking-widest gap-2 opacity-50 group-hover:opacity-100 transition-opacity">
                        发现同频伙伴 <Users size={12} />
                      </div>
                    </div>
                  </div>
                </div>

                {/* Footer Notice */}
                <div className="text-center py-16 opacity-30">
                  <p className="text-[10px] text-white uppercase tracking-[0.4em] font-light">
                    &copy; 2026 RealHeart · 反快餐恋爱辅助工具
                  </p>
                </div>
              </div>
            </motion.div>
          ) : (
            <motion.div
              key={mode}
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              className="flex-1 flex flex-col overflow-hidden"
            >
              {mode === 'messages' ? (
                <div className="flex-1 flex flex-col w-full overflow-hidden">
                  {renderHeader()}
                  <div className="flex-1 flex flex-col max-w-4xl mx-auto w-full px-0 md:px-4 gap-0 md:gap-4 overflow-hidden pt-4 pb-32 md:pb-0">
                    {selectedChat ? (
                      <ChatWindow 
                        chatId={selectedChat.id} 
                        otherUser={selectedChat.otherUser} 
                        onBack={() => setSelectedChat(null)} 
                        socialMode={socialMode}
                      />
                    ) : (
                      <ChatList onSelectChat={(id, otherUser) => setSelectedChat({ id, otherUser })} socialMode={socialMode} />
                    )}
                  </div>
                </div>
              ) : (
                <div className="flex-1 flex flex-col pb-32 md:pb-0 overflow-hidden">
                  <Square 
                    onNavigate={handleSetMode} 
                    onSelectChat={navigateToChat}
                    socialMode={socialMode}
                    onSocialModeChange={setSocialMode}
                    step={squareStep}
                    onStepChange={setSquareStep}
                    questionIndex={squareQuestionIndex}
                    onQuestionIndexChange={setSquareQuestionIndex}
                    answers={squareAnswers}
                    onAnswersChange={setSquareAnswers}
                    showFriends1v1={showFriends1v1}
                    setShowFriends1v1={setShowFriends1v1}
                    renderHeader={renderHeader}
                  />
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      <ProfileModal
        isOpen={showProfileModal}
        onClose={() => setShowProfileModal(false)}
        onComplete={refreshProfile}
        onRetest={() => {
          setSquareStep('intro');
          setMode('square');
        }}
      />

      <AnimatePresence>
        {showAuthModal && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-8 backdrop-blur-2xl bg-black/90"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }}
              animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 md:p-12 relative shadow-2xl flex flex-col"
            >
              <button 
                onClick={() => setShowAuthModal(false)}
                className="absolute top-6 right-6 p-2 text-white/30 hover:text-white rounded-full transition-colors"
              >
                <X size={20} />
              </button>
              
              <div className="text-center space-y-4 mb-8">
                <div className="flex justify-center mb-6">
                  <div className="w-16 h-16 rounded-3xl glass flex items-center justify-center">
                    <Heart size={32} className="text-aurora-pink" />
                  </div>
                </div>
                <h2 className="text-2xl font-serif italic text-white tracking-wide">欢迎来到真心</h2>
                <p className="text-[10px] text-white/50 tracking-widest uppercase font-bold">专为澳洲华人设计，认真找对象的地方</p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="space-y-2">
                  <label className="text-[10px] text-white/60 uppercase tracking-widest pl-1 font-bold">用手机号登录</label>
                  <input 
                    type="text"
                    placeholder="你的澳洲手机号（+61）"
                    className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 outline-none focus:border-aurora-pink/30 transition-colors"
                  />
                  <div className="flex gap-2">
                    <input 
                      type="text"
                      placeholder="验证码"
                      className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3.5 text-xs text-white placeholder-white/20 outline-none focus:border-aurora-pink/30 transition-colors"
                    />
                    <button className="px-4 py-3.5 whitespace-nowrap bg-white/10 hover:bg-white/20 border border-white/10 hover:border-white/20 text-white text-[10px] font-bold uppercase tracking-widest rounded-xl transition-colors">
                      获取验证码
                    </button>
                  </div>
                </div>
                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    demoLogin();
                  }}
                  className="w-full py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white text-xs font-bold uppercase tracking-widest rounded-xl shadow-lg shadow-aurora-pink/20 hover:scale-[1.02] transition-transform"
                >
                  手机号登录 (演示)
                </button>

                <div className="relative flex items-center py-4">
                  <div className="flex-grow border-t border-white/10"></div>
                  <span className="flex-shrink-0 mx-4 text-[9px] text-white/30 uppercase tracking-widest">或者</span>
                  <div className="flex-grow border-t border-white/10"></div>
                </div>

                <button 
                  onClick={() => {
                    setShowAuthModal(false);
                    signIn('google');
                  }}
                  className="w-full py-4 bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest rounded-xl hover:scale-[1.02] transition-transform border border-white/10 flex items-center justify-center gap-3"
                >
                  <svg viewBox="0 0 24 24" width="16" height="16" xmlns="http://www.w3.org/2000/svg"><path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4"/><path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/><path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/><path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/></svg>
                  使用 Google 登录
                </button>
              </div>

              <div className="text-center space-y-1 mt-8">
                <p className="text-[9px] text-white/30">注册即代表你同意我们的用户协议和隐私政策</p>
                <p className="text-[9px] text-white/20 font-bold uppercase tracking-widest pt-1">本平台仅限澳洲华人使用</p>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Footer - Social Proof */}
      {mode === 'home' && (
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-50">
          <p className="text-[9px] text-white/5 uppercase tracking-[0.4em] font-light">
            &copy; 2026 RealHeart · 反快餐恋爱辅助工具
          </p>
        </div>
      )}
      </div>
      </ErrorBoundary>
    </AuthContext.Provider>
  );
}
