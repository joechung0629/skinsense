"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import clsx from "clsx";

interface AnalysisHistory {
  id: string;
  created_at: string;
  skin_type: string;
  score: number;
  ai_observation: string | null;
  goal_conflict: string | null;
  questionnaire: any;
  image_url: string | null;
  analysis_data: any;
}

const skinTypeLabels: Record<string, string> = {
  oily: "油性肌膚",
  dry: "乾性肌膚",
  combination: "混合肌膚",
  normal: "正常肌膚",
  sensitive: "敏感肌膚",
};

export default function HistoryList() {
  const { user, loading: authLoading } = useAuth();
  const [history, setHistory] = useState<AnalysisHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedItem, setSelectedItem] = useState<AnalysisHistory | null>(null);
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600";
    if (score >= 60) return "text-yellow-600";
    return "text-red-600";
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
    <div className="space-y-6">
      {/* History List */}
      <div className="space-y-3">
        {history.map((item) => (
          <button
            key={item.id}
            onClick={() => setSelectedItem(selectedItem?.id === item.id ? null : item)}
            className={clsx(
              "w-full rounded-xl border p-4 text-left transition-all",
              selectedItem?.id === item.id
                ? "border-skin-500 bg-skin-50 shadow-sm"
                : "border-gray-200 bg-white hover:border-skin-300 hover:bg-skin-50/50"
            )}
          >
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                {item.image_url && (
                  <img
                    src={item.image_url}
                    alt="分析圖片"
                    className="h-12 w-12 rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="font-medium text-gray-900">
                    {skinTypeLabels[item.skin_type] || item.skin_type || "未知類型"}
                  </p>
                  <p className="text-sm text-gray-500">{formatDate(item.created_at)}</p>
                </div>
              </div>
              <div className="text-right">
                <p className={clsx("text-2xl font-bold", getScoreColor(item.score))}>
                  {item.score}
                </p>
                <p className="text-xs text-gray-400">評分</p>
              </div>
            </div>

            {/* Expanded Details */}
            {selectedItem?.id === item.id && item.analysis_data && (
              <div className="mt-4 space-y-4 border-t border-gray-200 pt-4">
                {/* AI Observation */}
                {item.ai_observation && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-1">🔍 AI 觀察</h4>
                    <p className="text-sm text-gray-600">{item.ai_observation}</p>
                  </div>
                )}

                {/* Goal Conflict */}
                {item.goal_conflict && (
                  <div className="rounded-lg bg-amber-50 p-3">
                    <h4 className="text-sm font-bold text-amber-700 mb-1">⚠️ 目標提醒</h4>
                    <p className="text-sm text-amber-800">{item.goal_conflict}</p>
                  </div>
                )}

                {/* Concerns */}
                {item.analysis_data.concerns && item.analysis_data.concerns.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">⚠️ 肌膚問題</h4>
                    <ul className="space-y-1">
                      {item.analysis_data.concerns.map((c: string, i: number) => (
                        <li key={i} className="flex items-center gap-2 text-sm text-gray-600">
                          <span className="w-1.5 h-1.5 rounded-full bg-skin-400"></span>
                          {c}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Routine - Morning */}
                {item.analysis_data.routine?.morning && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">☀️ 早間護理</h4>
                    <ol className="space-y-2">
                      {item.analysis_data.routine.morning.map((ritem: any, i: number) => (
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

                {/* Routine - Evening */}
                {item.analysis_data.routine?.evening && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">🌙 晚間護理</h4>
                    <ol className="space-y-2">
                      {item.analysis_data.routine.evening.map((ritem: any, i: number) => (
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
                {item.analysis_data.ingredients && item.analysis_data.ingredients.length > 0 && (
                  <div>
                    <h4 className="text-sm font-bold text-gray-700 mb-2">✨ 推薦成分</h4>
                    <div className="space-y-2">
                      {item.analysis_data.ingredients.map((ritem: any, i: number) => (
                        <div key={i} className="border-l-3 border-skin-400 pl-3 text-sm">
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
          </button>
        ))}
      </div>
    </div>
  );
}
