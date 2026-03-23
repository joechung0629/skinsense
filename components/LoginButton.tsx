"use client";
import { useAuth } from "@/app/providers/AuthProvider";

export default function LoginButton() {
  const { user, loading, signInWithGoogle, signOut } = useAuth();

  if (loading) {
    return <span>載入中...</span>;
  }

  if (user) {
    return (
      <div className="flex items-center gap-4">
        <span className="text-sm text-gray-600">{user.email}</span>
        <button
          onClick={signOut}
          className="text-sm text-red-600 hover:text-red-700"
        >
          登出
        </button>
      </div>
    );
  }

  return (
    <button
      onClick={signInWithGoogle}
      className="bg-skin-600 text-white px-4 py-2 rounded-lg hover:bg-skin-700 transition-colors"
    >
      用 Google 登入
    </button>
  );
}
