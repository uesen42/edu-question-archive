
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { TestCreateDialog } from '@/components/TestCreateDialog';
import { TestViewDialog } from '@/components/TestViewDialog';
import { TestCard } from '@/components/TestCard';
import { EmptyTestsState } from '@/components/EmptyTestsState';
import { useQuestionStore } from '@/store/questionStore';
import { Test } from '@/types';
import { exportTestToPDF } from '@/utils/pdfExport';

export default function Tests() {
  const [isTestCreateOpen, setIsTestCreateOpen] = useState(false);
  const [isTestViewOpen, setIsTestViewOpen] = useState(false);
  const [selectedTest, setSelectedTest] = useState<Test | null>(null);
  const { 
    tests, 
    questions, 
    categories, 
    loadTests, 
    loadQuestions, 
    loadCategories,
    addTest 
  } = useQuestionStore();

  useEffect(() => {
    loadTests();
    loadQuestions();
    loadCategories();
  }, [loadTests, loadQuestions, loadCategories]);

  const handleCreateTest = (testData: any) => {
    addTest(testData);
  };

  const handleViewTest = (test: Test) => {
    setSelectedTest(test);
    setIsTestViewOpen(true);
  };

  const handleDownloadTest = (test: Test) => {
    exportTestToPDF(test, questions, categories);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testler</h1>
          <p className="text-gray-600 mt-2">Test oluşturun ve yönetin</p>
        </div>
        <Button 
          className="flex items-center gap-2"
          onClick={() => setIsTestCreateOpen(true)}
        >
          <Plus className="h-4 w-4" />
          Yeni Test Oluştur
        </Button>
      </div>

      {tests.length === 0 ? (
        <EmptyTestsState onCreateTest={() => setIsTestCreateOpen(true)} />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tests.map((test) => (
            <TestCard
              key={test.id}
              test={test}
              onView={handleViewTest}
              onDownload={handleDownloadTest}
            />
          ))}
        </div>
      )}

      <TestCreateDialog
        open={isTestCreateOpen}
        onOpenChange={setIsTestCreateOpen}
        onSave={handleCreateTest}
        questions={questions}
        categories={categories}
      />

      <TestViewDialog
        test={selectedTest}
        questions={questions}
        categories={categories}
        open={isTestViewOpen}
        onOpenChange={setIsTestViewOpen}
      />
    </div>
  );
}
