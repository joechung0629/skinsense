"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase";

interface ProblematicProduct {
  id: string;
  user_id: string;
  product_name: string;
  reaction: string | null;
  notes: string | null;
  created_at: string;
}

export default function ProblematicProductsManager() {
  const [products, setProducts] = useState<ProblematicProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [productName, setProductName] = useState("");
  const [reaction, setReaction] = useState("");
  const [notes, setNotes] = useState("");
  const [adding, setAdding] = useState(false);
  const supabase = createClient();

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setLoading(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("problematic_products")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error && data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const addProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName.trim() || adding) return;

    setAdding(true);
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      setAdding(false);
      return;
    }

    const { data, error } = await (supabase as any)
      .from("problematic_products")
      .insert({ 
        user_id: user.id, 
        product_name: productName.trim(),
        reaction: reaction.trim() || null,
        notes: notes.trim() || null
      })
      .select()
      .single();

    if (!error && data) {
      setProducts([data, ...products]);
      setProductName("");
      setReaction("");
      setNotes("");
    }
    setAdding(false);
  };

  const removeProduct = async (id: string) => {
    const { error } = await (supabase as any)
      .from("problematic_products")
      .delete()
      .eq("id", id);

    if (!error) {
      setProducts(products.filter((p) => p.id !== id));
    }
  };

  return (
    <div className="rounded-xl border border-gray-200 bg-white p-6">
      <div className="mb-4">
        <h3 className="text-lg font-semibold text-gray-800">⚠️ 有問題的產品</h3>
        <p className="text-sm text-gray-500">記錄您使用後有不良反應的產品，分析新產品時會提醒您</p>
      </div>

      {/* Add Form */}
      <form onSubmit={addProduct} className="mb-4 space-y-2">
        <input
          type="text"
          value={productName}
          onChange={(e) => setProductName(e.target.value)}
          placeholder="產品名稱（例如：某品牌精華）"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skin-500"
          disabled={adding}
        />
        <input
          type="text"
          value={reaction}
          onChange={(e) => setReaction(e.target.value)}
          placeholder="用後反應（可選，例如：泛紅、爆痘、刺痛）"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skin-500"
          disabled={adding}
        />
        <input
          type="text"
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="備註（可選）"
          className="w-full rounded-lg border border-gray-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-skin-500"
          disabled={adding}
        />
        <button
          type="submit"
          disabled={!productName.trim() || adding}
          className="w-full rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-skin-700 disabled:opacity-50"
        >
          {adding ? "添加中..." : "添加產品"}
        </button>
      </form>

      {/* Product List */}
      {loading ? (
        <div className="text-center text-sm text-gray-500 py-4">載入中...</div>
      ) : products.length === 0 ? (
        <div className="text-center text-sm text-gray-400 py-4">
          還沒有記錄有問題的產品
        </div>
      ) : (
        <div className="space-y-2">
          {products.map((product) => (
            <div
              key={product.id}
              className="flex items-start justify-between rounded-lg border border-red-100 bg-red-50 p-3"
            >
              <div className="flex-1">
                <p className="font-medium text-red-800">{product.product_name}</p>
                {product.reaction && (
                  <p className="text-sm text-red-600 mt-0.5">反應：{product.reaction}</p>
                )}
                {product.notes && (
                  <p className="text-xs text-gray-500 mt-0.5">{product.notes}</p>
                )}
              </div>
              <button
                onClick={() => removeProduct(product.id)}
                className="ml-2 rounded-full p-1 text-red-400 hover:bg-red-100 transition-colors"
                aria-label="移除"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
