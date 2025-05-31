import React, { useState } from "react";

const AIAdjustPanel = ({ projectName, storyName, taskName, onClose }) => {
  // 用一個 state 表示當前選中層級: "project", "story", "task", 或 null
  const [checkedLevel, setCheckedLevel] = useState(null);
  const [selectedReason, setSelectedReason] = useState("");

  const reasons = {
    project: [
      "拆分不均勻",
      "分析邏輯錯誤",
      "拆分過於細碎",
      "拆分過於粗糙",
    ],
    story: [
      "缺乏明確完成定義",
      "低估或遺漏工作內容",
      "Task 拆分不均勻",
      "未考慮驗證與測試",
    ],
  };

  // 點選 checkbox 時切換，互斥
  const onChangeLevel = (level) => {
    setSelectedReason("");
    setCheckedLevel((prev) => (prev === level ? null : level));
  };

  // 下拉選單呈現對應原因
  const renderReasonSelect = () => {
    if (!checkedLevel || checkedLevel === "task") return null;
    const reasonList = reasons[checkedLevel];
    return (
      <div style={{ marginTop: 10 }}>
        <label>
          結果不滿意的理由：
          <select
            value={selectedReason}
            onChange={(e) => setSelectedReason(e.target.value)}
            style={{ marginLeft: 10 }}
          >
            <option value="">請選擇</option>
            {reasonList.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
      </div>
    );
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        right: 0,
        width: 320,
        height: "100vh",
        backgroundColor: "#fff",
        boxShadow: "-2px 0 6px rgba(0,0,0,0.2)",
        borderLeft: "1px solid #ddd",
        zIndex: 1500,
        padding: 20,
        overflowY: "auto",
      }}
    >
      <div
        style={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
        }}
      >
        <h3 style={{ margin: 0 }}>🤖 AI 調整</h3>
        <button
          onClick={onClose}
          style={{
            background: "none",
            border: "none",
            fontSize: 18,
            cursor: "pointer",
            color: "#666",
          }}
        >
          ✖
        </button>
      </div>

      <div style={{ marginTop: 20 }}>
        {/* Project checkbox */}
        <label
          style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
        >
          <input
            type="checkbox"
            checked={checkedLevel === "project"}
            onChange={() => onChangeLevel("project")}
            style={{ marginRight: 8 }}
          />
          {projectName || "Project"}
        </label>

        {/* Story checkbox */}
        {!checkedLevel || checkedLevel !== "project" ? (
          <label
            style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
          >
            <input
              type="checkbox"
              checked={checkedLevel === "story"}
              onChange={() => onChangeLevel("story")}
              style={{ marginRight: 8 }}
            />
            {storyName || "story.name"}
          </label>
        ) : null}

        {/* Task checkbox */}
        {!checkedLevel || (checkedLevel !== "project" && checkedLevel !== "story") ? (
          <label
            style={{ display: "flex", alignItems: "center", marginBottom: 10 }}
          >
            <input
              type="checkbox"
              checked={checkedLevel === "task"}
              onChange={() => onChangeLevel("task")}
              style={{ marginRight: 8 }}
            />
            {taskName || "task.name"}
          </label>
        ) : null}

        {renderReasonSelect()}
      </div>
    </div>
  );
};

export default AIAdjustPanel;
