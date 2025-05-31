//員工 API 路由
const express = require('express');
const router = express.Router();
const Employee = require('./models/Employee');

// 取得所有員工
router.get('/', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// 新增員工
router.post('/', async (req, res) => {
  const { employeeName, mbtiType, specialty, languages } = req.body;

  const newEmployee = new Employee({
    employeeName,
    mbtiType,
    skills: specialty, // ← 對應 specialty -> skills
    preferences: {
      projectType: languages // ← 對應 languages -> preferences.projectType
    },
    availability: true // optional，或使用預設值
  });

  try {
    await newEmployee.save();
    res.json(newEmployee);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: '儲存失敗' });
  }
});

// 更新員工
router.put('/:id', async (req, res) => {
  const emp = await Employee.findByIdAndUpdate(req.params.id, req.body, { new: true });
  res.json(emp);
});

// 刪除員工
router.delete('/:id', async (req, res) => {
  await Employee.findByIdAndDelete(req.params.id);
  res.json({ success: true });
});

module.exports = router;
