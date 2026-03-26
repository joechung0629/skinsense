import { NextRequest, NextResponse } from "next/server";
import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

interface UserProfile {
  skin_type_self?: string;
  sensitivity?: string;
  goal?: string;
  skin_history?: string;
  t_zone_oiliness?: string;
  pore_size?: string;
  acne_level?: string;
  hydration?: string;
}

function buildSystemPrompt(profile: UserProfile): string {
  return `你是 SkinSense 的 AI 護膚助理。根據用戶的皮膚資料回答問題。

用戶皮膚：
- 皮膚類型：${profile.skin_type_self || "未填寫"}
- 敏感程度：${profile.sensitivity || "未填寫"}
- T區油脂：${profile.t_zone_oiliness || "未填寫"}
- 毛孔大小：${profile.pore_size || "未填寫"}
- 痘痘程度：${profile.acne_level || "未填寫"}
- 缺水情況：${profile.hydration || "未填寫"}
- 目標：${profile.goal || "未填寫"}
- 皮膚/過敏史：${profile.skin_history || "無"}

規則：
- 用繁體中文
- 適合香港/台灣讀者
- 專業但易讀
- 如果涉及醫療，建議就醫
- 不要推薦特定品牌
- 回答簡潔，不超過 200 字
- 不要重複開頭問候語，直接回答`;
}

export async function POST(request: NextRequest) {
  try {
    const { message, userId, userProfile } = await request.json();

    if (!message) {
      return NextResponse.json({ success: false, error: "訊息不可為空" }, { status: 400 });
    }

    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ success: false, error: "API Key 未設置" }, { status: 500 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const systemPrompt = buildSystemPrompt(userProfile || {});

    const result = await model.generateContent([
      { text: systemPrompt },
      { text: `用戶問題：${message}` },
    ]);

    const reply = result.response.text();

    return NextResponse.json({ success: true, reply });
  } catch (error) {
    console.error("Chatbot error:", error);
    return NextResponse.json({ success: false, error: "處理失敗" }, { status: 500 });
  }
}
