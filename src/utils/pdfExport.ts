
import { Test, Question, Category } from '@/types';
import { exportTestToPDF as modernExportTestToPDF } from './modernPdfExport';

// Eski PDF export fonksiyonunu modern versiyona yönlendir
export const exportTestToPDF = async (
  test: Test,
  questions: Question[],
  categories: Category[]
) => {
  try {
    console.log('PDF oluşturma işlemi modern sistem ile başlıyor...');
    await modernExportTestToPDF(test, questions, categories);
  } catch (error) {
    console.error('Modern PDF export hatası:', error);
    
    // Yedek JSON export
    const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
    const exportData = {
      test: {
        title: test.title,
        description: test.description,
        createdAt: test.createdAt,
        settings: test.settings
      },
      questions: testQuestions.map((q, index) => ({
        number: index + 1,
        title: q.title,
        content: q.content,
        category: categories.find(cat => cat.id === q.categoryId)?.name || 'Bilinmeyen',
        options: test.settings.showOptions && q.options ? q.options : undefined,
      })),
      exportDate: new Date().toISOString(),
      note: "PDF oluşturulamadı, yedek JSON dosyası oluşturuldu"
    };

    const blob = new Blob([JSON.stringify(exportData, null, 2)], {
      type: 'application/json',
    });
    
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `test-${test.title.replace(/[^a-zA-Z0-9çğıöşüÇĞIİÖŞÜ]/g, '-')}-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log('Yedek JSON dosyası oluşturuldu');
  }
};
