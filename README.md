
# 🧠 智慧任務拆解與人力資源分配系統

> 利用 AI 技術實現任務自動拆解與精準分工，提高專案管理效率與決策品質

## 📌 專案簡介

本系統旨在解決專案初期任務拆解與人力分配的高負擔問題。傳統工具如 Notion、ClickUp 雖支援專案追蹤，但仍需大量手動操作。本系統導入 Azure OpenAI 技術，結合語意解析、風險分析與人力配對，實現從「會議紀錄 ➝ 任務拆解 ➝ 任務評估 ➝ 任務分配 ➝ 動態調整」的全自動化流程，降低專案管理成本。

## 🔧 核心功能

- ✂️ **任務自動拆解**：根據會議紀錄自動產生 Story-Task-Item 階層式結構
- 🧮 **任務屬性評估**：計算風險、難度與預估工時
- 🧑‍🤝‍🧑 **人力資源配對**：根據員工專長與性格類型執行任務分配
- 📊 **可視化任務看板**：顯示任務屬性、分配對象與工時
- 🔁 **AI 與手動雙模式調整**：管理者可即時進行任務與人員的再分配
- 📥 **Notion 整合輸入**：支援 Markdown/txt 文件與 Notion 匯入

## 🧠 技術創新

- 使用 **Azure OpenAI GPT 模型** 解析自然語言會議紀錄
- 透過語意比對與特徵資料分析，實現智能化人員配對
- 支援 AI 回饋再訓練與動態任務重構

## 🏗 系統架構

採用經典 **MVC 架構**：

- **Frontend (View)**：React，負責資料輸入與視覺化看板
- **Backend (Controller)**：Node.js + Express.js，控制模組流程
- **AI 引擎與資料儲存 (Model)**：整合 Azure OpenAI 與 MongoDB

```
📁 frontend   - React 前端界面 (含 src/App.js 與 components 資料夾)
📁 backend    - 僅包含 server.js 的 Node.js API 啟動點
📁 database   - MongoDB 資料結構設計
📁 ai-engine  - 任務拆解 / 分配 / 調整模組 (OpenAI API)
```

## 💻 使用技術

- Frontend: React
- Backend: Node.js + Express.js
- Database: MongoDB
- Third-Party Services: Azure OpenAI API (GPT)

## 🚀 專案啟動方式

1. 安裝前後端依賴：
   ```bash
   cd frontend
   npm install
   cd backend
   npm install
   ```

2. 設定 `.env` 檔案：
   ```
   AZURE_OPENAI_ENDPOINT=https://your-resource-name.openai.azure.com/
   API_KEY=your_azure_openai_key
   DEPLOYMENT_NAME=your-deployment-id
   API_VERSION=2024-02-01
   ```

3. 分別啟動前後端伺服器：
   ```bash
   # 前端
   cd frontend
   npm start

   # 後端
   cd backend
   node server.js
   ```

4. 開啟瀏覽器進入 `http://localhost:3000` 進行操作

## 📺 系統介面

- 建立新專案頁面
- 輸入員工特徵資料
- 任務拆解與評估結果一覽
- 任務分配結果看板
- 手動與 AI 分配調整功能
