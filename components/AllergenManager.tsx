"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface Allergen {
  id: string;
  user_id: string;
  allergen: string;
  created_at: string;
}

export default function AllergenManager() {
  const [allergens, setAllergens] = useState<Allergen[]>([]);
  const [loading, setLoading] = useState(true);
  const [newAllergen, setNewAllergen] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchAllergens();
  }, []);

  const fetchAllergens = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("user_allergens")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setAllergens(data);
    }
    setLoading(false);
  };

  const addAllergen = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAllergen.trim() || adding) return;

    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAdding(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("user_allergens")
      .insert({ user_id: user.id, allergen: newAllergen.trim() })
      .select()
      .single();

    if (!error && data) {
      setAllergens([data, ...allergens]);
      setNewAllergen("");
    }
    setAdding(false);
  };

  const removeAllergen = async (id: string) => {
    const { error } = await (supabase as any)
      .from("user_allergens")
      .delete()
      .eq("id", id);

    if (!error) {
      setAllergens(allergens.filter((a) => a.id !== id));
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">⚠️ 過敏成分管理</h3>
        <p className="text-sm text-gray-500">記錄您使用後會過敏的成分，分析產品時會提醒您</p>
      </div>

      {/* Add Form */}
      <form onSubmit={addAllergen} className="mb-4 flex gap-2">
        <input
          type="text"
          value={newAllergen}
          onChange={(e) => setNewAllergen(e.target.value)}
          placeholder="例如：酒精、香料、苯氧乙醇..."
          className="flex-1 rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skin-500"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={!newAllergen.trim() || adding}
          className="rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skin-700 disabled:opacity-50"
        >
          {adding ? "添加中..." : "添加"}
        </button>
      </form>

      {/* Allergen List */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-4">載入中...</div>
      ) : allergens.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-4">
          還沒有記錄過敏成分
        </div>
      ) : (
        <div className="flex flex-wrap gap-2">
          {allergens.map((allergen) => (
            <span
              key={allergen.id}
              className="inline-flex items-center gap-1 rounded-full bg-red-50 px-3 py-1.5 text-sm text-red-700 border border-red-100"
            >
              {allergen.allergen}
              <button
                onClick={() => removeAllergen(allergen.id)}
                className="ml-1 rounded-full p-0.5 hover:bg-red-100 transition-colors"
                aria-label="移除"
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </span>
          ))}
        </div>
      )}
    </div>
  );
}
