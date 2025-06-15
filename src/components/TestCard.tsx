
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Eye } from 'lucide-react';
import { Test } from '@/types';

interface TestCardProps {
  test: Test;
  onView: (test: Test) => void;
  onDownload: (test: Test) => void;
}

export function TestCard({ test, onView, onDownload }: TestCardProps) {
  return (
    <Card className="hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg">{test.title}</CardTitle>
          <Badge variant="secondary">
            {test.questionIds.length} soru
          </Badge>
        </div>
      </CardHeader>
      <CardContent>
        <p className="text-gray-600 text-sm mb-4">
          {test.description || 'Açıklama yok'}
        </p>
        
        <div className="flex flex-wrap gap-2 mb-4">
          {test.settings.showAnswers && (
            <Badge variant="outline" className="text-xs">
              Cevaplar gösteriliyor
            </Badge>
          )}
          {test.settings.randomizeOrder && (
            <Badge variant="outline" className="text-xs">
              Karışık sıra
            </Badge>
          )}
          {test.settings.timeLimit && (
            <Badge variant="outline" className="text-xs">
              {test.settings.timeLimit} dk
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <Calendar className="h-3 w-3 inline mr-1" />
            {new Date(test.createdAt).toLocaleDateString('tr-TR')}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onView(test)}
            >
              <Eye className="h-3 w-3 mr-1" />
              Görüntüle
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={() => onDownload(test)}
            >
              <Download className="h-3 w-3 mr-1" />
              İndir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
