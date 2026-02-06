
import { GoogleGenAI } from "@google/genai";

// سيتم تعويض process.env.API_KEY بواسطة Vite أثناء البناء
// تأكد من إضافة API_KEY في إعدادات البيئة (Environment Variables) في Netlify
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

export const generateTrackInsight = async (trackName: string) => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: `بصفتك خبير موسيقي، أعطني وصفاً قصيراً وملهماً باللغة العربية لهذا المقطع الصوتي: "${trackName}". اجعله مختصراً جداً (أقل من 20 كلمة).`,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini Error:", error);
    return "استمتع بألحانك المفضلة مع ترانيم.";
  }
};
