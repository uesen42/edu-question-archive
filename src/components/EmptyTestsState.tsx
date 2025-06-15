
import { Button } from '@/components/ui/button';
import { FileText } from 'lucide-react';

interface EmptyTestsStateProps {
  onCreateTest: () => void;
}

export function EmptyTestsState({ onCreateTest }: EmptyTestsStateProps) {
  return (
    <div className="text-center py-12">
      <FileText className="mx-auto h-12 w-12 text-gray-400" />
      <h3 className="mt-4 text-lg font-medium text-gray-900">
        Henüz test yok
      </h3>
      <p className="mt-2 text-gray-600">
        İlk testinizi oluşturarak başlayın.
      </p>
      <Button 
        className="mt-4"
        onClick={onCreateTest}
      >
        İlk Testi Oluştur
      </Button>
    </div>
  );
}
