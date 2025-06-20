const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

const Project = require("./models/Project");
const TaskModel = require("./models/DecomposedTask");
const Assignment = require("./models/Assignment");
const TaskEvaluation = require("./models/TaskEvaluation");
const Feedback = require("./models/Feedback");
const dataRoutes = require("./routes/dataRoutes");
const employeeRoutes = require('./routes/employees');
const runadjustment = require("./AiAdj");
const { runReassign } = require('./reAssign');

const app = express();
const PORT = 3001;

app.use(cors());
app.use(express.json());

// ✅ MongoDB 連線
mongoose.connect("mongodb://localhost:27017/taskmanager")
  .then(() => console.log("✅ server成功連線至 MongoDB"))
  .catch((err) => console.error("❌ server MongoDB 連線錯誤：", err));

const db = mongoose.connection;
db.on("disconnected", () => console.warn("⚠️ MongoDB 已中斷連線"));

// ✅ 控制引擎狀態管理
let isControlEngineDone = false;
function resetControlEngineStatus() {
  isControlEngineDone = false;
}
function markControlEngineDone() {
  isControlEngineDone = true;
}
function getControlEngineStatus() {
  return isControlEngineDone;
}
const controlEngineStatus = {
  init: "idle",
  redecompose: "idle",
  evaluation: "idle",
  assignTasks: "idle",
  all: "idle",
  error: null
};
function updateStatus(stage, status) {
  if (stage in controlEngineStatus) {
    controlEngineStatus[stage] = status;
  } else if (stage === "error") {
    controlEngineStatus.error = status;
  } else {
    console.warn("⚠️ 無效階段：", stage);
  }

  // ✅ 自動判斷是否完成
  if (stage === "all" && status === "done") {
    markControlEngineDone();
  }
}

// ✅ 控制引擎階段查詢（合併 done + 階段狀態）
app.get("/api/control-engine/status", (req, res) => {
  res.json({
    done: getControlEngineStatus(),
    ...controlEngineStatus
  });
});

app.post("/api/control-engine/mark-done", (req, res) => {
  markControlEngineDone();
  console.log("✅ 控制引擎標記為完成");
  res.sendStatus(200);
});

// ✅ 專案建立與控制引擎啟動
app.post("/api/projects", async (req, res) => {
  try {
    resetControlEngineStatus();
    await Project.deleteMany({});
    console.log("📥 收到新專案資料：", req.body, "舊資料已刪除");
    const project = new Project(req.body);
    await project.save();
    console.log("✅ 專案已儲存至資料庫");

    exec("node controlEngine.js", (err, stdout, stderr) => {
      if (err) {
        console.error("❌ 控制引擎執行失敗：", err.message);
        return;
      }
      console.log("✅ 控制引擎執行完成");
      console.log(stdout);
    });

    res.status(201).json({ message: "專案已儲存，控制引擎已執行" });
  } catch (err) {
    console.error("❌ 專案儲存錯誤：", err.message);
    res.status(500).json({ error: err.message });
  }
});

// ✅ 專案查詢
app.get("/api/projects/latest", async (req, res) => {
  try {
    const project = await Project.findOne().sort({ createdAt: -1 });
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 員工路由
app.use('/api/employees', employeeRoutes);

// ✅ 分析
const Employee = require('./models/Employee');
const EmployeeAnalysis = require('./analysis/EmployeeAnalysis');
const analysis = new EmployeeAnalysis();
app.post('/api/analyze', async (req, res) => {
  const { employeeId, task } = req.body;
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ error: '員工不存在' });
  const result = analysis.analyzeTaskCompatibility(employee, task);
  res.json(result);
});

// ✅ Collection 查詢
app.use("/api/data", dataRoutes);

// ✅ 拆解任務
app.get('/api/tasks', async (req, res) => {
  try {
    const task = await TaskModel.findOne();
    res.json(task);
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});
app.post('/api/tasks', async (req, res) => {
  try {
    await TaskModel.deleteMany();
    const result = await TaskModel.create(req.body);
    res.json({ success: true, insertedId: result._id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save tasks' });
  }
});

// ✅ 員工任務分配
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await Assignment.findOne();
    res.json(result || {});
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to load assignments' });
  }
});
app.post('/api/assignments', async (req, res) => {
  try {
    await Assignment.deleteMany();
    const result = await Assignment.create(req.body);
    res.json({ success: true, insertedId: result._id });
  } catch (err) {
    res.status(500).json({ success: false, error: 'Failed to save assignments' });
  }
});

// ✅ 拆解資料查詢
const DecomposedTask = require("./models/DecomposedTask");
app.get("/api/taskdecompose", async (req, res) => {
  try {
    const taskdec = await DecomposedTask.find();
    res.json(taskdec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// ✅ 啟動 AI 調整流程
app.post("/api/readjust", async (req, res) => {
  const adjustments = req.body;
  if (!Array.isArray(adjustments) || adjustments.length === 0) {
    return res.status(400).json({ message: "調整資料格式錯誤或為空" });
  }

  try {
    const result = await Feedback.insertMany(adjustments);
    runadjustment((stage, status) => {
      updateStatus(stage, status);
    });
    res.status(200).json({
      message: "調整資料已成功寫入，流程已啟動",
      insertedCount: result.length,
    });
  } catch (error) {
    console.error("寫入 feedback 集合失敗:", error);
    res.status(500).json({ message: "伺服器錯誤，無法寫入資料" });
  }
});

// ✅ 任務重新分配
app.post("/api/reassign", async (req, res) => {
  const { reason } = req.body;
  if (!reason || reason.trim() === "") {
    return res.status(400).json({ error: "原因不可為空" });
  }

  try {
    resetControlEngineStatus();
    await runReassign({ reason });
    res.json({ message: "重新分配已完成" });
  } catch (error) {
    console.error("重新分配錯誤:", error);
    res.status(500).json({ error: "重新分配失敗" });
  }
});

// ✅ AI調整查詢（合併 done + 階段狀態）
app.get("/api/reassign/status", (req, res) => {
  res.json({
    done: getControlEngineStatus(),
    ...controlEngineStatus
  });
});


// ✅ 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器啟動於 http://localhost:${PORT}`);
});
