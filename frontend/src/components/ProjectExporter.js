// src/components/ProjectExporter.js
import React, { useState } from 'react';
import axios from 'axios';
import { saveAs } from 'file-saver';
import { PDFDocument, StandardFonts, rgb } from 'pdf-lib';

export default function ProjectExporter() {
  const [projectId, setProjectId] = useState('');

  const generatePDF = async (data) => {
    const pdfDoc = await PDFDocument.create();
    const page = pdfDoc.addPage([600, 800]);
    const { width, height } = page.getSize();
    const font = await pdfDoc.embedFont(StandardFonts.HelveticaBold);

    // 標題
    page.drawText(data.projectName, {
      x: 50,
      y: height - 50,
      size: 24,
      font,
      color: rgb(0, 0.2, 0.4),
    });

    // 詳細內容
    let yPosition = height - 100;
    data.assignments.forEach((assignment, index) => {
      page.drawText(`${index + 1}. ${assignment.employee} (${assignment.position})`, {
        x: 50,
        y: yPosition,
        size: 14,
        font,
      });
      yPosition -= 30;
      
      page.drawText(`任務：\n${assignment.tasks}`, {
        x: 70,
        y: yPosition,
        size: 12,
        lineHeight: 15,
      });
      yPosition -= 80;
      
      page.drawText(`工作項目：\n${assignment.items}`, {
        x: 70,
        y: yPosition,
        size: 12,
        lineHeight: 15,
      });
      yPosition -= 120;
    });

    // 產生檔案
    const pdfBytes = await pdfDoc.save();
    saveAs(new Blob([pdfBytes]), `${data.projectName}_專案報告.pdf`);
  };

  const handleExport = async () => {
    try {
      const { data } = await axios.get(`/api/projects/export/${projectId}`);
      await generatePDF(data);
    } catch (err) {
      alert('匯出失敗: ' + err.message);
    }
  };

  return (
    <div className="exporter-container">
      <input
        type="text"
        value={projectId}
        onChange={(e) => setProjectId(e.target.value)}
        placeholder="輸入專案 ID"
      />
      <button onClick={handleExport} className="export-btn">
        產生專案報告 (PDF)
      </button>
    </div>
  );
}
