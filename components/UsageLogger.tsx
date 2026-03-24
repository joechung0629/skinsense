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

interface UsageLoggerProps {
  embedded?: boolean;
  selectedDate?: string;
}

export default function UsageLogger({ embedded = false, selectedDate }: UsageLoggerProps) {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [products, setProducts] = useState<Product[]>([]);
  const [todayLogs, setTodayLogs] = useState<UsageLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [date, setDate] = useState(selectedDate || new Date().toISOString().split("T")[0]);
  const [routineTime, setRoutineTime] = useState<RoutineTime>("both");

  useEffect(() => {
    if (selectedDate) setDate(selectedDate);
  }, [selectedDate]);

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchData();
  }, [user, date]);

  const fetchData = async () => {
    if (!user) return;

    try {
      const [productsRes, logsRes] = await Promise.all([
        (supabase as any)
          .from("skincare_products")
          .select("id, name, type, brand")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false }),
        (supabase as any)
          .from("product_usage_logs")
          .select("id, product_id, used_at, routine_time")
          .eq("user_id", user.id)
          .eq("used_at", date)
      ]);

      if (productsRes.error) throw productsRes.error;
      if (logsRes.error) throw logsRes.error;

      setProducts(productsRes.data || []);
      setTodayLogs(logsRes.data || []);
    } catch (err: any) {
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  const toggleProduct = async (productId: string) => {
    if (!user) return;

    const existingLog = todayLogs.find((l) => l.product_id === productId);

    setSaving(true);
    setError(null);
    setSuccess(false);

    try {
      if (existingLog) {
        // Remove log
        const { error: deleteError } = await (supabase as any)
          .from("product_usage_logs")
          .delete()
          .eq("id", existingLog.id)
          .eq("user_id", user.id);

        if (deleteError) throw deleteError;
        setTodayLogs(todayLogs.filter((l) => l.id !== existingLog.id));
      } else {
        // Add log
        const { data, error: insertError } = await (supabase as any)
          .from("product_usage_logs")
          .insert({
            user_id: user.id,
            product_id: productId,
            used_at: date,
            routine_time: routineTime,
          })
          .select()
          .single();

        if (insertError) throw insertError;
        setTodayLogs([...todayLogs, data]);
      }
      setSuccess(true);
      setTimeout(() => setSuccess(false), 2000);
    } catch (err: any) {
      setError(err.message || "操作失敗");
    } finally {
      setSaving(false);
    }
  };

  const handleDateChange = (newDate: string) => {
    setDate(newDate);
  };

  if (authLoading || loading) {
    return (
      <div className="flex justify-center py-8">
        <div className="h-6 w-6 animate-spin rounded-full border-3 border-skin-200 border-t-skin-600"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="rounded-xl bg-skin-50 p-6 text-center">
        <p className="text-gray-600">請先登入以記錄使用</p>
      </div>
    );
  }

  const usedProductIds = new Set(todayLogs.map((l) => l.product_id));

  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type as ProductType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {} as Record<ProductType, Product[]>);

  const formatDateDisplay = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    if (d.getTime() === today.getTime()) return "今天";
    if (d.getTime() === yesterday.getTime()) return "昨天";
    return d.toLocaleDateString("zh-TW", { month: "long", day: "numeric" });
  };

  return (
    <div className="space-y-4">
      {/* Date Selector & Routine Time */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() - 1);
              handleDateChange(d.toISOString().split("T")[0]);
            }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>
          <span className="text-sm font-medium min-w-[60px] text-center">
            {formatDateDisplay(date)}
          </span>
          <button
            onClick={() => {
              const d = new Date(date);
              d.setDate(d.getDate() + 1);
              const today = new Date().toISOString().split("T")[0];
              if (d.toISOString().split("T")[0] <= today) {
                handleDateChange(d.toISOString().split("T")[0]);
              }
            }}
            className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>
          <input
            type="date"
            value={date}
            onChange={(e) => handleDateChange(e.target.value)}
            max={new Date().toISOString().split("T")[0]}
            className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
          />
        </div>

        <select
          value={routineTime}
          onChange={(e) => setRoutineTime(e.target.value as RoutineTime)}
          className="rounded-lg border border-gray-200 px-3 py-1.5 text-sm"
        >
          {Object.entries(ROUTINE_TIME_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Feedback */}
      {error && (
        <div className="rounded-lg bg-red-50 p-2 text-sm text-red-600">{error}</div>
      )}
      {success && !error && (
        <div className="rounded-lg bg-green-50 p-2 text-sm text-green-600">已更新</div>
      )}

      {/* Empty Products */}
      {products.length === 0 && (
        <div className="rounded-xl bg-skin-50 p-6 text-center">
          <p className="text-gray-600">尚無護膚品</p>
          <p className="text-sm text-gray-400 mt-1">請先新增產品</p>
        </div>
      )}

      {/* Products Grid */}
      <div className="grid gap-2 sm:grid-cols-2">
        {products.map((product) => {
          const isUsed = usedProductIds.has(product.id);
          return (
            <button
              key={product.id}
              onClick={() => toggleProduct(product.id)}
              disabled={saving}
              className={clsx(
                "flex items-center gap-3 rounded-lg border p-3 text-left transition-all",
                isUsed
                  ? "border-skin-500 bg-skin-50"
                  : "border-gray-200 bg-white hover:border-skin-300 hover:bg-skin-50/50",
                saving && "opacity-50 cursor-not-allowed"
              )}
            >
              <div
                className={clsx(
                  "flex-shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition-colors",
                  isUsed
                    ? "border-skin-500 bg-skin-500"
                    : "border-gray-300"
                )}
              >
                {isUsed && (
                  <svg className="w-3 h-3 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                  </svg>
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={clsx("font-medium truncate", isUsed ? "text-skin-700" : "text-gray-900")}>
                  {product.name}
                </p>
                {product.brand && (
                  <p className="text-xs text-gray-500 truncate">{product.brand}</p>
                )}
              </div>
              <span className="text-xs text-gray-400">
                {PRODUCT_TYPE_LABELS[product.type as ProductType]}
              </span>
            </button>
          );
        })}
      </div>

      {/* Summary */}
      {todayLogs.length > 0 && (
        <div className="rounded-lg bg-skin-50 p-3 text-center">
          <p className="text-sm text-skin-700">
            已記錄 {todayLogs.length} 項產品
          </p>
        </div>
      )}
    </div>
  );
}
