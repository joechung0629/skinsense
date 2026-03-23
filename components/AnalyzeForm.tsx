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
      reader.onload = () => resolve(reader.result as string);
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
      const base64 = await fileToBase64(image);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
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
        <div className="rounded-xl bg-skin-50 p-6">
          <h3 className="mb-4 text-lg font-bold">分析結果</h3>
          <div className="space-y-4">
            <div>
              <span className="font-medium">皮膚類型：</span>
              <span className="capitalize">{result.skinType}</span>
            </div>
            <div>
              <span className="font-medium">評分：</span>
              <span>{result.score}/100</span>
            </div>
            {result.concerns && (
              <div>
                <span className="font-medium">問題：</span>
                <ul className="list-disc list-inside">
                  {result.concerns.map((c: string, i: number) => (
                    <li key={i}>{c}</li>
                  ))}
                </ul>
              </div>
            )}
            <div>
              <span className="font-medium">護理建議：</span>
              <pre className="mt-2 overflow-auto text-sm whitespace-pre-wrap">
                {JSON.stringify(result, null, 2)}
              </pre>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}