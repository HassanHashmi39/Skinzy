import * as api from './api';
import { getReportHTML } from './reportTemplate';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf/dist/jspdf.es.min.js';

export const generatePDF = async (result: any) => {
  try {
    // 1. Get logged-in user profile if available
    let patientInfo = null;
    try {
      const userRes = await api.getCurrentUser();
      if (userRes && userRes.user) {
        patientInfo = userRes.user;
      }
    } catch (err) {
      console.log('Generating report for guest user or unauthenticated session.');
    }

    // 2. Generate HTML
    const html = getReportHTML(result, patientInfo);

    // 3. Render HTML to PDF
    if (typeof window !== 'undefined') {
      const container = document.createElement('div');
      container.style.position = 'absolute';
      container.style.left = '-9999px';
      container.style.top = '0';
      // To ensure correct rendering width
      container.style.width = '800px'; 
      container.innerHTML = html;
      document.body.appendChild(container);

      // Wait for fonts/styles to load
      await new Promise(resolve => setTimeout(resolve, 500));

      const reportElement = container.querySelector('.report-container') as HTMLElement;
      
      if (!reportElement) {
        document.body.removeChild(container);
        throw new Error('Could not find report container');
      }

      const canvas = await html2canvas(reportElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        windowWidth: 800
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);
      
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = pdf.internal.pageSize.getHeight();
      
      const imgHeight = (canvas.height * pdfWidth) / canvas.width;
      let heightLeft = imgHeight;
      let position = 0;

      pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
      heightLeft -= pdfHeight;

      while (heightLeft > 0) {
        position = heightLeft - imgHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'JPEG', 0, position, pdfWidth, imgHeight);
        heightLeft -= pdfHeight;
      }

      // 4. Download PDF automatically
      const patientName = patientInfo?.name || 'Guest';
      const safeName = patientName.replace(/\\s+/g, '_');
      
      const createdDate = result.createdAt ? new Date(result.createdAt) : new Date();
      const dateString = createdDate.toISOString().split('T')[0];
      
      const fileName = `Skinzy_Report_${safeName}_${dateString}.pdf`;
      
      pdf.save(fileName);

      document.body.removeChild(container);
    }
  } catch (error) {
    console.error('Web PDF generation failed:', error);
    throw error;
  }
};
