import { GoogleGenerativeAI } from "https://esm.sh/@google/generative-ai@0.14.0";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
const supabaseKey = Deno.env.get("SUPABASE_ANON_KEY")!;
const genAI = new GoogleGenerativeAI(Deno.env.get("GEMINI_API_KEY") || "");

interface UserProfile {
  skin_type_self: string | null;
  sensitivity: string | null;
  goal: string | null;
  skin_history: string | null;
}

interface AnalysisResult {
  status: "good" | "warning" | "bad";
  ingredients: string[];
  analysis: string;
  recommendation: string;
}

const SYSTEM_PROMPT = `你是專業的護膚品成分分析師。

根據產品名稱分析成分，並根據用戶的皮膚狀況判斷是否適合。

請嚴格以 JSON 格式回覆：
{
  "status": "good" | "warning" | "bad",
  "ingredients": ["成分1", "成分2", ...],
  "analysis": "分析說明（50-100字）",
  "recommendation": "建議（30-50字）"
}

分析規則：
- status: "good" = 適合，無風險成分
- status: "warning" = 注意，部分成分需留意
- status: "bad" = 不適合，含刺激性或致痘成分

用戶資料：
- 皮膚類型：{skinType}
- 敏感程度：{sensitivity}
- 目標：{goal}
- 關注問題：{concerns}`;

Deno.serve(async (req) => {
  try {
    const { productId, productName, brand, userId } = await req.json();

    if (!productName || !userId) {
      return new Response(
        JSON.stringify({ error: "缺少必要參數" }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Create Supabase client for Deno
    const supabase = createClient(supabaseUrl, supabaseKey);

    // Get user profile
    const { data: profile } = await supabase
      .from("user_profiles")
      .select("*")
      .eq("user_id", userId)
      .single();

    const userProfile: UserProfile = profile || {
      skin_type_self: "normal",
      sensitivity: "low",
      goal: "維持現狀",
      skin_history: null,
    };

    // Build analysis prompt
    const concerns = userProfile.skin_history || "無特殊問題";
    const prompt = SYSTEM_PROMPT
      .replace("{skinType}", userProfile.skin_type_self || "normal")
      .replace("{sensitivity}", userProfile.sensitivity || "low")
      .replace("{goal}", userProfile.goal || "維持現狀")
      .replace("{concerns}", concerns);

    // Use AI to analyze based on product name
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    const fullPrompt = `${prompt}

產品：${productName}
品牌：${brand || "未指定"}

請根據產品名稱推斷可能的成分，並分析是否適合該用戶。如果這是一個知名產品，請根據其典型成分進行分析。`;

    const result = await model.generateContent([fullPrompt]);
    const response = result.response;
    const text = response.text();

    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    let analysisResult: AnalysisResult;

    if (jsonMatch) {
      analysisResult = JSON.parse(jsonMatch[0]) as AnalysisResult;
    } else {
      // Fallback
      analysisResult = {
        status: "warning",
        ingredients: [],
        analysis: "無法獲取成分資訊",
        recommendation: "建議查看產品包裝上的成分表",
      };
    }

    // Save to database
    await supabase
      .from("product_analyses")
      .insert({
        user_id: userId,
        product_id: productId,
        ingredient_analysis: analysisResult,
        analysis_result: analysisResult.status === "good" ? "適合" :
          analysisResult.status === "warning" ? "注意" : "不適合",
      });

    return new Response(
      JSON.stringify({
        success: true,
        data: analysisResult,
      }),
      { headers: { "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Analysis error:", error);
    return new Response(
      JSON.stringify({ error: "分析失敗" }),
      { status: 500, headers: { "Content-Type": "application/json" } }
    );
  }
});
