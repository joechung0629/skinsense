# SkinSense - AI 智能皮膚分析 Web

使用 Next.js 14 + Supabase + Gemini AI 建立的皮膚分析平台。

## 🚀 快速開始

### 1. 安裝依賴

```bash
npm install
```

### 2. 設定環境變量

```bash
cp .env.local.example .env.local
```

編輯 `.env.local` 填入以下變量：

- `NEXT_PUBLIC_SUPABASE_URL` - Supabase 專案 URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Anonymous Key
- `GEMINI_API_KEY` - Google Gemini API Key

### 3. 啟動開發伺服器

```bash
npm run dev
```

打開 [http://localhost:3000](http://localhost:3000)

### 4. 設置 Supabase 數據庫

在 Supabase Dashboard → SQL Editor 運行 `supabase/schema.sql`，或自行執行以下 SQL：

```sql
-- 詳細的 schema 請參考 supabase/schema.sql
-- 包含 analysis_history、skincare_products、product_usage_logs 表格
```

## 📁 專案結構

```
skinsense-web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 首頁
│   ├── analyzer/           # 分析工具頁
│   ├── products/           # 護膚品管理頁
│   ├── history/            # 分析歷史頁
│   ├── blog/               # 部落格
│   └── api/                # API Routes
├── components/             # React 組件
│   ├── ProductsList.tsx   # 護膚品列表
│   ├── ProductForm.tsx    # 產品表單（新增/編輯）
│   ├── UsageLogger.tsx     # 使用記錄器
│   ├── SkincareDiary.tsx   # 護膚日記
│   ├── HistoryList.tsx    # 歷史記錄列表
│   └── Header.tsx          # 頁面導航
├── lib/                    # 工具函數
│   ├── supabase.ts        # Supabase 客戶端
│   ├── ai.ts              # Gemini AI 整合
│   └── types.ts           # TypeScript 類型
├── supabase/               # Supabase Schema
│   ├── schema.sql         # 數據庫 schema
│   └── types.ts           # Supabase 生成的類型
└── public/                 # 靜態資源
```

## 🛠️ 技術棧

- **Framework**: Next.js 14 (App Router)
- **Styling**: Tailwind CSS
- **Database**: Supabase
- **AI**: Google Gemini
- **Language**: TypeScript

## 📝 主要功能

- [x] AI 皮膚分析（基於 Gemini）
- [x] JSON-LD 結構化數據
- [x] SEO 優化（Meta、OG、Twitter）
- [x] 響應式設計
- [x] 用戶認證（Google/Apple）
- [x] 分析歷史記錄
- [x] 護膚品管理（新增/編輯/刪除）
- [x] 使用記錄（按日期記錄使用產品）
- [x] 護膚日記（日曆視圖 + 列表視圖）
- [ ] Sitemap 生成

## 🔧 開發腳本

```bash
npm run dev      # 開發模式
npm run build    # 建構生產版本
npm run start    # 啟動生產伺服器
npm run lint     # 程式碼檢查
```

## 📄 License

MIT
