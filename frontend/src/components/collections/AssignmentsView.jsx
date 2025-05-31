import React from "react";

const AssignmentsView = ({ data }) => {
  if (!data || data.length === 0) {
    return <p>❗尚無指派資料</p>;
  }

  // 假設只有一個專案（根據你提供的資料），取第一個就好
  const project = data[0];

  return (
    <div style={{ padding: "20px" }}>
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "20px",
        }}
      >
        {project.assignments?.map((assignment, i) => (
          <div
            key={i}
            style={{
              width: "300px",
              border: "1px solid #ccc",
              borderRadius: "10px",
              padding: "15px",
              backgroundColor: "#fefefe",
              boxShadow: "0 2px 6px rgba(0, 0, 0, 0.1)",
            }}
          >
            <p><strong>{assignment.employee}</strong></p>
            <p><strong>Task：</strong>{assignment.tasks?.join(", ")}</p>
            <p><strong> Item：</strong></p>
            <ul>
              {assignment.items?.map((item, j) => (
                <li key={j}> {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AssignmentsView;
