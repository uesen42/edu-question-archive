
import React from 'react';
import { Button } from '@/components/ui/button';
import { Download } from 'lucide-react';
import { Exam } from '@/types/exam';
import { Question, Category } from '@/types';
import { exportMobileExamToPDF, isMobileDevice } from '@/utils/mobilePdfExport';
import { exportExamToPDF } from '@/utils/examPdfExport';

interface Props {
  exam: Exam;
  questions: Question[];
  categories: Category[];
}

export const MobileExamPdfButton: React.FC<Props> = ({ 
  exam, 
  questions, 
  categories 
}) => {
  const handleDownload = async () => {
    try {
      const isMobile = isMobileDevice();
      
      if (isMobile) {
        console.log('Mobil sınav PDF export başlıyor...');
        await exportMobileExamToPDF(exam, questions, categories);
      } else {
        console.log('Masaüstü sınav PDF export başlıyor...');
        await exportExamToPDF(exam, questions, categories);
      }
    } catch (error) {
      console.error('Sınav PDF export hatası:', error);
    }
  };

  const isMobile = isMobileDevice();

  return (
    <Button 
      variant="outline" 
      size={isMobile ? "default" : "sm"}
      onClick={handleDownload}
      className={isMobile ? "min-h-[44px] px-4" : ""}
    >
      <Download className={`${isMobile ? 'h-4 w-4' : 'h-3 w-3'} mr-1`} />
      {isMobile ? 'PDF İndir' : 'İndir'}
    </Button>
  );
};
