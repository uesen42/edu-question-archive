
import React from 'react';
import { exportTestToPDF, PDFExportSettings, defaultPDFSettings } from '@/utils/modernPdfExport';
import { Test, Question, Category } from '@/types';

interface Props {
  test: Test;
  questions: Question[];
  categories: Category[];
  settings?: PDFExportSettings;
}

export const PdfExportButton: React.FC<Props> = ({ 
  test, 
  questions, 
  categories, 
  settings = defaultPDFSettings 
}) => {
  const handleExport = async () => {
    try {
      await exportTestToPDF(test, questions, categories, settings);
    } catch (error) {
      console.error('PDF export hatası:', error);
    }
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
        fontSize: '16px',
        display: 'flex',
        alignItems: 'center',
        gap: '8px'
      }}
    >
      <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
        <path d="M14,2H6A2,2 0 0,0 4,4V20A2,2 0 0,0 6,22H18A2,2 0 0,0 20,20V8L14,2M18,20H6V4H13V9H18V20Z" />
      </svg>
      PDF Olarak İndir
    </button>
  );
};
