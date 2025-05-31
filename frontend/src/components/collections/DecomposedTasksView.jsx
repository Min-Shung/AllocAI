import React from 'react';

const DecomposedTasksView = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>沒有可顯示的任務資料。</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '32px' }}>
      {data.map((group) => (
        <div
          key={group._id?.$oid || group.name}
          style={{
            padding: '24px',
            borderRadius: '12px',
            border: '1px solid #e5e7eb',
            backgroundColor: '#f9fafb',
            boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
          }}
        >
          <h2 style={{ fontSize: '20px', fontWeight: '700', marginBottom: '16px' }}>
            {group.name}
          </h2>

          <ul style={{ paddingLeft: '20px' }}>
            {Array.isArray(group.tasks) && group.tasks.map((task) => (
              <li key={task._id?.$oid || task.name} style={{ marginBottom: '16px' }}>
                <div style={{ fontWeight: '600', marginBottom: '6px' }}>
                  {task.name}
                </div>
                <ul style={{ paddingLeft: '20px', listStyleType: 'circle' }}>
                  {Array.isArray(task.items) && task.items.map((item, idx) => (
                    <li key={idx} style={{ marginBottom: '4px' }}>{item}</li>
                  ))}
                </ul>
              </li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
};

export default DecomposedTasksView;
