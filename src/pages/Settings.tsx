
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Settings as SettingsIcon, Download, Upload, Trash2 } from 'lucide-react';
import { useSettings } from '@/hooks/useSettings';

export default function Settings() {
  const { settings, updateSetting, exportData, importData, clearAllData } = useSettings();

  const handleClearData = () => {
    if (window.confirm('Tüm verileri silmek istediğinizden emin misiniz? Bu işlem geri alınamaz.')) {
      clearAllData();
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Ayarlar</h1>
        <p className="text-gray-600 mt-2">Sistem ayarlarını yönetin</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="space-y-2">
              <Label htmlFor="questions-per-page">Sayfa başına soru sayısı</Label>
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
            <CardTitle>PDF Ayarları</CardTitle>
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
          </CardContent>
        </Card>

        {/* Veri Yönetimi */}
        <Card>
          <CardHeader>
            <CardTitle>Veri Yönetimi</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Button onClick={exportData} className="w-full flex items-center gap-2">
              <Download className="h-4 w-4" />
              Verileri Dışa Aktar
            </Button>

            <Button onClick={importData} variant="outline" className="w-full flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Verileri İçe Aktar
            </Button>

            <Button 
              onClick={handleClearData} 
              variant="destructive" 
              className="w-full flex items-center gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Tüm Verileri Temizle
            </Button>
          </CardContent>
        </Card>

        {/* Sistem Bilgileri */}
        <Card>
          <CardHeader>
            <CardTitle>Sistem Bilgileri</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <div className="flex justify-between">
              <span className="text-sm font-medium">Versiyon:</span>
              <span className="text-sm text-gray-600">1.0.0</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Son Güncelleme:</span>
              <span className="text-sm text-gray-600">15 Haziran 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Tarayıcı Depolama:</span>
              <span className="text-sm text-gray-600">LocalStorage</span>
            </div>
            <div className="flex justify-between">
              <span className="text-sm font-medium">Desteklenen Formatlar:</span>
              <span className="text-sm text-gray-600">KaTeX, HTML, PNG, JPG</span>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
