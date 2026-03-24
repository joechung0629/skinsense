# SkinSense PRD

## 1. Concept & Vision

**SkinSense** 是一個 AI 驅動的個人皮膚護理助理。透過問卷優先、AI 影像分析、用護膚品追蹤，幫助用戶了解自己的皮膚、追蹤護膚效果、建立更好的護膚習慣。

**核心理念：**
- 問卷是人類判斷，AI 是輔助參考
- 不需要昂貴的皮膚檢測設備
- 數據累積讓推薦越來越精準

---

## 2. Target Users

- 18-45 歲，對護膚有興趣但缺乏專業知識的人
- 希望系統性了解和管理皮膚狀況的人
- 想要追蹤護膚品效果的用戶

---

## 3. Features

### 3.1 已完成 ✅

#### AI 皮膚分析
- 用戶填寫 6 題皮膚狀態問卷
- 上傳臉部照片（可選）
- AI 分析並生成個人化護膚建議
- 人類皮膚驗證（防止上傳無關圖片）
- **目標衝突警告（加強版）**：更大的警告框，包含「調整目標」和「我知道了」按鈕
- **問卷自動帶入**：已登入用戶下次訪問時，問卷答案自動填入（可修改）

#### 用戶系統
- Google OAuth 登入
- 用戶認證透過 Supabase Auth

#### 歷史記錄
- 保存每次分析的完整結果
- 可展開查看詳細推薦（concerns、routine、ingredients）
- AI 觀察取代分數顯示
- **加強版目標衝突警告**：顯示在展開內容頂部，更醒目

#### 護膚品追蹤
- 添加/編輯/刪除護膚品
- 產品類型：潔面、爽膚水、精華、面霜、防曬、面膜、其他
- 記錄每日使用情況
- 護膚日記：日曆視圖 + 列表視圖

#### 護膚品效果關聯（新增）
- **分析-產品關聯**：用戶完成分析後可選擇「我正在使用這些產品」
- **使用時長顯示**：顯示產品已關聯使用的天數
- **效果狀態追蹤**：根據分析記錄對比 concerns 變化，顯示：
  - ✅ 改善中（皮膚問題解決數 > 新問題數）
  - ⚠️ 需要關注（新問題數 > 改善數）
  - 皮膚狀況穩定（無明顯變化）

### 3.2 規劃中 📋

#### 護膚品效果追蹤
- 關聯產品使用記錄與皮膚分析結果
- 顯示「使用某產品 X 天後，皮膚問題改善了」

#### 進度對比
- 與歷史分析對比
- 顯示趨勢（皮膚變好了/需要關注）

#### 定時提醒
- 定期提醒用戶回來分析
- 「距離上次分析已過 30 天」

#### 天氣/環境影響
- 根據用戶所在地天氣調整建議
- 分析氣候對皮膚的影響

#### 專業報告上傳
- 允許用戶上傳專業皮膚檢測報告
- 增強推薦準確度

---

## 4. User Flow

```
訪問網站
    ↓
Google 登入
    ↓
填寫皮膚問卷 + 上傳照片（可選）
    ↓
AI 分析 → 獲得護膚建議
    ↓
保存到歷史記錄
    ↓
添加護膚品
    ↓
記錄每日使用
    ↓
查看護膚日記，追蹤效果
```

---

## 5. Data Model

### analysis_history
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | TEXT | 用戶 ID |
| created_at | TIMESTAMPTZ | 分析時間 |
| skin_type | TEXT | 皮膚類型 |
| ai_observation | TEXT | AI 觀察 |
| goal_conflict | TEXT | 目標衝突提醒 |
| concerns | JSONB | 肌膚問題 |
| routine | JSONB | 護膚步驟 |
| ingredients | JSONB | 推薦成分 |
| questionnaire | JSONB | 用戶問卷答案 |

### skincare_products
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | TEXT | 用戶 ID |
| name | TEXT | 產品名稱 |
| type | TEXT | 產品類型 |
| brand | TEXT | 品牌（可選） |
| notes | TEXT | 備註 |
| created_at | TIMESTAMPTZ | 添加時間 |

### product_usage_logs
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | TEXT | 用戶 ID |
| product_id | UUID | 產品 ID |
| used_at | DATE | 使用日期 |
| routine_time | TEXT | morning/evening/both |

### analysis_product_links
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| analysis_id | UUID | 分析記錄 ID |
| product_id | UUID | 護膚品 ID |
| created_at | TIMESTAMPTZ | 創建時間 |

### user_profiles
| 欄位 | 類型 | 說明 |
|------|------|------|
| id | UUID | 主鍵 |
| user_id | TEXT | 用戶 ID（唯一） |
| created_at | TIMESTAMPTZ | 創建時間 |
| updated_at | TIMESTAMPTZ | 更新時間 |
| skin_type_self | TEXT | 自我皮膚類型 |
| t_zone_oiliness | TEXT | T區油脂情況 |
| pore_size | TEXT | 毛孔大小 |
| acne_level | TEXT | 痘痘程度 |
| sensitivity | TEXT | 敏感程度 |
| hydration | TEXT | 缺水情況 |
| gender | TEXT | 性別 |
| age | TEXT | 年齡 |
| climate | TEXT | 居住氣候 |
| is_traveling | BOOLEAN | 是否旅行中 |
| travel_climate | TEXT | 旅行目的地氣候 |
| goal | TEXT | 主要目標 |
| skin_history | TEXT | 皮膚/過敏史 |

---

## 6. Tech Stack

| 層面 | 技術 |
|------|------|
| Frontend | Next.js 14, React, Tailwind CSS |
| Backend | Supabase Edge Function |
| AI | Google Gemini 2.5 Flash |
| Database | Supabase (PostgreSQL) |
| Auth | Supabase Auth (Google OAuth) |
| Hosting | Vercel |

---

## 7. Project Structure

```
skinsense-web/
├── app/
│   ├── page.tsx              # 首頁
│   ├── analyzer/page.tsx     # 皮膚分析頁
│   ├── history/page.tsx      # 歷史記錄頁
│   ├── products/page.tsx    # 護膚品頁
│   └── login/page.tsx       # 登入頁
├── components/
│   ├── AnalyzeForm.tsx      # 分析表單
│   ├── Header.tsx           # 導航欄
│   ├── HistoryList.tsx      # 歷史列表
│   ├── ProductsList.tsx     # 產品列表
│   ├── ProductForm.tsx      # 產品表單
│   ├── UsageLogger.tsx      # 使用記錄
│   ├── SkincareDiary.tsx    # 護膚日記
│   ├── LoginButton.tsx      # 登入按鈕
│   └── LoginGate.tsx        # 登入限制
├── lib/
│   └── supabase.ts          # Supabase 客戶端
├── supabase/
│   ├── schema.sql           # 數據庫結構
│   └── types.ts             # TypeScript 類型
└── public/
```

---

## 8. Current Stage

### MVP ✅ 完成
- [x] AI 皮膚分析（問卷 + 照片）
- [x] 人類皮膚驗證
- [x] 目標衝突警告（加強版）
- [x] Google 登入
- [x] 歷史記錄
- [x] 護膚品追蹤
- [x] 護膚日記
- [x] 護膚品效果關聯

### 增強功能 📋 規劃中
- [ ] 進度對比/趨勢圖
- [ ] 定時提醒
- [ ] 天氣影響分析
- [ ] 專業報告上傳

---

## 9. Links

| 資源 | 連結 |
|------|------|
| 網站 | https://skinsense-omega.vercel.app |
| GitHub | https://github.com/joechung0629/skinsense |
| Supabase | https://supabase.com/dashboard/project/gsvkuzusfnieblzcsvcs |

---

*最後更新：2026-03-24 09:15 UTC*
