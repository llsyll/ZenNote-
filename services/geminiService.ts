
import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

/**
 * 抓取 X (Twitter) 推文并整理成 Markdown 长文
 */
export const fetchXThread = async (url: string): Promise<{ title: string, content: string }> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-pro-preview',
      contents: `这是 X (Twitter) 的链接：${url}。
      请执行以下任务：
      1. 使用搜索功能找到该推文及其所在的连续对话（Thread）。
      2. 提取所有博主发布的推文正文内容。
      3. 整理成一篇逻辑通顺、具有文学感的 Markdown 文章。
      4. 拟一个不超过 10 个字的诗意中文标题。
      5. 剔除推文中的广告、链接、互动数据、日期戳。
      6. 严格返回 JSON 格式：{"title": "你的标题", "content": "整理后的正文"}`,
      config: {
        tools: [{ googleSearch: {} }],
        responseMimeType: "application/json"
      },
    });

    const result = JSON.parse(response.text || '{"title":"", "content":""}');
    return {
      title: result.title || "整理自 X",
      content: result.content || "抓取失败，请检查链接。"
    };
  } catch (error) {
    console.error("X Fetch Error:", error);
    throw new Error("同步失败，请重试或手动输入。");
  }
};

export const polishText = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Text to format: ${text}`,
      config: {
        systemInstruction: `You are a professional editor. Add paragraph breaks and polish the language for a zen reading card. Return ONLY formatted text.`,
      },
    });
    return response.text || text;
  } catch (error) {
    return text;
  }
};

export const summarizeToTitle = async (text: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `Generate a poetic 4-6 char Chinese title for this: ${text.substring(0, 300)}`,
    });
    return response.text?.trim() || "随笔";
  } catch (error) {
    return "随笔";
  }
};
