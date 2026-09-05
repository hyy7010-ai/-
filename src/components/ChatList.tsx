import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { MessageSquare, Search, ChevronRight, User, Sun } from 'lucide-react';
import { db } from '../firebase';
import { collection, query, where, getDocs, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from '../App';
import { ChatSession, UserProfile, mockUsers } from '../types';

interface ChatListProps {
  onSelectChat: (chatId: string, otherUser: UserProfile) => void;
  socialMode?: 'dating' | 'friends';
}

export default function ChatList({ onSelectChat, socialMode = 'dating' }: ChatListProps) {
  const { user } = useAuth();
  const [chats, setChats] = useState<(ChatSession & { otherUser: UserProfile; unreadCount?: number })[]>([]);
  const [loading, setLoading] = useState(true);

  const formatMessageTime = (ts: string | undefined) => {
    if (!ts) return '';
    const date = new Date(ts);
    const now = new Date();
    
    const isToday = date.getDate() === now.getDate() && date.getMonth() === now.getMonth() && date.getFullYear() === now.getFullYear();
    
    const yesterday = new Date(now);
    yesterday.setDate(now.getDate() - 1);
    const isYesterday = date.getDate() === yesterday.getDate() && date.getMonth() === yesterday.getMonth() && date.getFullYear() === yesterday.getFullYear();

    const timeStr = date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

    if (isToday) {
      return timeStr;
    } else if (isYesterday) {
      return `昨天`;
    } else {
      return `${date.getMonth() + 1}月${date.getDate()}日`;
    }
  };

  const fetchChats = async () => {
    if (!user) return;

    try {
      const chatsRef = collection(db, 'chats');
      const q = query(chatsRef, where('participants', 'array-contains', user.id || user.uid));
      const querySnapshot = await getDocs(q);
      const chatData = querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as any));

      const chatsWithUsers = await Promise.all(
        (chatData || []).map(async (chat: any) => {
          const otherUserId = chat.participants.find((id: string) => id !== (user.id || user.uid));
          
          let otherUser: UserProfile = {
            uid: otherUserId || '',
            displayName: '神秘用户',
            gender: 'other',
            orientation: 'other',
            mbti: '未知',
            personality: '',
            partnerPreferences: '',
            answers: {},
            createdAt: ''
          };

          if (otherUserId) {
            const userDocSnap = await getDoc(doc(db, 'profiles', otherUserId));
            
            if (userDocSnap.exists()) {
              otherUser = userDocSnap.data() as UserProfile;
            }
          }

          return {
            ...chat,
            id: chat.id,
            otherUser
          };
        })
      );

      // Filter out expired chats (24h without interaction) and by social mode
      const now = new Date();
      const filteredChats = chatsWithUsers.filter(chat => {
        const lastTime = new Date(chat.last_timestamp);
        const diffInHours = (now.getTime() - lastTime.getTime()) / (1000 * 60 * 60);
        
        // If no messages and more than 24h since creation/last_timestamp
        if (!chat.last_message && diffInHours > 24) {
          return false;
        }

        // Filter by social mode (if otherUser has mode)
        if (chat.otherUser?.mode && chat.otherUser.mode !== socialMode) {
          return false;
        }

        return true;
      });

      // Sort by last_timestamp
      const sortedChats = filteredChats.sort((a, b) => {
        return new Date(b.last_timestamp).getTime() - new Date(a.last_timestamp).getTime();
      });

      setChats(sortedChats);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching chats:', error);
      
      // Fallback for mock chats
      const mockChats: (ChatSession & { otherUser: UserProfile })[] = [];
      const uid = user.id || user.uid;
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`messages_mock-chat-${uid}-`)) {
          const chatId = key.replace('messages_', '');
          const targetUid = chatId.replace(`mock-chat-${uid}-`, '');
          const msgs = JSON.parse(localStorage.getItem(key) || '[]');
          const lastMsg = msgs[msgs.length - 1];
          // Find mock user
          const mockUser = mockUsers.find(u => u.uid === targetUid);
          if (mockUser && mockUser.mode === socialMode) {
            // stable pseudo-random unread count
            const hash = targetUid.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
            const unreadCount = hash % 4; // 0 to 3
            mockChats.push({
              id: chatId,
              participants: [uid, targetUid || ''],
              last_message: lastMsg?.text || '',
              last_timestamp: lastMsg?.timestamp || new Date().toISOString(),
              otherUser: mockUser,
              unreadCount: unreadCount > 0 && msgs.length > 1 ? unreadCount : 0
            });
          }
        }
      }
      setChats(mockChats);
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChats();

    if (!user) return;
    const chatsRef = collection(db, 'chats');
    const q = query(chatsRef, where('participants', 'array-contains', user.id || user.uid));
    
    const unsubscribe = onSnapshot(q, () => {
      fetchChats();
    });

    return () => {
      unsubscribe();
    };
  }, [user, socialMode]);

  return (
    <div className="flex flex-col h-full space-y-4 md:space-y-6">
      <div className="flex items-center justify-between px-4 md:px-2">
        <h2 className="text-xl md:text-2xl font-serif italic text-white/90">
          {socialMode === 'friends' ? '同频搭子' : '真心私信'}
        </h2>
        <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center border border-white/5">
          <MessageSquare size={20} className={socialMode === 'friends' ? 'text-neon-green' : 'text-aurora-pink'} />
        </div>
      </div>

      <div className="relative group px-4 md:px-0">
        <Search className={`absolute left-4 top-1/2 -translate-y-1/2 text-white/20 transition-colors ${socialMode === 'friends' ? 'group-focus-within:text-neon-green' : 'group-focus-within:text-aurora-pink'}`} size={18} />
        <input
          type="text"
          placeholder="搜索联系人..."
          className="w-full bg-white/5 rounded-2xl pl-12 pr-6 py-3.5 outline-none transition-all"
        />
      </div>

      <div className="flex-1 overflow-y-auto scrollbar-hide space-y-3 pb-6">
        {loading ? (
          <div className="flex justify-center py-10">
            <div className="w-8 h-8 rounded-full animate-spin" />
          </div>
        ) : chats.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full py-20 px-6 text-center space-y-8 animate-in fade-in duration-700">
            <div className="relative">
              <div className={`absolute inset-0 ${socialMode === 'friends' ? 'bg-neon-green' : 'bg-aurora-pink'} blur-3xl opacity-10 rounded-full`} />
              <div className="w-32 h-32 rounded-full glass border border-white/10 flex items-center justify-center relative shadow-2xl relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-tr from-white/5 to-transparent z-0" />
                <img src="https://images.unsplash.com/photo-1511632765486-a01980e01a18?q=80&w=300&auto=format&fit=crop" alt="Empty state" className="absolute inset-0 w-full h-full object-cover opacity-30 mix-blend-overlay" />
                <MessageSquare size={48} className="text-white/40 relative z-10" strokeWidth={1} />
              </div>
            </div>
            
            <div className="space-y-3 relative z-10">
              <h3 className="text-xl font-medium text-white/90 tracking-wide">
                暂无对话，快去广场遇到懂你的人吧！
              </h3>
              <p className="text-xs text-white/40 max-w-[240px] mx-auto leading-relaxed">
                在这里，每一次相遇都值得期待。开启你的匹配之旅，或者在同频广场寻找志同道合的搭子。
              </p>
            </div>
            
            <button 
              onClick={() => {
                const switchSquareBtn = document.querySelector('button[aria-label="switch-to-square"]') as HTMLButtonElement | null;
                if (switchSquareBtn) {
                  switchSquareBtn.click();
                } else {
                  // Fallback
                  document.getElementById('square-nav-btn')?.click();
                }
              }}
              className={`relative overflow-hidden px-8 py-4 bg-gradient-to-r ${socialMode === 'friends' ? 'from-neon-green to-cyan-400 text-black shadow-neon-green/20' : 'from-aurora-pink to-sunset-orange text-white shadow-aurora-pink/20'} text-sm font-bold tracking-widest rounded-full shadow-2xl hover:-translate-y-1 transition-all group`}
            >
              <div className="absolute inset-0 bg-white/20 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-700" />
              前往匹配
            </button>
          </div>
        ) : (
          chats.map((chat) => (
            <motion.div
              key={chat.id}
              whileHover={{ x: 4, backgroundColor: 'rgba(255, 255, 255, 0.05)' }}
              onClick={() => onSelectChat(chat.id, chat.otherUser)}
              className="p-4 rounded-2xl cursor-pointer transition-all flex items-center gap-4 group"
            >
              <div className="relative">
                <div className={`w-12 h-12 rounded-xl bg-gradient-to-tr ${socialMode === 'friends' ? 'from-neon-green/20 to-cyan-400/20' : 'from-aurora-pink/20 to-sunset-orange/20'} flex items-center justify-center overflow-hidden`}>
                  {chat.otherUser.avatarUrl ? (
                    <img src={chat.otherUser.avatarUrl} alt="" className="w-full h-full object-cover" />
                  ) : (
                    <User size={24} className="text-white/40 group-hover:text-white transition-colors" />
                  )}
                </div>
                <div className={`absolute -bottom-1 -right-1 w-4 h-4 rounded-full ${socialMode === 'friends' ? 'bg-neon-green/20 border-neon-green/50' : 'bg-aurora-pink/20 border-aurora-pink/50'} flex items-center justify-center backdrop-blur-sm border`}>
                  <div className={`w-1.5 h-1.5 rounded-full ${socialMode === 'friends' ? 'bg-neon-green' : 'bg-aurora-pink'} animate-pulse`} />
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex justify-between items-baseline mb-1">
                  <div className="flex items-center gap-2">
                    <h4 className="font-medium truncate">{chat.otherUser.displayName}</h4>
                    <span className={`px-1.5 py-0.5 rounded-md ${socialMode === 'friends' ? 'bg-neon-green/20 text-neon-green' : 'bg-aurora-pink/20 text-aurora-pink'} text-[8px] font-bold tracking-widest uppercase`}>
                      {socialMode === 'friends' ? '同频推荐' : '99% 契合'}
                    </span>
                  </div>
                  <span className="text-[10px] text-white/30 font-mono">
                    {formatMessageTime(chat.last_timestamp)}
                  </span>
                </div>
                
                <p className="text-xs text-white/50 truncate mb-2">
                  {chat.last_message || '点击开始对话...'}
                </p>

                <div className="flex items-center mt-1">
                  <span className="px-2.5 py-1 bg-white/10 rounded-full text-[10px] md:text-xs text-white/60 font-bold tracking-wider">
                    {(() => {
                      const days = socialMode === 'friends' ? 10 : 15;
                      const targetDate = new Date();
                      targetDate.setDate(targetDate.getDate() + days);
                      const month = targetDate.getMonth() + 1;
                      const date = targetDate.getDate();
                      return `还有 ${days} 天解锁联系方式 (${month}月${date}日)`;
                    })()}
                  </span>
                </div>
              </div>
              
              <div className="flex flex-col items-end gap-2 shrink-0">
                {chat.unreadCount && chat.unreadCount > 0 ? (
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-lg ${socialMode === 'friends' ? 'bg-neon-green text-black' : 'bg-aurora-pink'}`}>
                    {chat.unreadCount}
                  </div>
                ) : null}
                <ChevronRight size={16} className="text-white/10 group-hover:text-white/40 transition-colors" />
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
}
