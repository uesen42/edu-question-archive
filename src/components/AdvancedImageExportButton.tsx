import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Download, Image, FileText, Columns2, Columns } from 'lucide-react';
import { Test, Question, Category } from '@/types';
import { 
  exportTestSingleColumnImagePDF,
  exportTestDoubleColumnImagePDF,
  exportOpenEndedQuestionsPDF,
  defaultImageExportSettings,
  ImageExportSettings 
} from '@/utils/advancedImagePdfExport';
import { toast } from '@/components/ui/use-toast';

interface Props {
  test?: Test | null;
  questions: Question[];
  categories: Category[];
}

export const AdvancedImageExportButton: React.FC<Props> = ({ 
  test, 
  questions, 
  categories 
}) => {
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isExporting, setIsExporting] = useState(false);
  const [settings, setSettings] = useState<ImageExportSettings>(defaultImageExportSettings);

  const handleExportSingleColumn = async () => {
    if (!test) return;
    
    setIsExporting(true);
    try {
      await exportTestSingleColumnImagePDF(test, questions, categories, settings);
      toast({
        title: "Başarılı",
        description: "Tek sütun PDF başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error('Export hatası:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsDialogOpen(false);
    }
  };

  const handleExportDoubleColumn = async () => {
    if (!test) return;
    
    setIsExporting(true);
    try {
      await exportTestDoubleColumnImagePDF(test, questions, categories, settings);
      toast({
        title: "Başarılı",
        description: "Çift sütun PDF başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error('Export hatası:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsDialogOpen(false);
    }
  };

  const handleExportOpenEnded = async () => {
    setIsExporting(true);
    try {
      await exportOpenEndedQuestionsPDF(questions, categories, settings);
      toast({
        title: "Başarılı",
        description: "Açık uçlu sorular PDF'leri başarıyla oluşturuldu.",
      });
    } catch (error) {
      console.error('Export hatası:', error);
      toast({
        title: "Hata",
        description: "PDF oluşturulurken bir hata oluştu.",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
      setIsDialogOpen(false);
    }
  };

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <Image className="h-4 w-4 mr-2" />
          Gelişmiş PDF
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Image className="h-5 w-5" />
            Gelişmiş Resim Tabanlı PDF Export
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Export Ayarları */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">Export Ayarları</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between">
                <Label htmlFor="show-options">Şıkları Göster</Label>
                <Switch
                  id="show-options"
                  checked={settings.showOptions}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, showOptions: checked }))
                  }
                />
              </div>
              
              <div className="flex items-center justify-between">
                <Label htmlFor="show-answers">Cevapları Göster</Label>
                <Switch
                  id="show-answers"
                  checked={settings.showAnswers}
                  onCheckedChange={(checked) =>
                    setSettings(prev => ({ ...prev, showAnswers: checked }))
                  }
                />
              </div>
            </CardContent>
          </Card>

          {/* Test Export Seçenekleri */}
          {test && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Test: {test.title}
                  <Badge variant="secondary">{test.questionIds.length} soru</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button
                  onClick={handleExportSingleColumn}
                  disabled={isExporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Columns className="h-4 w-4 mr-2" />
                  Tek Sütun PDF (Büyük Format)
                </Button>
                
                <Button
                  onClick={handleExportDoubleColumn}
                  disabled={isExporting}
                  className="w-full justify-start"
                  variant="outline"
                >
                  <Columns2 className="h-4 w-4 mr-2" />
                  Çift Sütun PDF (Kompakt Format)
                </Button>
              </CardContent>
            </Card>
          )}

          {/* Açık Uçlu Sorular Export */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Açık Uçlu Sorular
                <Badge variant="secondary">
                  {questions.filter(q => !q.options || q.options.length === 0).length} soru
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button
                onClick={handleExportOpenEnded}
                disabled={isExporting || questions.filter(q => !q.options || q.options.length === 0).length === 0}
                className="w-full justify-start"
                variant="outline"
              >
                <Download className="h-4 w-4 mr-2" />
                Hem Tek Hem Çift Sütun PDF Oluştur
              </Button>
            </CardContent>
          </Card>

          {/* Bilgi Notu */}
          <div className="text-xs text-gray-600 bg-blue-50 p-3 rounded-lg">
            <p className="font-medium mb-1">Bilgi:</p>
            <ul className="space-y-1">
              <li>• Sorular yüksek kaliteli resim olarak render edilir</li>
              <li>• Matematik formülleri doğru şekilde gösterilir</li>
              <li>• Tek sütun: Her soru büyük ve net görünür</li>
              <li>• Çift sütun: Sayfa başına daha fazla soru sığar</li>
              <li>• Açık uçlu sorular için her iki format da oluşturulur</li>
            </ul>
          </div>

          {isExporting && (
            <div className="text-center py-4">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto"></div>
              <p className="mt-2 text-sm text-gray-600">PDF oluşturuluyor...</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};