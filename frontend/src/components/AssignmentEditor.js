import React, { useEffect, useState } from 'react';

const iconStyle = {
  color: 'green',
  fontSize: '1rem',
  border: 'none',
  background: 'none',
  cursor: 'pointer'
};

function AssignmentEditor() {
  const [projectName, setProjectName] = useState('');
  const [assignments, setAssignments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, []);

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      const res = await fetch('http://localhost:3001/api/assignments');
      const data = await res.json();
      setProjectName(data.projectName || '');
      setAssignments(data.assignments || []);
    } catch (err) {
      alert('❌ 無法載入員工任務分配資料');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleItemChange = (empIndex, itemIndex, value) => {
    const updated = [...assignments];
    updated[empIndex].items[itemIndex] = value;
    setAssignments(updated);
  };

  const handleTaskChange = (empIndex, taskIndex, value) => {
    const updated = [...assignments];
    updated[empIndex].tasks[taskIndex] = value;
    setAssignments(updated);
  };

  const handleAddItem = (empIndex) => {
    const updated = [...assignments];
    updated[empIndex].items.push('');
    setAssignments(updated);
  };

  const handleAddTask = (empIndex) => {
    const updated = [...assignments];
    updated[empIndex].tasks.push('');
    setAssignments(updated);
  };

  const handleDeleteItem = (empIndex, itemIndex) => {
    const updated = [...assignments];
    updated[empIndex].items.splice(itemIndex, 1);
    setAssignments(updated);
  };

  const handleDeleteTask = (empIndex, taskIndex) => {
    const updated = [...assignments];
    updated[empIndex].tasks.splice(taskIndex, 1);
    setAssignments(updated);
  };

  const handleSave = async () => {
    try {
      const cleanedAssignments = assignments.map(emp => {
        const { _id, ...rest } = emp;
        return rest;
      });

      const payload = {
        projectName,
        assignments: cleanedAssignments
      };

      const res = await fetch('http://localhost:3001/api/assignments', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const result = await res.json();
      if (result.success) {
        alert('✅ 任務分配已更新');
      } else {
        alert('❌ 更新失敗');
      }
    } catch (err) {
      alert('❌ 更新時發生錯誤');
      console.error(err);
    }
  };

  return (
    <div style={{ marginTop: '3rem', padding: '2rem', borderTop: '2px solid #aaa' }}>
      <h2>👥 任務分配調整</h2>
      <p><b>專案名稱：</b>{projectName}</p>
      {loading ? <p>載入中...</p> : (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1.5rem' }}>
          {assignments.map((emp, empIndex) => (
            <div key={emp.employee} style={{
              flex: '1 1 45%',
              border: '1px solid #ccc',
              borderRadius: '10px',
              boxShadow: '2px 2px 8px rgba(0,0,0,0.1)',
              padding: '1rem',
              backgroundColor: '#fefefe'
            }}>
              <h3 style={{
                backgroundColor: '#f0f0f0',
                padding: '0.5rem 1rem',
                borderRadius: '6px',
                borderBottom: '1px solid #ddd'
              }}>{emp.employee}</h3>

              {/* Task 區塊 */}
              <p style={{ marginTop: '1rem', fontWeight: 'bold' }}>Task：</p>
              <ul>
                {emp.tasks.map((task, taskIndex) => (
                  <li key={taskIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      value={task}
                      onChange={(e) => handleTaskChange(empIndex, taskIndex, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleDeleteTask(empIndex, taskIndex)} style={iconStyle}>✖</button>
                    {taskIndex === emp.tasks.length - 1 && (
                      <button onClick={() => handleAddTask(empIndex)} style={iconStyle}>➕ Add Task</button>
                    )}
                  </li>
                ))}
              </ul>

              {/* Item 區塊 */}
              <p style={{ marginTop: '1rem', fontWeight: 'bold', marginLeft: '1rem' }}>Item：</p>
              <ul style={{ marginLeft: '2rem' }}>
                {emp.items.map((item, itemIndex) => (
                  <li key={itemIndex} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <input
                      value={item}
                      onChange={(e) => handleItemChange(empIndex, itemIndex, e.target.value)}
                      style={{ flex: 1 }}
                    />
                    <button onClick={() => handleDeleteItem(empIndex, itemIndex)} style={iconStyle}>✖</button>
                    {itemIndex === emp.items.length - 1 && (
                      <button onClick={() => handleAddItem(empIndex)} style={iconStyle}>➕ Add Item</button>
                    )}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
      <div style={{ marginTop: '2rem' }}>
        <button onClick={handleSave} style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>📤 儲存</button>
      </div>
    </div>
  );
}

export default AssignmentEditor;
