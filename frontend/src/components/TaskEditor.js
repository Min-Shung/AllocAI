import React, { useState, useEffect } from 'react';

function TaskEditor({ taskStructure, onUpdate, onNext }) {
  const [tasks, setTasks] = useState({ stories: [] });

  useEffect(() => {
    if (taskStructure?.stories) {
      setTasks(taskStructure);
    }
  }, [taskStructure]);

  const updateStructure = (newStructure) => {
    setTasks(newStructure);
    onUpdate(newStructure);
  };

  const handleRename = (level, storyIdx, taskIdx, itemIdx, value) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    if (level === 'story') updated.stories[storyIdx].name = value;
    if (level === 'task') updated.stories[storyIdx].tasks[taskIdx].name = value;
    if (level === 'item') updated.stories[storyIdx].tasks[taskIdx].items[itemIdx] = value;
    updateStructure(updated);
  };

  const handleDeleteStory = (storyIdx) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories.splice(storyIdx, 1);
    updateStructure(updated);
  };

  const handleDeleteTask = (storyIdx, taskIdx) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories[storyIdx].tasks.splice(taskIdx, 1);
    updateStructure(updated);
  };

  const handleDeleteItem = (storyIdx, taskIdx, itemIdx) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories[storyIdx].tasks[taskIdx].items.splice(itemIdx, 1);
    updateStructure(updated);
  };

  const handleAddTask = (storyIdx) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories[storyIdx].tasks.push({ name: '新任務', items: [] });
    updateStructure(updated);
  };

  const handleAddItem = (storyIdx, taskIdx) => {
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories[storyIdx].tasks[taskIdx].items.push('新項目');
    updateStructure(updated);
  };

  const handleAddStory = () => {
    const newStory = {
      name: '新 Story',
      tasks: [
        {
          name: '新任務',
          items: ['新項目']
        }
      ]
    };
    const updated = JSON.parse(JSON.stringify(tasks));
    updated.stories.push(newStory);
    updateStructure(updated);
  };

  const iconStyle = {
    color: 'green',
    fontSize: '1rem',
    border: 'none',
    background: 'none',
    cursor: 'pointer'
  };

  const uploadToMongoDB = async () => {
    try {
      const res = await fetch('http://localhost:3001/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(tasks)
      });
      const result = await res.json();
      alert('✅ 任務已成功更新到 MongoDB！');
    } catch (err) {
      console.error('❌ 上傳失敗：', err.message);
      alert('❌ 上傳失敗：' + err.message);
    }
  };

  return (
    <div style={{ padding: '2rem' }}>
      <h2 style={{ fontSize: '1.5rem', marginBottom: '1rem' }}>🛠️ 任務拆分調整</h2>
      {tasks.stories.map((story, storyIdx) => (
        <div key={storyIdx} style={{ border: '1px solid #ccc', borderRadius: '10px', padding: '1rem', marginBottom: '1.5rem', backgroundColor: '#f9f9f9' }}>
          
          <p style={{ fontWeight: 'bold' }}>Story：</p>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem' }}>
            <input
              value={story.name}
              onChange={(e) => handleRename('story', storyIdx, null, null, e.target.value)}
              placeholder='Story 名稱'
              style={{ flex: 1, padding: '0.3rem 0.5rem' }}
            />
            <button onClick={() => handleDeleteStory(storyIdx)} style={iconStyle}>✖</button>
            <button onClick={() => handleAddTask(storyIdx)} style={iconStyle}>✚ Add Task</button>
          </div>

          {story.tasks.map((task, taskIdx) => (
            <div key={taskIdx} style={{ marginLeft: '2rem', marginBottom: '1rem' }}>
              <p style={{ fontWeight: 'bold' }}>Task：</p>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.5rem' }}>
                <input
                  value={task.name}
                  onChange={(e) => handleRename('task', storyIdx, taskIdx, null, e.target.value)}
                  placeholder='Task 名稱'
                  style={{ flex: 1, padding: '0.25rem 0.5rem' }}
                />
                <button onClick={() => handleDeleteTask(storyIdx, taskIdx)} style={iconStyle}>✖</button>
                <button onClick={() => handleAddItem(storyIdx, taskIdx)} style={iconStyle}>✚ Add Item</button>
              </div>

              <p style={{ fontWeight: 'bold' }}>Item：</p>
              <ul style={{ paddingLeft: '1.5rem' }}>
                {task.items.map((item, itemIdx) => (
                  <li key={itemIdx} style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.3rem' }}>
                    <input
                      value={item}
                      onChange={(e) => handleRename('item', storyIdx, taskIdx, itemIdx, e.target.value)}
                      style={{ flex: 1, padding: '0.2rem 0.5rem' }}
                    />
                    <button onClick={() => handleDeleteItem(storyIdx, taskIdx, itemIdx)} style={iconStyle}>✖</button>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '2rem' }}>
        <button onClick={handleAddStory} style={{ ...iconStyle, padding: '0.5rem 1rem' }}>✚ Add Story</button>
        <button onClick={uploadToMongoDB} style={{ padding: '0.5rem 1rem', backgroundColor: '#2196F3', color: 'white', border: 'none', borderRadius: '5px' }}>📤 儲存</button>
      </div>
    </div>
  );
}

export default TaskEditor;
