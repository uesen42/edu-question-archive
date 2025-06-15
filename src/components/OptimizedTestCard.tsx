
import React, { memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Calendar, Download, Eye } from 'lucide-react';
import { Test } from '@/types';
import { usePerformance } from '@/hooks/usePerformance';

interface OptimizedTestCardProps {
  test: Test;
  onView: (test: Test) => void;
  onDownload: (test: Test) => void;
}

const OptimizedTestCardComponent = ({ test, onView, onDownload }: OptimizedTestCardProps) => {
  usePerformance(`TestCard-${test.id}`);

  const handleView = React.useCallback(() => {
    onView(test);
  }, [onView, test]);

  const handleDownload = React.useCallback(() => {
    onDownload(test);
  }, [onDownload, test]);

  const formattedDate = React.useMemo(() => {
    return new Date(test.createdAt).toLocaleDateString('tr-TR');
  }, [test.createdAt]);

  const settingsCount = React.useMemo(() => {
    let count = 0;
    if (test.settings.showAnswers) count++;
    if (test.settings.randomizeOrder) count++;
    if (test.settings.showOptions) count++;
    if (test.settings.timeLimit) count++;
    return count;
  }, [test.settings]);

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
          {test.settings.showOptions && (
            <Badge variant="outline" className="text-xs">
              Şıklı sorular
            </Badge>
          )}
          {test.settings.timeLimit && (
            <Badge variant="outline" className="text-xs">
              {test.settings.timeLimit} dk
            </Badge>
          )}
          {settingsCount === 0 && (
            <Badge variant="outline" className="text-xs">
              Varsayılan ayarlar
            </Badge>
          )}
        </div>

        <div className="flex items-center justify-between">
          <div className="text-xs text-gray-500">
            <Calendar className="h-3 w-3 inline mr-1" />
            {formattedDate}
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleView}
            >
              <Eye className="h-3 w-3 mr-1" />
              Görüntüle
            </Button>
            <Button 
              variant="outline" 
              size="sm"
              onClick={handleDownload}
            >
              <Download className="h-3 w-3 mr-1" />
              İndir
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export const OptimizedTestCard = memo(OptimizedTestCardComponent);
