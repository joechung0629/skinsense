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
CREATE TABLE IF NOT EXISTS analysis_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  skin_type TEXT,
  score INTEGER,
  ai_observation TEXT,
  goal_conflict TEXT,
  questionnaire JSONB,
  image_url TEXT,
  analysis_data JSONB
);

ALTER TABLE analysis_history ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see own history" ON analysis_history
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can insert own history" ON analysis_history
  FOR INSERT WITH CHECK (user_id = auth.uid());
```

## 📁 專案結構

```
skinsense-web/
├── app/                    # Next.js App Router
│   ├── layout.tsx          # 根佈局
│   ├── page.tsx            # 首頁
│   ├── analyzer/           # 分析工具頁
│   ├── history/            # 分析歷史頁
│   ├── blog/               # 部落格
│   └── api/                # API Routes
├── components/             # React 組件
│   ├── HistoryList.tsx    # 歷史記錄列表
│   └── ...
├── lib/                    # 工具函數
│   ├── supabase.ts        # Supabase 客戶端
│   ├── ai.ts              # Gemini AI 整合
│   └── types.ts           # TypeScript 類型
├── supabase/               # Supabase Schema
│   └── schema.sql         # 數據庫 schema
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
