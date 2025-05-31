/*import React from "react";

const MetricBlock = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div style={{ marginLeft: "20px", fontSize: "14px", color: "#555" }}>
      {["risk", "difficulty", "story_point"].map((key) =>
        metrics[key] ? (
          <div key={key} style={{ marginBottom: 4 }}>
            <strong>{key.toUpperCase()}：</strong>
            <span> {metrics[key].number} 分</span>
            <br />
            <em>理由：{metrics[key].reason}</em>
          </div>
        ) : null
      )}
    </div>
  );
};

const TaskItem = ({ item }) => (
  <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
    <strong>Item：{item.name}</strong>
    <MetricBlock metrics={item.metrics} />
  </div>
);

const TaskBlock = ({ task }) => (
  <div style={{ marginLeft: "20px", marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
    <h4>Task：{task.name}</h4>
    <MetricBlock metrics={task.metrics} />
    {task.items?.map((item, idx) => (
      <TaskItem key={idx} item={item} />
    ))}
  </div>
);

const StoryBlock = ({ story }) => (
  <div style={{ marginBottom: "30px" }}>
    <h3>Story：{story.name}</h3>
    {story.tasks?.map((task, idx) => (
      <TaskBlock key={idx} task={task} />
    ))}
  </div>
);

const TaskEvaluationsView = ({ data }) => {
  if (!data || data.length === 0) return <p>⚠️ 尚無任務分析資料</p>;

  return (
    <div>
      {data.map((evalItem, index) => (
        <div key={index} style={{ padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px", borderRadius: "10px" }}>
          {evalItem.stories?.map((story, idx) => (
            <StoryBlock key={idx} story={story} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TaskEvaluationsView;*/
import React from "react";
const barColors = {
  risk: "#e53935",       // 紅色
  difficulty: "#fb8c00", // 橘色
};

const MetricBar = ({ label, score, max = 5, color }) => {
  const percentage = Math.min(score / max, 1) * 100;

  return (
    <div style={{ marginBottom: 8 }}>
      <div style={{ fontWeight: "bold", marginBottom: 4 }}>
        {label.toUpperCase()}：{score} 分
      </div>
      <div style={{
        height: 8,
        background: "#ddd",
        borderRadius: 4,
        overflow: "hidden",
        width: "200px"
      }}>
        <div style={{
          width: `${percentage}%`,
          height: "100%",
          backgroundColor: color,
          transition: "width 0.3s ease"
        }} />
      </div>
    </div>
  );
};

const MetricBlock = ({ metrics }) => {
  if (!metrics) return null;

  return (
    <div style={{ marginTop: "10px", marginLeft: "20px", fontSize: "14px", color: "#555" }}>
      {/* risk */}
      {metrics.risk && (
        <div style={{ marginBottom: 10 }}>
          <MetricBar
            label="risk"
            score={metrics.risk.number}
            color={barColors.risk}
            max={5}
          />
          <em style={{ color: "#666" }}> reason：{metrics.risk.reason}</em>
        </div>
      )}

      {/* difficulty */}
      {metrics.difficulty && (
        <div style={{ marginBottom: 10 }}>
          <MetricBar
            label="difficulty"
            score={metrics.difficulty.number}
            color={barColors.difficulty}
            max={5}
          />
          <em style={{ color: "#666" }}> reason：{metrics.difficulty.reason}</em>
        </div>
      )}

      {/* story_point */}
      {metrics.story_point && (
        <div style={{ marginBottom: 10 }}>
          <strong>STORY_POINT：</strong> {metrics.story_point.number} 點 ≈ {metrics.story_point.number * 0.5} 人天
          <br />
          <em style={{ color: "#666" }}> reason：{metrics.story_point.reason}</em>
        </div>
      )}
    </div>
  );
};



const TaskItem = ({ item }) => (
  <div style={{ marginLeft: "20px", marginBottom: "10px" }}>
    <strong>Item：{item.name}</strong>
    <MetricBlock metrics={item.metrics} />
  </div>
);

const TaskBlock = ({ task }) => (
  <div style={{ marginLeft: "20px", marginBottom: "20px", padding: "10px", border: "1px solid #ccc", borderRadius: "6px" }}>
    <h4>Task：{task.name}</h4>
    <MetricBlock metrics={task.metrics} />
    {task.items?.map((item, idx) => (
      <TaskItem key={idx} item={item} />
    ))}
  </div>
);

const StoryBlock = ({ story }) => (
  <div style={{ marginBottom: "30px" }}>
    <h3>Story：{story.name}</h3>
    {story.tasks?.map((task, idx) => (
      <TaskBlock key={idx} task={task} />
    ))}
  </div>
);

const TaskEvaluationsView = ({ data }) => {
  if (!data || data.length === 0) return <p>⚠️ 尚無任務分析資料</p>;

  return (
    <div>
      {data.map((evalItem, index) => (
        <div key={index} style={{ padding: "20px", backgroundColor: "#f9f9f9", marginBottom: "30px", borderRadius: "10px" }}>
          {evalItem.stories?.map((story, idx) => (
            <StoryBlock key={idx} story={story} />
          ))}
        </div>
      ))}
    </div>
  );
};

export default TaskEvaluationsView;
