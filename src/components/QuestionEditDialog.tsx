
import { useState, useEffect } from 'react';
import { Question, Category } from '@/types';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { X } from 'lucide-react';

interface QuestionEditDialogProps {
  question: Question | null;
  categories: Category[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (question: Question) => void;
}

export function QuestionEditDialog({ 
  question, 
  categories, 
  open, 
  onOpenChange, 
  onSave 
}: QuestionEditDialogProps) {
  const [formData, setFormData] = useState({
    title: '',
    content: '',
    categoryId: '',
    difficultyLevel: 'kolay' as 'kolay' | 'orta' | 'zor',
    grade: 1,
    tags: [] as string[],
    newTag: ''
  });

  useEffect(() => {
    if (question) {
      setFormData({
        title: question.title,
        content: question.content,
        categoryId: question.categoryId,
        difficultyLevel: question.difficultyLevel,
        grade: question.grade,
        tags: [...question.tags],
        newTag: ''
      });
    }
  }, [question]);

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

  const handleSave = () => {
    if (question && formData.title.trim() && formData.content.trim()) {
      const updatedQuestion: Question = {
        ...question,
        title: formData.title.trim(),
        content: formData.content.trim(),
        categoryId: formData.categoryId,
        difficultyLevel: formData.difficultyLevel,
        grade: formData.grade,
        tags: formData.tags,
        updatedAt: new Date()
      };
      onSave(updatedQuestion);
      onOpenChange(false);
    }
  };

  if (!question) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Soruyu Düzenle</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4">
          {/* Başlık */}
          <div>
            <Label htmlFor="title">Soru Başlığı</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="Soru başlığını girin..."
            />
          </div>

          {/* İçerik */}
          <div>
            <Label htmlFor="content">Soru İçeriği</Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => setFormData(prev => ({ ...prev, content: e.target.value }))}
              placeholder="Soru içeriğini girin... (LaTeX için $ işareti kullanabilirsiniz)"
              rows={4}
            />
          </div>

          {/* Kategori, Zorluk, Sınıf */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Kategori</Label>
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
          <Button onClick={handleSave}>
            Kaydet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
