import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { DailyLog } from '../types';

export const exportELDLogsToPDF = async (dailyLogs: DailyLog[], tripId: string): Promise<void> => {
  // Create a temporary container for PDF content
  const container = document.createElement('div');
  container.style.position = 'absolute';
  container.style.left = '-9999px';
  container.style.width = '800px';
  container.style.background = 'white';
  container.style.padding = '20px';
  container.style.fontFamily = 'Arial, sans-serif';
  
  // Build HTML content for PDF
  container.innerHTML = `
    <div style="text-align: center; margin-bottom: 30px;">
      <h1 style="color: #1e293b; margin: 0;">ELD Trip Logs</h1>
      <p style="color: #64748b; margin: 10px 0;">Trip ID: ${tripId}</p>
      <p style="color: #64748b; margin: 0;">Generated on ${new Date().toLocaleDateString()}</p>
    </div>
    
    <div style="margin-bottom: 20px;">
      <h2 style="color: #334155; border-bottom: 2px solid #e2e8f0; padding-bottom: 10px;">Daily Logs Summary</h2>
    </div>
    
    ${dailyLogs.map(log => `
      <div style="margin-bottom: 20px; border: 1px solid #e2e8f0; border-radius: 8px; padding: 15px; background: ${log.is_rest_day ? '#fef7cd' : '#f8fafc'};">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
          <h3 style="margin: 0; color: #1e293b;">Day ${log.day} - ${log.date}</h3>
          <span style="background: ${log.is_rest_day ? '#eab308' : '#3b82f6'}; color: white; padding: 4px 8px; border-radius: 4px; font-size: 12px;">
            ${log.is_rest_day ? 'REST DAY' : 'DRIVING DAY'}
          </span>
        </div>
        
        <div style="display: grid; grid-template-columns: repeat(4, 1fr); gap: 15px; margin-bottom: 10px;">
          <div>
            <strong style="color: #64748b;">Driving Hours:</strong><br>
            <span style="font-size: 18px; color: #1e293b;">${log.drive_hours.toFixed(1)}</span>
          </div>
          <div>
            <strong style="color: #64748b;">On-Duty Hours:</strong><br>
            <span style="font-size: 18px; color: #1e293b;">${log.on_duty_hours.toFixed(1)}</span>
          </div>
          <div>
            <strong style="color: #64748b;">Off-Duty Hours:</strong><br>
            <span style="font-size: 18px; color: #1e293b;">${log.off_duty_hours.toFixed(1)}</span>
          </div>
          <div>
            <strong style="color: #64748b;">Miles:</strong><br>
            <span style="font-size: 18px; color: #1e293b;">${log.miles}</span>
          </div>
        </div>
        
        ${log.notes.length > 0 ? `
          <div style="margin-top: 10px;">
            <strong style="color: #64748b;">Notes:</strong>
            ${log.notes.map(note => `<span style="background: #e2e8f0; padding: 2px 6px; border-radius: 4px; margin-left: 5px; font-size: 12px;">${note}</span>`).join('')}
          </div>
        ` : ''}
      </div>
    `).join('')}
  `;
  
  document.body.appendChild(container);
  
  try {
    // Convert HTML to canvas
    const canvas = await html2canvas(container, {
      backgroundColor: 'white',
      scale: 2,
      useCORS: true
    });
    
    // Create PDF
    const pdf = new jsPDF('p', 'mm', 'a4');
    const imgData = canvas.toDataURL('image/png');
    
    const pdfWidth = pdf.internal.pageSize.getWidth();
    const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
    
    pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
    
    // Download PDF
    pdf.save(`eld-logs-${tripId}.pdf`);
    
  } finally {
    // Clean up
    document.body.removeChild(container);
  }
};