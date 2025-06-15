
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, FileText, Calendar, Download } from 'lucide-react';

export default function Tests() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Testler</h1>
          <p className="text-gray-600 mt-2">Test oluşturun ve yönetin</p>
        </div>
        <Button className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Yeni Test Oluştur
        </Button>
      </div>

      <div className="text-center py-12">
        <FileText className="mx-auto h-12 w-12 text-gray-400" />
        <h3 className="mt-4 text-lg font-medium text-gray-900">
          Henüz test yok
        </h3>
        <p className="mt-2 text-gray-600">
          İlk testinizi oluşturarak başlayın.
        </p>
        <Button className="mt-4">
          İlk Testi Oluştur
        </Button>
      </div>
    </div>
  );
}
