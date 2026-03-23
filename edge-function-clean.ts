import { serve } from "https://deno.land/std@0.168.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const { imageBase64, skinTypeSelf, tZoneOiliness, poreSize, acneLevel, sensitivity, hydration, gender, age, climate, isTraveling, travelClimate, goal, skinHistory } = await req.json()

    if (!imageBase64) {
      return new Response(JSON.stringify({ error: "請提供圖片" }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY')
    if (!GEMINI_API_KEY) {
      return new Response(JSON.stringify({ error: "AI 服務未配置" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    // Mappings - all in one place
    const skinTypeMap: Record<string, string> = { oily: '油性', dry: '乾性', combination: '混合', normal: '正常', sensitive: '敏感肌' }
    const genderMap: Record<string, string> = { male: '男', female: '女' }
    const climateMap: Record<string, string> = { tropical: '熱帶/亞熱帶', dry: '乾燥', moderate: '溫和', cold: '寒冷', island: '海島' }
    const goalMap: Record<string, string> = { oil_control: '控油', whitening: '美白', anti_aging: '抗老', acne: '祛痘', moisturizing: '保濕' }
    const unsureMap: Record<string, string> = {
      oily: '油性', dry: '乾性', combination: '混合', normal: '正常', sensitive: '敏感肌', unsure: '不清楚',
      none: '幾乎不長痘', few: '偶爾長一兩粒', moderate: '經常長痘', severe: '嚴重痘痘問題',
      small: '細小', large: '粗大', low: '不太敏感', high: '很容易過敏/泛紅'
    }

    // Build user context string
    const userContext = `
【用戶自評問卷】
- 皮膚類型：${skinTypeMap[skinTypeSelf] || '不清楚'}
- T 字位油脂：${unsureMap[tZoneOiliness] || '不清楚'}
- 毛孔大小：${unsureMap[poreSize] || '不清楚'}
- 長痘情況：${unsureMap[acneLevel] || '不清楚'}
- 敏感程度：${unsureMap[sensitivity] || '不清楚'}
- 缺水情況：${unsureMap[hydration] || '不清楚'}
- 性別：${genderMap[gender] || '未指定'}
- 年齡：${age || '未指定'}
- 居住氣候：${climateMap[climate] || '未指定'}
${isTraveling ? `- 旅行目的地：${climateMap[travelClimate] || '未指定'}` : ''}
- 主要目標：${goalMap[goal] || '未指定'}
- 皮膚歷史：${skinHistory || '無'}
`.trim()

    const SINGLE_PROMPT = `你是一個專業的皮膚護理顧問，同時也是嚴格的圖片審核員。

首先，請檢查這張圖片是否包含人類的臉部或頸部皮膚。
如果不是（例如是：動物、食物、風景、建築、植物、文檔、表格、Excel、產品、純文字等），請直接回覆：{"error": "請上傳包含人類臉部或頸部皮膚的清晰照片，不要上傳其他內容"}

如果圖片是有效的皮膚照片，請分析並回覆以下 JSON：
{
  "skinType": "dry" | "oily" | "combination" | "normal" | "sensitive",
  "skinTypeConfidence": 85,
  "aiObservation": "你觀察到的皮膚狀況一句話描述",
  "concerns": ["中文問題描述1", "中文問題描述2"],
  "routine": {
    "morning": [{"product": "產品名", "purpose": "目的"}],
    "evening": [{"product": "產品名", "purpose": "目的"}]
  },
  "ingredients": [{"ingredient": "成分名", "benefit": "功效", "concentration": "建議濃度"}],
  "score": 75
}

${userContext}

只回覆 JSON，不要有其他文字。`;

    // Single API call
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [
            { text: SINGLE_PROMPT },
            { inlineData: { mimeType: 'image/jpeg', data: imageBase64 } }
          ]}]
        })
      }
    )

    const data = await response.json()
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text || ""

    // Check for error response
    if (text.includes('"error"')) {
      const errorMatch = text.match(/\{[\s\S]*\}/)
      if (errorMatch) {
        const errorObj = JSON.parse(errorMatch[0])
        if (errorObj.error) {
          return new Response(JSON.stringify({ error: errorObj.error }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
        }
      }
    }

    const jsonMatch = text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return new Response(JSON.stringify({ error: "無法解析 AI 回覆" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
    }

    const parsed = JSON.parse(jsonMatch[0])
    parsed.id = crypto.randomUUID()
    parsed.createdAt = new Date().toISOString()

    return new Response(JSON.stringify(parsed), { headers: { ...corsHeaders, 'Content-Type': 'application/json' } })

  } catch (error) {
    console.error('Edge Function error:', error)
    return new Response(JSON.stringify({ error: "服務錯誤" }), { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } })
  }
})