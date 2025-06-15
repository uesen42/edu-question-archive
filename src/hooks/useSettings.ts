
import { useState, useEffect } from 'react';
import { useToast } from '@/hooks/use-toast';
import { useQuestionStore } from '@/store/questionStore';

interface SettingsState {
  darkMode: boolean;
  autoSave: boolean;
  questionsPerPage: number;
  pdfTitle: string;
  pdfSubtitle: string;
  showAnswers: boolean;
}

const defaultSettings: SettingsState = {
  darkMode: false,
  autoSave: true,
  questionsPerPage: 12,
  pdfTitle: 'Test Soruları',
  pdfSubtitle: 'Okul Adı / Tarih',
  showAnswers: false,
};

export function useSettings() {
  const [settings, setSettings] = useState<SettingsState>(defaultSettings);
  const { toast } = useToast();
  const { questions, categories, tests } = useQuestionStore();

  useEffect(() => {
    const savedSettings = localStorage.getItem('app-settings');
    if (savedSettings) {
      try {
        setSettings(JSON.parse(savedSettings));
      } catch (error) {
        console.error('Failed to parse saved settings:', error);
      }
    }
  }, []);

  const updateSetting = <K extends keyof SettingsState>(
    key: K,
    value: SettingsState[K]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);
    localStorage.setItem('app-settings', JSON.stringify(newSettings));
    
    toast({
      title: 'Ayar Güncellendi',
      description: 'Ayarınız başarıyla kaydedildi.',
    });
  };

  const exportData = () => {
    try {
      const data = {
        exportDate: new Date().toISOString(),
        version: '1.0.0',
        data: {
          questions,
          categories,
          tests,
          settings
        }
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], {
        type: 'application/json',
      });
      
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `soru-bankasi-yedek-${new Date().toISOString().split('T')[0]}.json`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      
      toast({
        title: 'Veriler Dışa Aktarıldı',
        description: 'Tüm verileriniz başarıyla indirildi.',
      });
    } catch (error) {
      toast({
        title: 'Hata',
        description: 'Veriler dışa aktarılırken bir hata oluştu.',
        variant: 'destructive',
      });
    }
  };

  const importData = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    
    input.onchange = (event) => {
      const file = (event.target as HTMLInputElement).files?.[0];
      if (!file) return;
      
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const importedData = JSON.parse(e.target?.result as string);
          
          // Yeni format desteği
          const data = importedData.data || importedData;
          
          if (data.questions) {
            localStorage.setItem('questions', JSON.stringify(data.questions));
          }
          if (data.categories) {
            localStorage.setItem('categories', JSON.stringify(data.categories));
          }
          if (data.tests) {
            localStorage.setItem('tests', JSON.stringify(data.tests));
          }
          if (data.settings) {
            localStorage.setItem('app-settings', JSON.stringify(data.settings));
            setSettings(data.settings);
          }
          
          toast({
            title: 'Veriler İçe Aktarıldı',
            description: 'Tüm verileriniz başarıyla yüklendi.',
          });
          
          // Sayfayı yenile
          window.location.reload();
        } catch (error) {
          toast({
            title: 'Hata',
            description: 'Dosya formatı geçersiz.',
            variant: 'destructive',
          });
        }
      };
      reader.readAsText(file);
    };
    
    input.click();
  };

  const clearAllData = () => {
    localStorage.removeItem('questions');
    localStorage.removeItem('categories');
    localStorage.removeItem('tests');
    localStorage.removeItem('app-settings');
    setSettings(defaultSettings);
    
    toast({
      title: 'Tüm Veriler Temizlendi',
      description: 'Tüm verileriniz başarıyla silindi.',
    });
    
    // Sayfayı yenile
    window.location.reload();
  };

  return {
    settings,
    updateSetting,
    exportData,
    importData,
    clearAllData,
  };
}
