"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import clsx from "clsx";

interface AnalysisHistory {
  id: string;
  created_at: string;
  skin_type: string | null;
  ai_observation: string | null;
  goal_conflict: string | null;
  concerns: string[] | null;
  routine: {
    morning: { product: string; purpose: string }[];
    evening: { product: string; purpose: string }[];
  } | null;
  ingredients: { ingredient: string; benefit: string; concentration?: string }[] | null;
  questionnaire: any;
}

const skinTypeLabels: Record<string, string> = {
  oily: "油性肌",
  dry: "乾性肌",
  combination: "混合肌",
  normal: "正常肌",
  sensitive: "敏感肌",
};

export default function HistoryList() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const supabase = createClient();

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const { data, error } = await supabase
          .from("analysis_history")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;
        setHistory(data || []);
      } catch (err: any) {
        setError(err.message || "載入歷史記錄失敗");
      } finally {
        setLoading(false);
      }
    };

    fetchHistory();
  }, [user]);

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("zh-TW", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-12">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-skin-200 border-t-skin-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-skin-50 p-8 text-center">
        <p className="text-gray-600">請先登入以查看歷史記錄</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="rounded-xl bg-red-50 p-4 text-sm text-red-600">
        {error}
      </div>
    );
  }

  if (history.length === 0) {
    return (
      <div className="rounded-xl bg-skin-50 p-8 text-center">
        <p className="text-4xl mb-4">📋</p>
        <p className="text-gray-600">尚無分析記錄</p>
        <p className="text-sm text-gray-400 mt-2">完成皮膚分析後，記錄會顯示在這裡</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {history.map((item) => (
        <div
          key={item.id}
          className={clsx(
            "rounded-xl border transition-all cursor-pointer",
            expandedId === item.id
              ? "border-skin-500 bg-skin-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-skin-300 hover:bg-skin-50/50"
          )}
          onClick={() => setExpandedId(expandedId === item.id ? null : item.id)}
        >
          {/* Card Header - Always Visible */}
          <div className="p-4">
            <div className="flex items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-gray-900">
                    {skinTypeLabels[item.skin_type || ""] || "未知類型"}
                  </span>
                </div>
                <p className="text-sm text-gray-500 mb-2">{formatDate(item.created_at)}</p>
                {item.ai_observation && (
                  <p className="text-sm text-gray-600 line-clamp-2">🔍 {item.ai_observation}</p>
                )}
              </div>
              <div className="flex-shrink-0">
                <svg
                  className={clsx(
                    "w-5 h-5 text-gray-400 transition-transform",
                    expandedId === item.id && "rotate-180"
                  )}
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </div>
            </div>
          </div>

          {/* Expanded Details */}
          {expandedId === item.id && (
            <div className="border-t border-gray-200 p-4 space-y-4">
              {/* Enhanced Goal Conflict Warning */}
              {item.goal_conflict && (
                <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-4">
                  <h4 className="text-base font-bold text-amber-800 mb-2">⚠️ 護膚目標與皮膚狀況衝突</h4>
                  <p className="text-amber-700 mb-3">{item.goal_conflict}</p>
                  <div className="flex gap-3">
                    <a
                      href="/analyzer"
                      className="rounded-lg bg-amber-500 px-3 py-1.5 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                    >
                      調整目標
                    </a>
                    <span className="text-amber-600 text-sm underline cursor-pointer">
                      我知道了
                    </span>
                  </div>
                </div>
              )}

              {/* Concerns */}
              {item.concerns && item.concerns.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">⚠️ 肌膚問題</h4>
                  <ul className="space-y-1">
                    {item.concerns.map((c, i) => (
                      <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                        <span className="w-1.5 h-1.5 rounded-full bg-skin-400"></span>
                        {c}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Morning Routine */}
              {item.routine?.morning && item.routine.morning.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">☀️ 早間護理</h4>
                  <ol className="space-y-2">
                    {item.routine.morning.map((ritem, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-skin-200 text-skin-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-skin-800">{ritem.product}</p>
                          <p className="text-gray-500">{ritem.purpose}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Evening Routine */}
              {item.routine?.evening && item.routine.evening.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">🌙 晚間護理</h4>
                  <ol className="space-y-2">
                    {item.routine.evening.map((ritem, i) => (
                      <li key={i} className="flex gap-3 text-sm">
                        <span className="flex-shrink-0 w-5 h-5 rounded-full bg-skin-200 text-skin-700 text-xs font-bold flex items-center justify-center">
                          {i + 1}
                        </span>
                        <div>
                          <p className="font-medium text-skin-800">{ritem.product}</p>
                          <p className="text-gray-500">{ritem.purpose}</p>
                        </div>
                      </li>
                    ))}
                  </ol>
                </div>
              )}

              {/* Ingredients */}
              {item.ingredients && item.ingredients.length > 0 && (
                <div>
                  <h4 className="text-sm font-bold text-gray-700 mb-2">✨ 推薦成分</h4>
                  <div className="space-y-2">
                    {item.ingredients.map((ritem, i) => (
                      <div key={i} className="border-l-2 border-skin-400 pl-3 text-sm">
                        <p className="font-medium text-skin-700">{ritem.ingredient}</p>
                        <p className="text-gray-500">{ritem.benefit}</p>
                        {ritem.concentration && (
                          <p className="text-xs text-skin-500">建議濃度：{ritem.concentration}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
