import jsPDF from 'jspdf';
import { Inspection } from '../types/index.ts';

export function exportInspectionToPDF(inspection: Inspection): void {
  const doc = new jsPDF({
    orientation: 'portrait',
    unit: 'mm',
    format: 'a4'
  });

  const primaryColor = [15, 23, 42]; // slate-900
  const accentColor = inspection.anomalyDetected ? [220, 38, 38] : [22, 163, 74]; // red or green
  const mutedColor = [100, 116, 139]; // slate-500

  // Header band
  doc.setFillColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.rect(0, 0, 210, 30, 'F');

  // Title
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(18);
  doc.setFont('helvetica', 'bold');
  doc.text('VISIONIQ ENTERPRISE', 15, 14);

  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(203, 213, 225);
  doc.text('Automated Visual Intelligence & Anomaly Inspection Report', 15, 22);

  // Status Badge in Header
  doc.setFillColor(accentColor[0], accentColor[1], accentColor[2]);
  doc.rect(145, 8, 50, 14, 'F');
  doc.setTextColor(255, 255, 255);
  doc.setFont('helvetica', 'bold');
  doc.setFontSize(8);
  const statusText = inspection.anomalyDetected ? `ANOMALY: ${inspection.severity.toUpperCase()}` : 'STATUS: NOMINAL';
  doc.text(statusText, 170, 17, { align: 'center' });

  // Metadata Section
  let y = 42;
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('1. INSPECTION RECORD & TELEMETRY', 15, y);

  y += 7;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);

  doc.text('Inspection ID:', 15, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.setFont('helvetica', 'bold');
  doc.text(`VIQ-${String(inspection.id).padStart(6, '0')}`, 45, y);

  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.setFont('helvetica', 'normal');
  doc.text('Timestamp:', 110, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(new Date(inspection.createdAt).toLocaleString(), 135, y);

  y += 6;
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Target Domain:', 15, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(inspection.domain, 45, y);

  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Inspector:', 110, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(inspection.userName || `User #${inspection.userId}`, 135, y);

  y += 6;
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('Confidence Score:', 15, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text(`${inspection.confidenceScore}%`, 45, y);

  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('AI Engine:', 110, y);
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('Google Gemini Vision (2.5/3.8 Flash)', 135, y);

  // Executive Summary
  y += 12;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.text('2. DIAGNOSTIC ASSESSMENT & SUMMARY', 15, y);

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  const splitSummary = doc.splitTextToSize(inspection.summary || 'No summary available.', 180);
  doc.text(splitSummary, 15, y);
  y += splitSummary.length * 5 + 4;

  // Detected Objects Table
  y += 4;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('3. DETECTED FEATURES & BOUNDING COORDINATES', 15, y);

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  y += 6;
  doc.setFillColor(241, 245, 249);
  doc.rect(15, y, 180, 7, 'F');
  doc.setFontSize(8);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(71, 85, 105);
  doc.text('FEATURE / LABEL', 18, y + 5);
  doc.text('SEVERITY', 90, y + 5);
  doc.text('CONFIDENCE', 125, y + 5);
  doc.text('COORDINATES [Y1,X1,Y2,X2]', 155, y + 5);
  y += 9;

  const objects = inspection.rawAiResponse?.detectedObjects || [];
  if (objects.length === 0) {
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
    doc.text('No anomalies or bounding objects cataloged.', 18, y + 4);
    y += 8;
  } else {
    for (const obj of objects) {
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(30, 41, 59);
      doc.text(obj.label, 18, y + 4);
      doc.text(obj.severity || inspection.severity, 90, y + 4);
      doc.text(`${obj.confidence}%`, 125, y + 4);
      doc.text(`[${obj.box2d.join(', ')}]`, 155, y + 4);

      if (obj.details) {
        y += 4;
        doc.setFontSize(7.5);
        doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
        doc.text(`   Note: ${obj.details}`, 18, y + 3);
        doc.setFontSize(8);
      }

      y += 7;
      if (y > 260) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Recommendations
  y += 6;
  doc.setFontSize(11);
  doc.setFont('helvetica', 'bold');
  doc.setTextColor(primaryColor[0], primaryColor[1], primaryColor[2]);
  doc.text('4. REMEDIATION PROTOCOLS & ACTION PLAN', 15, y);

  y += 6;
  doc.setDrawColor(226, 232, 240);
  doc.line(15, y, 195, y);

  y += 6;
  const recs = inspection.rawAiResponse?.recommendations || [];
  doc.setFontSize(8.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(51, 65, 85);
  if (recs.length === 0) {
    doc.text('Standard nominal maintenance procedures apply.', 18, y);
    y += 6;
  } else {
    for (let i = 0; i < recs.length; i++) {
      const recLine = `${i + 1}. ${recs[i]}`;
      const splitRec = doc.splitTextToSize(recLine, 175);
      doc.text(splitRec, 18, y);
      y += splitRec.length * 4.5 + 2;
      if (y > 270) {
        doc.addPage();
        y = 20;
      }
    }
  }

  // Footer Certificate Notice
  doc.setDrawColor(226, 232, 240);
  doc.line(15, 280, 195, 280);
  doc.setFontSize(7.5);
  doc.setFont('helvetica', 'normal');
  doc.setTextColor(mutedColor[0], mutedColor[1], mutedColor[2]);
  doc.text('VisionIQ Enterprise - Certified AI Vision Inspection Audit Trail', 15, 285);
  doc.text(`Generated: ${new Date().toISOString()}`, 195, 285, { align: 'right' });

  // Save PDF
  doc.save(`VisionIQ-Inspection-${inspection.id}.pdf`);
}

export function exportInspectionsToCSV(inspections: Inspection[]): void {
  const headers = ['ID', 'Date', 'Domain', 'Inspector', 'Anomaly Detected', 'Severity', 'Confidence Score', 'Summary'];
  const rows = inspections.map((i) => [
    `VIQ-${i.id}`,
    new Date(i.createdAt).toISOString(),
    `"${i.domain.replace(/"/g, '""')}"`,
    `"${(i.userName || '').replace(/"/g, '""')}"`,
    i.anomalyDetected ? 'TRUE' : 'FALSE',
    i.severity,
    `${i.confidenceScore}%`,
    `"${(i.summary || '').replace(/"/g, '""')}"`
  ]);

  const csvContent = [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', `VisionIQ-Inspection-History-${new Date().toISOString().split('T')[0]}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
