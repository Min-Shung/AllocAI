import React, { useState } from 'react';
import axios from 'axios';

export default function FeedbackForm() {
  const [action, setAction] = useState('');
  const [reason, setReason] = useState('');
  const [comment, setComment] = useState('');
  const [result, setResult] = useState(null);

  const reasonOptions = {
    '重新拆分': ['拆分結果不合理', '分析邏輯錯誤', '忽略優先順序', '其他'],
    '重新分配': ['分配不均', '員工負擔過重', '忽略人員技能差異', '分配結果重複或衝突', '其他'],
  };


  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-blue-100 p-6">
      <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl p-8">
        <h1 className="text-3xl font-extrabold mb-6 text-blue-700">任務回饋表單</h1>

        <div className="space-y-4">
          <div>
            <label className="block font-medium mb-1">📌 選擇操作</label>
            <select
              value={action}
              onChange={(e) => {
                setAction(e.target.value);
                setReason('');
              }}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">請選擇</option>
              <option value="重新分配">🔁 重新分配任務</option>
              <option value="重新拆分">🧩 重新拆分並重跑</option>
            </select>
          </div>

          {action && (
            <div>
              <label className="block font-medium mb-1">📍 不滿意原因</label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
              >
                <option value="">請選擇原因</option>
                {(reasonOptions[action] || []).map((option, idx) => (
                  <option key={idx} value={option}>
                    {option}
                  </option>
                ))}
              </select>
            </div>
          )}

          {(reason === '其他' || comment) && (
            <div>
              <label className="block font-medium mb-1">📝 補充說明</label>
              <textarea
                value={comment}
                onChange={(e) => setComment(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded"
                rows={4}
                placeholder="請輸入具體不滿意的內容..."
              />
            </div>
          )}

          <button
            onClick={handleSubmit}
            className="w-full bg-blue-600 text-white py-2 rounded hover:bg-blue-700 transition"
          >
            🚀 提交意見
          </button>
        </div>
      </div>
    </div>
  );
}
