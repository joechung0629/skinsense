"use client";

import { useState } from "react";
import clsx from "clsx";

const EDGE_FUNCTION_URL = "https://gsvkuzusfnieblzcsvcs.supabase.co/functions/v1/analyze-skin";

export default function AnalyzeForm() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  
  // User profile - Skin status questionnaire
  const [skinTypeSelf, setSkinTypeSelf] = useState<"oily" | "dry" | "combination" | "normal" | "sensitive" | "unsure" | "">("");
  const [tZoneOiliness, setTZoneOiliness] = useState<"oily" | "normal" | "dry" | "unsure" | "">("");
  const [poreSize, setPoreSize] = useState<"small" | "medium" | "large" | "unsure" | "">("");
  const [acneLevel, setAcneLevel] = useState<"none" | "few" | "moderate" | "severe" | "unsure" | "">("");
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high" | "unsure" | "">("");
  const [hydration, setHydration] = useState<"oily" | "normal" | "dry" | "unsure" | "">("");
  
  // Additional context
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [age, setAge] = useState<"18-25" | "26-35" | "36-45" | "45+" | "">("");
  const [climate, setClimate] = useState<"tropical" | "dry" | "moderate" | "cold" | "">("");
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelClimate, setTravelClimate] = useState<"tropical" | "dry" | "cold" | "island" | "">("");
  const [goal, setGoal] = useState<"oil_control" | "whitening" | "anti_aging" | "acne" | "moisturizing" | "">("");
  const [skinHistory, setSkinHistory] = useState("");

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = compressed.includes(",") ? compressed.split(",")[1] : compressed;
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError("請上傳圖片");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const base64 = await compressImage(image);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          // Questionnaire answers
          skinTypeSelf,
          tZoneOiliness,
          poreSize,
          acneLevel,
          sensitivity,
          hydration,
          // Additional context
          gender,
          age,
          climate,
          isTraveling,
          travelClimate,
          goal,
          skinHistory: skinHistory || undefined
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
      }
    } catch (err: any) {
      setError(err.message || "網絡錯誤，請稍後再試");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const QuestionSelect = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (v: any) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
      >
        <option value="">請選擇</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg object-contain"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-sm text-skin-600 hover:text-skin-700"
              >
                重新上傳
              </label>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center gap-2 cursor-pointer text-gray-500"
            >
              <span className="text-4xl">📷</span>
              <span>點擊上傳皮膚照片</span>
              <span className="text-xs text-gray-400">
                請上傳臉部或頸部清晰照片
              </span>
            </label>
          )}
        </div>

        {/* Skin Status Questionnaire */}
        <div className="rounded-xl bg-skin-50 p-6 space-y-5">
          <h3 className="text-lg font-bold">📋 皮膚狀態問卷（主要）</h3>
          <p className="text-sm text-gray-600">請根據你平時的感受選擇，如果不清楚可以選擇「不清楚」</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <QuestionSelect
              label="你覺得自己屬於什麼皮膚類型？"
              value={skinTypeSelf}
              onChange={setSkinTypeSelf}
              options={[
                { value: "oily", label: "油性皮膚" },
                { value: "dry", label: "乾性皮膚" },
                { value: "combination", label: "混合皮膚" },
                { value: "normal", label: "正常皮膚" },
                { value: "sensitive", label: "敏感肌" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="T 字位（額頭和鼻子）的油脂情況？"
              value={tZoneOiliness}
              onChange={setTZoneOiliness}
              options={[
                { value: "oily", label: "很油" },
                { value: "normal", label: "正常" },
                { value: "dry", label: "乾燥" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="你的毛孔大小？"
              value={poreSize}
              onChange={setPoreSize}
              options={[
                { value: "small", label: "細小" },
                { value: "medium", label: "中等" },
                { value: "large", label: "粗大" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="長痘情況？"
              value={acneLevel}
              onChange={setAcneLevel}
              options={[
                { value: "none", label: "幾乎不長痘" },
                { value: "few", label: "偶爾長一兩粒" },
                { value: "moderate", label: "經常長痘" },
                { value: "severe", label: "嚴重痘痘問題" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="皮膚敏感程度？"
              value={sensitivity}
              onChange={setSensitivity}
              options={[
                { value: "low", label: "不太敏感" },
                { value: "medium", label: "適中" },
                { value: "high", label: "很容易過敏/泛紅" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="你的皮膚缺水情況？"
              value={hydration}
              onChange={setHydration}
              options={[
                { value: "oily", label: "外油內乾" },
                { value: "normal", label: "水油平衡" },
                { value: "dry", label: "乾燥脫皮" },
                { value: "unsure", label: "不清楚" },
              ]}
            />
          </div>
        </div>

        {/* Additional Context */}
        <div className="rounded-xl bg-skin-50 p-6 space-y-4">
          <h3 className="text-lg font-bold">👤 基本資料（輔助參考）</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <QuestionSelect
              label="性別"
              value={gender}
              onChange={setGender}
              options={[
                { value: "male", label: "男" },
                { value: "female", label: "女" },
              ]}
            />

            <QuestionSelect
              label="年齡"
              value={age}
              onChange={setAge}
              options={[
                { value: "18-25", label: "18-25 歲" },
                { value: "26-35", label: "26-35 歲" },
                { value: "36-45", label: "36-45 歲" },
                { value: "45+", label: "45 歲以上" },
              ]}
            />

            <QuestionSelect
              label="居住氣候"
              value={climate}
              onChange={setClimate}
              options={[
                { value: "tropical", label: "熱帶/亞熱帶" },
                { value: "dry", label: "乾燥" },
                { value: "moderate", label: "溫和" },
                { value: "cold", label: "寒冷" },
              ]}
            />

            <QuestionSelect
              label="主要目標"
              value={goal}
              onChange={setGoal}
              options={[
                { value: "oil_control", label: "控油" },
                { value: "whitening", label: "美白" },
                { value: "anti_aging", label: "抗老" },
                { value: "acne", label: "祛痘" },
                { value: "moisturizing", label: "保濕" },
              ]}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTraveling}
                onChange={(e) => setIsTraveling(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-skin-500 focus:ring-skin-500"
              />
              <span className="text-sm font-medium text-gray-700">我正在旅行</span>
            </label>
          </div>

          {isTraveling && (
            <QuestionSelect
              label="旅行目的地氣候"
              value={travelClimate}
              onChange={setTravelClimate}
              options={[
                { value: "tropical", label: "熱帶雨林" },
                { value: "dry", label: "乾燥地區" },
                { value: "cold", label: "寒冷地區" },
                { value: "island", label: "海島度假" },
              ]}
            />
          )}
        </div>

        {/* Skin History */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            皮膚歷史 / 過敏史（選填）
          </label>
          <textarea
            value={skinHistory}
            onChange={(e) => setSkinHistory(e.target.value)}
            rows={2}
            placeholder="例如：對酒精過敏、用某產品爆痘..."
            className="w-full rounded-lg border border-gray-200 p-3 focus:border-skin-500 focus:outline-none focus:ring-2 focus:ring-skin-100"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !image || !skinTypeSelf}
          className={clsx(
            "w-full rounded-lg py-3 font-medium text-white transition-colors",
            loading || !image || !skinTypeSelf
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-skin-600 hover:bg-skin-700"
          )}
        >
          {loading ? "分析中..." : "開始分析"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Score Card */}
          <div className="rounded-xl bg-gradient-to-br from-skin-500 to-skin-600 p-6 text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{result.score}</div>
              <div className="text-sm opacity-80">總評分</div>
            </div>
          </div>

          {/* Skin Type */}
          <div className="rounded-xl bg-skin-50 p-6">
            <h3 className="text-lg font-bold mb-2">🔍 皮膚類型</h3>
            <p className="text-2xl font-semibold text-skin-600">
              {result.skinType === 'oily' && '油性肌膚'}
              {result.skinType === 'dry' && '乾性肌膚'}
              {result.skinType === 'combination' && '混合肌膚'}
              {result.skinType === 'normal' && '正常肌膚'}
              {result.skinType === 'sensitive' && '敏感肌膚'}
            </p>
            {result.skinTypeConfidence && (
              <p className="text-sm text-gray-600 mt-1">
                AI 分析置信度：{result.skinTypeConfidence}%
              </p>
            )}
          </div>

          {/* Concerns */}
          {result.concerns && result.concerns.length > 0 && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">⚠️ 肌膚問題</h3>
              <ul className="space-y-2">
                {result.concerns.map((c: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-skin-400"></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Routine - Morning */}
          {result.routine?.morning && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">☀️ 早間護理</h3>
              <ol className="space-y-3">
                {result.routine.morning.map((item: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skin-200 text-skin-700 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-skin-800">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Routine - Evening */}
          {result.routine?.evening && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">🌙 晚間護理</h3>
              <ol className="space-y-3">
                {result.routine.evening.map((item: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skin-200 text-skin-700 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-skin-800">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Ingredients */}
          {result.ingredients && result.ingredients.length > 0 && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">✨ 推薦成分</h3>
              <div className="space-y-3">
                {result.ingredients.map((item: any, i: number) => (
                  <div key={i} className="border-l-4 border-skin-400 pl-4">
                    <p className="font-medium text-skin-700">{item.ingredient}</p>
                    <p className="text-sm text-gray-600">{item.benefit}</p>
                    {item.concentration && (
                      <p className="text-xs text-skin-500 mt-1">建議濃度：{item.concentration}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}