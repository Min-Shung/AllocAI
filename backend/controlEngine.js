const axios = require("axios");
const mongoose = require("mongoose");
const { exec } = require("child_process");

const TaskEvaluation = require("./models/TaskEvaluation"); // 請確認路徑正確

const {
  MONGODB_URI = "mongodb://localhost:27017/taskmanager",
} = process.env;

// MongoDB 連線（拿掉）

const db = mongoose.connection;
db.on("disconnected", () => console.warn("⚠️ MongoDB 已中斷連線"));

async function fetchLatestProject() {
  console.log("📡 controlor抓取最新專案資料中...");
  const res = await axios.get("http://localhost:3001/api/projects/latest");
  console.log("✅ controlor抓取專案資料完成");
  return res.data;
}

function runScript(scriptPath) {
  console.log(`🧠 執行子腳本：${scriptPath}`);
  return new Promise((resolve, reject) => {
    exec(`node ${scriptPath}`, (err, stdout, stderr) => {
      if (err) {
        console.error(`❌ 腳本錯誤 (${scriptPath}):`, stderr);
        return reject(err);
      }
      console.log(`📤 腳本輸出 (${scriptPath}):\n${stdout}`);
      resolve();
    });
  });
}

async function main() {
  try {
    console.log("🚀 控制引擎啟動");
    await fetchLatestProject();
    await runScript("decomposer.js");
    // 2. 執行評估模組（EvaluationModule.js）
    await runScript("EvaluationModule.js");
    // 3. 執行任務分配模組（assignTasks.js）
    await runScript("assignTasks.js");
    console.log("🎉 控制引擎執行完畢");

  } catch (err) {
    console.error("❌ 控制引擎錯誤：", err);
  } finally {
    mongoose.connection.close();
  }
}

main();
