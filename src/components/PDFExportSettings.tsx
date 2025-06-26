
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Separator } from '@/components/ui/separator';

export interface AdvancedPDFSettings {
  // Layout Settings
  questionsPerRow: 1 | 2;
  questionsPerPage: number;
  pageBreakBetweenQuestions: boolean;
  questionSpacing: number;
  
  // Numbering Settings
  numberingStyle: 'numeric' | 'alphabetic' | 'roman';
  numberingFormat: 'circle' | 'parenthesis' | 'dot' | 'square';
  showQuestionNumbers: boolean;
  
  // Content Settings
  showOptions: boolean;
  showAnswerKey: boolean;
  showMetaInfo: boolean;
  showCategory: boolean;
  showGrade: boolean;
  showDifficulty: boolean;
  showDate: boolean;
  
  // Typography Settings
  fontSize: number;
  fontFamily: 'times' | 'arial' | 'calibri';
  lineHeight: number;
  
  // Page Settings
  pageMargin: number;
  headerHeight: number;
  footerHeight: number;
  
  // Advanced Settings
  optimizeForMobile: boolean;
  preventOrphanQuestions: boolean;
  balanceColumns: boolean;
}

export const defaultAdvancedPDFSettings: AdvancedPDFSettings = {
  questionsPerRow: 2,
  questionsPerPage: 0, // 0 means auto
  pageBreakBetweenQuestions: false,
  questionSpacing: 15,
  
  numberingStyle: 'numeric',
  numberingFormat: 'circle',
  showQuestionNumbers: true,
  
  showOptions: true,
  showAnswerKey: true,
  showMetaInfo: true,
  showCategory: true,
  showGrade: true,
  showDifficulty: true,
  showDate: true,
  
  fontSize: 11,
  fontFamily: 'times',
  lineHeight: 1.4,
  
  pageMargin: 20,
  headerHeight: 15,
  footerHeight: 15,
  
  optimizeForMobile: false,
  preventOrphanQuestions: true,
  balanceColumns: true,
};

interface Props {
  settings: AdvancedPDFSettings;
  onSettingsChange: (settings: AdvancedPDFSettings) => void;
  hasAnswers: boolean;
}

export function PDFExportSettings({ settings, onSettingsChange, hasAnswers }: Props) {
  const updateSetting = <K extends keyof AdvancedPDFSettings>(
    key: K, 
    value: AdvancedPDFSettings[K]
  ) => {
    onSettingsChange({ ...settings, [key]: value });
  };

  return (
    <div className="space-y-6 max-h-[70vh] overflow-y-auto">
      {/* Layout Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Sayfa Düzeni</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Sütun Sayısı</Label>
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

          <div className="space-y-3">
            <Label className="text-sm font-medium">Soru Arası Mesafe: {settings.questionSpacing}mm</Label>
            <Slider
              value={[settings.questionSpacing]}
              onValueChange={(value) => updateSetting('questionSpacing', value[0])}
              max={30}
              min={5}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Sayfa Başına Soru Sayısı</Label>
            <Select
              value={settings.questionsPerPage.toString()}
              onValueChange={(value) => updateSetting('questionsPerPage', parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0">Otomatik</SelectItem>
                <SelectItem value="5">5 soru</SelectItem>
                <SelectItem value="10">10 soru</SelectItem>
                <SelectItem value="15">15 soru</SelectItem>
                <SelectItem value="20">20 soru</SelectItem>
                <SelectItem value="25">25 soru</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="page-break"
              checked={settings.pageBreakBetweenQuestions}
              onCheckedChange={(checked) => updateSetting('pageBreakBetweenQuestions', checked)}
            />
            <Label htmlFor="page-break" className="text-xs">Her soru yeni sayfada</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="prevent-orphan"
              checked={settings.preventOrphanQuestions}
              onCheckedChange={(checked) => updateSetting('preventOrphanQuestions', checked)}
            />
            <Label htmlFor="prevent-orphan" className="text-xs">Yalnız kalan soruları önle</Label>
          </div>
        </CardContent>
      </Card>

      {/* Numbering Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Numaralandırma</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center space-x-2">
            <Switch
              id="show-numbers"
              checked={settings.showQuestionNumbers}
              onCheckedChange={(checked) => updateSetting('showQuestionNumbers', checked)}
            />
            <Label htmlFor="show-numbers" className="text-xs">Soru numaralarını göster</Label>
          </div>

          {settings.showQuestionNumbers && (
            <>
              <div className="space-y-3">
                <Label className="text-sm font-medium">Numara Stili</Label>
                <RadioGroup 
                  value={settings.numberingStyle} 
                  onValueChange={(value) => updateSetting('numberingStyle', value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="numeric" id="num-numeric" />
                    <Label htmlFor="num-numeric" className="text-xs">Sayısal (1, 2, 3...)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="alphabetic" id="num-alpha" />
                    <Label htmlFor="num-alpha" className="text-xs">Alfabetik (A, B, C...)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="roman" id="num-roman" />
                    <Label htmlFor="num-roman" className="text-xs">Roma rakamı (I, II, III...)</Label>
                  </div>
                </RadioGroup>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium">Numara Formatı</Label>
                <RadioGroup 
                  value={settings.numberingFormat} 
                  onValueChange={(value) => updateSetting('numberingFormat', value as any)}
                >
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="circle" id="fmt-circle" />
                    <Label htmlFor="fmt-circle" className="text-xs">Daire (①)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="parenthesis" id="fmt-paren" />
                    <Label htmlFor="fmt-paren" className="text-xs">Parantez (1)</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="dot" id="fmt-dot" />
                    <Label htmlFor="fmt-dot" className="text-xs">Nokta 1.</Label>
                  </div>
                  <div className="flex items-center space-x-2">
                    <RadioGroupItem value="square" id="fmt-square" />
                    <Label htmlFor="fmt-square" className="text-xs">Kare [1]</Label>
                  </div>
                </RadioGroup>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Typography Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Yazı Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Boyutu: {settings.fontSize}pt</Label>
            <Slider
              value={[settings.fontSize]}
              onValueChange={(value) => updateSetting('fontSize', value[0])}
              max={16}
              min={8}
              step={1}
              className="w-full"
            />
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Font Ailesi</Label>
            <Select
              value={settings.fontFamily}
              onValueChange={(value) => updateSetting('fontFamily', value as any)}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="times">Times New Roman</SelectItem>
                <SelectItem value="arial">Arial</SelectItem>
                <SelectItem value="calibri">Calibri</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-3">
            <Label className="text-sm font-medium">Satır Aralığı: {settings.lineHeight}</Label>
            <Slider
              value={[settings.lineHeight]}
              onValueChange={(value) => updateSetting('lineHeight', value[0])}
              max={2.0}
              min={1.0}
              step={0.1}
              className="w-full"
            />
          </div>
        </CardContent>
      </Card>

      <Separator />

      {/* Content Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">İçerik Ayarları</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
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

          <div className="flex items-center space-x-2">
            <Switch
              id="show-meta"
              checked={settings.showMetaInfo}
              onCheckedChange={(checked) => updateSetting('showMetaInfo', checked)}
            />
            <Label htmlFor="show-meta" className="text-xs">Meta bilgileri göster</Label>
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
        </CardContent>
      </Card>

      {/* Advanced Settings */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Gelişmiş Ayarlar</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-center space-x-2">
            <Switch
              id="mobile-optimize"
              checked={settings.optimizeForMobile}
              onCheckedChange={(checked) => updateSetting('optimizeForMobile', checked)}
            />
            <Label htmlFor="mobile-optimize" className="text-xs">Mobil için optimize et</Label>
          </div>

          <div className="flex items-center space-x-2">
            <Switch
              id="balance-columns"
              checked={settings.balanceColumns}
              onCheckedChange={(checked) => updateSetting('balanceColumns', checked)}
            />
            <Label htmlFor="balance-columns" className="text-xs">Sütunları dengele</Label>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
