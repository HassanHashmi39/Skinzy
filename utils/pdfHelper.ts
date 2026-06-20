import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import * as FileSystem from 'expo-file-system';
import * as api from './api';
import { getReportHTML } from './reportTemplate';

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
    // We don't need weatherData in the new design, but we pass undefined
    const html = getReportHTML(result, patientInfo);

    // 3. Generate PDF file (raw)
    const { uri } = await Print.printToFileAsync({ html });

    // 4. Construct file name
    const patientName = patientInfo?.name || 'Guest';
    const safeName = patientName.replace(/\\s+/g, '_');
    const createdDate = result.createdAt ? new Date(result.createdAt) : new Date();
    const dateString = createdDate.toISOString().split('T')[0];
    const fileName = `Skinzy_Report_${safeName}_${dateString}.pdf`;

    // 5. Rename file for sharing
    const newUri = `${FileSystem.cacheDirectory}${fileName}`;
    await FileSystem.copyAsync({
      from: uri,
      to: newUri
    });

    // 6. Share/Download PDF file
    await Sharing.shareAsync(newUri, {
      mimeType: 'application/pdf',
      dialogTitle: 'Download Skin Analysis Report',
      UTI: 'com.adobe.pdf',
    });
  } catch (error) {
    console.error('Mobile PDF generation failed:', error);
    throw error;
  }
};
