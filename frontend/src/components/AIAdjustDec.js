import React, { useState, useEffect } from "react";

function Checkbox({ label, checked, onChange }) {
  return (
    <label style={{ display: "block", marginLeft: "1em", marginTop: 5 }}>
      <input type="checkbox" checked={checked} onChange={onChange} />
      {label}
    </label>
  );
}

const project = {
  _id: "project_001",
  name: "Project",
};

const projectReasons = ["拆分不均勻", "分析邏輯錯誤", "拆分過於細碎", "拆分過於粗糙", "其他"];
const storyReasons = ["缺乏明確完成定義", "低估或遺漏工作內容", "Task 拆分不均勻", "未考慮驗證與測試", "其他"];
const taskReasons = ["不合理分工", "過於細碎", "需要重新命名", "其他"];

export default function ProjectTree() {
  const [data, setData] = useState([]); // 存 stories 陣列
  const [checkedItems, setCheckedItems] = useState({});
  const [reasonMap, setReasonMap] = useState({});
  const [customReasonMap, setCustomReasonMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [submitMessage, setSubmitMessage] = useState("");

  // 取得 stories 陣列

  useEffect(() => {
    fetch("http://localhost:3001/api/taskdecompose")
      .then((res) => res.json())
      .then((json) => {
        console.log("Raw fetched data:", json);

        const converted = json.map((story, storyIndex) => {
          return {
            _id: story._id || `story_${storyIndex}`, // 若 story 沒有 _id 就補一個
            name: story.name || `Story ${storyIndex + 1}`,
            tasks: (story.tasks || []).map((task, taskIndex) => ({
              _id: `${story._id || `story_${storyIndex}`}_task_${taskIndex}`,
              name: task.name || `Task ${taskIndex + 1}`
            }))
          };
        });

        setData(converted);
        setCheckedItems({});
        setReasonMap({});
        setCustomReasonMap({});
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);


  const handleReasonChange = (id, value) => {
    setReasonMap((prev) => ({ ...prev, [id]: value }));
    if (value !== "其他") setCustomReasonMap((prev) => ({ ...prev, [id]: "" }));
  };

  const handleCustomReasonChange = (id, value) => {
    setCustomReasonMap((prev) => ({ ...prev, [id]: value }));
  };

  // 點擊 checkbox 切換狀態
  const toggleCheck = (id, type, storyId = null, taskIds = []) => {
    setCheckedItems((prev) => {
      const newChecked = { ...prev };

      if (id === "project") {
        // project 勾選取消時清空其他所有選項
        if (!prev.project) {
          // 勾選 project 時，清除 story/task
          Object.keys(newChecked).forEach((key) => {
            if (key !== "project") delete newChecked[key];
          });
          newChecked.project = true;
        } else {
          // 取消 project
          delete newChecked.project;
        }
        return newChecked;
      }

      if (type === "story") {
        if (!prev[id]) {
          // 勾選故事，移除 project 以及該故事底下 task 的勾選
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
          // 勾選任務，移除 project 以及該任務的 story 勾選
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

    // 切換時清除理由
    setReasonMap((prev) => ({ ...prev, [id]: "" }));
    setCustomReasonMap((prev) => ({ ...prev, [id]: "" }));
  };

  // 選擇理由下拉選單
  const renderReasonSelect = (id, type) => {
    let reasons = [];
    if (type === "project") reasons = projectReasons;
    else if (type === "story") reasons = storyReasons;
    else if (type === "task") reasons = taskReasons;

    const selected = reasonMap[id] || "";
    const isOther = selected === "其他";

    return (
      <div style={{ marginLeft: "2em", marginTop: 4 }}>
        <label>
          理由：
          <select
            value={selected}
            onChange={(e) => handleReasonChange(id, e.target.value)}
            style={{ marginLeft: 8 }}
          >
            <option value="">請選擇</option>
            {reasons.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </label>
        {isOther && (
          <div style={{ marginTop: 4 }}>
            <input
              type="text"
              value={customReasonMap[id] || ""}
              onChange={(e) => handleCustomReasonChange(id, e.target.value)}
              placeholder="請輸入自定義理由"
              style={{ marginLeft: 8 }}
            />
          </div>
        )}
      </div>
    );
  };

  // 渲染任務
  const renderTasks = (tasks, storyId) =>
    tasks.map((task) => {
      const show = checkedItems[task._id];
      return (
        <div key={task._id} style={{ marginLeft: "2em" }}>
          <Checkbox
            label={task.name}
            checked={!!checkedItems[task._id]}
            onChange={() => toggleCheck(task._id, "task", storyId)}
          />
          {show && renderReasonSelect(task._id, "task")}
        </div>
      );
    });

  // 渲染故事
  const renderStories = (stories) =>
    stories.map((story) => {
      const isChecked = !!checkedItems[story._id];
      const taskIds = Array.isArray(story.tasks) ? story.tasks.map((t) => t._id) : [];


      return (
        <div key={story._id} style={{ marginLeft: "1em", marginTop: 10 }}>
          <Checkbox
            label={story.name}
            checked={isChecked}
            onChange={() => toggleCheck(story._id, "story", null, taskIds)}
          />
          {isChecked && renderReasonSelect(story._id, "story")}
          {!isChecked && renderTasks(story.tasks, story._id)}
        </div>
      );
    });

  // 送出調整資料
  const handleSubmit = () => {
    try {
      const payload = Object.entries(checkedItems)
        .filter(([, checked]) => checked)
        .map(([id]) => {
          let type = "task",
            name = "",
            againId = id;

          if (id === "project") {
            type = "project";
            name = project.name;
            againId = "000000000000000000000000"; // 你可以自己決定 Project 的 againId
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
            if (!customReasonMap[id] || customReasonMap[id].trim() === "") {
              throw new Error(`項目 ${name} 選了「其他」，請填寫自訂理由`);
            }
          } else if (!reasonMap[id] || reasonMap[id].trim() === "") {
            throw new Error(`項目 ${name} 必須選擇理由`);
          }

          const reason =
            reasonMap[id] === "其他" ? customReasonMap[id].trim() : reasonMap[id];
          return { type, name, reason, againId };
        });

      fetch("http://localhost:3001/api/readjust", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })
        .then((res) => (res.ok ? res.json() : Promise.reject()))
        .then(() => {
          setSubmitMessage("送出成功！");
          setCheckedItems({});
          setReasonMap({});
          setCustomReasonMap({});
        })
        .catch(() => setSubmitMessage("送出失敗"));
    } catch (err) {
      setSubmitMessage(err.message);
    }
  };

  if (loading) return <div>Loading...</div>;
  if (!data || data.length === 0) return <div>No data</div>;

  return (
    
    <div style={{ maxHeight: "90vh", overflowY: "auto", paddingRight: 16 }}>
      {/* Project Checkbox */}
      <Checkbox
        label={project.name}
        checked={!!checkedItems["project"]}
        onChange={() => toggleCheck("project", "project")}
      />
      {checkedItems["project"] && renderReasonSelect("project", "project")}

      {/* Stories list */}
      {!checkedItems["project"] &&
        data.map((story) => (
          <div
            key={story._id}
            style={{ border: "1px solid #ccc", marginBottom: 20, padding: 10 }}
          >
            {renderStories([story])}
          </div>
        ))}

      <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
        <button onClick={handleSubmit} style={{ padding: "8px 16px" }}>
            重新調整
        </button>
        {submitMessage && (
            <div
            style={{
                marginLeft: 16,
                color: submitMessage.includes("失敗") ? "red" : "green",
                whiteSpace: "nowrap",
            }}
            >
            {submitMessage}
            </div>
        )}
        </div>

    </div>
  );
}
