const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const bodyParser = require("body-parser");
const { exec } = require("child_process");

/*這裡是你的模組函式，要先改成 export 函式形式
const { runDecomposeModule } = require("./decomposer");
const { runEvaluationModule } = require("./EvaluationModule");
const { runAssignModule } = require("./assignTasks");*/

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
const PORT =3001;

//測試用放行
app.use(cors());
app.use(express.json());

// MongoDB 連線
mongoose.connect("mongodb://localhost:27017/taskmanager")
  .then(() => console.log("✅ server成功連線至 MongoDB"))
  .catch((err) => console.error("❌ server MongoDB 連線錯誤：", err));

const db = mongoose.connection;
db.on("disconnected", () => console.warn("⚠️ MongoDB 已中斷連線"));


// API：新增專案 ok
app.post("/api/projects", async (req, res) => {
  try {
    await Project.deleteMany({});
    console.log("📥 收到新專案資料：", req.body ,"舊資料已刪除");
    const project = new Project(req.body);
    await project.save();
    console.log("✅ 專案已儲存至資料庫");

    // 執行控制引擎
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


// API：取得最新專案 ok
app.get("/api/projects/latest", async (req, res) => {
  try {
    const project = await Project.findOne().sort({ createdAt: -1 });
    console.log("📤 傳送最新專案：", project?.projectName || "無資料");
    res.json(project);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

//API:員工路由
app.use('/api/employees', employeeRoutes);

// 特徵分析 API（範例：分析單一員工與任務）
const Employee = require('./models/Employee');
const EmployeeAnalysis = require('./analysis/EmployeeAnalysis');
const DecomposedTask = require("./models/DecomposedTask");
const analysis = new EmployeeAnalysis();
app.post('/api/analyze', async (req, res) => {
  const { employeeId, task } = req.body;
  const employee = await Employee.findById(employeeId);
  if (!employee) return res.status(404).json({ error: '員工不存在' });
  const result = analysis.analyzeTaskCompatibility(employee, task);
  res.json(result);
});

// ✅ Collection 資料查詢 API
app.use("/api/data", dataRoutes);

// ✅ [GET] 任務拆解
app.get('/api/tasks', async (req, res) => {
  try {
    const task = await TaskModel.findOne();
    res.json(task);
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to fetch tasks' });
  }
});

// ✅ [POST] 儲存任務拆解（先清空再插入）
app.post('/api/tasks', async (req, res) => {
  try {
    await TaskModel.deleteMany();
    const result = await TaskModel.create(req.body);
    res.json({ success: true, insertedId: result._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save tasks' });
  }
});

// ✅ [GET] 員工任務分配
app.get('/api/assignments', async (req, res) => {
  try {
    const result = await Assignment.findOne();
    res.json(result || {});
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to load assignments' });
  }
});

// ✅ [POST] 儲存任務分配（先清空再插入）
app.post('/api/assignments', async (req, res) => {
  try {
    await Assignment.deleteMany();
    const result = await Assignment.create(req.body);
    res.json({ success: true, insertedId: result._id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, error: 'Failed to save assignments' });
  }
});

//AI調整
//取的拆分資料
app.get("/api/taskdecompose", async (req, res) => {
  try {
    const taskdec = await DecomposedTask.find();
    res.json(taskdec);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});


// 這裡存當前流程狀態，供輪詢用
let currentProcessStatus = {
  stage: null,
  status: null,
  updatedAt: null,
};

function updateCurrentStatus(stage, status) {
  currentProcessStatus = { stage, status, updatedAt: new Date() };
}

// 接收調整資料並啟動流程
app.post("/api/readjust", async (req, res) => {
  const adjustments = req.body;

  if (!Array.isArray(adjustments) || adjustments.length === 0) {
    return res.status(400).json({ message: "調整資料格式錯誤或為空" });
  }

  try {
    const result = await Feedback.insertMany(adjustments);

    // 非同步啟動流程
  runadjustment((stage, status) => {
      updateCurrentStatus(stage, status);
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

app.post("/api/reassign", async (req, res) => {
  const { reason } = req.body;

  if (!reason || reason.trim() === "") {
    return res.status(400).json({ error: "原因不可為空" });
  }

  console.log("收到分配原因:", reason);

  try {
    await runReassign({ reason });  // 執行但不回傳結果
    res.json({ message: "重新分配已完成" });  // 只告知前端已完成
  } catch (error) {
    console.error("重新分配錯誤:", error);
    res.status(500).json({ error: "重新分配失敗" });
  }
});


// 啟動伺服器
app.listen(PORT, () => {
  console.log(`🚀 伺服器啟動於 http://localhost:${PORT}`);
});
