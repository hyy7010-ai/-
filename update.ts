import * as fs from 'fs';

let code = fs.readFileSync('src/components/Square.tsx', 'utf-8');

const startIdx = code.indexOf("            {socialMode === 'friends' ? (");
const endIdx = code.indexOf("          </div>\n          )}\n          </motion.div>\n        )}");

if (startIdx !== -1 && endIdx !== -1) {
   let replacingBlock = code.substring(startIdx, endIdx);
   let datingBlockIdx = replacingBlock.indexOf('// Dating mode');
   let datingBlock = replacingBlock.substring(datingBlockIdx + '// Dating mode\n'.length);

   datingBlock = datingBlock.replace(
      '<Heart className={currentContent.accent} size={20} fill="currentColor" />',
      '{socialMode === \'friends\' ? <Users className={currentContent.accent} size={20} /> : <Heart className={currentContent.accent} size={20} fill="currentColor" />}'
   ).replace(
      '>\n                  真心广场\n                </h1>',
      '>\n                  {socialMode === \'friends\' ? \'找到你的同频伙伴\' : \'真心广场\'}\n                </h1>'
   );

   datingBlock = datingBlock.replace(
      'className="px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 bg-gradient-to-r from-aurora-pink to-sunset-orange text-white shadow-lg"',
      'className={`px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 ${socialMode === \'dating\' ? \'bg-gradient-to-r from-aurora-pink to-sunset-orange text-white shadow-lg\' : \'text-white/40 hover:text-white hover:bg-white/5\'}`}'
   ).replace(
      '<Heart size={14} className="animate-pulse" />',
      '<Heart size={14} className={socialMode === \'dating\' ? \'animate-pulse\' : \'\'} />'
   ).replace(
      'onClick={() => onSocialModeChange(\'friends\')}\n                  className="px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 text-white/40 hover:text-white hover:bg-white/5"',
      'onClick={() => onSocialModeChange(\'friends\')}\n                  className={`px-8 py-3 text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all rounded-full flex items-center gap-2 ${socialMode === \'friends\' ? \'bg-gradient-to-r from-neon-green to-emerald-500 text-white shadow-lg\' : \'text-white/40 hover:text-white hover:bg-white/5\'}`}'
   );

   let featuresIdx = datingBlock.indexOf('{currentContent.features.map');
   
   let friendsFeatures = `
              {socialMode === 'friends' ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-3 w-full mt-6">
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
                         transition={{ delay: 0.5 + idx * 0.05 }}
                         onClick={() => {
                           if (!user) {
                             setShowAuthModal(true);
                             return;
                           }
                           setSelectedFriendCategory(tag);
                           setShowFriendTypeModal(true);
                         }}
                         className="relative group w-full cursor-pointer"
                       >
                         <div className={\`absolute -inset-[1px] bg-gradient-to-b \${currentContent.gradient} rounded-3xl opacity-0 group-hover:opacity-30 transition-opacity duration-300\`} />
                         <div className="relative h-full p-4 md:p-6 bg-white/5 hover:bg-white/10 rounded-3xl border border-white/5 hover:border-white/20 transition-all flex flex-col gap-2 items-center text-center shadow-lg">
                           <h3 className="text-lg md:text-xl font-bold text-white tracking-wide whitespace-nowrap">{tag.label}</h3>
                           <p className="text-[9px] text-white/50 tracking-widest uppercase line-clamp-1">{tag.desc}</p>
                         </div>
                       </motion.div>
                    ))}
                 </div>
              ) : (
   `;

   datingBlock = datingBlock.substring(0, featuresIdx) + friendsFeatures + datingBlock.substring(featuresIdx);
   
   let featuresEndIdx = datingBlock.indexOf('              </div>\n\n              {/* Footer Notice */}');
   datingBlock = datingBlock.substring(0, featuresEndIdx) + '              )}\n' + datingBlock.substring(featuresEndIdx);
   
   datingBlock = datingBlock.replace(
      'const testAnswers: Record<number, string> = {};\n                           questions.forEach((q) => {',
      'if (socialMode === \'friends\') {\n                             setStep(\'matching\');\n                             return;\n                           }\n                           const testAnswers: Record<number, string> = {};\n                           questions.forEach((q) => {'
   );

   datingBlock = datingBlock.replace(
      'className="flex flex-col items-center w-full max-w-xl mx-auto pt-0 pb-4 -mt-4"',
      'className={`flex flex-col items-center w-full ${socialMode === \'friends\' ? \'max-w-6xl\' : \'max-w-xl\'} mx-auto pt-0 pb-4 -mt-4`}'
   );

   code = code.substring(0, startIdx) + datingBlock + code.substring(endIdx);
   fs.writeFileSync('src/components/Square.tsx', code);
   console.log("Success");
} else {
   console.log("Could not find blocks");
}
