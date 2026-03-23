"use client";

import { useState } from "react";
import clsx from "clsx";

const EDGE_FUNCTION_URL = "https://gsvkuzusfnieblzcsvcs.supabase.co/functions/v1/analyze-skin";

export default function AnalyzeForm() {
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [skinHistory, setSkinHistory] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

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

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Remove the data URI prefix (e.g., "data:image/jpeg;base64,")
        const base64 = result.includes(",") ? result.split(",")[1] : result;
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  // Compress image if too large (max 1MB base64 = ~750KB image)
  const compressImage = async (file: File, maxSizeMB = 0.5): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          // Scale down if too large
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
          
          // Convert to base64 (lower quality for smaller size)
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
      // Use compressed image to avoid base64 size limits
      const base64 = await compressImage(image);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          imageBase64: base64,
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

  return (
    <div className="grid gap-8 lg:grid-cols-2">
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
                JPG, PNG 最大 10MB
              </span>
            </label>
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
            rows={3}
            placeholder="例如：我是乾性皮膚，對酒精過敏..."
            className="w-full rounded-lg border border-gray-200 p-3 focus:border-skin-500 focus:outline-none focus:ring-2 focus:ring-skin-100"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !image}
          className={clsx(
            "w-full rounded-lg py-3 font-medium text-white transition-colors",
            loading || !image
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