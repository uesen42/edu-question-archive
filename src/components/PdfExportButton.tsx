
import React from 'react';
import { exportTestToPDF } from '@/utils/modernPdfExport';

interface Props {
  testTitle: string;
}

export const PdfExportButton: React.FC<Props> = ({ testTitle }) => {
  const handleExport = () => {
    // Bu fonksiyon artık sadece test başlığı ile çalışamaz
    // Test objesi, sorular ve kategoriler gerekli
    console.log('PDF export için test objesi gerekli:', testTitle);
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
