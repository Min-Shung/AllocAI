import React, { useState } from "react";
import { useNavigate } from 'react-router-dom';
import axios from "axios";
import EmployeeForm from './EmployeeAnalysis'; 
import EmployeeList from './EmployeeList';

export default function ProjectForm() {
  const [form, setForm] = useState({
    projectName: "",
    projectGoal: "",
    startDate: "",
    endDate: "",
    meetingNotes: "",
  });
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [showEmployeeList, setShowEmployeeList] = useState(false);

  const navigate = useNavigate(); 

  const handleChange = (e) =>
    setForm({ ...form, [e.target.name]: e.target.value });

  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target.result;
      setForm((prev) => ({ ...prev, meetingNotes: text }));
    };
    reader.readAsText(file);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      ...form,
      expectedTimeline: `${form.startDate} ~ ${form.endDate}`,
    };

    try {
      await axios.post("http://localhost:3001/api/projects", payload);
      alert("✅ 專案已提交！");
      navigate('/collection');
    } catch (err) {
      alert("❌ 錯誤：" + err.message);
    }
  };

  return (
    <>
      <form
        onSubmit={handleSubmit}
        style={{
          maxWidth: 600,
          margin: "40px auto",
          padding: 20,
          border: "1px solid #ccc",
          borderRadius: 10,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          backgroundColor: "#fafafa",
        }}
      >
        {/* 新增員工資料按鈕 */}
        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-end", gap: "10px", marginBottom: 20 }}>
          <button 
            type="button" 
            onClick={() => setShowEmployeeForm(true)} 
            style={{
              padding: "8px 16px",
              backgroundColor: "#28a745",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer"
            }}
          >
            新增員工資料
          </button>

          <button 
            type="button" 
            onClick={() => setShowEmployeeList(true)} 
            style={{
              padding: "8px 16px",
              backgroundColor: "#007bff",
              color: "white",
              border: "none",
              borderRadius: 5,
              cursor: "pointer"
            }}
          >
            檢視員工清單
          </button>
        </div>

        <h2 style={{ textAlign: "center", marginBottom: 20 }}>建立新專案</h2>

        {/* 下面是其他表單欄位 */}
        <div style={{ marginBottom: 15 }}>
          <label>專案名稱</label>
          <input
            name="projectName"
            value={form.projectName}
            placeholder="輸入專案名稱"
            onChange={handleChange}
            required
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>專案目標</label>
          <textarea
            name="projectGoal"
            value={form.projectGoal}
            placeholder="描述專案目標"
            onChange={handleChange}
            required
            rows={3}
            style={{
              width: "100%",
              padding: 8,
              marginTop: 5,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>預期時程</label>
          <div style={{ display: "flex", gap: 10, marginTop: 5 }}>
            <input
              type="date"
              name="startDate"
              value={form.startDate}
              onChange={handleChange}
              required
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            />
            <span style={{ lineHeight: "36px" }}>～</span>
            <input
              type="date"
              name="endDate"
              value={form.endDate}
              onChange={handleChange}
              required
              style={{
                flex: 1,
                padding: 8,
                borderRadius: 5,
                border: "1px solid #ccc",
              }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 15 }}>
          <label>會議記錄（手動輸入或上傳 .txt/.md）</label>
          <input
            type="file"
            accept=".txt,.md"
            onChange={handleFileUpload}
            style={{ marginTop: 5, marginBottom: 10 }}
          />
          <textarea
            name="meetingNotes"
            value={form.meetingNotes}
            placeholder="輸入或上傳會議記錄"
            onChange={handleChange}
            required
            rows={8}
            style={{
              width: "100%",
              padding: 8,
              borderRadius: 5,
              border: "1px solid #ccc",
            }}
          />
        </div>

        <button
          type="submit"
          style={{
            width: "100%",
            padding: 10,
            border: "none",
            backgroundColor: "#007bff",
            color: "#fff",
            borderRadius: 5,
            cursor: "pointer",
          }}
        >
          提交
        </button>
      </form>

      {/* 將新增員工表單 modal 放到 form 外層 */}
      {showEmployeeForm && (
        <div className="modal-backdrop" onClick={() => setShowEmployeeForm(false)} style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            maxWidth: 600,
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <EmployeeForm onSuccess={() => {
              console.log('EmployeeForm submit success, but modal should stay open');
            }} />
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: '16px' }}>
              <button 
                onClick={() => setShowEmployeeForm(false)} 
                style={{ padding: '8px 12px' }}
              >
                關閉
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 將員工清單 modal 也放到 form 外層 */}
      {showEmployeeList && (
        <div className="modal-backdrop" onClick={() => setShowEmployeeList(false)} style={{
          position: "fixed",
          top: 0, left: 0, right: 0, bottom: 0,
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          zIndex: 1000
        }}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{
            backgroundColor: "white",
            padding: 20,
            borderRadius: 10,
            maxWidth: 600,
            width: "90%",
            maxHeight: "80vh",
            overflowY: "auto",
            boxShadow: "0 2px 10px rgba(0,0,0,0.2)"
          }}>
            <EmployeeList onClose={() => setShowEmployeeList(false)} />
          </div>
        </div>
      )}
    </>
  );
}
