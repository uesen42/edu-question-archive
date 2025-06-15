
import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Activity, MemoryStick, Zap } from 'lucide-react';
import { usePerformance } from '@/hooks/usePerformance';

interface PerformanceMonitorProps {
  isVisible?: boolean;
}

export function PerformanceMonitor({ isVisible = false }: PerformanceMonitorProps) {
  const { metrics, getMemoryUsage, logPerformanceMetrics } = usePerformance('PerformanceMonitor');
  const [bundleSize, setBundleSize] = useState<number>(0);

  useEffect(() => {
    // Estimate bundle size from loaded scripts
    const scripts = Array.from(document.querySelectorAll('script[src]'));
    let totalSize = 0;
    
    scripts.forEach(script => {
      const src = script.getAttribute('src');
      if (src && src.includes('assets')) {
        // Rough estimation based on script tag presence
        totalSize += 100; // KB estimate per script
      }
    });
    
    setBundleSize(totalSize);
  }, []);

  const memoryInfo = getMemoryUsage();
  const avgRenderTime = metrics.length > 0 
    ? metrics.reduce((sum, m) => sum + m.renderTime, 0) / metrics.length 
    : 0;

  if (!isVisible) return null;

  return (
    <Card className="fixed bottom-4 right-4 w-80 bg-gray-900 text-white border-gray-700 z-50">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Activity className="h-4 w-4" />
          Performance Monitor
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300">Avg Render Time:</span>
          <Badge variant={avgRenderTime > 16 ? 'destructive' : 'secondary'}>
            {avgRenderTime.toFixed(2)}ms
          </Badge>
        </div>
        
        {memoryInfo && (
          <div className="flex items-center justify-between">
            <span className="text-xs text-gray-300 flex items-center gap-1">
              <MemoryStick className="h-3 w-3" />
              Memory:
            </span>
            <Badge variant="outline">
              {(memoryInfo.usedJSHeapSize / 1024 / 1024).toFixed(1)}MB
            </Badge>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-300 flex items-center gap-1">
            <Zap className="h-3 w-3" />
            Bundle Size:
          </span>
          <Badge variant="outline">
            ~{bundleSize}KB
          </Badge>
        </div>

        <Button 
          variant="outline" 
          size="sm" 
          onClick={logPerformanceMetrics}
          className="w-full text-xs"
        >
          Log Metrics
        </Button>
      </CardContent>
    </Card>
  );
}
