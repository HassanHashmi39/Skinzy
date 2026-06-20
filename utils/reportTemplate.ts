import { SkinAnalysisResult } from './types';

export function getReportHTML(
  result: SkinAnalysisResult,
  patientInfo?: any,
  weatherData?: any
): string {
  // Format Date & Time
  const createdDate = result.createdAt ? new Date(result.createdAt) : new Date();
  
  // Format exactly like: 14 June 2026
  const formattedDate = createdDate.toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
  
  // Format exactly like: 02:45 PM
  const formattedTime = createdDate.toLocaleTimeString('en-US', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  });

  const reportId = result._id || 'SKN-2026-001245';

  const isGuest = !patientInfo || !patientInfo.name;
  const patientName = isGuest ? 'Guest User' : patientInfo.name;
  const patientEmail = isGuest ? 'guest@skinzy.ai' : (patientInfo.email || 'Not Provided');
  const patientGender = isGuest ? 'Not Specified' : (patientInfo.gender || 'Not Specified');
  const patientAge = isGuest ? 'N/A' : (patientInfo.age || 'N/A');
  const patientCity = isGuest ? 'Unknown' : (patientInfo.city || patientInfo.location || 'Unknown');
  const patientSkinType = result.skinType || 'Combination';

  const confidence = result.confidence || '64%';
  let aiDetected = result.detectedDisease || result.skinType || 'Healthy / Normal Skin';
  if (aiDetected.toLowerCase() === 'normal' || aiDetected.toLowerCase() === 'healthy') {
      aiDetected = 'Healthy / Normal Skin';
  }
  
  let conditionLevel = result.conditionLevel || 'Good';
  // Capitalize first letter
  conditionLevel = conditionLevel.charAt(0).toUpperCase() + conditionLevel.slice(1);

  // AI Interpretation
  let aiInterpretation = result.advice || `Your skin is looking healthy.\nStay consistent with your routine.`;
  if (!result.advice && conditionLevel.toLowerCase() !== 'good') {
      aiInterpretation = `The AI detected signs of ${aiDetected}. A consistent routine targeting this issue is highly recommended.`;
  }
  if (conditionLevel.toLowerCase() === 'good' && !result.advice) {
      aiInterpretation = "Great Skin Health!\nYour skin is looking healthy.\nStay consistent with your routine.";
  }

  // Action plan logic
  const morningRoutine = (result.morningRoutine && result.morningRoutine.length > 0) 
    ? result.morningRoutine 
    : ['Gentle Cleanser', 'Active Serum (Vitamin C)', 'Sunscreen SPF 60+'];
    
  const nightRoutine = (result.nightRoutine && result.nightRoutine.length > 0) 
    ? result.nightRoutine 
    : ['Double Cleanse', 'Targeted Treatment', 'Reparative Moisturizer'];

  // Dos and Donts logic
  const dos = (result.dos && result.dos.length > 0) 
    ? result.dos 
    : [
      'Maintain daily skincare routine',
      'Gentle cleanser morning & night',
      'Light moisturizer',
      'Daily SPF 30+ sunscreen',
      'Weekly gentle exfoliation',
      'Stay hydrated (8+ glasses water/day)'
    ];

  const donts = (result.donts && result.donts.length > 0) 
    ? result.donts 
    : [
      'Avoid oily/salty food',
      "Don't touch face unnecessarily",
      'Never skip sunscreen'
    ];

  // Golden Rules
  const goldenRules = [
    'Sunscreen is MUST (SPF 50+ Daily)',
    'Gentle skincare is better than harsh products',
    'Consistency is key for results',
    'Avoid random DIY treatments'
  ];

  // Products
  const products = (result.recommendations && result.recommendations.length > 0) 
    ? result.recommendations.map(p => ({
        name: `${p.brand || ''} ${p.name || ''}`.trim(),
        category: p.category || 'Skincare'
    })) 
    : [
      { name: 'Cetaphil Gentle Skin Cleanser', category: 'Skincare' },
      { name: 'CeraVe Daily Moisturizing Lotion', category: 'Skincare' },
      { name: "L'Oreal Daily UV Defender SPF 50", category: 'Sunscreen' },
      { name: 'Cosrx Gentle Exfoliator', category: 'Exfoliation' }
    ];

  return `
  <!DOCTYPE html>
  <html lang="en">
  <head>
    <meta charset="UTF-8">
    <title>Skinzy AI Analysis Report</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap');
      
      body {
        font-family: 'Inter', -apple-system, sans-serif;
        color: #1F2937;
        margin: 0;
        padding: 0;
        line-height: 1.3;
        background-color: #FFFFFF;
        font-size: 11px;
      }
      
      .report-container {
        width: 100%;
        max-width: 800px;
        margin: 0 auto;
        padding: 20px;
        box-sizing: border-box;
      }

      h1, h2, h3, h4 {
        margin: 0 0 6px 0;
        color: #111827;
      }

      p {
        margin: 0 0 6px 0;
      }

      .header {
        border-bottom: 2px solid #E5E7EB;
        padding-bottom: 10px;
        margin-bottom: 15px;
        display: flex;
        justify-content: space-between;
        align-items: center;
      }

      .header-title h1 {
        font-size: 20px;
        font-weight: 900;
        color: #6D28D9;
        text-transform: uppercase;
        letter-spacing: 1px;
        margin-bottom: 2px;
      }
      
      .header-title h2 {
        font-size: 12px;
        font-weight: 600;
        color: #4B5563;
      }

      .header-info {
        font-size: 10px;
        text-align: right;
      }

      .header-info div {
        margin-bottom: 3px;
      }

      .card {
        background: #F9FAFB;
        border: 1px solid #E5E7EB;
        border-radius: 8px;
        padding: 12px;
        margin-bottom: 12px;
      }

      .card-title {
        font-size: 13px;
        font-weight: 800;
        color: #4C1D95;
        border-bottom: 1px solid #D1D5DB;
        padding-bottom: 6px;
        margin-bottom: 10px;
        text-transform: uppercase;
      }

      .grid-2 {
        display: flex;
        gap: 12px;
        margin-bottom: 12px;
      }
      .grid-2 > div {
        flex: 1;
      }

      .patient-info {
        display: grid;
        grid-template-columns: 80px 1fr 80px 1fr;
        gap: 4px 8px;
      }
      .patient-info strong {
        color: #6B7280;
        font-weight: 600;
        font-size: 10px;
      }
      .patient-info span {
        font-weight: 700;
        font-size: 11px;
      }

      .highlight-box {
        background: #EDE9FE;
        border: 2px solid #C4B5FD;
        border-radius: 8px;
        padding: 12px;
        text-align: center;
        margin-bottom: 12px;
      }
      .highlight-box h2 {
        font-size: 16px;
        color: #5B21B6;
        margin-bottom: 4px;
      }
      .highlight-box p {
        font-size: 12px;
        color: #4C1D95;
      }
      .highlight-box .confidence {
        display: inline-block;
        background: #5B21B6;
        color: white;
        padding: 4px 12px;
        border-radius: 20px;
        font-weight: 700;
        font-size: 11px;
        margin-top: 6px;
      }

      .ai-detection {
        background: #ECFDF5;
        border: 1px solid #A7F3D0;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      
      .golden-rules {
        background: #FEF3C7;
        border: 2px solid #FCD34D;
        padding: 12px;
        border-radius: 8px;
        margin-bottom: 12px;
      }
      .golden-rules h3 {
        color: #B45309;
        font-size: 13px;
        margin-bottom: 8px;
      }

      ul, ol {
        margin: 0;
        padding-left: 16px;
      }
      li {
        margin-bottom: 4px;
      }

      .list-unstyled {
        list-style: none;
        padding-left: 0;
      }
      .list-unstyled li {
        margin-bottom: 4px;
        display: flex;
        align-items: flex-start;
      }
      .list-unstyled li::before {
        margin-right: 6px;
        font-weight: bold;
      }
      .dos li::before {
        content: '✓';
        color: #059669;
      }
      .donts li::before {
        content: '•';
        color: #DC2626;
      }

      table {
        width: 100%;
        border-collapse: collapse;
        margin-top: 6px;
      }
      th, td {
        padding: 6px 8px;
        text-align: left;
        border-bottom: 1px solid #E5E7EB;
        font-size: 10px;
      }
      th {
        background-color: #F3F4F6;
        color: #374151;
        font-weight: 700;
        font-size: 10px;
      }
      tr:last-child td {
        border-bottom: none;
      }

      .disclaimer {
        margin-top: 15px;
        background-color: #FFFBEB;
        border: 1px dashed #F59E0B;
        padding: 10px;
        border-radius: 8px;
        font-size: 9px;
        color: #B45309;
        text-align: center;
      }

      .disclaimer strong {
        display: block;
        font-size: 10px;
        margin-bottom: 4px;
        text-transform: uppercase;
      }

      /* Helper classes for spacing */
      .mb-0 { margin-bottom: 0; }
      .mt-0 { margin-top: 0; }

      /* PDF specific rules */
      .page-break {
        page-break-before: always;
        break-before: page;
      }
      .no-break {
        page-break-inside: avoid;
        break-inside: avoid;
      }
    </style>
  </head>
  <body>
    <div class="report-container">
      
      <!-- HEADER -->
      <div class="header">
        <div class="header-title">
          <h1>SKINZY</h1>
          <h2>AI-Powered Skin Analysis Report</h2>
        </div>
        <div class="header-info">
          <div><strong>Report ID:</strong> ${reportId}</div>
          <div><strong>Date:</strong> ${formattedDate}</div>
          <div><strong>Time:</strong> ${formattedTime}</div>
        </div>
      </div>

      <!-- PATIENT INFORMATION -->
      <div class="card">
        <div class="card-title">Patient Information</div>
        <div class="patient-info">
          <strong>Name:</strong> <span>${patientName}</span>
          <strong>Gender:</strong> <span>${patientGender}</span>
          <strong>Email:</strong> <span><a href="mailto:${patientEmail}" style="color:#2563EB; text-decoration:none;">${patientEmail}</a></span>
          <strong>Age:</strong> <span>${patientAge}</span>
          <strong>City:</strong> <span>${patientCity}</span>
          <strong>Skin Type:</strong> <span>${patientSkinType}</span>
        </div>
      </div>

      <div class="grid-2">
        <!-- ANALYSIS RESULT HIGHLIGHT -->
        <div class="highlight-box mb-0">
          <h2>Analysis Complete!</h2>
          <p>Here's what we found about your skin.</p>
          <div class="confidence">Confidence: ${confidence}</div>
        </div>

        <!-- AI DETECTION RESULT -->
        <div class="ai-detection mb-0">
          <strong style="display:block; color:#065F46; font-size: 10px; text-transform:uppercase; margin-bottom:2px;">Our AI Detected:</strong>
          <div style="font-size: 16px; font-weight: 800; color: #047857; margin-bottom: 6px;">${aiDetected}</div>
          
          <strong style="display:inline-block; color:#065F46; font-size: 10px; text-transform:uppercase; margin-right: 4px;">Condition Level:</strong>
          <span style="display:inline-block; background: #D1FAE5; color: #065F46; padding: 2px 8px; border-radius: 12px; font-weight: 700;">${conditionLevel}</span>
        </div>
      </div>

      <!-- AI INTERPRETATION -->
      <div class="card">
        <div class="card-title">AI Interpretation</div>
        <div style="font-size: 12px; color: #1F2937; white-space: pre-line;">${aiInterpretation}</div>
      </div>

      <!-- SKIN DETAILS -->
      <div class="grid-2 no-break">
        <div class="card mb-0">
          <strong style="display:block; color:#6B7280; font-size:10px; text-transform:uppercase; margin-bottom:2px;">Skin Category:</strong>
          <span style="font-size: 14px; font-weight: 700; color: #111827;">${patientSkinType}</span>
        </div>
        <div class="card mb-0">
          <strong style="display:block; color:#6B7280; font-size:10px; text-transform:uppercase; margin-bottom:2px;">Skin Tone:</strong>
          <span style="font-size: 14px; font-weight: 700; color: #111827;">${result.skinTone || 'Medium'}</span>
        </div>
      </div>

      <!-- PERSONALIZED ACTION PLAN -->
      <div class="card">
        <div class="card-title">Personalized Action Plan</div>
        <div class="grid-2">
          <div>
            <h3 style="color:#2563EB;">Morning Routine</h3>
            <ol>
              ${morningRoutine.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}
            </ol>
          </div>
          <div>
            <h3 style="color:#4338CA;">Night Routine</h3>
            <ol>
              ${nightRoutine.map(step => `<li>${step.replace(/^\d+\.\s*/, '')}</li>`).join('')}
            </ol>
          </div>
        </div>
      </div>

      <!-- DO'S AND DON'TS -->
      <div class="grid-2 no-break">
        <div class="card mb-0">
          <div class="card-title" style="color: #059669; border-color:#A7F3D0;">DO'S</div>
          <ul class="list-unstyled dos">
            ${dos.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
        <div class="card mb-0">
          <div class="card-title" style="color: #DC2626; border-color:#FECACA;">DON'TS</div>
          <ul class="list-unstyled donts">
            ${donts.map(item => `<li>${item}</li>`).join('')}
          </ul>
        </div>
      </div>

      <!-- GOLDEN RULES -->
      <div class="golden-rules no-break">
        <h3>Golden Rules ✨</h3>
        <ul class="list-unstyled donts" style="margin-top: 6px;">
          ${goldenRules.map(rule => `<li style="color:#92400E;">${rule}</li>`).join('')}
        </ul>
      </div>

      <!-- RECOMMENDED PRODUCTS -->
      <div class="card no-break">
        <div class="card-title">Recommended Products</div>
        <table>
          <thead>
            <tr>
              <th style="width: 60%">Product Name</th>
              <th style="width: 40%">Category</th>
            </tr>
          </thead>
          <tbody>
            ${products.map(p => `
              <tr>
                <td><strong>${p.name}</strong></td>
                <td>${p.category}</td>
              </tr>
            `).join('')}
          </tbody>
        </table>
      </div>

      <!-- MEDICAL DISCLAIMER -->
      <div class="disclaimer no-break">
        <strong>DISCLAIMER</strong>
        This report was generated by Skinzy AI using image analysis technology. The results are intended for skincare guidance and educational purposes only. This report is NOT a medical diagnosis. For severe or persistent skin concerns, consult a licensed dermatologist.
      </div>

    </div>
  </body>
  </html>
  `;
}
