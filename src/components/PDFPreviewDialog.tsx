
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Test, Question, Category } from '@/types';
import { generateAdvancedPDFPreviewContent, exportAdvancedTestToPDF } from '@/utils/advancedPdfExport';
import { Download, Eye, Settings } from 'lucide-react';
import { PDFExportSettings, AdvancedPDFSettings, defaultAdvancedPDFSettings } from './PDFExportSettings';

interface PDFPreviewDialogProps {
  test: Test | null;
  questions: Question[];
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function PDFPreviewDialog({ 
  test, 
  questions, 
  categories, 
  open, 
  onOpenChange 
}: PDFPreviewDialogProps) {
  const [settings, setSettings] = useState<AdvancedPDFSettings>(defaultAdvancedPDFSettings);
  const [showSettings, setShowSettings] = useState(false);
  const [isExporting, setIsExporting] = useState(false);

  if (!test) return null;

  const testQuestions = questions.filter(q => test.questionIds.includes(q.id));
  const hasAnswers = testQuestions.some(q => 
    q.options && q.options.length > 0 && typeof q.correctAnswer === 'number'
  );

  const handleExport = async () => {
    try {
      setIsExporting(true);
      await exportAdvancedTestToPDF(test, questions, categories, settings);
    } catch (error) {
      console.error('PDF export hatası:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const previewContent = generateAdvancedPDFPreviewContent(test, questions, categories, settings);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-7xl max-h-[95vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span className="flex items-center gap-2">
              <Eye className="h-5 w-5" />
              PDF Önizleme: {test.title}
            </span>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowSettings(!showSettings)}
              >
                <Settings className="h-4 w-4 mr-1" />
                Ayarlar
              </Button>
              <Button 
                onClick={handleExport}
                disabled={isExporting}
                className="flex items-center gap-2"
              >
                <Download className="h-4 w-4" />
                {isExporting ? 'İndiriliyor...' : 'PDF İndir'}
              </Button>
            </div>
          </DialogTitle>
        </DialogHeader>
        
        <div className="flex gap-6">
          {/* Ayarlar Paneli */}
          {showSettings && (
            <Card className="w-80 h-fit">
              <CardHeader>
                <CardTitle className="text-sm">PDF Ayarları</CardTitle>
              </CardHeader>
              <CardContent>
                <PDFExportSettings
                  settings={settings}
                  onSettingsChange={setSettings}
                  hasAnswers={hasAnswers}
                />
              </CardContent>
            </Card>
          )}

          {/* Önizleme Alanı */}
          <div className="flex-1 min-w-0">
            <div 
              className="border rounded-lg p-4 bg-white shadow-inner min-h-[600px] pdf-preview"
              style={{ 
                maxWidth: '210mm', 
                margin: '0 auto',
                transform: showSettings ? 'scale(0.8)' : 'scale(0.9)',
                transformOrigin: 'top center'
              }}
              dangerouslySetInnerHTML={{ __html: previewContent }}
            />
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
