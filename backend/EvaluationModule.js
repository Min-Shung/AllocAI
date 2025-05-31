require('dotenv').config();
const mongoose = require('mongoose');
const axios = require('axios');
const DecomposedTask = require("./models/DecomposedTask");
const TaskEvaluation = require('./models/TaskEvaluation');
const Project = require('./models/Project');

const {
  AZURE_OPENAI_ENDPOINT,
  API_KEY,
  DEPLOYMENT_NAME,
  API_VERSION,
  MONGODB_URI = 'mongodb://localhost:27017/taskmanager',
} = process.env;

const SYSTEM_PROMPT = `你是一個資深的項目經理，請根據以下描述對任務進行評估：
1. 風險評估（RPN指數）：1-5分，考慮可能性、影響力和可檢測性，需使用繁體中文給予具體評估依據
2. 難度係數：1-5分，考慮技術複雜度、資源需求與依賴關係，需要使用繁體中文說明具體挑戰
3. 用時預估：使用Story Point（1點=0.5人天），需使用繁體中文解釋估算邏輯
補充說明：  
如果任務是較大的任務（task），請你根據一般專案經驗進行合理推論與評估，並仍然以完整格式回傳。
如果任務是簡短的子項目（items），請你根據一般專案經驗進行合理推論與評估，並仍然以完整格式回傳。
請始終回傳嚴格JSON格式：{
  "risk":{ "number": number, "reason": string},
  "difficulty":{ "number": number, "reason": string},
  "story_point":{ "number": number, "reason": string}
}
請務必僅回傳有效 JSON，不要包含任何多餘文字或解釋。`;
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
    console.warn('⚠️ extractJson 解析失敗:', err.message);
    return null;
  }
}
async function evaluateTask(taskDescription) {
  if (!taskDescription || typeof taskDescription !== 'string' || taskDescription.trim() === '') {
    console.warn('無效的任務描述，略過評估：', taskDescription);
    return null;
  }

  try {
    const baseUrl = AZURE_OPENAI_ENDPOINT.replace(/\/$/, '');
    const url = `${baseUrl}/openai/deployments/${DEPLOYMENT_NAME}/chat/completions?api-version=${API_VERSION}`;

    const headers = {
      'Content-Type': 'application/json',
      'api-key': API_KEY,
    };

    const body = {
      messages: [
        { role: 'system', content: SYSTEM_PROMPT },
        { role: 'user', content: taskDescription },
      ],
      temperature: 0.3,
      max_tokens: 500,
    };

    const response = await axios.post(url, body, { headers });
    const content = response.data.choices[0].message.content;

    const parsed = extractJson(content);
    if (!parsed) {
      console.error('❌ 無法從以下內容解析 JSON:\n', content);
    }
    return parsed;

  } catch (error) {
    if (error.response) {
      console.error('API 錯誤:', error.response.status, error.response.data);
    } else {
      console.error('解析錯誤:', error.message);
    }
    return null;
  }
}

async function retryUntilValid(fn, maxRetries = 5, delayMs = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    const result = await fn();
    if (result) return result;
    await new Promise(res => setTimeout(res, delayMs));
  }
  return null;
}
async function createInitialEvaluationFromDecomposed() {
  const decomposedStories = await DecomposedTask.find().sort({ createdAt: 1 }); // 抓所有 story
  if (!decomposedStories || decomposedStories.length === 0) {
    throw new Error('❌ 找不到任何 DecomposedTask 資料');
  }

  const stories = decomposedStories.map(storyDoc => ({
    name: storyDoc.name, // story 名稱
    tasks: storyDoc.tasks.map(task => ({
      name: task.name,
      metrics: null,
      items: task.items.map(itemName => ({
        name: itemName,
        metrics: null,
      })),
    })),
  }));

  const newEvaluation = new TaskEvaluation({
    description: '任務初評', // 預設名稱，這裡不再使用 project name
    stories,
    feedback: [],
  });

  await newEvaluation.save();
  console.log('✅ 建立新的 TaskEvaluation 文件：', newEvaluation._id);
  return newEvaluation;
}


async function runEvaluationModule() {
  // MongoDB 連線，放這裡才執行
  await mongoose.connect(MONGODB_URI);
  console.log("✅ evaluation成功連線至 MongoDB");
  await TaskEvaluation.deleteMany({});// 清空 TaskEvaluation 資料表
  const db = mongoose.connection;
  db.on("disconnected", () => console.warn("⚠️ MongoDB 已中斷連線"));
  const latestTaskEvaluation = await createInitialEvaluationFromDecomposed();
  const projectDesc = latestTaskEvaluation.description || '';
  const data = JSON.parse(JSON.stringify(latestTaskEvaluation));


  for (const story of data.stories) {
    for (const task of story.tasks) {
    const fullTaskName = task.name;
    console.log(`📝 評估任務：${fullTaskName}`);

    // 評估 task
    const taskInput = `${projectDesc} 任務名稱：${fullTaskName}`;

    const taskEvaluation = await retryUntilValid(() => evaluateTask(taskInput));

    task.metrics = taskEvaluation
      ? { ...taskEvaluation, updated_at: new Date().toISOString() }
      : null;

    // 評估每個 item
    task.items = await Promise.all(
      task.items.map(async (item) => {
        const evaluation = await retryUntilValid(() => evaluateTask(item.name));
        return {
          name: item.name,
          metrics: evaluation
            ? { ...evaluation, updated_at: new Date().toISOString() }
            : null,
        };
      })
    );
  }
  }

  // 更新資料庫文件
  await TaskEvaluation.findByIdAndUpdate(latestTaskEvaluation._id, data, { new: true });
  console.log('✅ 任務評估完成並更新資料庫');
  // 執行完關閉連線
  await mongoose.connection.close();
  console.log("✅ MongoDB 連線已關閉");

  return data;
}

// 防止模組被require時自動執行
if (require.main === module) {
  runEvaluationModule()
    .catch(err => {
      console.error('❌ 發生錯誤：', err);
      process.exit(1);
    });
}

module.exports = { runEvaluationModule };
