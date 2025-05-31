import React from "react";

export default function ReasonSelect({
  id,
  type,
  reasonMap,
  customReasonMap,
  handleReasonChange,
  handleCustomReasonChange,
  reasonOptions
}) {
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
          {reasonOptions.map((r) => (
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
}