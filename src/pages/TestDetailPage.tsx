
// src/pages/TestDetailPage.tsx

import React from 'react';
import { PdfExportButton } from '@/components/PdfExportButton';

export default function TestDetailPage() {
  const testTitle = "Deneme Testi - Matematik";

  return (
    <div style={{ padding: '40px' }}>
      <h1>{testTitle}</h1>
      <p>Bu sayfada test detayları yer alıyor.</p>

      <div style={{ marginTop: '20px' }}>
        <PdfExportButton testTitle={testTitle} />
      </div>
    </div>
  );
}
