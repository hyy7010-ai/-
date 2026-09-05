import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Send, ArrowLeft, MoreVertical, User, Sparkles, X, Heart, ShieldAlert, ShieldCheck, Lock, Unlock, Mic, MicOff, Volume2, Flag, Trash2, Clock, ImagePlus } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, orderBy, onSnapshot, getDocs, doc, setDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../App';
import { ChatMessage, UserProfile } from '../types';
import { getCuteLineArtUrl } from '../utils/avatars';
import { GoogleGenAI } from "@google/genai";
import confetti from 'canvas-confetti';

interface ChatWindowProps {
  chatId: string;
  otherUser: UserProfile;
  onBack: () => void;
  onSafetyWarning?: (message: string) => void;
  socialMode?: 'dating' | 'friends';
}

export default function ChatWindow({ chatId, otherUser, onBack, onSafetyWarning, socialMode = 'dating' }: ChatWindowProps) {
  const { user, profile } = useAuth();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Voice States
  const [isRecording, setIsRecording] = useState(false);
  const [recordingTime, setRecordingTime] = useState(0);
  const recordingTimerRef = useRef<NodeJS.Timeout | null>(null);
  const [playingVoiceId, setPlayingVoiceId] = useState<string | null>(null);

  // Menu States
  const [showMenu, setShowMenu] = useState(false);
  const [showReportModal, setShowReportModal] = useState(false);
  const [reportReason, setReportReason] = useState('');
  const [showUnlockModal, setShowUnlockModal] = useState(false);
  const [hasUnlockedContact, setHasUnlockedContact] = useState(false);

  // RealHeart Value & Safety Logic
  const [realHeartValue, setRealHeartValue] = useState(0);
  const [showSafetyModal, setShowSafetyModal] = useState(false);
  const [safetyTimer, setSafetyTimer] = useState(0);
  const [hasConfirmedSafety, setHasConfirmedSafety] = useState(false);
  const [pendingMessage, setPendingMessage] = useState<string | null>(null);

  // Calculate RealHeart Value
  useEffect(() => {
    const wordCount = messages.reduce((acc, msg) => acc + (msg.text?.length || 0), 0);
    const voiceCount = messages.filter(msg => msg.type === 'voice').length;
    const durationMinutes = Math.min(30, Math.floor(messages.length * 1.5));

    const wordScore = Math.min(40, (wordCount / 500) * 40);
    const voiceScore = Math.min(40, (voiceCount / 3) * 40);
    const durationScore = Math.min(20, (durationMinutes / 30) * 20);

    const multiplier = socialMode === 'friends' ? 2 : 1;
    const total = Math.floor((wordScore + voiceScore + durationScore) * multiplier);
    setRealHeartValue(Math.min(100, total));
  }, [messages, socialMode]);

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

  const maskSensitiveInfo = (text: string) => {
    if (!text) return '';
    const isUnlocked = socialMode === 'friends' 
      ? messages.length >= 20 
      : realHeartValue >= 100;

    if (isUnlocked) return text;
    const sensitiveRegex = /(微信|wx|微信号|加我|联系方式|手机号|电话|1[3-9]\d{9}|[a-zA-Z0-9_-]{6,20})/gi;
    return text.replace(sensitiveRegex, (match) => {
      if (match.length < 5 && !/\d/.test(match)) return match;
      const unlockText = socialMode === 'friends' ? '发送20条消息解锁' : '真心值达到100解锁';
      return `[需${unlockText}]`;
    });
  };

  const fetchMessages = async () => {
    if (!chatId) return;

    if (chatId.startsWith('mock-chat')) {
      const stored = localStorage.getItem(`messages_${chatId}`);
      if (stored) {
        setMessages(JSON.parse(stored));
      } else {
        const initialMessages: ChatMessage[] = [
          {
            id: 'icebreaker',
            senderId: 'system',
            type: 'text',
            text: `✨ 灵魂匹配已建立！\n你们的破冰问题：发现你们都觉得“花钱吃遍墨尔本Brunch”是很快乐的事，可以聊聊最推荐的餐厅吗？\n\n🕒 匹配倒计时已开启，你们有15天的时间来了解彼此。`,
            timestamp: new Date().toISOString(),
          }
        ];
        // Only add welcome message if it's not a friend mode icebreaker specifically, but let's just make it universal
        setMessages(initialMessages);
        localStorage.setItem(`messages_${chatId}`, JSON.stringify(initialMessages));
      }
      setLoading(false);
      return;
    }

    try {
      const messagesRef = collection(db, 'messages');
      const q = query(messagesRef, where('chat_id', '==', chatId), orderBy('timestamp', 'asc'));
      const querySnapshot = await getDocs(q);

      const msgs = querySnapshot.docs.map(doc => {
        const m = doc.data();
        return {
          id: doc.id,
          senderId: m.sender_id,
          text: m.text,
          type: m.type || 'text',
          duration: m.duration,
          timestamp: m.timestamp
        };
      }) as ChatMessage[];

      if (msgs.length === 0) {
         let initialText = socialMode === 'friends' 
            ? `✨ 真心交友已开启！\n你们的破冰问题：发现你们都有同样的兴趣爱好，最近有没有哪项活动特别想去试试？\n\n🕒 匹配倒计时已开启，你们有10天的时间来了解彼此。`
            : `✨ 灵魂匹配已建立！\n你们的破冰问题：发现你们都觉得“花钱吃遍墨尔本Brunch”是很快乐的事，可以聊聊最推荐的餐厅吗？\n\n🕒 匹配倒计时已开启，你们有15天的时间来了解彼此。`;
         
         if (chatId.startsWith('group-')) {
           initialText = `✨ 欢迎来到 ${otherUser.displayName}！\n在这里你可以遇到同城拥有相同爱好的修狗，随时随地开启组队。\n请保持友善，祝你聊得开心！`;
         }

         setMessages([{
            id: 'icebreaker',
            senderId: 'system',
            type: 'text',
            text: initialText,
            timestamp: new Date().toISOString(),
         }]);
      } else {
         setMessages(msgs);
      }
      setLoading(false);
      
      setTimeout(() => {
        if (scrollRef.current) {
          scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMessages();
    
    if (!chatId || chatId.startsWith('mock-')) return;
    const messagesRef = collection(db, 'messages');
    const q = query(messagesRef, where('chat_id', '==', chatId), orderBy('timestamp', 'asc'));
    
    const unsubscribe = onSnapshot(q, () => {
      fetchMessages();
    });
    
    return () => { unsubscribe(); };
  }, [chatId]);

  const startRecording = () => {
    setIsRecording(true);
    setRecordingTime(0);
    recordingTimerRef.current = setInterval(() => {
      setRecordingTime(prev => prev + 1);
    }, 1000);
  };

  const stopRecording = async () => {
    if (!isRecording) return;
    setIsRecording(false);
    if (recordingTimerRef.current) clearInterval(recordingTimerRef.current);
    
    if (recordingTime < 1) return; // Too short

    const duration = recordingTime;
    const voiceMsg: Partial<ChatMessage> = {
      senderId: user?.id,
      type: 'voice',
      duration,
      timestamp: new Date().toISOString()
    };

    if (chatId.startsWith('mock-chat')) {
      const finalMsg = { ...voiceMsg, id: Date.now().toString() } as ChatMessage;
      const updated = [...messages, finalMsg];
      setMessages(updated);
      localStorage.setItem(`messages_${chatId}`, JSON.stringify(updated));
      return;
    }

    try {
      const uid = user?.id || user?.uid;
      await setDoc(doc(collection(db, 'messages')), {
        chat_id: chatId,
        sender_id: uid,
        type: 'voice',
        duration,
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Error sending voice:', error);
    }
  };

  const handleSendMessage = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!user || !newMessage.trim()) return;

    const text = newMessage.trim();
    const sensitiveRegex = /(微信|wx|微信号|加我|联系方式|手机号|电话|1[3-9]\d{9}|[a-zA-Z0-9_-]{6,20})/gi;
    if (sensitiveRegex.test(text) && !hasConfirmedSafety) {
      setPendingMessage(text);
      setShowSafetyModal(true);
      setSafetyTimer(3);
      return;
    }

    setNewMessage('');
    setHasConfirmedSafety(false);

    if (chatId.startsWith('mock-chat')) {
      const newMsg = { id: Date.now().toString(), senderId: user.id, text, timestamp: new Date().toISOString() };
      const updatedMessages = [...messages, newMsg];
      setMessages(updatedMessages);
      localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
      return;
    }

    try {
      const uid = user.id || user.uid;
      const timestamp = new Date().toISOString();
      await setDoc(doc(collection(db, 'messages')), { chat_id: chatId, sender_id: uid, text, timestamp });
      await updateDoc(doc(db, 'chats', chatId), { last_message: text, last_timestamp: timestamp });
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const playbackTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const toggleVoicePlayback = (msgId: string) => {
    if (playbackTimeoutRef.current) {
      clearTimeout(playbackTimeoutRef.current);
      playbackTimeoutRef.current = null;
    }

    if (playingVoiceId === msgId) {
      setPlayingVoiceId(null);
    } else {
      setPlayingVoiceId(msgId);
      // Simulate real playback duration
      playbackTimeoutRef.current = setTimeout(() => {
        setPlayingVoiceId(null);
        playbackTimeoutRef.current = null;
      }, 3000);
    }
  };

  useEffect(() => {
    return () => {
      if (playbackTimeoutRef.current) clearTimeout(playbackTimeoutRef.current);
    };
  }, []);

  const submitReport = () => {
    if (!reportReason) return;
    console.log('[Safety] Reporting user:', otherUser.uid, 'Reason:', reportReason);
    setShowReportModal(false);
    setShowMenu(false);
    // In a real app, this would hit a secure endpoint
    const duration = 2000;
    confetti({ particleCount: 150, spread: 70, origin: { y: 0.6 }, colors: ['#EF4444', '#DC2626'] });
    alert('感谢反馈，我们将会在 24 小时内进行核查并保障社区安全。');
  };

  return (
    <div className="flex flex-col h-full bg-black/60 backdrop-blur-3xl md:rounded-[2.5rem] rounded-none overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)] relative border-x border-t border-white/5 md:border">
      {/* Header */}
      <div className="p-4 md:p-6 flex items-center justify-between relative z-50 bg-black/20 backdrop-blur-md">
        <div className="flex items-center gap-3 md:gap-4">
          <button onClick={onBack} className="p-2 md:p-2.5 rounded-full bg-white/5 hover:bg-white/10 transition-colors text-white/60 hover:text-white backdrop-blur-sm">
            <ArrowLeft size={18} />
          </button>
          <div className="flex items-center gap-3 md:gap-4">
            <div className="w-10 h-10 md:w-12 md:h-12 rounded-full flex items-center justify-center border-2 border-white/10 shrink-0 overflow-hidden shadow-lg bg-black/50">
              <img src={otherUser?.avatarUrl || getCuteLineArtUrl('修狗')} alt="Avatar" className="w-full h-full object-cover bg-white" />
            </div>
            <div className="min-w-0">
              <h3 className="text-sm md:text-base font-bold tracking-wide text-white truncate max-w-[150px] md:max-w-none">{otherUser.displayName}</h3>
              <div className="flex items-center gap-2 mt-0.5">
                <div className="flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-green-400 animate-pulse shadow-[0_0_8px_rgba(7ade80,0.6)]" />
                  <span className="text-[9px] uppercase tracking-widest text-white/50 font-bold">{chatId.startsWith('group-') ? '活跃中' : '在线'}</span>
                </div>
                {!chatId.startsWith('group-') && (
                  <>
                    <div className="w-1 h-1 bg-white/20 rounded-full" />
                    <span className="text-[9px] uppercase tracking-widest text-transparent bg-clip-text bg-gradient-to-r from-aurora-pink to-sunset-orange font-bold">契合度 99%</span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-1 md:gap-2">
          {!chatId.startsWith('group-') && (
            <div className="hidden md:flex flex-col items-end mr-2">
              <div className={`flex items-center px-3 py-1.5 rounded-full ${socialMode === 'friends' ? 'bg-neon-green/10 border-neon-green/20' : 'bg-aurora-pink/10 border-aurora-pink/20'} border gap-1.5 mb-1`}>
                <Clock size={12} className={socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'} />
                <span className={`text-[10px] md:text-xs font-bold ${socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'}`}>
                  {(() => {
                    const days = socialMode === 'friends' ? 10 : 15;
                    const targetDate = new Date();
                    targetDate.setDate(targetDate.getDate() + days);
                    const month = targetDate.getMonth() + 1;
                    const date = targetDate.getDate();
                    return `还有 ${days} 天可以交换联系方式 (${month}月${date}日)`;
                  })()}
                </span>
              </div>
              <span className="text-[10px] text-white/40 uppercase tracking-wider relative right-2">
                {socialMode === 'friends' ? '聊满10天，双方确认后才能解锁' : '聊满15天，双方确认后才能解锁'}
              </span>
            </div>
          )}
          <div className="relative">
            <button 
              onClick={() => setShowMenu(!showMenu)}
              className="p-2 rounded-xl hover:bg-white/5 transition-colors text-white/40 hover:text-white"
            >
              <MoreVertical size={18} />
            </button>
            <AnimatePresence>
              {showMenu && (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.95, y: 10 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95, y: 10 }}
                  className="absolute right-0 mt-2 w-48 bg-zinc-900/90 backdrop-blur-xl border border-white/10 rounded-2xl p-1 shadow-2xl z-[60]"
                >
                  {!chatId.startsWith('group-') && (
                    <button 
                      onClick={() => { setShowMenu(false); setShowUnlockModal(true); }}
                      className="w-full flex items-center gap-3 px-4 py-3 text-xs text-aurora-pink hover:bg-aurora-pink/10 rounded-xl transition-colors font-bold"
                    >
                      <Unlock size={14} /> 获取联系方式
                    </button>
                  )}
                  <button 
                    onClick={() => setShowReportModal(true)}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-red-400 hover:bg-red-500/10 rounded-xl transition-colors"
                  >
                    <Flag size={14} /> 举报用户
                  </button>
                  <button 
                    onClick={() => console.log('Clear chat')}
                    className="w-full flex items-center gap-3 px-4 py-3 text-xs text-white/40 hover:bg-white/5 rounded-xl transition-colors"
                  >
                    <Trash2 size={14} /> 清除聊天记录
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* Messages Area */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 md:p-6 space-y-4 md:space-y-6 scrollbar-hide flex flex-col">
        {messages.map((msg) => {
          const isMe = msg.senderId === user?.id;
          return (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 10, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              className={`flex items-end gap-2 ${isMe ? 'flex-row-reverse' : 'flex-row'} mb-1`}
            >
              <div className={`w-8 h-8 md:w-10 md:h-10 rounded-full flex-shrink-0 flex items-center justify-center border border-white/10 shadow-md overflow-hidden ${isMe ? 'opacity-90' : ''}`}>
                <img 
                   src={isMe ? (profile?.avatarUrl || user?.user_metadata?.avatar_url || getCuteLineArtUrl('猫咪')) : (otherUser?.avatarUrl || getCuteLineArtUrl('修狗'))} 
                   alt="avatar" 
                   className="w-full h-full object-cover bg-white" 
                />
              </div>

              <div className={`flex flex-col gap-1 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                <div 
                  onClick={() => msg.type === 'voice' && toggleVoicePlayback(msg.id)}
                  className={`px-4 md:px-5 py-2.5 md:py-3.5 rounded-2xl md:rounded-[20px] text-[13px] md:text-sm leading-relaxed relative group transition-all duration-300 cursor-pointer ${
                  isMe 
                    ? 'bg-gradient-to-tr from-aurora-pink to-sunset-orange text-white rounded-tr-sm shadow-md shadow-aurora-pink/20 font-medium' 
                    : 'bg-white/[0.05] border border-white/10 text-white/90 rounded-tl-sm backdrop-blur-xl shadow-sm font-light'
                }`}>
                  {msg.type === 'voice' ? (
                    <div className="flex items-center gap-3 min-w-[80px]">
                      {playingVoiceId === msg.id ? <Volume2 size={16} className="animate-bounce" /> : <Mic size={16} className="opacity-60" />}
                      <div className="flex gap-0.5 items-center h-4">
                        {[1, 2, 3, 4, 5, 6, 7].map(i => (
                          <motion.div 
                            key={i} 
                            animate={playingVoiceId === msg.id ? { height: [4, 12, 4] } : { height: 6 }}
                            transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.1 }}
                            className="w-0.5 bg-white/40 rounded-full" 
                          />
                        ))}
                      </div>
                      <span className="text-[10px] font-mono opacity-60 ml-2">{msg.duration}"</span>
                    </div>
                  ) : msg.type === 'image' ? (
                    <div className="rounded-xl overflow-hidden -m-2">
                       <img preload="true" src={msg.imageUrl || msg.text} alt="chat image" className="max-w-[200px] md:max-w-[260px] max-h-[300px] object-cover hover:scale-[1.02] transition-transform" />
                    </div>
                  ) : (
                    <div className="whitespace-pre-wrap leading-tight font-light">{maskSensitiveInfo(msg.text || '')}</div>
                  )}
                </div>
                <div className={`text-[9px] opacity-30 font-mono tracking-widest px-1 ${isMe ? 'text-right' : 'text-left'}`}>
                  {formatMessageTime(msg.timestamp)}
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>

      {/* Input / Recording Bar */}
      <div className="p-3 md:p-6 pb-4 md:pb-6 relative z-10 bg-black/40 backdrop-blur-3xl md:bg-transparent border-t md:border-t-0 border-white/5 flex flex-col gap-2">
        
        <div className="flex items-center justify-center gap-1 opacity-60">
          <ShieldCheck size={10} className={socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'} />
          <span className="text-[9px] text-white/80 uppercase tracking-widest">
            {socialMode === 'friends' ? '🤝 认真交朋友的地方 · AI全程守护' : '这里是安全聊天区域 · AI全程守护 · 暂无异常风险'}
          </span>
        </div>

        <div className="flex overflow-x-auto py-2 gap-2 px-1">
          {["周末一般怎么安排？", "最喜欢的一部电影是什么？", "有什么最近想去玩的地方吗？", "分享一件今天开心的事情吧"].map((topic, i) => (
            <button
              key={i}
              onClick={() => setNewMessage(topic)}
              className="text-[10px] md:text-xs text-white/60 bg-white/5 border border-white/10 hover:bg-white/10 hover:text-white px-3 py-1.5 rounded-full whitespace-nowrap transition-colors"
            >
              {topic}
            </button>
          ))}
        </div>

        <div className="relative">
          <AnimatePresence>
          {isRecording ? (
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              className="absolute inset-x-3 md:inset-x-6 bottom-4 md:bottom-6 h-14 bg-red-500/10 backdrop-blur-xl border border-red-500/20 rounded-2xl flex items-center justify-between px-4 md:px-6 z-20"
            >
              <div className="flex items-center gap-3 md:gap-4">
                <div className="relative">
                  <div className="w-3 h-3 bg-red-500 rounded-full animate-ping absolute inset-0" />
                  <div className="w-3 h-3 bg-red-500 rounded-full relative z-10" />
                </div>
                <span className="text-[10px] md:text-xs font-mono text-white/80 tabular-nums">REC 0:{recordingTime.toString().padStart(2, '0')}</span>
              </div>
              <div className="flex gap-0.5">
                {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
                  <motion.div
                    key={i}
                    animate={{ height: [6, Math.random() * 16 + 6, 6] }}
                    transition={{ duration: 0.5, repeat: Infinity, delay: i * 0.05 }}
                    className="w-1 bg-red-500/60 rounded-full"
                  />
                ))}
              </div>
              <button 
                onMouseUp={stopRecording}
                onTouchEnd={stopRecording}
                className="text-[9px] md:text-[10px] uppercase tracking-widest text-white/60 font-bold"
              >
                松开结束
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <form onSubmit={handleSendMessage} className="flex gap-2.5 min-h-[50px] items-end mx-auto w-full">
          <button 
            type="button"
            onMouseDown={startRecording}
            onTouchStart={(e) => { e.preventDefault(); startRecording(); }}
            className={`w-[48px] h-[48px] md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 shrink-0 ${isRecording ? 'bg-aurora-pink border-aurora-pink/50 text-white shadow-[0_0_20px_rgba(255,107,107,0.4)] scale-110 animate-pulse' : 'text-white/40 hover:text-white hover:bg-white/10'}`}
          >
            {isRecording ? <MicOff size={20} /> : <Mic size={20} />}
          </button>
          
          <div className="relative shrink-0">
            <input 
              type="file" 
              accept="image/*" 
              className="hidden" 
              id="image-upload"
              onChange={async (e) => {
                const file = e.target.files?.[0];
                if (!file || !user) return;
                
                // Read as base64 for fallback/preview
                const reader = new FileReader();
                reader.onloadend = async () => {
                  const base64Data = reader.result as string;
                  let finalUrl = base64Data;
                  
                  // Fallback: we removed supabase.storage
                  try {
                    console.warn('Supabase storage removed. Falling back to base64 encoding.');
                  } catch (err) {
                    console.warn('Supabase storage upload failed:', err);
                  }
                  
                  // Send message
                  if (chatId.startsWith('mock-chat')) {
                    const uid = user.id || user.uid;
                    const newMsg: ChatMessage = { id: Date.now().toString(), senderId: uid, imageUrl: finalUrl, timestamp: new Date().toISOString(), type: 'image' };
                    const updatedMessages = [...messages, newMsg];
                    setMessages(updatedMessages);
                    localStorage.setItem(`messages_${chatId}`, JSON.stringify(updatedMessages));
                  } else {
                    try {
                      const uid = user.id || user.uid;
                      const timestamp = new Date().toISOString();
                      await setDoc(doc(collection(db, 'messages')), { chat_id: chatId, sender_id: uid, text: finalUrl, type: 'image', timestamp });
                      await updateDoc(doc(db, 'chats', chatId), { last_message: '[图片]', last_timestamp: timestamp });
                    } catch (error) {
                      console.error('Error sending image:', error);
                    }
                  }
                };
                reader.readAsDataURL(file);
                // Clear input
                e.target.value = '';
              }}
            />
            <label 
              htmlFor="image-upload" 
              className="w-[48px] h-[48px] md:w-[52px] md:h-[52px] rounded-full flex items-center justify-center transition-all bg-white/5 border border-white/10 shrink-0 text-white/40 hover:text-white hover:bg-white/10 cursor-pointer"
            >
              <ImagePlus size={20} />
            </label>
          </div>

          <div className="flex-1 relative flex items-center bg-white/5 border border-white/10 rounded-[2rem] overflow-hidden focus-within:border-white/30 focus-within:bg-white-[0.07] transition-all shadow-inner">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              onFocus={() => {
                setTimeout(() => {
                  if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
                }, 300);
              }}
              placeholder={isRecording ? "正在录音..." : "发个真心话..."}
              className="w-full bg-transparent px-5 py-4 outline-none text-[13px] md:text-sm text-white placeholder-white/30"
              style={{ minHeight: '52px' }}
            />
            <button 
              type="submit"
              disabled={!newMessage.trim()}
              className={`absolute right-1.5 w-10 h-10 rounded-full flex items-center justify-center transition-all disabled:opacity-0 disabled:scale-75 ${newMessage.trim() ? 'bg-gradient-to-r from-aurora-pink to-sunset-orange text-white shadow-lg scale-100' : 'bg-white/10 text-white/50 scale-90'}`}
            >
              <Send size={16} className={newMessage.trim() ? "ml-0.5" : ""} />
            </button>
          </div>
        </form>
        </div>
      </div>

      {/* Safety Modal & Report Modal */}
      <AnimatePresence>
        {showReportModal && (
          <motion.div 
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div 
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 border border-white/10 rounded-[2.5rem] p-8 space-y-6 shadow-2xl"
            >
              <div className="flex justify-between items-center">
                <h2 className="text-xl font-bold text-white tracking-widest uppercase">举报反馈</h2>
                <button onClick={() => setShowReportModal(false)} className="p-2 text-white/20 hover:text-white"><X size={20} /></button>
              </div>
              <div className="space-y-3">
                {['诈骗/欺诈行为', '辱骂/语言攻击', '色情低俗内容', '虚假身份/照片'].map(reason => (
                  <button 
                    key={reason}
                    onClick={() => setReportReason(reason)}
                    className={`w-full text-left p-4 rounded-xl border transition-all text-sm ${reportReason === reason ? 'bg-red-500/10 border-red-500/40 text-red-400' : 'bg-white/5 border-white/10 text-white/40 hover:bg-white/10'}`}
                  >
                    {reason}
                  </button>
                ))}
              </div>
              <button 
                onClick={submitReport}
                disabled={!reportReason}
                className="w-full py-4 bg-gradient-to-r from-red-600 to-red-400 text-white font-bold rounded-2xl shadow-xl shadow-red-500/20 disabled:opacity-30 uppercase tracking-widest text-xs"
              >
                确认提交举报
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Safety Modal (kept from before, integrated naturally) */}
      <AnimatePresence>
        {showSafetyModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/60 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-8 space-y-6 shadow-2xl border border-white/10"
            >
              <div className="w-16 h-16 rounded-2xl bg-aurora-pink/20 flex items-center justify-center mx-auto"><ShieldAlert size={32} className="text-aurora-pink" /></div>
              <div className="text-center space-y-2">
                <h2 className="text-xl font-bold text-white uppercase tracking-widest">面基安全须知</h2>
                <p className="text-[10px] text-white/40 uppercase tracking-[0.2em]">Safety Guidelines</p>
              </div>
              <div className="space-y-4 text-xs text-white/60 leading-relaxed">
                <p>· 建议选择墨尔本 CBD 等公共场所见面。</p>
                <p>· 务必将您的位置分享给好友。</p>
                <p>· 真心值未达标前交换联系方式存在风险。</p>
              </div>
              <button
                disabled={safetyTimer > 0}
                onClick={() => { setHasConfirmedSafety(true); setShowSafetyModal(false); }}
                className={`w-full py-4 rounded-2xl font-bold uppercase tracking-widest text-[10px] transition-all ${safetyTimer > 0 ? 'bg-white/5 text-white/20' : 'bg-aurora-pink text-white shadow-lg'}`}
              >
                {safetyTimer > 0 ? `阅读确认 (${safetyTimer}s)` : '我已确认安全并发送'}
              </button>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
      {/* Unlock Contact Modal */}
      <AnimatePresence>
        {showUnlockModal && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-6 bg-black/80 backdrop-blur-xl"
          >
            <motion.div
              initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
              className="w-full max-w-md bg-zinc-900 rounded-[2.5rem] p-10 space-y-8 shadow-2xl border border-white/10 text-center relative overflow-hidden"
            >
              <div className={`absolute inset-0 bg-gradient-to-b ${socialMode === 'friends' ? 'from-neon-green/5' : 'from-aurora-pink/5'} to-transparent pointer-events-none`} />
              
              <div className={`w-20 h-20 rounded-3xl bg-gradient-to-tr ${socialMode === 'friends' ? 'from-neon-green/20 to-emerald-500/20 shadow-[0_0_50px_rgba(57,255,20,0.2)] border-[#39ff14]/30' : 'from-aurora-pink/20 to-sunset-orange/20 shadow-[0_0_50px_rgba(255,107,107,0.2)] border-[#ff6b6b]/30'} flex items-center justify-center mx-auto border`}>
                <Unlock size={32} className={socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'} />
              </div>
              
              <div className="space-y-3 relative z-10">
                <h2 className="text-sm font-bold text-white/50 tracking-widester uppercase">
                  {socialMode === 'friends' ? '你们已经聊了10天了！' : '已满足灵魂契合条件'}
                </h2>
                <h3 className="text-2xl font-serif italic text-white tracking-wide">
                  {socialMode === 'friends' ? '感觉合拍的话，可以交换联系方式了' : `${otherUser.displayName} 的联系方式`}
                </h3>
              </div>

              {socialMode === 'friends' && !hasUnlockedContact ? (
                <div className="space-y-4 text-left bg-white/5 p-6 rounded-2xl border border-white/10">
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs text-white/60">聊天天数</span>
                    <span className="text-sm font-mono text-neon-green">10天</span>
                  </div>
                  <div className="flex justify-between items-center pb-3 border-b border-white/5">
                    <span className="text-xs text-white/60">发送消息</span>
                    <span className="text-sm font-mono text-neon-green">{messages.length > 50 ? messages.length : 342}条</span>
                  </div>
                  <div className="pt-2 space-y-2">
                    <span className="text-[10px] text-white/40 uppercase tracking-widest font-bold flex items-center gap-1">
                      <Sparkles size={10} className="text-neon-green" /> AI总结
                    </span>
                    <p className="text-xs leading-relaxed text-white/80 italic">你们都喜欢探店和旅游，有很多共同话题。</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="p-6 bg-white/5 rounded-2xl border border-white/10 space-y-1">
                    <p className="text-[10px] uppercase font-bold text-white/30 tracking-widest">WeChat ID</p>
                    <p className="text-xl font-mono text-white tracking-wider">
                      {hasUnlockedContact || realHeartValue >= 100 || chatId.startsWith('mock') ? 'wx_id_83921' : '*******'}
                    </p>
                  </div>
                  
                  <p className="text-xs text-secondary leading-relaxed px-4">
                    {socialMode === 'friends' ? '🤝 真心朋友达成！\n希望你们成为真正的朋友' : '你们的契合已经得到见证，现在可以去更广阔的世界了解彼此了。'}
                  </p>
                </div>
              )}

              <div className="space-y-3 relative z-10">
                {socialMode === 'friends' && !hasUnlockedContact ? (
                  <button
                    onClick={() => {
                      setHasUnlockedContact(true);
                    }}
                    className="w-full py-4 rounded-full font-bold tracking-widest text-[#050505] text-sm transition-all bg-neon-green shadow-lg hover:scale-[1.02]"
                  >
                    交换联系方式
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      navigator.clipboard.writeText('wx_id_83921');
                      alert('已复制微信号');
                    }}
                    disabled={!hasUnlockedContact && realHeartValue < 100 && !chatId.startsWith('mock')}
                    className={`w-full py-4 rounded-full font-bold uppercase tracking-widest text-[#050505] text-sm transition-all ${socialMode === 'friends' ? 'bg-neon-green' : 'bg-gradient-to-r from-aurora-pink to-sunset-orange'} shadow-lg hover:scale-[1.02] disabled:opacity-30 disabled:pointer-events-none`}
                  >
                    复制微信号
                  </button>
                )}
                <button
                  onClick={() => setShowUnlockModal(false)}
                  className="w-full py-4 text-[10px] text-white/40 uppercase tracking-widest hover:text-white transition-colors"
                >
                  {socialMode === 'friends' && !hasUnlockedContact ? '再聊几天' : '继续聊天'}
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}

