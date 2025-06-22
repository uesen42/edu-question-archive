
import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Test, Question, Category } from '@/types';
import { generatePDFPreviewContent, exportTestToPDF, PDFExportSettings, defaultPDFSettings } from '@/utils/modernPdfExport';
import { Download, Eye, Settings } from 'lucide-react';

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
  const [settings, setSettings] = useState<PDFExportSettings>(defaultPDFSettings);
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
      await exportTestToPDF(test, questions, categories, settings);
    } catch (error) {
      console.error('PDF export hatası:', error);
    } finally {
      setIsExporting(false);
    }
  };

  const previewContent = generatePDFPreviewContent(test, questions, categories, settings);

  const updateSetting = <K extends keyof PDFExportSettings>(
    key: K, 
    value: PDFExportSettings[K]
  ) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

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
              <CardContent className="space-y-4">
                {/* Düzen Ayarları */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">Sayfa Düzeni</Label>
                  <RadioGroup 
                    value={settings.questionsPerRow.toString()} 
                    onValueChange={(value) => updateSetting('questionsPerRow', parseInt(value) as 1 | 2)}
                  >
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="1" id="layout-1" />
                      <Label htmlFor="layout-1" className="text-xs">Tek sütun</Label>
                    </div>
                    <div className="flex items-center space-x-2">
                      <RadioGroupItem value="2" id="layout-2" />
                      <Label htmlFor="layout-2" className="text-xs">İki sütun</Label>
                    </div>
                  </RadioGroup>
                </div>

                {/* İçerik Ayarları */}
                <div className="space-y-3">
                  <Label className="text-sm font-medium">İçerik</Label>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <Switch
                        id="show-options"
                        checked={settings.showOptions}
                        onCheckedChange={(checked) => updateSetting('showOptions', checked)}
                      />
                      <Label htmlFor="show-options" className="text-xs">Şıkları göster</Label>
                    </div>
                    
                    {hasAnswers && (
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-answer-key"
                          checked={settings.showAnswerKey}
                          onCheckedChange={(checked) => updateSetting('showAnswerKey', checked)}
                        />
                        <Label htmlFor="show-answer-key" className="text-xs">Cevap anahtarı</Label>
                      </div>
                    )}
                  </div>
                </div>

                {/* Meta Bilgiler */}
                <div className="space-y-3">
                  <div className="flex items-center space-x-2">
                    <Switch
                      id="show-meta"
                      checked={settings.showMetaInfo}
                      onCheckedChange={(checked) => updateSetting('showMetaInfo', checked)}
                    />
                    <Label htmlFor="show-meta" className="text-xs font-medium">Meta bilgileri göster</Label>
                  </div>
                  
                  {settings.showMetaInfo && (
                    <div className="ml-6 space-y-2">
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-category"
                          checked={settings.showCategory}
                          onCheckedChange={(checked) => updateSetting('showCategory', checked)}
                        />
                        <Label htmlFor="show-category" className="text-xs">Kategori</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-grade"
                          checked={settings.showGrade}
                          onCheckedChange={(checked) => updateSetting('showGrade', checked)}
                        />
                        <Label htmlFor="show-grade" className="text-xs">Sınıf seviyesi</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-difficulty"
                          checked={settings.showDifficulty}
                          onCheckedChange={(checked) => updateSetting('showDifficulty', checked)}
                        />
                        <Label htmlFor="show-difficulty" className="text-xs">Zorluk seviyesi</Label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="show-date"
                          checked={settings.showDate}
                          onCheckedChange={(checked) => updateSetting('showDate', checked)}
                        />
                        <Label htmlFor="show-date" className="text-xs">Tarih</Label>
                      </div>
                    </div>
                  )}
                </div>
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
