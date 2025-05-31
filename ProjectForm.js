import React, { useState } from "react";
import axios from "axios";

export default function ProjectForm() {
  const [form, setForm] = useState({
    projectName: "",
    projectGoal: "",
    startDate: "",
    endDate: "",
    meetingNotes: "",
  });

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
    } catch (err) {
      alert("❌ 錯誤：" + err.message);
    }
  };

  return (
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
      <h2 style={{ textAlign: "center", marginBottom: 20 }}>建立新專案</h2>

      <div style={{ marginBottom: 15 }}>
        <label>專案名稱</label>
        <input
          name="projectName"
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
        <label>會議記錄（手動輸入或上傳 .txt/.md）
        </label>
        <input
          type="file"
          accept=".txt,.md"
          onChange={handleFileUpload}
          style={{ marginTop: 5, marginBottom: 10 }}
        />
        <textarea
          name="meetingNotes"
          placeholder="輸入或上傳會議記錄"
          value={form.meetingNotes}
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
  );
}
