import React, { useState } from "react";

function RedistributeForm() {
  const [reason, setReason] = useState("");
  const [customReason, setCustomReason] = useState("");
  const [status, setStatus] = useState("form"); // form | submitted | redistributing | success

  const handleSubmit = async (e) => {
  e.preventDefault();
  const finalReason = reason === "其他" ? customReason : reason;
  const jsonData = { reason: finalReason };

  // 先直接顯示「提交成功！」
  setStatus("submitted");

  try {
    // 等待1.5秒讓使用者看到「提交成功！」
    await new Promise((resolve) => setTimeout(resolve, 1500));

    // 顯示「任務重新分配中」
    setStatus("redistributing");

    // 呼叫後端
    const response = await fetch("http://localhost:3001/api/reassign", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(jsonData),
    });

    if (!response.ok) throw new Error("伺服器錯誤");

    const result = await response.json();
    if (result.message === "重新分配已完成") {
      // 顯示「重新分配成功！」1.5秒
      setStatus("success");
      await new Promise((resolve) => setTimeout(resolve, 1500));
      window.location.reload();
    }
    } catch (error) {
      console.error("送出失敗:", error);
      alert("送出失敗，請稍後再試");
      setStatus("form"); // 發生錯誤回到表單
    }
  };


  return (
    <div style={{ padding: 20 }}>
      {status === "form" && (
        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: 10 }}>
            <label style={{ display: "block", marginBottom: 5 }}>原因：</label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              style={{
                padding: 8,
                width: "100%",
                boxSizing: "border-box",
              }}
              required
            >
              <option value="">請選擇一個原因</option>
              <option value="分配不均衡">分配不均衡</option>
              <option value="不符合成員的技能">不符合成員的技能</option>
              <option value="分配過於細碎">分配過於細碎</option>
              <option value="分配過於粗糙">分配過於粗糙</option>
              <option value="其他">其他</option>
            </select>
          </div>

          {reason === "其他" && (
            <div style={{ marginBottom: 10 }}>
              <label style={{ display: "block", marginBottom: 5 }}>&nbsp;</label>
              <input
                type="text"
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                placeholder="請填寫原因"
                style={{
                  padding: 8,
                  width: "100%",
                  boxSizing: "border-box",
                }}
                required
              />
            </div>
          )}

          <div style={{ display: "flex", alignItems: "center", marginTop: 20 }}>
            <button type="submit" style={{ padding: "8px 16px" }}>
              重新調整
            </button>
          </div>
        </form>
      )}

      {status === "submitted" && (
        <p style={{ fontWeight: "bold", color: "green" }}>提交成功！</p>
      )}

      {status === "redistributing" && (
        <p style={{ fontWeight: "bold", color: "#555" }}>任務重新分配中...</p>
      )}

      {status === "success" && (
        <p style={{ fontWeight: "bold", color: "green" }}>重新分配成功！</p>
      )}
    </div>
  );
}

export default RedistributeForm;
