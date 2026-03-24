"use client";

import { useState, useEffect } from "react";
import clsx from "clsx";
import { createClient } from "@/lib/supabase";
import { useAuth } from "@/app/providers/AuthProvider";
import Link from "next/link";

const EDGE_FUNCTION_URL = "https://gsvkuzusfnieblzcsvcs.supabase.co/functions/v1/analyze-skin";

interface SkincareProduct {
  id: string;
  name: string;
  type: string;
  brand: string | null;
}

export default function AnalyzeForm() {
  const { user, userProfile, refreshProfile } = useAuth();
  const supabase = createClient();
  const [image, setImage] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [analysisId, setAnalysisId] = useState<string | null>(null);
  
  // User profile - Skin status questionnaire
  const [skinTypeSelf, setSkinTypeSelf] = useState<"oily" | "dry" | "combination" | "normal" | "sensitive" | "unsure" | "">("");
  const [tZoneOiliness, setTZoneOiliness] = useState<"oily" | "normal" | "dry" | "unsure" | "">("");
  const [poreSize, setPoreSize] = useState<"small" | "medium" | "large" | "unsure" | "">("");
  const [acneLevel, setAcneLevel] = useState<"none" | "few" | "moderate" | "severe" | "unsure" | "">("");
  const [sensitivity, setSensitivity] = useState<"low" | "medium" | "high" | "unsure" | "">("");
  const [hydration, setHydration] = useState<"oily" | "normal" | "dry" | "unsure" | "">("");
  
  // Additional context
  const [gender, setGender] = useState<"male" | "female" | "">("");
  const [age, setAge] = useState<"18-25" | "26-35" | "36-45" | "45+" | "">("");
  const [climate, setClimate] = useState<"tropical" | "dry" | "moderate" | "cold" | "">("");
  const [isTraveling, setIsTraveling] = useState(false);
  const [travelClimate, setTravelClimate] = useState<"tropical" | "dry" | "cold" | "island" | "">("");
  const [goal, setGoal] = useState<"oil_control" | "whitening" | "anti_aging" | "acne" | "moisturizing" | "">("");
  const [skinHistory, setSkinHistory] = useState("");

  // Auto-fill from saved profile when user logs in or profile loads
  useEffect(() => {
    if (user && userProfile) {
      // Only auto-fill if user hasn't modified the form yet
      // (i.e., all fields are still empty from initial state)
      if (!skinTypeSelf && userProfile.skin_type_self) {
        setSkinTypeSelf(userProfile.skin_type_self as any);
      }
      if (!tZoneOiliness && userProfile.t_zone_oiliness) {
        setTZoneOiliness(userProfile.t_zone_oiliness as any);
      }
      if (!poreSize && userProfile.pore_size) {
        setPoreSize(userProfile.pore_size as any);
      }
      if (!acneLevel && userProfile.acne_level) {
        setAcneLevel(userProfile.acne_level as any);
      }
      if (!sensitivity && userProfile.sensitivity) {
        setSensitivity(userProfile.sensitivity as any);
      }
      if (!hydration && userProfile.hydration) {
        setHydration(userProfile.hydration as any);
      }
      if (!gender && userProfile.gender) {
        setGender(userProfile.gender as any);
      }
      if (!age && userProfile.age) {
        setAge(userProfile.age as any);
      }
      if (!climate && userProfile.climate) {
        setClimate(userProfile.climate as any);
      }
      if (!isTraveling && userProfile.is_traveling !== undefined) {
        setIsTraveling(userProfile.is_traveling);
      }
      if (!travelClimate && userProfile.travel_climate) {
        setTravelClimate(userProfile.travel_climate as any);
      }
      if (!goal && userProfile.goal) {
        setGoal(userProfile.goal as any);
      }
      if (!skinHistory && userProfile.skin_history) {
        setSkinHistory(userProfile.skin_history);
      }
    }
  }, [user, userProfile]);

  // Product selection after analysis
  const [userProducts, setUserProducts] = useState<SkincareProduct[]>([]);
  const [selectedProductIds, setSelectedProductIds] = useState<string[]>([]);
  const [showProductSelector, setShowProductSelector] = useState(false);
  const [savingProducts, setSavingProducts] = useState(false);
  const [productsSaved, setProductsSaved] = useState(false);

  // Fetch user's products for selection
  useEffect(() => {
    if (user && showProductSelector && userProducts.length === 0) {
      fetchUserProducts();
    }
  }, [user, showProductSelector]);

  const fetchUserProducts = async () => {
    if (!user) return;
    try {
      const { data } = await (supabase as any)
        .from("skincare_products")
        .select("id, name, type, brand")
        .eq("user_id", user.id);
      setUserProducts(data || []);
    } catch (err) {
      console.error("Failed to fetch products:", err);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImage(file);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(file);
      setError(null);
    }
  };

  const compressImage = async (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
          const canvas = document.createElement('canvas');
          let width = img.width;
          let height = img.height;
          
          const maxDim = 800;
          if (width > maxDim || height > maxDim) {
            if (width > height) {
              height = (height / width) * maxDim;
              width = maxDim;
            } else {
              width = (width / height) * maxDim;
              height = maxDim;
            }
          }
          
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d')!;
          ctx.drawImage(img, 0, 0, width, height);
          
          const compressed = canvas.toDataURL('image/jpeg', 0.7);
          const base64 = compressed.includes(",") ? compressed.split(",")[1] : compressed;
          resolve(base64);
        };
        img.onerror = reject;
        img.src = e.target?.result as string;
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!image) {
      setError("請上傳圖片");
      return;
    }

    setLoading(true);
    setError(null);
    
    try {
      const base64 = await compressImage(image);
      
      const response = await fetch(EDGE_FUNCTION_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`
        },
        body: JSON.stringify({
          imageBase64: base64,
          // Questionnaire answers
          skinTypeSelf,
          tZoneOiliness,
          poreSize,
          acneLevel,
          sensitivity,
          hydration,
          // Additional context
          gender,
          age,
          climate,
          isTraveling,
          travelClimate,
          goal,
          skinHistory: skinHistory || undefined
        }),
      });

      const data = await response.json();
      
      if (data.error) {
        setError(data.error);
      } else {
        setResult(data);
        setShowProductSelector(false);
        setProductsSaved(false);
        setSelectedProductIds([]);

        // Save to history if user is logged in
        if (user) {
          try {
            const { data: insertData, error: insertErr } = await supabase
              .from("analysis_history")
              .insert({
                user_id: user.id,
                skin_type: data.skinType,
                ai_observation: data.aiObservation || null,
                goal_conflict: data.goalConflict || null,
                concerns: data.concerns || [],
                routine: data.routine || { morning: [], evening: [] },
                ingredients: data.ingredients || [],
                questionnaire: {
                  skinTypeSelf,
                  tZoneOiliness,
                  poreSize,
                  acneLevel,
                  sensitivity,
                  hydration,
                  gender,
                  age,
                  climate,
                  isTraveling,
                  travelClimate,
                  goal,
                  skinHistory,
                },
              } as any)
              .select("id")
              .single();

            if (!insertErr && insertData) {
              setAnalysisId((insertData as any).id);
              // Show product selector after analysis
              setShowProductSelector(true);
              // Save questionnaire answers to user profile for next time
              await saveUserProfile();
            }
          } catch (saveErr) {
            // Silent fail - don't interrupt user experience
            console.error("Failed to save history:", saveErr);
          }
        }
      }
    } catch (err: any) {
      setError(err.message || "網絡錯誤，請稍後再試");
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const saveUserProfile = async () => {
    if (!user) return;
    
    const profileData = {
      user_id: user.id,
      skin_type_self: skinTypeSelf || null,
      t_zone_oiliness: tZoneOiliness || null,
      pore_size: poreSize || null,
      acne_level: acneLevel || null,
      sensitivity: sensitivity || null,
      hydration: hydration || null,
      gender: gender || null,
      age: age || null,
      climate: climate || null,
      is_traveling: isTraveling || false,
      travel_climate: travelClimate || null,
      goal: goal || null,
      skin_history: skinHistory || null,
    };

    try {
      // Upsert: insert or update
      await (supabase as any)
        .from("user_profiles")
        .upsert(profileData, { onConflict: "user_id" });
      
      // Refresh the profile in AuthProvider
      await refreshProfile();
    } catch (err) {
      console.error("Failed to save user profile:", err);
    }
  };

  const handleProductToggle = (productId: string) => {
    setSelectedProductIds(prev =>
      prev.includes(productId)
        ? prev.filter(id => id !== productId)
        : [...prev, productId]
    );
  };

  const saveProductLinks = async () => {
    if (!analysisId || selectedProductIds.length === 0) return;
    
    setSavingProducts(true);
    try {
      const links = selectedProductIds.map(productId => ({
        analysis_id: analysisId,
        product_id: productId,
      }));
      
      await (supabase as any)
        .from("analysis_product_links")
        .insert(links);
      
      setProductsSaved(true);
      setShowProductSelector(false);
    } catch (err) {
      console.error("Failed to save product links:", err);
    } finally {
      setSavingProducts(false);
    }
  };

  const QuestionSelect = ({ 
    label, 
    value, 
    onChange, 
    options 
  }: { 
    label: string; 
    value: string; 
    onChange: (v: any) => void;
    options: { value: string; label: string }[];
  }) => (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full rounded-lg border border-gray-200 p-2.5 focus:border-skin-500 focus:outline-none"
      >
        <option value="">請選擇</option>
        {options.map(opt => (
          <option key={opt.value} value={opt.value}>{opt.label}</option>
        ))}
      </select>
    </div>
  );

  return (
    <div className="space-y-8">
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Image Upload */}
        <div className="rounded-xl border-2 border-dashed border-gray-200 p-8 text-center">
          <input
            type="file"
            accept="image/*"
            onChange={handleImageChange}
            className="hidden"
            id="image-upload"
          />
          
          {preview ? (
            <div className="space-y-4">
              <img
                src={preview}
                alt="Preview"
                className="mx-auto max-h-64 rounded-lg object-contain"
              />
              <label
                htmlFor="image-upload"
                className="cursor-pointer text-sm text-skin-600 hover:text-skin-700"
              >
                重新上傳
              </label>
            </div>
          ) : (
            <label
              htmlFor="image-upload"
              className="flex flex-col items-center gap-2 cursor-pointer text-gray-500"
            >
              <span className="text-4xl">📷</span>
              <span>點擊上傳皮膚照片</span>
              <span className="text-xs text-gray-400">
                請上傳臉部或頸部清晰照片
              </span>
            </label>
          )}
        </div>

        {/* Skin Status Questionnaire */}
        <div className="rounded-xl bg-skin-50 p-6 space-y-5">
          <h3 className="text-lg font-bold">📋 皮膚狀態問卷（主要）</h3>
          <p className="text-sm text-gray-600">請根據你平時的感受選擇，如果不清楚可以選擇「不清楚」</p>
          
          <div className="grid gap-4 md:grid-cols-2">
            <QuestionSelect
              label="你覺得自己屬於什麼皮膚類型？"
              value={skinTypeSelf}
              onChange={setSkinTypeSelf}
              options={[
                { value: "oily", label: "油性皮膚" },
                { value: "dry", label: "乾性皮膚" },
                { value: "combination", label: "混合皮膚" },
                { value: "normal", label: "正常皮膚" },
                { value: "sensitive", label: "敏感肌" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="T 字位（額頭和鼻子）的油脂情況？"
              value={tZoneOiliness}
              onChange={setTZoneOiliness}
              options={[
                { value: "oily", label: "很油" },
                { value: "normal", label: "正常" },
                { value: "dry", label: "乾燥" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="你的毛孔大小？"
              value={poreSize}
              onChange={setPoreSize}
              options={[
                { value: "small", label: "細小" },
                { value: "medium", label: "中等" },
                { value: "large", label: "粗大" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="長痘情況？"
              value={acneLevel}
              onChange={setAcneLevel}
              options={[
                { value: "none", label: "幾乎不長痘" },
                { value: "few", label: "偶爾長一兩粒" },
                { value: "moderate", label: "經常長痘" },
                { value: "severe", label: "嚴重痘痘問題" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="皮膚敏感程度？"
              value={sensitivity}
              onChange={setSensitivity}
              options={[
                { value: "low", label: "不太敏感" },
                { value: "medium", label: "適中" },
                { value: "high", label: "很容易過敏/泛紅" },
                { value: "unsure", label: "不清楚" },
              ]}
            />

            <QuestionSelect
              label="你的皮膚缺水情況？"
              value={hydration}
              onChange={setHydration}
              options={[
                { value: "oily", label: "外油內乾" },
                { value: "normal", label: "水油平衡" },
                { value: "dry", label: "乾燥脫皮" },
                { value: "unsure", label: "不清楚" },
              ]}
            />
          </div>
        </div>

        {/* Additional Context */}
        <div className="rounded-xl bg-skin-50 p-6 space-y-4">
          <h3 className="text-lg font-bold">👤 基本資料（輔助參考）</h3>
          
          <div className="grid gap-4 md:grid-cols-2">
            <QuestionSelect
              label="性別"
              value={gender}
              onChange={setGender}
              options={[
                { value: "male", label: "男" },
                { value: "female", label: "女" },
              ]}
            />

            <QuestionSelect
              label="年齡"
              value={age}
              onChange={setAge}
              options={[
                { value: "18-25", label: "18-25 歲" },
                { value: "26-35", label: "26-35 歲" },
                { value: "36-45", label: "36-45 歲" },
                { value: "45+", label: "45 歲以上" },
              ]}
            />

            <QuestionSelect
              label="居住氣候"
              value={climate}
              onChange={setClimate}
              options={[
                { value: "tropical", label: "熱帶/亞熱帶" },
                { value: "dry", label: "乾燥" },
                { value: "moderate", label: "溫和" },
                { value: "cold", label: "寒冷" },
              ]}
            />

            <QuestionSelect
              label="主要目標"
              value={goal}
              onChange={setGoal}
              options={[
                { value: "oil_control", label: "控油" },
                { value: "whitening", label: "美白" },
                { value: "anti_aging", label: "抗老" },
                { value: "acne", label: "祛痘" },
                { value: "moisturizing", label: "保濕" },
              ]}
            />
          </div>

          <div>
            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={isTraveling}
                onChange={(e) => setIsTraveling(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-skin-500 focus:ring-skin-500"
              />
              <span className="text-sm font-medium text-gray-700">我正在旅行</span>
            </label>
          </div>

          {isTraveling && (
            <QuestionSelect
              label="旅行目的地氣候"
              value={travelClimate}
              onChange={setTravelClimate}
              options={[
                { value: "tropical", label: "熱帶雨林" },
                { value: "dry", label: "乾燥地區" },
                { value: "cold", label: "寒冷地區" },
                { value: "island", label: "海島度假" },
              ]}
            />
          )}
        </div>

        {/* Skin History */}
        <div>
          <label className="mb-2 block text-sm font-medium text-gray-700">
            皮膚歷史 / 過敏史（選填）
          </label>
          <textarea
            value={skinHistory}
            onChange={(e) => setSkinHistory(e.target.value)}
            rows={2}
            placeholder="例如：對酒精過敏、用某產品爆痘..."
            className="w-full rounded-lg border border-gray-200 p-3 focus:border-skin-500 focus:outline-none focus:ring-2 focus:ring-skin-100"
          />
        </div>

        {/* Error */}
        {error && (
          <div className="rounded-lg bg-red-50 p-3 text-sm text-red-600">
            {error}
          </div>
        )}

        {/* Submit */}
        <button
          type="submit"
          disabled={loading || !image || !skinTypeSelf}
          className={clsx(
            "w-full rounded-lg py-3 font-medium text-white transition-colors",
            loading || !image || !skinTypeSelf
              ? "bg-gray-400 cursor-not-allowed"
              : "bg-skin-600 hover:bg-skin-700"
          )}
        >
          {loading ? "分析中..." : "開始分析"}
        </button>
      </form>

      {/* Result */}
      {result && (
        <div className="space-y-6">
          {/* Enhanced Goal Conflict Warning - TOP PRIORITY */}
          {result.goalConflict && (
            <div className="rounded-xl border-2 border-amber-400 bg-amber-50 p-6">
              <h3 className="text-lg font-bold text-amber-800 mb-2">
                ⚠️ 護膚目標與皮膚狀況衝突
              </h3>
              <p className="text-amber-700 mb-4">
                {result.goalConflict}
              </p>
              <div className="flex flex-wrap gap-3">
                <Link
                  href="/analyzer"
                  className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-medium text-white hover:bg-amber-600 transition-colors"
                >
                  調整目標
                </Link>
                <button
                  onClick={() => {
                    const warning = document.getElementById('goal-conflict-dismiss');
                    if (warning) warning.remove();
                  }}
                  className="text-amber-600 underline text-sm hover:text-amber-700"
                >
                  我知道了，繼續
                </button>
              </div>
            </div>
          )}

          {/* Score Card */}
          <div className="rounded-xl bg-gradient-to-br from-skin-500 to-skin-600 p-6 text-white">
            <div className="text-center">
              <div className="text-5xl font-bold mb-2">{result.score}</div>
              <div className="text-sm opacity-80">總評分</div>
            </div>
          </div>

          {/* Skin Type */}
          <div className="rounded-xl bg-skin-50 p-6">
            <h3 className="text-lg font-bold mb-2">🔍 皮膚類型</h3>
            <p className="text-2xl font-semibold text-skin-600">
              {result.skinType === 'oily' && '油性肌膚'}
              {result.skinType === 'dry' && '乾性肌膚'}
              {result.skinType === 'combination' && '混合肌膚'}
              {result.skinType === 'normal' && '正常肌膚'}
              {result.skinType === 'sensitive' && '敏感肌膚'}
            </p>
            {result.skinTypeConfidence && (
              <p className="text-sm text-gray-600 mt-1">
                AI 分析置信度：{result.skinTypeConfidence}%
              </p>
            )}
          </div>

          {/* Product Selection After Analysis */}
          {user && showProductSelector && (
            <div className="rounded-xl bg-white border border-skin-200 p-6">
              <h3 className="text-lg font-bold mb-2">🧴 我正在使用這些產品</h3>
              <p className="text-sm text-gray-600 mb-4">
                選擇你目前在用的產品，我們可以幫你追蹤效果
              </p>
              
              {userProducts.length > 0 ? (
                <>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {userProducts.map(product => (
                      <label
                        key={product.id}
                        className={clsx(
                          "flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-colors",
                          selectedProductIds.includes(product.id)
                            ? "border-skin-500 bg-skin-50"
                            : "border-gray-200 hover:border-skin-300"
                        )}
                      >
                        <input
                          type="checkbox"
                          checked={selectedProductIds.includes(product.id)}
                          onChange={() => handleProductToggle(product.id)}
                          className="w-4 h-4 rounded border-gray-300 text-skin-500 focus:ring-skin-500"
                        />
                        <div className="flex-1">
                          <p className="font-medium text-gray-900">{product.name}</p>
                          {product.brand && (
                            <p className="text-xs text-gray-500">{product.brand}</p>
                          )}
                        </div>
                      </label>
                    ))}
                  </div>
                  
                  {productsSaved ? (
                    <div className="mt-4 p-3 bg-green-50 text-green-700 rounded-lg text-sm">
                      ✓ 已儲存產品關聯
                    </div>
                  ) : (
                    <div className="mt-4 flex gap-3">
                      <button
                        onClick={saveProductLinks}
                        disabled={savingProducts || selectedProductIds.length === 0}
                        className={clsx(
                          "flex-1 rounded-lg py-2 text-sm font-medium transition-colors",
                          savingProducts || selectedProductIds.length === 0
                            ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                            : "bg-skin-600 text-white hover:bg-skin-700"
                        )}
                      >
                        {savingProducts ? "儲存中..." : "儲存並繼續"}
                      </button>
                      <button
                        onClick={() => setShowProductSelector(false)}
                        className="px-4 py-2 text-sm text-gray-600 hover:text-gray-800"
                      >
                        略過
                      </button>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-4">
                  <p className="text-gray-500 text-sm mb-3">還沒有添加任何產品</p>
                  <Link
                    href="/products"
                    className="text-skin-600 hover:text-skin-700 text-sm font-medium"
                  >
                    + 添加護膚品
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Concerns */}
          {result.concerns && result.concerns.length > 0 && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">⚠️ 肌膚問題</h3>
              <ul className="space-y-2">
                {result.concerns.map((c: string, i: number) => (
                  <li key={i} className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-skin-400"></span>
                    {c}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Routine - Morning */}
          {result.routine?.morning && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">☀️ 早間護理</h3>
              <ol className="space-y-3">
                {result.routine.morning.map((item: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skin-200 text-skin-700 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-skin-800">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Routine - Evening */}
          {result.routine?.evening && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">🌙 晚間護理</h3>
              <ol className="space-y-3">
                {result.routine.evening.map((item: any, i: number) => (
                  <li key={i} className="flex gap-3">
                    <span className="flex-shrink-0 w-6 h-6 rounded-full bg-skin-200 text-skin-700 text-sm font-bold flex items-center justify-center">
                      {i + 1}
                    </span>
                    <div>
                      <p className="font-medium text-skin-800">{item.product}</p>
                      <p className="text-sm text-gray-600">{item.purpose}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </div>
          )}

          {/* Ingredients */}
          {result.ingredients && result.ingredients.length > 0 && (
            <div className="rounded-xl bg-skin-50 p-6">
              <h3 className="text-lg font-bold mb-3">✨ 推薦成分</h3>
              <div className="space-y-3">
                {result.ingredients.map((item: any, i: number) => (
                  <div key={i} className="border-l-4 border-skin-400 pl-4">
                    <p className="font-medium text-skin-700">{item.ingredient}</p>
                    <p className="text-sm text-gray-600">{item.benefit}</p>
                    {item.concentration && (
                      <p className="text-xs text-skin-500 mt-1">建議濃度：{item.concentration}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
