import React, { useEffect, useState } from 'react';
import axios from 'axios';

export default function EmployeeList({ onClose }) {
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios.get('http://localhost:3001/api/employees')
      .then(response => {
        setEmployees(response.data);
        setLoading(false);
      })
      .catch(error => {
        console.error('載入員工資料錯誤:', error);
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <p>載入中...</p>;
  }

  return (
    <div>
      <h3>員工清單</h3>
      {employees.length === 0 ? (
        <p>目前沒有員工資料。</p>
      ) : (
        <ul style={{ paddingLeft: 0, listStyle: 'none' }}>
          {employees.map(emp => (
            <li key={emp._id} style={{ 
              border: "1px solid #ccc", 
              borderRadius: 8, 
              padding: 10, 
              marginBottom: 10, 
              backgroundColor: "#f9f9f9" 
            }}>
              <strong>姓名：</strong>{emp.employeeName}<br />
              <strong>MBTI：</strong>{emp.mbtiType}<br />
              <strong>技能：</strong>{emp.skills.join(', ') || '無'}<br />
              <strong>偏好專案類型：</strong>{emp.preferences?.projectType?.join(', ') || '無'}<br />
              <strong>可用狀態：</strong>{emp.availability ? '✅ 可用' : '❌ 不可用'}
            </li>
          ))}
        </ul>
      )}
      <div style={{ textAlign: 'center', marginTop: 20 }}>
        <button onClick={onClose} style={{
          padding: '8px 16px',
          backgroundColor: '#6c757d',
          color: 'white',
          border: 'none',
          borderRadius: 5,
          cursor: 'pointer'
        }}>
          關閉
        </button>
      </div>
    </div>
  );
}
