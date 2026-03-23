// Supabase Edge Function for AI Skin Analysis
// This routes through Supabase to help users in Hong Kong/China access Gemini

import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

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

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, skinHistory } = await req.json()

    if (!imageBase64) {
      return new Response(
        JSON.stringify({ error: "請提供圖片" }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    
    if (!GEMINI_API_KEY) {
      return new Response(
        JSON.stringify({ error: "AI 服務未配置" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    // Gemini 2.5 Flash - the current model that supports vision
    const models = [
      'gemini-2.5-flash',
      'gemini-2.5-flash-latest',
      'gemini-2.5-pro',
      'gemini-3-flash',
      'gemini-3.1-flash-lite',
    ];

    const prompt = skinHistory
      ? `${ANALYSIS_PROMPT}\n\n用戶背景：${skinHistory}`
      : ANALYSIS_PROMPT

    let result = null;
    let lastError = null;

    for (const model of models) {
      try {
        const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${GEMINI_API_KEY}`;
        
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [{
              parts: [
                { text: prompt },
                { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
              ]
            }]
          })
        })

        const data = await response.json()
        
        if (response.ok && data.candidates?.[0]?.content?.parts?.[0]?.text) {
          result = data;
          break;
        } else if (data.error) {
          lastError = data.error;
        }
      } catch (e) {
        lastError = e.message;
      }
    }

    if (!result) {
      console.error('All Gemini models failed:', lastError);
      return new Response(
        JSON.stringify({ error: "AI 模型不可用，請稍後再試" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const text = result.candidates?.[0]?.content?.parts?.[0]?.text || ""
    
    // Extract JSON
    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(
        JSON.stringify({ error: "無法解析 AI 回覆" }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      )
    }

    const parsed = JSON.parse(jsonMatch[0])
    parsed.id = crypto.randomUUID()
    parsed.createdAt = new Date().toISOString()

    return new Response(
      JSON.stringify(parsed),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(
      JSON.stringify({ error: "服務錯誤" }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    )
  }
})