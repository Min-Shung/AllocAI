const mongoose = require("mongoose");
const { exec } = require("child_process");

// 執行外部腳本的工具函式
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

async function runadjustment(updateStatus) {
  try {
    updateStatus("init", "running");
    console.log("🚀 控制引擎啟動");

    updateStatus("redecompose", "running");
    await runScript("redecompose.js");
    updateStatus("redecompose", "done");

    updateStatus("evaluation", "running");
    await runScript("EvaluationModule.js");
    updateStatus("evaluation", "done");

    updateStatus("assignTasks", "running");
    await runScript("assignTasks.js");
    updateStatus("assignTasks", "done");

    console.log("🎉 控制引擎執行完畢");
    updateStatus("all", "done");
  } catch (err) {
    console.error("❌ 控制引擎錯誤：", err);
    updateStatus("error", err.message || "未知錯誤");
  }
}

module.exports = runadjustment;
