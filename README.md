<img src="https://github.com/Min-Shung/AllocAI/blob/main/README_pic/logo.png" width="90px" height="90px">  

##   AllocAI--智慧任務拆解與人力資源分配系統

> 不用再手動拆分任務，交給AllocAI自動分工。把時間，留給真正的創造。

## 📌 專案簡介

本系統旨在解決專案初期任務拆解與人力分配的高負擔問題。傳統工具如 Notion、ClickUp 雖支援專案追蹤，但仍需大量手動操作。本系統導入 Azure OpenAI 技術，結合語意解析、風險分析與人力配對，實現從「會議紀錄 ➝ 任務拆解 ➝ 任務評估 ➝ 任務分配 ➝ 動態調整」的全自動化流程，降低專案管理成本。

## 🔧 核心功能

- ✂️ **任務自動拆解**：根據會議紀錄將專案拆解為 Story → Task → Item 階層式結構
- 🧮 **任務屬性評估**：針對每個Task與Item計算風險指數RPN、難度係數與預估工時
- 🧑‍🤝‍🧑 **人力資源配對**：根據員工特徵資料與任務屬性執行任務分配
- 📊 **視覺化任務看板**：顯示員工資訊、任務拆分、任務評估與任務分配結果
- 🔁 **AI 與手動雙模式調整**：管理者可進行任務與人員的再分配

## 📺 系統介面

**建立專案頁面**

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.28.07.png)

**輸入員工資料頁面**

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.28.15.png)

**看板頁面**  
-   員工資訊

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-05-30%20下午6.25.30.png)

-   專案資訊

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.28.36.png)

-   任務拆分

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.28.49.png)

-   任務評估

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.28.55.png)

-   任務分配

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.08.32.png)

**調整頁面**  
-   手動調整

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.29.24.png)

-   AI調整

![image](https://github.com/Min-Shung/AllocAI/blob/main/README_pic/截圖%202025-06-01%20上午12.29.07.png)

## 💻 使用技術

- Frontend: React
- Backend: Node.js + Express.js
- Database: MongoDB
- Third-Party Services: Azure OpenAI API (GPT)

## 🚀 專案啟動方式

### 📦 系統需求

- Node.js 16.15.0 以上
- React 
- MongoDB
- Azure OpenAI API 金鑰與部署

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

## 🌐 環境變數說明

| 變數名稱         | 說明                                                                                      |
|----------------------|--------------------------------------------------------------------------------------------------|
| AZURE_OPENAI_ENDPOINT | Azure OpenAI 資源端點 (例如： `https://your-resource-name.openai.azure.com/`)               |
| API_KEY               | Azure OpenAI API 金鑰                      |
| DEPLOYMENT_NAME       | Azure 上部署模型的名稱 (例如： `gpt-keyword-v1`)                        |
| API_VERSION           | API 使用版本（例如：2024-02-01）                                       |

