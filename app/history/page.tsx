import type { Metadata } from "next";
import HistoryList from "@/components/HistoryList";

export const metadata: Metadata = {
  title: "分析歷史",
  description: "查看您的皮膚分析歷史記錄",
};

export default function HistoryPage() {
  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-12 text-center">
        <h1 className="mb-4 text-3xl font-bold">📋 分析歷史</h1>
        <p className="text-gray-600">
          查看過往的皮膚分析記錄，了解您的肌膚變化
        </p>
      </header>

      <div className="mx-auto max-w-3xl">
        <HistoryList />
      </div>
    </div>
  );
}
