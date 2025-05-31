import React, { useState } from 'react';
import axios from 'axios';

export default function EmployeeForm({ onSuccess }) {
  const languageOptions = [
    'JavaScript', 'TypeScript', 'Python', 'Java', 'C', 'C++', 'C#', 'Go', 'Rust', 'Ruby', 'PHP', 'Swift', 'Kotlin', 'Scala', 'Perl', 'Objective-C', 'Dart', 'R', 'MATLAB', 'Julia', 'Shell', 'PowerShell', 'Haskell', 'Elixir', 'Erlang', 'Lua', 'Groovy', 'Visual Basic', 'F#', 'Assembly', 'COBOL', 'Fortran', 'Delphi', 'PL/SQL', 'SQL', 'SAS', 'ABAP', 'VHDL', 'Verilog', 'Prolog', 'Lisp', 'Scheme', 'Scratch', 'Crystal', 'Elm', 'OCaml', 'Solidity', 'Bash', 'Awk', 'Ada', 'LabVIEW', 'Smalltalk', 'ActionScript', 'CoffeeScript', 'VBScript', 'Logo', 'FoxPro', 'Simula', 'PostScript', 'RPG', 'ML', 'Q#', 'Tcl', 'Zig', 'Nim'
  ];

  const specialtyOptions = [
    '前端', '後端', '全端', 'UI', 'UX', '嵌入式', '資料分析', 'DevOps', 'AI/ML', '雲端運算', '資安', '網路', '測試', '自動化', '區塊鏈', '遊戲開發', '行動應用', '資料庫', '演算法', '硬體設計', '教育訓練', '技術管理', '數據科學', '網站架構', '大數據', '系統整合', '客服技術', 'IOT', 'AR/VR'
  ];

  const mbtiTypes = [
    'INTJ', 'ENTJ', 'INTP', 'ENTP', 'INFJ', 'ENFJ', 'INFP', 'ENFP',
    'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ', 'ISTP', 'ISFP', 'ESTP', 'ESFP'
  ];

  const [formData, setFormData] = useState({
    employeeName: '',
    mbtiType: mbtiTypes[0],
    preferences: {
      projectType: []
    },
    skills: []
  });

  const toggleLanguage = (lang) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.includes(lang)
        ? prev.skills.filter(l => l !== lang)
        : [...prev.skills, lang]
    }));
  };

  const toggleSpecialty = (spec) => {
    setFormData(prev => ({
      ...prev,
      preferences: {
        ...prev.preferences,
        projectType: prev.preferences.projectType.includes(spec)
          ? prev.preferences.projectType.filter(s => s !== spec)
          : [...prev.preferences.projectType, spec]
      }
    }));
  };

  const handleSubmit = async (e) => {
    console.log('送出的 formData：', formData);

    e.preventDefault();
    if (formData.skills.length < 2) {
      alert('請至少選擇兩種擅長語言！');
      return;
    }
    try {
      await axios.post('http://localhost:3001/api/employees', formData);
      alert('員工資料已新增！');
      setFormData({
        employeeName: '',
        mbtiType: mbtiTypes[0],
        preferences: {
          projectType: []
        },
        skills: []
      });
      if (onSuccess) onSuccess();
    } catch (error) {
      alert('新增失敗: ' + (error.response?.data?.error || error.message));
    }
  };

  return (
    <div className="form-bg">
      <form onSubmit={handleSubmit} className="employee-form">
        <h2>新增員工資料</h2>
        <div className="form-group">
          <label>姓名</label>
          <input
            type="text"
            value={formData.employeeName}
            onChange={e => setFormData({ ...formData, employeeName: e.target.value })}
            required
          />
        </div>

        <div className="form-group">
          <label>MBTI 類型</label>
          <select
            value={formData.mbtiType}
            onChange={e => setFormData({ ...formData, mbtiType: e.target.value })}
          >
            {mbtiTypes.map(type => (
              <option key={type} value={type}>{type}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label>Role（可多選）</label>
          <div className="option-group">
            {specialtyOptions.map(spec => (
              <button
                type="button"
                key={spec}
                className={formData.preferences.projectType.includes(spec) ? 'option-btn selected' : 'option-btn'}
                onClick={() => toggleSpecialty(spec)}
              >
                {spec}
              </button>
            ))}
          </div>
        </div>

        <div className="form-group">
          <label>Skill（至少選兩項）</label>
          <div className="option-group">
            {languageOptions.map(lang => (
              <button
                type="button"
                key={lang}
                className={formData.skills.includes(lang) ? 'option-btn selected' : 'option-btn'}
                onClick={() => toggleLanguage(lang)}
              >
                {lang}
              </button>
            ))}
          </div>
          <div style={{ color: formData.skills.length < 2 ? '#ff6b6b' : '#aaa', fontSize: '0.95rem', marginTop: '4px', textAlign: 'center' }}>
            {formData.skills.length < 2 ? '請至少選兩項' : `已選擇：${formData.skills.join(', ')}`}
          </div>
        </div>

        <button type="submit" className="submit-btn">新增員工</button>
      </form>

      <style>{`
        .form-bg {
          min-height: 100vh;
          background: #fff;
          display: flex;
          justify-content: center;
          align-items: center;
        }
        .employee-form {
          background:#f6f8fa;
          color: #222;
          padding: 32px 24px;
          border-radius: 18px;
          box-shadow: 0 4px 32px #0005;
          min-width: 340px;
          max-width: 540px;
        }
        .employee-form h2 {
          text-align: center;
          margin-bottom: 24px;
          letter-spacing: 2px;
        }
        .form-group {
          margin-bottom: 22px;
          display: flex;
          flex-direction: column;
          align-items: center;
        }
        .form-group label {
          margin-bottom: 8px;
          font-size: 1.05rem;
          letter-spacing: 1px;
        }
        .employee-form input[type="text"],
        .employee-form select {
          width: 220px;
          padding: 7px 12px;
          border: 1.5px solid #b3b3b3;
          border-radius: 5px;
          background:rgba(243, 246, 253, 0.77);
          color: #222;
          font-size: 1rem;
          margin-bottom: 4px;
        }
        .option-group {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;
          justify-content: center;
        }
        .option-btn {
          background:rgb(124, 126, 134);
          color:rgb(235, 237, 243);
          border: 1.5px solid rgb(62, 62, 63);
          border-radius: 18px;
          padding: 6px 18px;
          margin-bottom: 5px;
          font-size: 0.98rem;
          cursor: pointer;
          transition: background 0.2s, color 0.2s, border 0.2s;
        }
        .option-btn.selected {
          background: linear-gradient(90deg, #1e90ff 60%, #00c9a7 100%);
          color: #fff;
          border: 2px solid #1e90ff;
          font-weight: bold;
        }
        .submit-btn {
          margin-top: 16px;
          width: 100%;
          padding: 12px 0;
          background: linear-gradient(90deg,rgb(35, 37, 39) 60%,rgb(220, 233, 231) 100%);
          color: #fff;
          border: none;
          border-radius: 8px;
          font-size: 1.1rem;
          font-weight: bold;
          cursor: pointer;
          letter-spacing: 2px;
          box-shadow: 0 2px 8px #1e90ff44;
          transition: background 0.2s;
        }
        .submit-btn:hover {
          background: linear-gradient(90deg, rgb(220, 233, 231) 5%, rgb(35, 37, 39)100%);
        }
      `}</style>
    </div>
  );
}
