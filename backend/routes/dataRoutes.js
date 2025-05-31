// routes/dataRoutes.js
const express = require("express");
const router = express.Router();
const mongoose = require("mongoose");

// 確保連線（也可留給 app.js 管理，這裡只是安全做法）
const DB_URL = "mongodb://localhost:27017/taskmanager";
if (mongoose.connection.readyState === 0) {
  mongoose.connect(DB_URL, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  });
}

// ✅ 通用 Collection 資料取得 API
router.get("/:collectionName", async (req, res) => {
  const { collectionName } = req.params;

  try {
    const data = await mongoose.connection.db
      .collection(collectionName)
      .find()
      .toArray();

    res.json(data);
  } catch (err) {
    console.error("❌ API 錯誤：", err.message);
    res.status(500).json({ error: "Error fetching data" });
  }
});

module.exports = router;
