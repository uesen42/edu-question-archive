
import { useState } from 'react';
import { Question, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { X, Plus, Globe, Lock } from 'lucide-react';
import { LaTeXEditor } from './LaTeXEditor';

interface QuestionCreateDialogProps {
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Omit<Question, 'id' | 'createdAt' | 'updatedAt'>) => void;
}

export function QuestionCreateDialog({ 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: QuestionCreateDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    difficultyLevel: 'kolay' as 'kolay' | 'orta' | 'zor',
    grade: 1,
    tags: [] as string[],
    newTag: '',
    options: ['', '', '', ''],
    correctAnswer: 0,
    hasOptions: false,
    isPublic: true // Varsayılan olarak herkese açık
  });

  const resetForm = () => {
    setFormData({
      title: '',
      content: '',
      categoryId: '',
      difficultyLevel: 'kolay',
      grade: 1,
      tags: [],
      newTag: '',
      options: ['', '', '', ''],
      correctAnswer: 0,
      hasOptions: false,
      isPublic: true
    });
  };

  const handleAddTag = () => {
    if (formData.newTag.trim() && !formData.tags.includes(formData.newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...prev.tags, prev.newTag.trim()],
        newTag: ''
      }));
    }
  };

  const handleRemoveTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags.filter(tag => tag !== tagToRemove)
    }));
  };

  const handleOptionChange = (index: number, value: string) => {
    const newOptions = [...formData.options];
    newOptions[index] = value;
    setFormData(prev => ({ ...prev, options: newOptions }));
  };

  const handleAddOption = () => {
    setFormData(prev => ({
      ...prev,
      options: [...prev.options, '']
    }));
  };

  const handleRemoveOption = (index: number) => {
    if (formData.options.length > 2) {
      const newOptions = formData.options.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        options: newOptions,
        correctAnswer: prev.correctAnswer >= newOptions.length ? 0 : prev.correctAnswer
      }));
    }
  };

  const handleSave = () => {
    if (formData.title.trim() && formData.content.trim() && formData.categoryId) {
      const questionData: Omit<Question, 'id' | 'createdAt' | 'updatedAt'> = {
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        difficultyLevel: formData.difficultyLevel,
        grade: formData.grade,
        tags: formData.tags,
        isPublic: formData.isPublic,
        viewCount: 0,
        isFavorite: false
      };

      if (formData.hasOptions && formData.options.some(opt => opt.trim())) {
        questionData.options = formData.options.filter(opt => opt.trim());
        questionData.correctAnswer = formData.correctAnswer;
      }

      onSave(questionData);
      resetForm();
      onOpenChange(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(open) => {
      onOpenChange(open);
      if (!open) resetForm();
    }}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Yeni Soru Ekle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6">
          {/* Başlık */}
          <div>
            <Label htmlFor="title">Soru Başlığı *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Soru başlığını girin..."
            />
          </div>

          {/* İçerik - LaTeX Editor */}
          <div>
            <Label>Soru İçeriği *</Label>
            <LaTeXEditor
              value={formData.content}
              onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              placeholder="Soru içeriğini girin... LaTeX matematik için $ işareti kullanabilirsiniz"
            />
          </div>

          {/* Görünürlük Ayarı */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm flex items-center gap-2">
                {formData.isPublic ? <Globe className="h-4 w-4" /> : <Lock className="h-4 w-4" />}
                Soru Görünürlüğü
              </CardTitle>
              <CardDescription>
                Bu soruyu diğer kullanıcılar görebilsin mi?
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex items-center space-x-2">
                <Switch
                  id="public-question"
                  checked={formData.isPublic}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isPublic: checked }))}
                />
                <Label htmlFor="public-question" className="flex items-center gap-2">
                  {formData.isPublic ? (
                    <>
                      <Globe className="h-4 w-4 text-green-600" />
                      Herkese Açık
                    </>
                  ) : (
                    <>
                      <Lock className="h-4 w-4 text-orange-600" />
                      Sadece Benim
                    </>
                  )}
                </Label>
              </div>
              <p className="text-xs text-gray-500 mt-2">
                {formData.isPublic 
                  ? "Bu soru tüm kullanıcılar tarafından görülebilir ve kullanılabilir."
                  : "Bu soru sadece sizin tarafınızdan görülebilir ve kullanılabilir."
                }
              </p>
            </CardContent>
          </Card>

          {/* Kategori, Zorluk, Sınıf */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kategori *</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Kategori seç" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Zorluk Seviyesi</Label>
              <Select 
                value={formData.difficultyLevel} 
                onValueChange={(value: 'kolay' | 'orta' | 'zor') => 
                  setFormData(prev => ({ ...prev, difficultyLevel: value }))
                }
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="kolay">Kolay</SelectItem>
                  <SelectItem value="orta">Orta</SelectItem>
                  <SelectItem value="zor">Zor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Sınıf</Label>
              <Select 
                value={formData.grade.toString()} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, grade: parseInt(value) }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12].map((grade) => (
                    <SelectItem key={grade} value={grade.toString()}>
                      {grade}. Sınıf
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Çoktan Seçmeli Seçenekler */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="has-options"
                checked={formData.hasOptions}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, hasOptions: checked }))}
              />
              <Label htmlFor="has-options">Çoktan seçmeli soru</Label>
            </div>

            {formData.hasOptions && (
              <div className="space-y-3">
                <Label>Seçenekler</Label>
                {formData.options.map((option, index) => (
                  <div key={index} className="flex gap-2 items-center">
                    <div className="flex items-center space-x-2">
                      <input
                        type="radio"
                        name="correctAnswer"
                        checked={formData.correctAnswer === index}
                        onChange={() => setFormData(prev => ({ ...prev, correctAnswer: index }))}
                        className="w-4 h-4"
                      />
                      <span className="font-medium text-sm">
                        {String.fromCharCode(65 + index)})
                      </span>
                    </div>
                    <Input
                      value={option}
                      onChange={(e) => handleOptionChange(index, e.target.value)}
                      placeholder={`${String.fromCharCode(65 + index)} seçeneği...`}
                      className="flex-1"
                    />
                    {formData.options.length > 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => handleRemoveOption(index)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                ))}
                {formData.options.length < 8 && (
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={handleAddOption}
                    className="flex items-center gap-2"
                  >
                    <Plus className="h-4 w-4" />
                    Seçenek Ekle
                  </Button>
                )}
                <p className="text-xs text-gray-500">
                  Doğru cevabı seçmek için seçeneğin yanındaki radio butonuna tıklayın.
                </p>
              </div>
            )}
          </div>

          {/* Etiketler */}
          <div>
            <Label>Etiketler</Label>
            <div className="flex gap-2 mb-2">
              <Input
                value={formData.newTag}
                onChange={(e) => setFormData(prev => ({ ...prev, newTag: e.target.value }))}
                placeholder="Yeni etiket ekle..."
                onKeyPress={(e) => e.key === 'Enter' && handleAddTag()}
              />
              <Button type="button" onClick={handleAddTag} variant="outline">
                Ekle
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags.map((tag, index) => (
                <Badge key={index} variant="secondary" className="flex items-center gap-1">
                  #{tag}
                  <X 
                    className="h-3 w-3 cursor-pointer" 
                    onClick={() => handleRemoveTag(tag)}
                  />
                </Badge>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            İptal
          </Button>
          <Button 
            onClick={handleSave}
            disabled={!formData.title.trim() || !formData.content.trim() || !formData.categoryId}
          >
            Soruyu Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
