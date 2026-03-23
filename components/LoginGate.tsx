"use client";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginGate({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();

  if (loading) {
    return (
      <div className="flex justify-center py-12">
        <span className="text-gray-500">載入中...</span>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl border border-gray-200 bg-gray-50 py-16 text-center">
        <div className="mb-4 text-5xl">🔒</div>
        <h2 className="mb-2 text-xl font-semibold text-gray-800">需要登入才能使用</h2>
        <p className="mb-6 text-gray-500">
          請先使用 Google 帳號登入，即可開始使用 AI 皮膚分析功能。
        </p>
        <p className="text-sm text-gray-400">
          我們僅使用您的 Email 進行身份驗證，不會儲存任何個人敏感資料。
        </p>
      </div>
    );
  }

  return <>{children}</>;
}
