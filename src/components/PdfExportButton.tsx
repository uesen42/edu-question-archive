// src/components/PdfExportButton.tsx

import React from 'react';
import { exportToPDF } from '@/utils/pdfExport';

interface Props {
  testTitle: string;
}

export const PdfExportButton: React.FC<Props> = ({ testTitle }) => {
  const handleExport = () => {
    exportToPDF(testTitle);
  };

  return (
    <button
      onClick={handleExport}
      style={{
        padding: '10px 20px',
        backgroundColor: '#2196F3',
        color: 'white',
        border: 'none',
        borderRadius: '4px',
        cursor: 'pointer',
        fontSize: '16px'
      }}
    >
      PDF Olarak İndir
    </button>
  );
};
