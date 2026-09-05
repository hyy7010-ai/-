import { GoogleGenAI } from "@google/genai";
import { AI_SYSTEM_INSTRUCTION } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const tarotSystemInstruction = `
你是【真心塔罗 / RealTarot】的占卜师。
你的身份：统一、无名、无角色。
你的语气：极简、中性、高冷但有力量。
你的核心任务：将塔罗牌意与用户提供的【聊天证据】和【日记证据】进行**绝对绑定**。

解读规则：
1. **绝对证据导向**：每一句解读都必须基于【核心证据库】中的具体事实。严禁脱离证据进行空洞的牌意解释。如果证据不足以支撑某种推测，宁可不说，也不要编造。
2. **尊重牌意**：严禁为了“毒舌”而歪曲牌意。如果抽到的是正面、积极的牌（如：太阳、权杖六），你必须承认其中的积极面，但可以从“警惕过度乐观”或“对方目前的优势”角度进行冷峻分析。
3. **证据映射**：在解读中，必须明确指出是哪一段聊天记录或哪篇日记支撑了你的结论。
4. **致命一击**：如果历史记录显示用户正在被欺骗或自我消耗，你必须利用牌意作为武器，直接指出真相，哪怕真相很残酷。
5. **拒绝温情**：绝对禁止使用任何温情、土味的称呼。保持专业、数据化的冷酷感。
`;

export async function generateGuardianResponse(
  messages: { role: 'user' | 'model', parts: { text?: string, inlineData?: { mimeType: string, data: string } }[] }[]
) {
  const model = "gemini-3-flash-preview";
  
  const response = await ai.models.generateContent({
    model,
    contents: messages,
    config: {
      systemInstruction: AI_SYSTEM_INSTRUCTION,
      temperature: 0.7,
    },
  });
  return response.text;
}

export async function generateTarotReading(question: string, cards: string[], context: string) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    【用户提问】: "${question}"
    【抽取的塔罗牌】: ${cards.join('、')}
    
    【核心证据库 (聊天记录 & 恋爱日记)】: 
    ${context}

    请严格执行以下逻辑：
    1. **证据提取**：从【核心证据库】中提取与问题相关的关键对话和日记内容。
    2. **牌意绑定**：分析抽到的塔罗牌如何解释这些具体的证据。必须做到“一牌一证”，即每一张牌的解读都要挂钩到具体的证据点。
    3. **输出解读**：给出一段极简、高冷且有力量的解读。
    4. **风格要求**：数据化、事实化，拒绝情绪化安慰。必须直接指出真相，哪怕真相很残酷。严禁解释错，严禁脱离用户提供的聊天事实。
  `;
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: tarotSystemInstruction,
      temperature: 0.6,
    },
  });
  return response.text;
}

export async function generateDailySummary(logs: { role: string, content: string }[]) {
  const model = "gemini-3-flash-preview";
  const prompt = `
    以下是用户今日在【真心守护】中的聊天记录：
    ${logs.map(l => `[${l.role === 'user' ? '用户' : 'AI'}] ${l.content}`).join('\n')}
    
    请根据以上记录，生成一份今日情感守护总结。
    要求：
    1. 极简、中性、高冷、客观。
    2. 提取今日互动的核心矛盾或情感点。
    3. 给出基于数据的冷峻建议。
    4. 严禁使用任何温情、土味的称呼。
    5. 总结字数在 150 字以内。
  `;
  
  const response = await ai.models.generateContent({
    model,
    contents: prompt,
    config: {
      systemInstruction: AI_SYSTEM_INSTRUCTION,
      temperature: 0.6,
    },
  });
  return response.text;
}

export async function analyzeDiaryEntry(content: string, images: string[]) {
  const model = "gemini-3-flash-preview";
  
  const parts: any[] = [{ text: `
    你是一个情感分析专家。请根据以下日记内容和上传的图片（如果有），生成一个极简的标题，并给出一个 0-100 的心情指数（100为最开心，0为最悲伤）。
    
    日记内容: ${content}
    
    请以 JSON 格式返回：
    {
      "title": "极简标题",
      "moodScore": 85,
      "analysis": "极简、中性、高冷的情感分析建议"
    }
  ` }];

  if (images && images.length > 0) {
    images.forEach(img => {
      parts.push({
        inlineData: {
          mimeType: "image/png",
          data: img.split(',')[1]
        }
      });
    });
  }

  try {
    const response = await ai.models.generateContent({
      model,
      contents: { parts },
      config: { 
        responseMimeType: "application/json",
        temperature: 0.6
      }
    });
    return JSON.parse(response.text);
  } catch (error) {
    console.error("Diary Analysis Error:", error);
    return { title: "无题日记", moodScore: 50, analysis: "分析失败，请稍后再试。" };
  }
}
