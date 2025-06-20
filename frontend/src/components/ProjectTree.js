import React, { useState, useEffect } from "react";
import Checkbox from "./Aiadj/Checkbox";
import ReasonSelect from "./Aiadj/ReasonSelect";
import StoryItem from "./Aiadj/StoryItem";

const project = {
  _id: "project_001",
  name: "Project",
};

const projectReasons = ["拆分不均勻", "分析邏輯錯誤", "拆分過於細碎", "拆分過於粗糙", "其他"];
const storyReasons = ["缺乏明確完成定義", "低估或遺漏工作內容", "Task 拆分不均勻", "未考慮驗證與測試", "其他"];
const taskReasons = ["缺乏明確完成定義", "低估或遺漏工作內容", "Item 拆分不均勻", "其他"];

export default function ProjectTree() {
  const [data, setData] = useState([]);
  const [checkedItems, setCheckedItems] = useState({});
  const [reasonMap, setReasonMap] = useState({});
  const [customReasonMap, setCustomReasonMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState("");

  useEffect(() => {
    fetch("http://localhost:3001/api/taskdecompose")
      .then((res) => res.json())
      .then((json) => {
        const converted = json.map((story, storyIndex) => ({
          _id: story._id || `story_${storyIndex}`,
          name: story.name || `Story ${storyIndex + 1}`,
          tasks: (story.tasks || []).map((task, taskIndex) => ({
            _id: `${story._id || `story_${storyIndex}`}_task_${taskIndex}`,
            name: task.name || `Task ${taskIndex + 1}`,
          }))
        }));
        setData(converted);
        setLoading(false);
        console.log("Fetched data:", converted);
      })
      .catch(() => setLoading(false));
  }, []);

  const toggleCheck = (id, type, storyId = null, taskIds = []) => {
    setCheckedItems((prev) => {
      const newChecked = { ...prev };
      if (id === "project") {
        if (!prev.project) {
          Object.keys(newChecked).forEach((key) => {
            if (key !== "project") delete newChecked[key];
          });
          newChecked.project = true;
        } else {
          delete newChecked.project;
        }
        return newChecked;
      }
      if (type === "story") {
        if (!prev[id]) {
          delete newChecked.project;
          taskIds.forEach((tid) => delete newChecked[tid]);
          newChecked[id] = true;
        } else {
          delete newChecked[id];
        }
        return newChecked;
      }
      if (type === "task") {
        if (!prev[id]) {
          delete newChecked.project;
          if (storyId) delete newChecked[storyId];
          newChecked[id] = true;
        } else {
          delete newChecked[id];
        }
        return newChecked;
      }
      return newChecked;
    });
    setReasonMap((prev) => ({ ...prev, [id]: "" }));
    setCustomReasonMap((prev) => ({ ...prev, [id]: "" }));
  };

  const handleReasonChange = (id, value) => {
    setReasonMap((prev) => ({ ...prev, [id]: value }));
    if (value !== "其他") setCustomReasonMap((prev) => ({ ...prev, [id]: "" }));
  };

  const handleCustomReasonChange = (id, value) => {
    setCustomReasonMap((prev) => ({ ...prev, [id]: value }));
  };

  const pollStatus = () => {
    const interval = setInterval(() => {
      fetch("http://localhost:3001/api/reassign/status")
        .then((res) => res.json())
        .then((statusData) => {
          if (statusData.error) {
            setSubmitMessage("送出失敗：" + statusData.error);
            clearInterval(interval);
            setTimeout(() => setSubmitMessage(""), 3000);
            return;
          }
            const phaseNameMap = {
              redecompose: "重新拆分階段",
              evaluation: "評估階段",
              assignTasks: "任務指派階段"
            };
            const statusTextMap = {
              idle: "空閒中",
              running: "執行中",
              done: "完成",
              error: "錯誤"
            };
          const phases = ["redecompose", "evaluation", "assignTasks"];
          for (const phase of phases) {
            const phaseStatus = statusData[phase];
            const phaseName = phaseNameMap[phase] || phase;
            if (phaseStatus === "running") {
              setSubmitMessage(`${phaseName} ${statusTextMap[phaseStatus] || phaseStatus}...`);
              return;
            }
            if (phaseStatus === "error") {
              setSubmitMessage(`錯誤發生於階段：${phase}`);
              clearInterval(interval);
              return;
            }
          }

          // 如果所有都完成
          setSubmitMessage("更新成功！");
          clearInterval(interval);
          setTimeout(() => {
            window.location.reload();
          }, 2000);
        })
        .catch((err) => {
          console.error("Polling error:", err);
          setSubmitMessage("讀取狀態失敗");
          clearInterval(interval);
          setTimeout(() => setSubmitMessage(""), 3000);
        });
    }, 900); 
  };

    const handleSubmit = () => {
    try {
        const payload = Object.entries(checkedItems)
        .filter(([, checked]) => checked)
        .map(([id]) => {
            let type = "task", name = "", againId = id;
            if (id === "project") {
            type = "project";
            name = project.name;
            againId = "000000000000000000000000";
            } else {
            for (const story of data) {
                if (story._id === id) {
                type = "story";
                name = story.name;
                break;
                }
                for (const task of story.tasks) {
                if (task._id === id) {
                    type = "task";
                    name = task.name;
                    break;
                }
                }
            }
            }
            if (reasonMap[id] === "其他") {
            if (!customReasonMap[id]?.trim()) {
                throw new Error(`項目 ${name} 選了「其他」，請填寫自訂理由`);
            }
            } else if (!reasonMap[id]?.trim()) {
            throw new Error(`項目 ${name} 必須選擇理由`);
            }
            const reason = reasonMap[id] === "其他" ? customReasonMap[id].trim() : reasonMap[id];
            return { type, name, reason, againId };
        });

        fetch("http://localhost:3001/api/readjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(() => {
          setCheckedItems({});
          setReasonMap({});
          setCustomReasonMap({});
          setSubmitMessage("送出成功！");
          pollStatus();
        })
       .catch(() => {
            setSubmitMessage("送出失敗");
            setTimeout(() => setSubmitMessage(""), 3000);
        });
    } catch (err) {
        setSubmitMessage(err.message);
        setTimeout(() => setSubmitMessage(""), 3000);
    }
    };


  if (loading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div>No data</div>;
  if (submitMessage) {
    return (
        <div style={{ color: "green", marginTop: 20 }}>{submitMessage}</div>
    );
    }
  return (
    <div style={{ maxHeight: "90vh", overflowY: "auto", paddingRight: 16 }}>
      <Checkbox
        label={project.name}
        checked={!!checkedItems["project"]}
        onChange={() => toggleCheck("project", "project")}
      />
      {checkedItems["project"] && (
        <ReasonSelect
          id="project"
          type="project"
          reasonMap={reasonMap}
          customReasonMap={customReasonMap}
          handleReasonChange={handleReasonChange}
          handleCustomReasonChange={handleCustomReasonChange}
          reasonOptions={projectReasons}
        />
      )}

      {!checkedItems["project"] &&
        data.map((story) => (
          <div
            key={story._id}
            style={{ border: "1px solid #ccc", marginBottom: 20, padding: 10 }}
          >
            <StoryItem
              story={story}
              checkedItems={checkedItems}
              toggleCheck={toggleCheck}
              reasonMap={reasonMap}
              customReasonMap={customReasonMap}
              handleReasonChange={handleReasonChange}
              handleCustomReasonChange={handleCustomReasonChange}
              storyReasons={storyReasons}
              taskReasons={taskReasons}
            />
          </div>
        ))}

      <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
        <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
          重新調整
        </button>
        {submitMessage && (
            <div
                style={{
                marginBottom: 16,
                color: submitMessage.includes("失敗") ? "red" : "green",
                }}
            >
                {submitMessage}
            </div>
            )}
      </div>
    </div>
  );
}
