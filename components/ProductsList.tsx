"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import { ProductType, PRODUCT_TYPE_LABELS } from "@/supabase/types";
import clsx from "clsx";
import ProductForm from "./ProductForm";

interface SkincareProduct {
  id: string;
  name: string;
  type: string;
  brand: string | null;
  notes: string | null;
  created_at: string;
}

interface AnalysisRecord {
  id: string;
  created_at: string;
  concerns: string[] | null;
  skin_type: string | null;
}

interface ProductEffectiveness {
  productId: string;
  usageDays: number;
  status: "improving" | "stable" | "needs_attention" | "unknown";
  statusText: string;
  linkedAnalyses: number;
}

const productTypeIcons: Record<ProductType, string> = {
  cleanser: "🧴",
  toner: "💧",
  serum: "✨",
  moisturizer: "🧴",
  sunscreen: "☀️",
  mask: "📦",
  other: "💊",
};

export default function ProductsList() {
  const { user, loading: authLoading } = useAuth();
  const supabase = createClient();
  const [products, setProducts] = useState<SkincareProduct[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showForm, setShowForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState<SkincareProduct | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);
  const [productEffects, setProductEffects] = useState<Record<string, ProductEffectiveness>>({});

  useEffect(() => {
    if (!user) {
      setLoading(false);
      return;
    }
    fetchProducts();
    fetchProductEffectiveness();
  }, [user]);

  const fetchProducts = async () => {
    if (!user) return;

    try {
      const { data, error: fetchError } = await (supabase as any)
        .from("skincare_products")
        .select("*")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false });

      if (fetchError) throw fetchError;
      setProducts(data || []);
    } catch (err: any) {
      setError(err.message || "載入失敗");
    } finally {
      setLoading(false);
    }
  };

  const fetchProductEffectiveness = async () => {
    if (!user) return;

    try {
      // Get all analyses for this user
      const { data: analyses } = await (supabase as any)
        .from("analysis_history")
        .select("id, created_at, concerns, skin_type")
        .eq("user_id", user.id)
        .order("created_at", { ascending: true });

      if (!analyses || analyses.length === 0) return;

      // Get product links
      const analysisIds = analyses.map((a: AnalysisRecord) => a.id);
      const { data: links } = await (supabase as any)
        .from("analysis_product_links")
        .select("product_id, analysis_id")
        .in("analysis_id", analysisIds);

      if (!links) return;

      // Calculate effectiveness for each product
      const effects: Record<string, ProductEffectiveness> = {};
      
      for (const product of products) {
        const productLinks = links.filter((l: any) => l.product_id === product.id);
        const linkedAnalysisIds = productLinks.map((l: any) => l.analysis_id);
        const linkedAnalyses = analyses.filter((a: AnalysisRecord) => 
          linkedAnalysisIds.includes(a.id)
        );

        if (linkedAnalyses.length === 0) {
          effects[product.id] = {
            productId: product.id,
            usageDays: 0,
            status: "unknown",
            statusText: "尚無關聯分析",
            linkedAnalyses: 0,
          };
          continue;
        }

        // Calculate usage days
        const firstAnalysis = linkedAnalyses[0];
        const lastAnalysis = linkedAnalyses[linkedAnalyses.length - 1];
        const firstDate = new Date(firstAnalysis.created_at);
        const lastDate = new Date(lastAnalysis.created_at);
        const usageDays = Math.ceil((lastDate.getTime() - firstDate.getTime()) / (1000 * 60 * 60 * 24));

        // Compare concerns to determine effectiveness
        const firstConcerns = firstAnalysis.concerns || [];
        const lastConcerns = lastAnalysis.concerns || [];
        
        let status: "improving" | "stable" | "needs_attention" | "unknown" = "unknown";
        let statusText = "尚無足夠數據";

        if (linkedAnalyses.length >= 2) {
          const improvedCount = firstConcerns.filter((c: string) => !lastConcerns.includes(c)).length;
          const newConcerns = lastConcerns.filter((c: string) => !firstConcerns.includes(c)).length;
          
          if (improvedCount > newConcerns && improvedCount > 0) {
            status = "improving";
            statusText = `✅ ${improvedCount} 個問題改善了`;
          } else if (newConcerns > improvedCount) {
            status = "needs_attention";
            statusText = `⚠️ ${newConcerns} 個新問題出現`;
          } else {
            status = "stable";
            statusText = "皮膚狀況穩定";
          }
        }

        effects[product.id] = {
          productId: product.id,
          usageDays,
          status,
          statusText,
          linkedAnalyses: linkedAnalyses.length,
        };
      }

      setProductEffects(effects);
    } catch (err) {
      console.error("Failed to fetch product effectiveness:", err);
    }
  };

  const handleDelete = async (id: string) => {
    if (!user) return;

    try {
      const { error: deleteError } = await (supabase as any)
        .from("skincare_products")
        .delete()
        .eq("id", id)
        .eq("user_id", user.id);

      if (deleteError) throw deleteError;
      setProducts(products.filter((p) => p.id !== id));
      setDeleteConfirm(null);
    } catch (err: any) {
      setError(err.message || "刪除失敗");
    }
  };

  const handleFormSuccess = () => {
    setShowForm(false);
    setEditingProduct(null);
    fetchProducts();
    fetchProductEffectiveness();
  };

  const groupedProducts = products.reduce((acc, product) => {
    const type = product.type as ProductType;
    if (!acc[type]) acc[type] = [];
    acc[type].push(product);
    return acc;
  }, {} as Record<ProductType, SkincareProduct[]>);

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
        <p className="text-gray-600">請先登入以管理護膚品</p>
      </div>
    );
  }

  if (showForm || editingProduct) {
    return (
      <div className="max-w-md mx-auto">
        <div className="rounded-xl bg-white border p-6">
          <h3 className="text-lg font-bold mb-4">
            {editingProduct ? "編輯產品" : "新增產品"}
          </h3>
          <ProductForm
            product={editingProduct as any}
            onSuccess={handleFormSuccess}
            onCancel={() => {
              setShowForm(false);
              setEditingProduct(null);
            }}
          />
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Add Button */}
      <div className="flex justify-end">
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 rounded-lg bg-skin-600 px-4 py-2 text-sm font-medium text-white hover:bg-skin-700 transition-colors"
        >
          <span>+</span> 新增產品
        </button>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
          {error}
        </div>
      )}

      {/* Empty State */}
      {products.length === 0 && (
        <div className="rounded-xl bg-skin-50 p-8 text-center">
          <p className="text-4xl mb-4">🧴</p>
          <p className="text-gray-600">尚無護膚品</p>
          <p className="text-sm text-gray-400 mt-2">點擊上方按鈕新增第一個產品</p>
        </div>
      )}

      {/* Products by Type */}
      {Object.entries(groupedProducts).map(([type, typeProducts]) => (
        <div key={type} className="space-y-3">
          <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wide flex items-center gap-2">
            <span>{productTypeIcons[type as ProductType]}</span>
            {PRODUCT_TYPE_LABELS[type as ProductType]}
          </h3>
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3">
            {typeProducts.map((product) => {
              const effect = productEffects[product.id];
              
              return (
                <div
                  key={product.id}
                  className="rounded-xl border border-gray-200 bg-white p-4 hover:border-skin-300 hover:shadow-sm transition-all"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className="font-medium text-gray-900 truncate">{product.name}</h4>
                      {product.brand && (
                        <p className="text-sm text-gray-500 truncate">{product.brand}</p>
                      )}
                      {product.notes && (
                        <p className="text-sm text-gray-400 mt-2 line-clamp-2">{product.notes}</p>
                      )}
                      
                      {/* Effectiveness Status */}
                      {effect && effect.status !== "unknown" && (
                        <div className="mt-3 pt-3 border-t border-gray-100">
                          <div className={clsx(
                            "text-sm",
                            effect.status === "improving" && "text-green-600",
                            effect.status === "stable" && "text-gray-600",
                            effect.status === "needs_attention" && "text-amber-600"
                          )}>
                            <span>{effect.statusText}</span>
                          </div>
                          {effect.usageDays > 0 && (
                            <span className="text-xs text-gray-400 mt-1 block">
                              使用 {effect.usageDays} 天
                            </span>
                          )}
                        </div>
                      )}
                      
                      {/* Usage Duration */}
                      {effect && effect.usageDays > 0 && (
                        <div className="mt-2 text-xs text-gray-400">
                          已關聯 {effect.linkedAnalyses} 次分析
                        </div>
                      )}
                    </div>
                    <div className="flex gap-1">
                      <button
                        onClick={() => setEditingProduct(product)}
                        className="p-2 text-gray-400 hover:text-skin-600 rounded-lg hover:bg-skin-50 transition-colors"
                        title="編輯"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => setDeleteConfirm(product.id)}
                        className="p-2 text-gray-400 hover:text-red-600 rounded-lg hover:bg-red-50 transition-colors"
                        title="刪除"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    </div>
                  </div>

                  {/* Delete Confirmation */}
                  {deleteConfirm === product.id && (
                    <div className="mt-3 pt-3 border-t border-gray-100">
                      <p className="text-sm text-gray-600 mb-2">確定要刪除嗎？</p>
                      <div className="flex gap-2">
                        <button
                          onClick={() => setDeleteConfirm(null)}
                          className="flex-1 rounded-lg border border-gray-200 py-1.5 text-sm font-medium text-gray-600 hover:bg-gray-50"
                        >
                          取消
                        </button>
                        <button
                          onClick={() => handleDelete(product.id)}
                          className="flex-1 rounded-lg bg-red-600 py-1.5 text-sm font-medium text-white hover:bg-red-700"
                        >
                          刪除
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}
