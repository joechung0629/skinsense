"use client";

import { useState } from "react";
import ProductsList from "@/components/ProductsList";
import UsageLogger from "@/components/UsageLogger";
import SkincareDiary from "@/components/SkincareDiary";
import ProblematicProductsManager from "@/components/ProblematicProductsManager";
import clsx from "clsx";

type TabId = "products" | "logger" | "diary" | "problematic";

const tabs: { id: TabId; label: string; icon: string }[] = [
  { id: "products", label: "我的產品", icon: "📦" },
  { id: "logger", label: "記錄使用", icon: "✏️" },
  { id: "diary", label: "護膚日記", icon: "📅" },
  { id: "problematic", label: "有問題的產品", icon: "⚠️" },
];

export default function ProductsPage() {
  const [activeTab, setActiveTab] = useState<TabId>("products");

  return (
    <div className="container mx-auto px-4 py-12">
      <header className="mb-8 text-center">
        <h1 className="mb-4 text-3xl font-bold">🧴 護膚品管理</h1>
        <p className="text-gray-600">
          管理您的護膚品，記錄使用情況，追蹤護膚日記
        </p>
      </header>

      {/* Tab Navigation */}
      <div className="mb-8 flex justify-center">
        <div className="inline-flex rounded-xl border border-gray-200 bg-white p-1">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={clsx(
                "flex items-center gap-2 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-skin-600 text-white shadow-sm"
                  : "text-gray-600 hover:bg-gray-100"
              )}
            >
              <span>{tab.icon}</span>
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Content Sections */}
      <div className="mx-auto max-w-4xl">
        {activeTab === "products" && <ProductsList />}
        {activeTab === "logger" && <UsageLogger embedded={true} />}
        {activeTab === "diary" && <SkincareDiary />}
        {activeTab === "allergens" && <AllergenManager />}
      </div>
    </div>
  );
}
