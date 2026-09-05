import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, MapPin, Navigation2, BookOpen, Clock, Heart, Edit2, LogOut, Info } from 'lucide-react';
import { db } from '../firebase';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { UserProfile } from '../types';
import { useAuth } from '../App';
import { CUTE_SVG_PATHS, getCuteLineArtUrl } from '../utils/avatars';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: () => void;
  onRetest?: () => void;
}

export default function ProfileModal({ isOpen, onClose, onComplete, onRetest }: ProfileModalProps) {
  const { profile, user, setProfile, signOut } = useAuth();
  
  const [formData, setFormData] = useState({
    avatarUrl: '',
    displayName: '',
    bio: '',
    favoritePlace: '',
    lifeMotto: '',
    mbti: '',
    zodiac: '',
    school: '',
    region: '',
    plan: ''
  });

  const [saving, setSaving] = useState(false);
  const [isChoosingAvatar, setIsChoosingAvatar] = useState(false);

  useEffect(() => {
    if (isOpen && profile) {
      setFormData({
        avatarUrl: profile.avatarUrl || user?.user_metadata?.avatar_url || user?.photoURL || '',
        displayName: profile.displayName || '',
        bio: profile.bio || '',
        favoritePlace: profile.answers?.['favoritePlace'] || '',
        lifeMotto: profile.answers?.['lifeMotto'] || '',
        mbti: profile.mbti || '',
        zodiac: profile.answers?.['zodiac'] || '',
        school: profile.answers?.['school'] || '',
        region: profile.answers?.['region'] || '',
        plan: profile.answers?.['plan'] || '',
      });
    } else if (isOpen && user) {
       setFormData(prev => ({
         ...prev,
         avatarUrl: user?.user_metadata?.avatar_url || user?.photoURL || ''
       }));
    }
  }, [isOpen, profile, user]);

  const handleSave = async () => {
    if (!user) return;
    setSaving(true);
    
    const updatedProfile = {
      ...profile,
      uid: user.uid || user.id,
      displayName: formData.displayName,
      avatarUrl: formData.avatarUrl,
      bio: formData.bio,
      mbti: formData.mbti,
      answers: {
        ...(profile?.answers || {}),
        favoritePlace: formData.favoritePlace,
        lifeMotto: formData.lifeMotto,
        zodiac: formData.zodiac,
        school: formData.school,
        region: formData.region,
        plan: formData.plan
      }
    };

    try {
      if (user.id === 'demo-user-123') {
        setProfile(updatedProfile as UserProfile);
        onComplete();
        onClose();
        setSaving(false);
        return;
      }

      await setDoc(doc(db, 'profiles', user.uid), updatedProfile, { merge: true });
      
      onComplete();
      onClose();
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[200] flex items-center justify-center overflow-auto bg-[#050505] md:bg-black/80 md:backdrop-blur-xl">
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, y: 20, scale: 0.95 }}
          className="w-full max-w-4xl min-h-[100dvh] md:min-h-0 md:max-h-[90vh] bg-[#050505] md:rounded-[3rem] p-6 md:p-10 flex flex-col relative md:border md:border-white/10"
        >
          <div className="flex items-center justify-between mb-8 shrink-0">
            <h2 className="text-xl md:text-2xl font-serif italic text-white flex items-center gap-2">个人主页</h2>
            <button onClick={onClose} className="p-2 text-white/30 hover:text-white bg-white/5 rounded-full transition-colors">
              <X size={20} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto scrollbar-hide pb-32 md:pb-8">
            {isChoosingAvatar ? (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-medium text-white/80 px-2 tracking-wide">选择头像</h3>
                  <button onClick={() => setIsChoosingAvatar(false)} className="text-xs text-aurora-pink hover:text-white transition-colors">
                    返回
                  </button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-4">
                  {Object.keys(CUTE_SVG_PATHS).map(seed => {
                    const url = getCuteLineArtUrl(seed);
                    return (
                      <button
                        key={seed}
                        onClick={() => {
                          setFormData(prev => ({ ...prev, avatarUrl: url }));
                          setIsChoosingAvatar(false);
                        }}
                        className={`aspect-square rounded-[1.5rem] bg-white/5 border-2 flex items-center justify-center p-3 transition-all hover:scale-105 ${formData.avatarUrl === url ? 'border-aurora-pink shadow-[0_0_15px_rgba(255,107,107,0.3)]' : 'border-transparent hover:border-white/20'}`}
                      >
                        <img src={url} alt={seed} className="w-full h-full object-contain" />
                      </button>
                    );
                  })}
                </div>
              </div>
            ) : (
              <div className="flex flex-col md:flex-row gap-10 md:gap-16">
                {/* Left Column */}
                <div className="flex-1 flex flex-col space-y-8">
                  {/* Avatar Section */}
                  <div className="flex flex-col items-center justify-center pt-2">
                    <div className="relative group cursor-pointer" onClick={() => setIsChoosingAvatar(true)}>
                      <div className="w-28 h-28 md:w-32 md:h-32 rounded-[2rem] bg-zinc-900 border-2 border-white/10 overflow-hidden flex items-center justify-center transition-all group-hover:border-white/30 group-hover:shadow-[0_0_25px_rgba(255,255,255,0.1)]">
                        {formData.avatarUrl ? (
                          <img src={formData.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                        ) : (
                          <Heart size={40} className="text-white/20" />
                        )}
                      </div>
                      <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-xl bg-aurora-pink text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform">
                        <Camera size={18} />
                      </div>
                    </div>
                  </div>

                  {/* Basic Info */}
                  <div className="space-y-5">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-2">昵称</label>
                      <input 
                        type="text" 
                        value={formData.displayName}
                        onChange={(e) => setFormData({...formData, displayName: e.target.value})}
                        placeholder="给自己起个名字"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-aurora-pink/50 transition-colors font-medium"
                      />
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between items-center pr-2">
                        <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-2">一句话介绍 (限20字)</label>
                        <span className="text-[10px] text-white/30 tabular-nums font-mono">{formData.bio.length}/20</span>
                      </div>
                      <input 
                        type="text" 
                        maxLength={20}
                        value={formData.bio}
                        onChange={(e) => setFormData({...formData, bio: e.target.value})}
                        placeholder="简单介绍一下你自己"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-aurora-pink/50 transition-colors"
                      />
                    </div>
                  </div>
                </div>

                {/* Right Column */}
                <div className="flex-1 flex flex-col space-y-8">
                  <div className="space-y-5 pt-0">
                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-2">我在墨尔本最喜欢的地方</label>
                      <div className="relative">
                        <MapPin size={16} className="absolute left-5 top-1/2 -translate-y-1/2 text-white/20" />
                        <input 
                          type="text" 
                          value={formData.favoritePlace}
                          onChange={(e) => setFormData({...formData, favoritePlace: e.target.value})}
                          placeholder="比如：St Kilda Beach"
                          className="w-full bg-white/5 border border-white/5 rounded-2xl pl-12 pr-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-aurora-pink/50 transition-colors"
                        />
                      </div>
                    </div>

                    <div className="space-y-1">
                      <label className="text-[10px] uppercase font-bold text-white/40 tracking-widest pl-2">我的生活信条是？</label>
                      <input 
                        type="text" 
                        value={formData.lifeMotto}
                        onChange={(e) => setFormData({...formData, lifeMotto: e.target.value})}
                        placeholder="比如：享受当下，认真生活"
                        className="w-full bg-white/5 border border-white/5 rounded-2xl px-5 py-4 text-sm text-white placeholder-white/20 outline-none focus:border-aurora-pink/50 transition-colors italic"
                      />
                    </div>
                  </div>

                  <div className="h-[1px] w-full bg-gradient-to-r from-transparent via-white/10 to-transparent my-1 md:hidden" />

                  {/* Display Tags Section */}
                  <div className="space-y-4">
                    <h3 className="text-sm font-medium text-white/80 px-2 tracking-wide">展示内容</h3>
                    <div className="grid grid-cols-2 gap-3 md:gap-4">
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 cursor-text group focus-within:border-white/20 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 group-focus-within:text-white/50 transition-colors">你的 MBTI</span>
                        <input type="text" value={formData.mbti} onChange={(e) => setFormData({...formData, mbti: e.target.value})} placeholder="例如 ENFJ" className="bg-transparent outline-none text-sm text-white placeholder-white/20 font-bold" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 cursor-text group focus-within:border-white/20 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 group-focus-within:text-white/50 transition-colors">你的 星座</span>
                        <input type="text" value={formData.zodiac} onChange={(e) => setFormData({...formData, zodiac: e.target.value})} placeholder="例如 狮子座" className="bg-transparent outline-none text-sm text-white placeholder-white/20 font-bold" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 cursor-text group focus-within:border-white/20 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 group-focus-within:text-white/50 transition-colors">你的 学校</span>
                        <input type="text" value={formData.school} onChange={(e) => setFormData({...formData, school: e.target.value})} placeholder="例如 墨大" className="bg-transparent outline-none text-sm text-white placeholder-white/20 font-bold" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 cursor-text group focus-within:border-white/20 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 group-focus-within:text-white/50 transition-colors">你的 区域</span>
                        <input type="text" value={formData.region} onChange={(e) => setFormData({...formData, region: e.target.value})} placeholder="例如 City" className="bg-transparent outline-none text-sm text-white placeholder-white/20 font-bold" />
                      </div>
                      <div className="bg-white/5 border border-white/5 rounded-2xl p-4 flex flex-col gap-1 col-span-2 cursor-text group focus-within:border-white/20 transition-colors">
                        <span className="text-[9px] uppercase tracking-widest text-white/30 group-focus-within:text-white/50 transition-colors">你的 身份规划</span>
                        <input type="text" value={formData.plan} onChange={(e) => setFormData({...formData, plan: e.target.value})} placeholder="例如 获取PR中 / 学生" className="bg-transparent outline-none text-sm text-white placeholder-white/20 font-bold" />
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex gap-4 pt-2 border-t border-white/5 mt-auto flex-col md:flex-row">
                    {onRetest && (
                      <button 
                        onClick={() => {
                          onClose();
                          onRetest();
                        }}
                        className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-white bg-white/5 hover:bg-white/10 text-xs font-bold tracking-widest uppercase transition-colors"
                      >
                        <Navigation2 size={16} /> 重新匹配测试
                      </button>
                    )}
                    <button 
                      onClick={() => {
                        onClose();
                        signOut();
                      }}
                      className="w-full flex items-center justify-center gap-2 py-4 rounded-2xl text-red-400 bg-red-400/10 hover:bg-red-400/20 text-xs font-bold tracking-widest uppercase transition-colors"
                      title="设置"
                    >
                      <LogOut size={14} /> 退出登录
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {!isChoosingAvatar && (
            <div className="absolute bottom-6 left-6 right-6 md:static md:bottom-auto md:left-auto md:right-auto md:pt-8 bg-[#050505] z-10 border-t border-[#050505] md:w-full md:mt-auto shrink-0">
              <button 
                onClick={handleSave}
                disabled={saving}
                className="w-full py-4 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white text-sm md:text-base font-bold uppercase tracking-widest rounded-2xl shadow-lg shadow-aurora-pink/20 hover:scale-[1.02] transition-transform disabled:opacity-50"
              >
                {saving ? '保存中...' : '保存修改'}
              </button>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
