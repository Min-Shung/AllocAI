//員工 API 路由
const express = require('express');
const router = express.Router();
const Employee = require('../models/Employee');

// 取得所有員工
router.get('/', async (req, res) => {
  const employees = await Employee.find();
  res.json(employees);
});

// 新增員工
router.post('/', async (req, res) => {
  const emp = new Employee(req.body);
  await emp.save();
  res.json(emp);
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
