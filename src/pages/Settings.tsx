
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Settings as SettingsIcon, Download, Upload, Trash2, FileText, Database, Globe, Shield } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';
import { useQuestionStore } from '@/store/questionStore';
import { exportTestToPDF } from '@/utils/pdfExport';

export default function Settings() {
  const { settings, updateSetting, exportData, importData, clearAllData } = useSettings();
  const { questions, categories, tests } = useQuestionStore();

  const handleClearData = () => {
    if (window.confirm('Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      clearAllData();
    }
  };

  const exportQuestions = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        type: 'questions',
        data: {
          questions,
          categories
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `sorular-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Sorular dışa aktarılırken hata:', error);
    }
  };

  const exportTests = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        type: 'tests',
        data: {
          tests,
          questions: questions.filter(q => 
            tests.some(test => test.questionIds.includes(q.id))
          ),
          categories
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `testler-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Testler dışa aktarılırken hata:', error);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-2">Sistem ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Site Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              Site Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="site-title">Site Başlığı</Label>
              <Input 
                id="site-title" 
                placeholder="Soru Bankası Sistemi"
                value={settings.siteTitle || ''}
                onChange={(e) => updateSetting('siteTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="school-name">Okul/Kurum Adı</Label>
              <Input 
                id="school-name" 
                placeholder="Örnek Okulu"
                value={settings.schoolName || ''}
                onChange={(e) => updateSetting('schoolName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="teacher-name">Öğretmen Adı</Label>
              <Input 
                id="teacher-name" 
                placeholder="Öğretmen Adı Soyadı"
                value={settings.teacherName || ''}
                onChange={(e) => updateSetting('teacherName', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="language">Dil</Label>
              <Select value={settings.language || 'tr'} onValueChange={(value) => updateSetting('language', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Dil seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tr">Türkçe</SelectItem>
                  <SelectItem value="en">English</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Genel Ayarlar */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <SettingsIcon className="h-5 w-5" />
              Genel Ayarlar
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="dark-mode">Karanlık Tema</Label>
                <p className="text-sm text-gray-600">Karanlık tema kullan</p>
              </div>
              <Switch 
                id="dark-mode" 
                checked={settings.darkMode}
                onCheckedChange={(checked) => updateSetting('darkMode', checked)}
              />
            </div>
            
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="auto-save">Otomatik Kayıt</Label>
                <p className="text-sm text-gray-600">Soruları otomatik kaydet</p>
              </div>
              <Switch 
                id="auto-save" 
                checked={settings.autoSave}
                onCheckedChange={(checked) => updateSetting('autoSave', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-stats">İstatistikleri Göster</Label>
                <p className="text-sm text-gray-600">Dashboard'da istatistikleri göster</p>
              </div>
              <Switch 
                id="show-stats" 
                checked={settings.showStats !== false}
                onCheckedChange={(checked) => updateSetting('showStats', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions-per-page">Sayfa başina soru sayısı</Label>
              <Input 
                id="questions-per-page" 
                type="number" 
                value={settings.questionsPerPage}
                onChange={(e) => updateSetting('questionsPerPage', parseInt(e.target.value) || 12)}
                min="1"
                max="50"
              />
            </div>
          </CardContent>
        </Card>

        {/* PDF Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              PDF Ayarları
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="pdf-title">PDF Başlığı</Label>
              <Input 
                id="pdf-title" 
                placeholder="Test Soruları"
                value={settings.pdfTitle}
                onChange={(e) => updateSetting('pdfTitle', e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="pdf-subtitle">PDF Alt Başlığı</Label>
              <Input 
                id="pdf-subtitle" 
                placeholder="Okul Adı / Tarih"
                value={settings.pdfSubtitle}
                onChange={(e) => updateSetting('pdfSubtitle', e.target.value)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-answers">Cevapları Göster</Label>
                <p className="text-sm text-gray-600">PDF'te cevapları göster</p>
              </div>
              <Switch 
                id="show-answers" 
                checked={settings.showAnswers}
                onCheckedChange={(checked) => updateSetting('showAnswers', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="show-category-info">Kategori Bilgisi</Label>
                <p className="text-sm text-gray-600">PDF'te kategori bilgilerini göster</p>
              </div>
              <Switch 
                id="show-category-info" 
                checked={settings.showCategoryInfo !== false}
                onCheckedChange={(checked) => updateSetting('showCategoryInfo', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="questions-per-row">Satır başına soru sayısı</Label>
              <Select value={settings.questionsPerRow?.toString() || '2'} onValueChange={(value) => updateSetting('questionsPerRow', parseInt(value))}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Soru</SelectItem>
                  <SelectItem value="2">2 Soru</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Güvenlik Ayarları */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Güvenlik ve Gizlilik
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="backup-reminder">Yedekleme Hatırlatması</Label>
                <p className="text-sm text-gray-600">Düzenli yedekleme hatırlatması göster</p>
              </div>
              <Switch 
                id="backup-reminder" 
                checked={settings.backupReminder !== false}
                onCheckedChange={(checked) => updateSetting('backupReminder', checked)}
              />
            </div>

            <div className="flex items-center justify-between">
              <div>
                <Label htmlFor="confirm-delete">Silme Onayı</Label>
                <p className="text-sm text-gray-600">Önemli işlemler için onay iste</p>
              </div>
              <Switch 
                id="confirm-delete" 
                checked={settings.confirmDelete !== false}
                onCheckedChange={(checked) => updateSetting('confirmDelete', checked)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-frequency">Otomatik Yedekleme Sıklığı</Label>
              <Select value={settings.backupFrequency || 'weekly'} onValueChange={(value) => updateSetting('backupFrequency', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Seçin" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Günlük</SelectItem>
                  <SelectItem value="weekly">Haftalık</SelectItem>
                  <SelectItem value="monthly">Aylık</SelectItem>
                  <SelectItem value="never">Hiçbir zaman</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>

        {/* Veri Yönetimi */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Database className="h-5 w-5" />
              Veri Yönetimi
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <Button onClick={exportData} className="flex items-center gap-2">
                <Download className="h-4 w-4" />
                Tüm Verileri Dışa Aktar
              </Button>

              <Button onClick={exportQuestions} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Soruları Dışa Aktar
              </Button>

              <Button onClick={exportTests} variant="outline" className="flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Testleri Dışa Aktar
              </Button>

              <Button onClick={importData} variant="outline" className="flex items-center gap-2">
                <Upload className="h-4 w-4" />
                Verileri İçe Aktar
              </Button>
            </div>

            <div className="mt-6 pt-6 border-t">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-red-600">Tehlikeli İşlemler</h4>
                  <p className="text-sm text-gray-600">Bu işlemler geri alınamaz</p>
                </div>
                <Button 
                  onClick={handleClearData} 
                  variant="destructive" 
                  className="flex items-center gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  Tüm Verileri Temizle
                </Button>
              </div>
            </div>

            <div className="mt-4 p-4 bg-gray-50 rounded-lg">
              <h4 className="font-medium mb-2">Veri İstatistikleri</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Toplam Soru:</span>
                  <span className="ml-2 font-medium">{questions.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Toplam Test:</span>
                  <span className="ml-2 font-medium">{tests.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Kategori:</span>
                  <span className="ml-2 font-medium">{categories.length}</span>
                </div>
                <div>
                  <span className="text-gray-600">Son Yedek:</span>
                  <span className="ml-2 font-medium text-gray-500">Yok</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sistem Bilgileri */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div className="space-y-3">
                <h4 className="font-medium">Genel</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Versiyon:</span>
                    <span>1.0.0</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Son Güncelleme:</span>
                    <span>22 Haziran 2025</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Depolama</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Tip:</span>
                    <span>LocalStorage</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Yedekleme:</span>
                    <span>Firebase</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Desteklenen Formatlar</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">Matematik:</span>
                    <span>KaTeX</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Resim:</span>
                    <span>PNG, JPG</span>
                  </div>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="font-medium">Export</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-600">PDF:</span>
                    <span>html2pdf.js</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">JSON:</span>
                    <span>Destekleniyor</span>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
