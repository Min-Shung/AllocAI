import React, { useState, useEffect } from "react";
import EmployeesView from "./collections/EmployeesView";
import ProjectsView from "./collections/ProjectsView";
import TasksView from "./collections/DecomposedTasksView";
import EvaluationsView from "./collections/TaskEvaluationsView";
import AssignmentsView from "./collections/AssignmentsView";
import AssignmentEditor from './AssignmentEditor';
import TaskEditor from './TaskEditor'; 
import ProjectTree from "./ProjectTree";
import AssignmentResult from "./AssignmentResult";

const collections = [
  { key: "employees", label: "員工資訊" },
  { key: "projects", label: "專案資訊" },
  { key: "decomposed_tasks", label: "任務拆分" },
  { key: "taskevaluations", label: "任務分析" },
  { key: "assignments", label: "工作指派" },
];

const HIDDEN_KEYS = ["_id", "createdAt", "__v"];

const CollectionViewer = () => {
  const [selectedCollection, setSelectedCollection] = useState("employees");
  const [data, setData] = useState([]);
  const [showAIPanel, setShowAIPanel] = useState(false);
  const [showManualPanel, setShowManualPanel] = useState(false);
  const [activeEditor, setActiveEditor] = useState('assignment'); 
  const [showAITooltip, setShowAITooltip] = useState(false); // 控制滑鼠移入提示框
  const [selectedEvaluation, setSelectedEvaluation] = useState(null);
  const isTaskDecomposing = selectedCollection === "decomposed_tasks";
  const isAssignmentResult = selectedCollection === "assignments";

  useEffect(() => {
  fetch(`http://localhost:3001/api/data/${selectedCollection}`)
    .then((res) => res.json())
    .then((json) => {
      const cleaned = json.map((obj) => {
        const filtered = {};
        Object.entries(obj).forEach(([k, v]) => {
          if (!HIDDEN_KEYS.includes(k)) filtered[k] = v;
        });
        return filtered;
      });
      setData(cleaned);
      setShowAIPanel(false);
      setShowManualPanel(false);
      })
    .catch((err) => console.error("❌ 無法讀取資料：", err));
  }, [selectedCollection, setSelectedEvaluation]);


  const renderCollectionComponent = () => {
    switch (selectedCollection) {
      case "employees":
        return <EmployeesView data={data} />;
      case "projects":
        return <ProjectsView data={data} />;
      case "decomposed_tasks":
        return <TasksView data={data} />;
      case "taskevaluations":
        return <EvaluationsView data={data} />;
      case "assignments":
        return <AssignmentsView data={data} />;
      default:
        return <p>❓ 尚未支援此 collection</p>;
    }
  };

  const shouldShowAIBtn = ["decomposed_tasks", "assignments"].includes(selectedCollection);

  return (
    <div style={{ padding: "20px", fontFamily: "Arial", fontSize: "20px", position: "relative" }}>
      <h2>📖 看板</h2>

      {/* AI 圓形按鈕 + 滑鼠移入提示框 */}
      {shouldShowAIBtn && (
        <div
          style={{
            position: "fixed",
            top: 20,
            right: 20,
            height: 50,
            width: 50,
            zIndex: 1000,
          }}
          onMouseEnter={() => !showAIPanel && setShowAITooltip(true)}
          onMouseLeave={() => setShowAITooltip(false)}
        >
          {/* 圓形按鈕 */}
          <div
            title="AI調整"
            onClick={() => 
              setShowAIPanel(true)
            }
            style={{
              width: 50,
              height: 50,
              backgroundColor: "black",
              color: "white",
              borderRadius: "50%",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
              fontSize: 20,
              userSelect: "none",
              position: "relative",
              zIndex: 10,
            }}
          >
            🤖
          </div>

          {/* 長圓形提示框，絕對定位相對於視窗右上方 */}
          <div
            style={{
              position: "fixed",
              top: 20,
              right: 20, // 50(圓形寬度) + 20(距右邊距離)
              height: 50,
              backgroundColor: "#333",
              color: "white",
              borderRadius: 25,
              fontSize: 16,
              display: "flex",
              alignItems: "center",
              paddingLeft: 15,
              whiteSpace: "nowrap",
              userSelect: "none",
              overflow: "hidden",

              width: showAITooltip ? 140 : 0,
              opacity: showAITooltip ? 1 : 0,
              transition: "width 0.3s ease, opacity 0.3s ease",
              zIndex: 9,
            }}
          >
        AI 重新調整
      </div>
    </div>

      )}

    {showAIPanel && shouldShowAIBtn && (
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
          zIndex: 3000,
          padding: 20,
          overflowY: "auto",
        }}
      >
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <h3 style={{ margin: 0 }}>🤖 AI 調整</h3>
          <button
            onClick={() => setShowAIPanel(false)}
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

        {isTaskDecomposing && (
          <ProjectTree
            evaluation={data}
            onClose={() => setShowAIPanel(false)}
            onRefresh={() => setSelectedEvaluation((c) => c + 1)}
          />
        )}

        {isAssignmentResult && (
          <AssignmentResult
            data={data}
            onClose={() => setShowAIPanel(false)}
            onRefresh={() => setSelectedEvaluation((c) => c + 1)}
          />
        )}

      </div>
    )}



      {/* 控制區域 */}
      <div style={{ marginBottom: 20 }}>
        {collections.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setSelectedCollection(key)}
            style={{
              marginRight: 10,
              padding: "8px 12px",
              backgroundColor: selectedCollection === key ? "#1976d2" : "#e0e0e0",
              color: selectedCollection === key ? "white" : "black",
              border: "none",
              borderRadius: 4,
              cursor: "pointer",
            }}
          >
            {label}
          </button>
        ))}

        {/* 匯出按鈕 */}
        <button
          onClick={() => {
            const blob = new Blob([JSON.stringify(data, null, 2)], {
              type: "application/json",
            });
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = `${selectedCollection}.json`;
            link.click();
          }}
          style={{
            marginLeft: 20,
            backgroundColor: "green",
            color: "white",
            padding: "8px 12px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          匯出 JSON
        </button>

        {/* 手動調整按鈕 */}
        <button
          onClick={() => setShowManualPanel(true)}
          style={{
            marginLeft: 10,
            backgroundColor: "#ff9800",
            color: "white",
            padding: "8px 12px",
            borderRadius: 4,
            border: "none",
            cursor: "pointer",
          }}
        >
          手動調整
        </button>
      </div>

      {/* 手動調整面板 */}
      {showManualPanel && (
        <div
          style={{
            position: "fixed",
            top: "50%",
            left: "50%",
            transform: "translate(-50%, -50%)",
            width: "80%",
            height: "80%",
            backgroundColor: "#fff",
            border: "2px solid #ccc",
            borderRadius: 10,
            boxShadow: "0 4px 20px rgba(0,0,0,0.3)",
            zIndex: 2000,
            padding: 30,
            overflowY: "auto",
          }}
        >
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
            <h2>🛠 手動調整視窗</h2>
            <button
              onClick={() => setShowManualPanel(false)}
              style={{
                background: "none",
                border: "none",
                fontSize: 24,
                cursor: "pointer",
              }}
            >
              ✖
            </button>
          </div>

          {/* 編輯器切換按鈕 */}
          <div style={{ display: "flex", gap: "1rem", marginTop: "1rem", marginBottom: "2rem" }}>
            <button
              onClick={() => setActiveEditor("task")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: activeEditor === "task" ? "#4CAF50" : "#ddd",
                color: activeEditor === "task" ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              任務拆分調整
            </button>
            <button
              onClick={() => setActiveEditor("assignment")}
              style={{
                padding: "0.5rem 1rem",
                backgroundColor: activeEditor === "assignment" ? "#4CAF50" : "#ddd",
                color: activeEditor === "assignment" ? "#fff" : "#000",
                border: "none",
                borderRadius: "5px",
                cursor: "pointer",
              }}
            >
              任務分配調整
            </button>
          </div>

          {/* 編輯器內容 */}
          {activeEditor === "assignment" && <AssignmentEditor />}
          {activeEditor === "task" && (
            <TaskEditor
              taskStructure={data.length > 0 ? data[0] : null}
              onUpdate={(updated) => console.log("TaskEditor updated:", updated)}
              onNext={() => console.log("TaskEditor 下一步")}
            />
          )}
        </div>
      )}

      <div style={{ maxHeight: "100vh", overflowY: "auto" }}>
        {renderCollectionComponent()}
      </div>
    </div>
  );
};

export default CollectionViewer;
