# SkinSense Git Workflow

## Branch 命名規範

| Branch | 用途 | 部署 |
|--------|------|------|
| `main` | 生產代碼 | Vercel 自動部署 |
| `feature/功能名` | 開發新功能 | 手動測試 |

## 開發流程

### 1. 開始新功能
```bash
git checkout main
git pull origin main
git checkout -b feature/功能名
```

### 2. 開發與 commit
```bash
git add .
git commit -m "描述你的改動"
git push origin feature/功能名
```

### 3. 完成後 Merge 到 main
```bash
git checkout main
git merge feature/功能名
git push origin main
# Vercel 自動部署
```

### 4. 完成後刪除功能分支
```bash
git branch -d feature/功能名
git push origin --delete feature/功能名
```

## 範例：開發登入功能

```bash
# 1. 建立功能分支
git checkout -b feature/login

# 2. 開發... commit... push...

# 3. 完成，合併到 main
git checkout main
git merge feature/login
git push origin main

# 4. 刪除功能分支
git branch -d feature/login
git push origin --delete feature/login
```

## 注意事項

- `main` 是唯一的生產分支
- 所有新功能都從 `main` 分支出來
- 合併前先 `git pull origin main` 確保最新
- 測試成功後才能合併到 main

## Vercel 設置

- Default Branch: `main`
- Auto-deploy: 開啟
- 生產環境 URL: https://skinsense-omega.vercel.app
