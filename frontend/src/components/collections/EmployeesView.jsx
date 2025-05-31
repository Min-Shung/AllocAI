import React from 'react';

const EmployeesView = ({ data }) => {
  if (!Array.isArray(data) || data.length === 0) {
    return <p>沒有可顯示的員工資料。</p>;
  }

  return (
    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '24px' }}>
      {data.map((employee) => (
        <div
          key={employee._id?.$oid || employee.name}
          style={{
            width: '300px',
            padding: '20px',
            backgroundColor: '#ffffff',
            border: '1px solid #e5e7eb',
            borderRadius: '12px',
            boxShadow: '0 4px 6px rgba(0, 0, 0, 0.05)',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
          }}
        >
          <h3 style={{ fontSize: '18px', fontWeight: '600' }}>{employee.employeeName}</h3>
          <p style={{ margin: 0, color: '#000000' }}><strong>MBTI:</strong> {employee.mbtiType}</p>

          <div>
            <h4 style={{ margin: '8px 0 4px', fontSize: '16px' }}>技能:</h4>
            {Array.isArray(employee.skills) && employee.skills.length > 0 ? (
              <ul style={{ paddingLeft: '20px', margin: 0 }}>
                {employee.skills.map((skill, idx) => (
                  <li key={idx}>{skill}</li>
                ))}
              </ul>
            ) : (
              <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>無技能資料</p>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default EmployeesView;
