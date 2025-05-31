require("dotenv").config();
const mongoose = require("mongoose");
const axios = require("axios");

// 資料模型
const Employee = require("./models/Employee");
const TaskEvaluation = require("./models/TaskEvaluation");
const Assignment = require("./models/Assignment");

const {
  AZURE_OPENAI_ENDPOINT,
  API_KEY,
  DEPLOYMENT_NAME,
  API_VERSION,
  MONGODB_URI = "mongodb://localhost:27017/taskmanager",
} = process.env;

// ===== 工具函式 =====
function extractJson(text) {
  try {
    const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) ||
                      text.match(/```([\s\S]*?)```/) ||
                      text.match(/({[\s\S]*})/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[1]);
    }
    return JSON.parse(text);
  } catch (err) {
    console.warn("⚠️ extractJson 解析失敗:", err.message);
    return null;
  }
}
// GPT Prompt 產生器
const generatePrompt = (employees, taskEvaluation) => {
  return `
你是一個專業的任務分配助手，請根據以下規則進行任務分配：

- 每個任務應分配給最適合的員工，考慮員工的技能、MBTI 與角色是否匹配任務。
- 任務結構為：Story → Task → Item，每個層級都有名稱與 metrics（難度、風險、估計工時）。
- 同一個 task 底下的 item 可以分配給不同人，但同一個 item 不可重複分配。
- 如果將 task 分配給某人，代表他需要完成該 task 下的所有 items，這些 item 不能再分配給其他人。
- 每位員工都必須分配到至少一個 task 或 item。
- 必須確保所有 item 都有分配到人。
- 若沒有被分配到 item ，items欄位要回傳「無」的字樣。
- 若沒有被分配到 task ，tasks欄位要回傳「無」的字樣。

請只輸出 JSON 格式如下（只需輸出 assignment 結果）：
{
  "assignments": [
    {
      "employee": "員工姓名",
      "tasks": ["任務名稱1", "任務名稱2"],
      "items": ["任務項目1", "任務項目2"]
    }
  ]
}

以下是員工資料：
${JSON.stringify(employees, null, 2)}

以下是任務資料（含stories、tasks 與 items）：
${JSON.stringify(taskEvaluation.stories, null, 2)}
`;
};


async function callAzureOpenAI(prompt) {
  const url = `${AZURE_OPENAI_ENDPOINT}openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;
  const headers = { "Content-Type": "application/json", "api-key": API_KEY };
  const body = {
    messages: [{ role: "system", content: "你是一個任務分配助手。" }, { role: "user", content: prompt }],
    temperature: 0.3,
    max_tokens: 1000,
  };
  const response = await axios.post(url, body, { headers });
  const reply = response.data.choices[0].message.content;
  const parsed = extractJson(reply);
  if (!parsed) throw new Error("解析 GPT 回應失敗");
  return parsed;
}

async function connectDB() {
  if (mongoose.connection.readyState === 1) return;
  await mongoose.connect(MONGODB_URI);
  console.log("✅ 成功連線至 MongoDB");
  await Assignment.deleteMany({});
}

async function disconnectDB() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
    console.log("🔌 已斷開 MongoDB 連線");
  }
}

async function runAssignModule(projectId = null) {
  try {
    await connectDB();
    const employees = await Employee.find().lean();
    const taskEvaluation = projectId
      ? await TaskEvaluation.findById(projectId).lean()
      : await TaskEvaluation.findOne().lean();
    if (!taskEvaluation) throw new Error("找不到任務評估資料");

    const prompt = generatePrompt(employees, taskEvaluation);
    console.log("🚀 呼叫 GPT 執行任務配對...");
    const result = await callAzureOpenAI(prompt);

    const projectName = taskEvaluation.description || "Unnamed Project";
    await Assignment.create({ projectName, assignments: result.assignments });

    console.log(`✅ 任務已分配並儲存：${projectName}`);
    await disconnectDB();
    return result.assignments;
  } catch (err) {
    console.error("❌ 錯誤發生：", err.message);
    await disconnectDB();
    throw err;
  }
}

if (require.main === module) {
  runAssignModule().catch((err) => {
    console.error("❌ 執行失敗：", err);
    process.exit(1);
  });
}

module.exports = { runAssignModule };
