class EmployeeAnalysis {
  analyzeTaskCompatibility(employee, task) {
    // 這裡放你之前的分析邏輯
    // 回傳一個 JSON 結果
    return {
      compatibilityScore: 90, // 假設分數
      details: {
        mbtiMatch: 80,
        skillMatch: 90
      },
      recommendation: '強烈推薦'
    };
  }
}

module.exports = EmployeeAnalysis;
