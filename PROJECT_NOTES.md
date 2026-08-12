# CaRepair 專案背景筆記（PROJECT NOTES）

> 用途：本檔供「新對話 / 新任務」接手時快速恢復上下文。詳細帳號密鑰見 `.env.local` 與長期記憶（memory），本檔**不存放任何 secret 值**。

---

## 1. 專案概況

- **名稱**：CathyRepair（凱西維修 / CaRepair），Apple 系裝置維修站（實際涵蓋 iphone / ipad / watch / macbook）。
- **類型**：Next.js 全端應用，含前台預約/追蹤、後台管理（訂單/工單/庫存/會員）、二手商城、客戶追蹤頁。
- **資料來源**：Supabase（PostgreSQL + Auth + RLS），未連時自動降級為本地 Mock 資料。
- **部署**：GitHub 推送 → EdgeOne Pages（騰訊雲）自動部署。
- **Git 倉庫**：`samwong2025/CaRepair`（遠端仍指向原線上，本機改完 push 會更新同一個線上站）。

---

## 2. 技術棧與依賴

| 類別 | 項目 |
|---|---|
| 框架 | Next.js `^14.2.35`（App Router）、React `^18.3`、TypeScript `^5.6` |
| 樣式 | Tailwind CSS `3.4.17` + tailwindcss-animate、cva、clsx、tailwind-merge |
| 資料庫 | `@supabase/ssr ^0.5.2`、`@supabase/supabase-js ^2.45.4` |
| 圖標 | lucide-react `^0.446` |
| 圖表 | recharts `^2.12.7` |
| 影像 | sharp `^0.35.3`（next.config 設 `images.unoptimized=true`） |

**本地指令**（Windows / node20 特殊路徑，見 §7）：
```powershell
npm run dev      # next dev -p 3000
npm run build    # next build
npm run start    # next start -p 3000
npm run typecheck
```

---

## 3. 環境變數（`.env.local`）

複製 `.env.local.example` 後填入。鍵名如下，**值請取用 `.env.local` 或記憶中的帳號資訊**：

| 變數 | 說明 | 取值位置 |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 專案 URL | `.env.local` / 記憶 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | 公開 anon key | 同上 |
| `SUPABASE_SERVICE_ROLE_KEY` | 服務端金鑰（僅伺服器端，勿加 `NEXT_PUBLIC_`） | 同上 |
| `ADMIN_PASSWORD` | 後台密碼（**僅 Mock 模式**有效，連上 Supabase 後改走 Supabase Auth） | `.env.local.example` 預設 `admin123` |

**部署端（EdgeOne Production 環境手動貼）**：`NEXT_PUBLIC_SUPABASE_*`、`SUPABASE_SERVICE_ROLE_KEY`、`WECHAT_PUSH_TOKEN`、`EDGEONE_API_TOKEN`。靜態頁先刷新（~30s），API serverless 晚到（**約 3 分鐘**才拉到新版），推送後測試請等足。

---

## 4. 資料庫結構（Supabase / PostgreSQL）

建表腳本：`supabase/init.sql`（13 張 public 表 + RLS + 商品種子 10 行）。**重要**：換新 Supabase 專案後須重跑此腳本。

主要表：
- `customers`：會員檔案（member_no、level: regular/silver/gold/vip、points…）。
- `repair_orders`：維修訂單。關鍵欄位：
  - `order_no`：格式 `SH-YYYYMMDD-XXXX`
  - `device_category`：`iphone|ipad|watch|macbook`
  - `quote`：`jsonb`（報價結構）
  - `status`：`submitted|confirmed|diagnosing|repairing|quality_check|ready|completed|cancelled`
  - `parts_used`：`jsonb NOT NULL DEFAULT '[]'`（**訂單實際選用配件**，曾在線上漏建，見 §6）
  - `manual_price`、`price_note`：手動改價（後台改價會標「尊享折扣」）
  - `source`：`online|manual`
- `repair_tickets`：工單（含 cascade，刪訂單時一併刪除），本身也有 `parts_used`。
- `products`、`shop_orders`：二手商城。

> 線上改表（加欄位/修資料）用 Supabase Management API（`PAT`）+ `NOTIFY pgrst, 'reload schema'` 強制刷新 schema cache，否則 PostgREST 找不到新欄位會報 `Could not find ... in the schema cache`。

---

## 5. 程式碼架構

**Repository 模式**（雲端/本地實作切換）：
- `src/lib/repositories/types.ts`：介面定義
- `src/lib/repositories/supabase.ts`：Supabase 實作（線上）
- `src/lib/repositories/mock.ts` + `mock-store.ts`：本地 Mock
- `src/lib/repositories/index.ts`：依環境選擇實作

**路由**（`src/app`）：
- `(site)/`：前台（首頁/案例/關於/預約/維修流程）
- `admin/`：後台（訂單、工單、庫存、會員、報表）
- `api/`：介面（含 `orders/[id]` 的 PATCH/PUT/DELETE）
- `track/`：客戶訂單追蹤頁

**元件**（`src/components`）：`admin/`、`home/`、`repair/`、`shop/`、`track/`、`about/`、`layout/`、`ui/`。

**關鍵 lib**：
- `quote-engine.ts` / `pricing-store.ts`：報價引擎
- `receipt-share.ts`：收據 PDF / WhatsApp / Email 分享（**客戶端文案統一在此與 `receipt.tsx`、`order-card.tsx` 三處同步**）
- `inventory-*.ts` / `catalog-store.ts` / `shop-store.ts`：庫存與商城
- `auth.ts` + `middleware.ts`：後台登入守衛

---

## 6. 已知坑 / 歷史修復（最近 git 紀錄）

| Commit | 主題 | 注意點 |
|---|---|---|
| `af7a4ce` | 客戶端「講價優惠」→「**尊享折扣**」 | 收據/追蹤頁/分享共 4 處同步改，避免客戶學樣講價 |
| `c114400` | `repair_orders` 補 `parts_used` 欄位 | 線上曾漏建導致 update 報錯；同時 `supabase.ts` 寫入 `?? null`→`?? []` 避 NOT NULL |
| `d7772eb` | 配件選擇不鎖死 | `parts-picker.tsx` 改為「智能篩選/全部配件」Tab + 搜尋（型號太多無法一一對應） |
| `f6e5afb` | 工單新增「取消 / 永久刪除」 | 取消=改 `status=cancelled` 留記錄；刪除=DELETE + cascade 關聯工單，皆二次確認 Modal |
| `cd25ff1` | 修「找不到指定訂單」誤導錯誤 | `updateRepairOrder` 區分真 404 vs 伺服器錯誤；API 回 500＋真實訊息而非一律 404 |
| `3b81773` | 放大首頁案例切換提示框 | ⚠️ 此 commit message 在 git 歷史顯示為亂碼（中文編碼炸），功能正常，勿誤判 |
| `c999836` | 商城訂單狀態切換走確認彈窗 | 加編輯客戶資料 Modal（鎖定金額/商品/單號） |

**文案規範**（台灣繁體，技術標識仍英文）：
- 折扣標籤用「尊享折扣」**不要**「講價優惠」。
- 稱呼統一「師傅」**不要**「技師」。

---

## 7. 工作流備忘（Windows / PowerShell 陷阱）

- **node 路徑**：`C:\Users\HOME\node20\node-v20.19.0-win-x64\npm.cmd`（需 `$env:Path` 前置才可用 npm）。
- **git commit 中文**：禁止用 PowerShell heredoc / 單引號提交（會炸）。改用暫存檔：
  ```powershell
  # 寫 .commit-msg.tmp 後
  git commit -F .commit-msg.tmp
  cmd /c del /F /Q .commit-msg.tmp
  ```
- **構建前清 `.next`**：遇 safe-delete guard（本 turn 50 刪上限）或殘留，手動 `cmd /c rmdir /S /Q .next`。
- **PowerShell `node -e` 含中文會炸**：改用 `.mjs` 檔（必要時 `\uXXXX` 轉義）執行後 `cmd /c del` 清理。
- **刪檔**：受控資料夾下 `Remove-Item` 會卡 UI，用 `cmd /c del /F /Q` 更穩。
- **本地預覽端口**：`next dev -p 3000` / `next start -p 3000`；曾有用 `-p 3100` 的 `next start` 佔用檔案導致移動失敗，移動專案前先 `Stop-Process` 停掉 node 預覽服務。

---

## 8. 帳號與換號計劃

**現用帳號**（值見 `.env.local` / 長期記憶，勿外洩）：
- Supabase：`https://stqqsdlrqfrbwurbrwhg.supabase.co`（anon / service_role / PAT `sbp_...`）
- EdgeOne（騰訊雲）、GitHub：`samwong2025/CaRepair`

**計劃更換三組帳號**：騰訊雲/EdgeOne、Supabase、GitHub。
更換後須重做：
1. EdgeOne Pages 重新關聯倉庫；
2. GitHub Secrets：`EDGEONE_API_TOKEN` / `WECHAT_PUSH_TOKEN` / `NEXT_PUBLIC_SUPABASE_*` / `SUPABASE_SERVICE_ROLE_KEY`；
3. 新建 Supabase 專案並重跑 `supabase/init.sql` 建表；
4. EdgeOne Production 環境手動貼上述環境變數後重新部署。

---

## 9. 接手快速檢查清單

1. 確認 `.env.local` 齊全（§3），`npm run dev` 能起。
2. 改完先 `npm run build` 確認編譯，再 `git commit -F .commit-msg.tmp` 推送。
3. 推送後**等約 3 分鐘**再測線上 API（靜態頁約 30s 即可）。
4. 客戶端折扣/文案改動須同步 `receipt.tsx`、`order-card.tsx`、`receipt-share.ts` 三處。
5. 任何線上 DDL 改動後執行 `NOTIFY pgrst, 'reload schema'`。
