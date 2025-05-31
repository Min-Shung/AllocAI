import React from 'react';

const ProjectsView = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>目前沒有任何專案資料。</p>;
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
      {data.map((project, index) => (
        <div
          key={index}
          style={{
            width: '100%',
            padding: '30px',
            backgroundColor: '#f9f9f9',
            border: '1px solid #ccc',
            borderRadius: '8px',
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
          }}
        >
          <h2 style={{ marginBottom: '10px' }}>{project.projectName}</h2>
          <p style={{ marginBottom: '15px' }}>{project.projectGoal}</p>
          <div style={{ display: 'flex', gap: '40px', marginBottom: '15px' }}>
            <p><strong>起始日期:</strong> {project.startDate}</p>
            <p><strong>結束日期:</strong> {project.endDate}</p>
            <p><strong>預計時程:</strong> {project.expectedTimeline}</p>
          </div>
          <div>
            <h3>會議紀錄</h3>
            <p style={{ whiteSpace: 'pre-wrap', lineHeight: 1.6 }}>{project.meetingNotes}</p>
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProjectsView;
