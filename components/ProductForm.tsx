"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import { ProductType, PRODUCT_TYPE_LABELS } from "@/supabase/types";
import clsx from "clsx";

interface ProductFormProps {
  product?: {
    id?: string;
    name: string;
    type: ProductType;
    brand?: string;
    notes?: string;
  };
  onSuccess: () => void;
  onCancel: () => void;
}

export default function ProductForm({ product, onSuccess, onCancel }: ProductFormProps) {
  const { user } = useAuth();
  const supabase = createClient();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [form, setForm] = useState({
    name: product?.name || "",
    type: product?.type || "cleanser" as ProductType,
    brand: product?.brand || "",
    notes: product?.notes || "",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !form.name.trim()) return;

    setLoading(true);
    setError(null);

    try {
      if (product?.id) {
        // Update existing
        const { error: updateError } = await (supabase as any)
          .from("skincare_products")
          .update({
            name: form.name.trim(),
            type: form.type,
            brand: form.brand.trim() || null,
            notes: form.notes.trim() || null,
          })
          .eq("id", product.id)
          .eq("user_id", user.id);

        if (updateError) throw updateError;
      } else {
        // Insert new
        const { error: insertError } = await (supabase as any)
          .from("skincare_products")
          .insert({
            user_id: user.id,
            name: form.name.trim(),
            type: form.type,
            brand: form.brand.trim() || null,
            notes: form.notes.trim() || null,
          });

        if (insertError) throw insertError;
      }

      onSuccess();
    } catch (err: any) {
      setError(err.message || "儲存失敗");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      {/* Product Name */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          產品名稱 <span className="text-red-500">*</span>
        </label>
        <input
          type="text"
          value={form.name}
          onChange={(e) => setForm({ ...form, name: e.target.value })}
          placeholder="例如：青春精華液"
          required
          className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
        />
      </div>

      {/* Product Type */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          產品類型 <span className="text-red-500">*</span>
        </label>
        <select
          value={form.type}
          onChange={(e) => setForm({ ...form, type: e.target.value as ProductType })}
          className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
        >
          {Object.entries(PRODUCT_TYPE_LABELS).map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      </div>

      {/* Brand */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          品牌（選填）
        </label>
        <input
          type="text"
          value={form.brand}
          onChange={(e) => setForm({ ...form, brand: e.target.value })}
          placeholder="例如：SK-II"
          className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
        />
      </div>

      {/* Notes */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          備註（選填）
        </label>
        <textarea
          value={form.notes}
          onChange={(e) => setForm({ ...form, notes: e.target.value })}
          placeholder="使用心得、成分注意事項等..."
          rows={2}
          className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
        />
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Actions */}
      <div className="flex gap-3 pt-2">
        <button
          type="button"
          onClick={onCancel}
          className="flex-1 rounded-lg border border-gray-200 py-2.5 font-medium text-gray-600 hover:bg-gray-50 transition-colors"
        >
          取消
        </button>
        <button
          type="submit"
          disabled={loading || !form.name.trim()}
          className={clsx(
            "flex-1 rounded-lg py-2.5 font-medium text-white transition-colors",
            loading || !form.name.trim()
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-skin-600 hover:bg-skin-700"
          )}
        >
          {loading ? "儲存中..." : product?.id ? "更新" : "新增"}
        </button>
      </div>
    </form>
  );
}
