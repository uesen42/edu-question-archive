import { useEffect, useRef, useState } from 'react';

interface PerformanceMetrics {
  renderTime: number;
  componentName: string;
  timestamp: number;
}

interface MemoryInfo {
  usedJSHeapSize: number;
  totalJSHeapSize: number;
  jsHeapSizeLimit: number;
}

export function usePerformance(componentName: string) {
  const renderStartTime = useRef<number>(0);
  const [metrics, setMetrics] = useState<PerformanceMetrics[]>([]);

  // Only set renderStartTime before the first paint
  useEffect(() => {
    renderStartTime.current = performance.now();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  // Only run after mount (componentDidMount)
  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };
    setMetrics(prev => [...prev.slice(-9), metric]); // Keep last 10 metrics
    if (renderTime > 16) {
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run only once on mount

  const getMemoryUsage = (): MemoryInfo | null => {
    if ('memory' in performance) {
      return (performance as any).memory;
    }
    return null;
  };

  const logPerformanceMetrics = () => {
    console.group('Performance Metrics');
    console.table(metrics);
    console.log('Memory Usage:', getMemoryUsage());
    console.groupEnd();
  };

  return {
    metrics,
    getMemoryUsage,
    logPerformanceMetrics,
  };
}
