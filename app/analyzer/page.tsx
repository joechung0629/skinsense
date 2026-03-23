import type { Metadata } from "next";
import AnalyzeForm from "@/components/AnalyzeForm";
import LoginGate from "@/components/LoginGate";

export const metadata: Metadata = {
  title: "皮膚分析",
  description:
    "上傳您的肌膚照片，AI 將為您分析肌膚類型、識別問題，並提供個人化的護理建議和產品推薦。",
};

export default function AnalyzerPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">AI 皮膚分析</h1>
        <p className="text-gray-600">
          上傳清晰的肌膚照片，獲得專業的護理建議
        </p>
      </header>

      <div className="mx-auto max-w-4xl">
        <LoginGate>
          <AnalyzeForm />
        </LoginGate>
      </div>
    </div>
  );
}
