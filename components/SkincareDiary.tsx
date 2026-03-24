"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import { ProductType, RoutineTime, PRODUCT_TYPE_LABELS, ROUTINE_TIME_LABELS } from "@/supabase/types";
import clsx from "clsx";

interface Product {
  id: string;
  name: string;
  type: string;
  brand: string | null;
}

interface UsageLog {
  id: string;
  product_id: string;
  used_at: string;
  routine_time: string | null;
}

interface DiaryEntry {
  date: string;
  logs: UsageLog[];
  products: Record<string, Product>;
}

export default function SkincareDiary() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [entries, setEntries] = useState<DiaryEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "calendar">("list");
  const [selectedMonth, setSelectedMonth] = useState(() => {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchDiary();
  }, [user, selectedMonth]);

  const fetchDiary = async () => {
    if (!user) return;

    try {
      // Fetch all logs for the selected month
      const [year, month] = selectedMonth.split("-").map(Number);
      const startDate = `${selectedMonth}-01`;
      const endDate = new Date(year, month, 0).toISOString().split("T")[0];

      const { data: logsData, error: logsError } = await (supabase as any)
        .from("product_usage_logs")
        .select("id, product_id, used_at, routine_time")
        .eq("user_id", user.id)
        .gte("used_at", startDate)
        .lte("used_at", endDate)
        .order("used_at", { ascending: false });

      if (logsError) throw logsError;

      // Fetch products
      const { data: productsData, error: productsError } = await (supabase as any)
        .from("skincare_products")
        .select("id, name, type, brand")
        .eq("user_id", user.id);

      if (productsError) throw productsError;

      const productsMap: Record<string, Product> = {};
      productsData?.forEach((p: Product) => (productsMap[p.id] = p));

      // Group by date
      const grouped: Record<string, UsageLog[]> = {};
      logsData?.forEach((log: UsageLog) => {
        if (!grouped[log.used_at]) grouped[log.used_at] = [];
        grouped[log.used_at].push(log);
      });

      const diaryEntries: DiaryEntry[] = Object.entries(grouped)
        .map(([date, logs]) => ({
          date,
          logs,
          products: productsMap,
        }))
        .sort((a, b) => b.date.localeCompare(a.date));

      setEntries(diaryEntries);
    } catch (err: any) {
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("zh-TW", {
      weekday: "short",
      month: "numeric",
      day: "numeric",
    });
  };

  const getUsageDaysCount = () => {
    return entries.filter((e) => e.logs.length > 0).length;
  };

  const getCalendarDays = () => {
    const [year, month] = selectedMonth.split("-").map(Number);
    const firstDay = new Date(year, month - 1, 1).getDay();
    const daysInMonth = new Date(year, month, 0).getDate();
    const days: (number | null)[] = [];

    // Padding for first week
    for (let i = 0; i < firstDay; i++) days.push(null);
    // Days of month
    for (let i = 1; i <= daysInMonth; i++) days.push(i);
    return days;
  };

  const isDateHasLogs = (day: number) => {
    const dateStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
    return entries.some((e) => e.date === dateStr && e.logs.length > 0);
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
        <p className="text-gray-600">請先登入以查看護膚日記</p>
      </div>
    );
  }

  const calendarDays = getCalendarDays();

  return (
    <div className="space-y-6">
      {/* Controls */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Month Selector */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const [y, m] = selectedMonth.split("-").map(Number);
              const newDate = new Date(y, m - 2, 1);
              setSelectedMonth(
                `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`
              );
            }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium min-w-[80px] text-center">
            {new Date(selectedMonth + "-01").toLocaleDateString("zh-TW", {
              year: "numeric",
              month: "long",
            })}
          </span>
          <button
            onClick={() => {
              const now = new Date();
              const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
              if (selectedMonth < currentMonth) {
                const [y, m] = selectedMonth.split("-").map(Number);
                const newDate = new Date(y, m, 1);
                setSelectedMonth(
                  `${newDate.getFullYear()}-${String(newDate.getMonth() + 1).padStart(2, "0")}`
                );
              }
            }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
        </div>

        {/* View Toggle */}
        <div className="flex rounded-lg border border-gray-200">
          <button
            onClick={() => setViewMode("list")}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-l-lg transition-colors",
              viewMode === "list"
                ? "bg-skin-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            列表
          </button>
          <button
            onClick={() => setViewMode("calendar")}
            className={clsx(
              "px-3 py-1.5 text-sm font-medium rounded-r-lg transition-colors",
              viewMode === "calendar"
                ? "bg-skin-600 text-white"
                : "text-gray-600 hover:bg-gray-50"
            )}
          >
            日曆
          </button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3">
        <div className="rounded-xl bg-skin-50 p-4 text-center">
          <p className="text-2xl font-bold text-skin-600">{entries.length}</p>
          <p className="text-xs text-gray-500">記錄天數</p>
        </div>
        <div className="rounded-xl bg-skin-50 p-4 text-center">
          <p className="text-2xl font-bold text-skin-600">
            {entries.reduce((sum, e) => sum + e.logs.length, 0)}
          </p>
          <p className="text-xs text-gray-500">使用次數</p>
        </div>
        <div className="rounded-xl bg-skin-50 p-4 text-center col-span-2 sm:col-span-1">
          <p className="text-2xl font-bold text-skin-600">{getUsageDaysCount()}</p>
          <p className="text-xs text-gray-500">活躍天數</p>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">{error}</div>
      )}

      {/* Calendar View */}
      {viewMode === "calendar" && (
        <div className="rounded-xl border border-gray-200 p-4">
          {/* Weekday Headers */}
          <div className="grid grid-cols-7 gap-1 mb-2">
            {["日", "一", "二", "三", "四", "五", "六"].map((d) => (
              <div key={d} className="text-center text-xs font-medium text-gray-500 py-1">
                {d}
              </div>
            ))}
          </div>
          {/* Days */}
          <div className="grid grid-cols-7 gap-1">
            {calendarDays.map((day, idx) => {
              if (day === null) return <div key={idx} />;
              const hasLogs = isDateHasLogs(day);
              const dayStr = `${selectedMonth}-${String(day).padStart(2, "0")}`;
              const entry = entries.find((e) => e.date === dayStr);
              const today = new Date().toISOString().split("T")[0];
              const isToday = dayStr === today;

              return (
                <div
                  key={idx}
                  className={clsx(
                    "aspect-square flex flex-col items-center justify-center rounded-lg text-sm",
                    hasLogs
                      ? "bg-skin-100 text-skin-700 font-medium"
                      : "text-gray-600",
                    isToday && "ring-2 ring-skin-500"
                  )}
                >
                  <span>{day}</span>
                  {hasLogs && entry && (
                    <span className="w-1.5 h-1.5 rounded-full bg-skin-500 mt-0.5" />
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* List View */}
      {viewMode === "list" && (
        <div className="space-y-4">
          {entries.length === 0 ? (
            <div className="rounded-xl bg-skin-50 p-8 text-center">
              <p className="text-4xl mb-4">📅</p>
              <p className="text-gray-600">這個月還沒有記錄</p>
              <p className="text-sm text-gray-400 mt-2">使用 Usage Logger 開始記錄吧</p>
            </div>
          ) : (
            entries.map((entry) => (
              <div
                key={entry.date}
                className="rounded-xl border border-gray-200 bg-white overflow-hidden"
              >
                <div className="px-4 py-3 bg-skin-50 border-b border-gray-200">
                  <p className="font-medium text-skin-700">{formatDate(entry.date)}</p>
                </div>
                <div className="p-4">
                  <div className="flex flex-wrap gap-2">
                    {entry.logs.map((log) => {
                      const product = entry.products[log.product_id];
                      if (!product) return null;
                      return (
                        <div
                          key={log.id}
                          className="inline-flex items-center gap-1.5 rounded-full bg-skin-100 px-3 py-1 text-sm text-skin-700"
                        >
                          <span>{PRODUCT_TYPE_LABELS[product.type as ProductType]}</span>
                          <span className="font-medium">{product.name}</span>
                          {log.routine_time && (
                            <span className="text-xs text-skin-500">
                              ({ROUTINE_TIME_LABELS[log.routine_time as RoutineTime]})
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
