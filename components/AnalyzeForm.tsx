"use client";

import { useState, useRef } from "react";
import { useForm } from "react-hook-form";
import clsx from "clsx";

interface FormData {
  image: FileList;
  skinHistory?: string;
  concerns?: string;
}

export default function AnalyzeForm() {
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  const { register, handleSubmit } = useForm<FormData>();

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    try {
      const formData = new FormData();
      formData.append("image", data.image[0]);
      if (data.skinHistory) formData.append("skinHistory", data.skinHistory);

      const res = await fetch("/api/analyze", {
        method: "POST",
        body: formData,
      });

      const json = await res.json();
      if (json.success) setResult(json.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="grid gap-8 lg:grid-cols-2">
      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* Image Upload */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            {...register("image", { required: true })}
            onChange={onFileChange}
            ref={fileRef}
            className="hidden"
          />
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg object-contain"
              />
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                className="text-sm text-skin-600 hover:text-skin-700"
              >
                重新上傳
              </button>
            </div>
          ) : (
            <button
              type="button"
              onClick={() => fileRef.current?.click()}
              className="flex flex-col items-center gap-2 text-gray-500"
            >
              <span className="text-4xl">📷</span>
              <span>點擊上傳皮膚照片</span>
              <span className="text-xs text-gray-400">
                JPG, PNG 最大 10MB
              </span>
            </button>
          )}
        </div>

        {/* Skin History */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            皮膚歷史 / 過敏史（選填）
          </label>
          <textarea
            {...register("skinHistory")}
            rows={3}
            placeholder="例如：我是乾性皮膚，對酒精過敏..."
            className="w-full rounded-lg border border-gray-200 p-3 focus:border-skin-500 focus:outline-none focus:ring-2 focus:ring-skin-100"
          />
        </div>

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className={clsx(
            "w-full rounded-lg py-3 font-medium text-white transition-colors",
            loading
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
          <pre className="overflow-auto text-sm">
            {JSON.stringify(result, null, 2)}
          </pre>
        </div>
      )}
    </div>
  );
}
