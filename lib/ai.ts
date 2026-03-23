import { GoogleGenerativeAI } from "@google/generative-ai";
import type { AnalyzeRequest, SkinAnalysisResult } from "./types";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");

const ANALYSIS_PROMPT = `你是專業的皮膚護理顧問 AI。分析用戶皮膚照片並提供護理建議。

請以嚴格的 JSON 格式回覆，包含以下欄位：
{
  "skinType": "dry" | "oily" | "combination" | "normal" | "sensitive",
  "concerns": ["concern1", "concern2", ...],
  "routine": {
    "morning": [{"order": 1, "product": "產品名", "purpose": "目的"}, ...],
    "evening": [{"order": 1, "product": "產品名", "purpose": "目的"}, ...]
  },
  "ingredients": [{"ingredient": "成分名", "benefit": "功效", "concentration": "建議濃度"}, ...],
  "score": 75
}

注意：
- concerns 最多 5 項
- routine.morning 和 routine.evening 各最多 5 步
- score 是 0-100 的整數
- 只回覆 JSON，不要有其他文字`;

export async function analyzeSkin(request: AnalyzeRequest): Promise<SkinAnalysisResult> {
  if (!process.env.GEMINI_API_KEY) {
    throw new Error("GEMINI_API_KEY 未設置");
  }
  
  const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

  const prompt = request.skinHistory
    ? `${ANALYSIS_PROMPT}\n\n用戶背景：${request.skinHistory}\n Concerns: ${request.concerns?.join(", ") || "未指定"}`
    : ANALYSIS_PROMPT;

  const imagePart = request.imageBase64
    ? { inlineData: { data: request.imageBase64, mimeType: "image/jpeg" } }
    : null;

  const result = await model.generateContent(
    imagePart ? [prompt, imagePart] : [prompt]
  );

  const response = result.response;
  const text = response.text();

  // 提取 JSON
  const jsonMatch = text.match(/\{[\s\S]*\}/);
  if (!jsonMatch) throw new Error("無法解析 AI 回覆");

  const parsed = JSON.parse(jsonMatch[0]) as SkinAnalysisResult;
  parsed.id = crypto.randomUUID();
  parsed.createdAt = new Date().toISOString();

  return parsed;
}
