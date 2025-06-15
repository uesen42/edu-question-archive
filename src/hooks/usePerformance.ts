
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

  useEffect(() => {
    renderStartTime.current = performance.now();
  });

  useEffect(() => {
    const renderEndTime = performance.now();
    const renderTime = renderEndTime - renderStartTime.current;
    
    const metric: PerformanceMetrics = {
      renderTime,
      componentName,
      timestamp: Date.now(),
    };

    setMetrics(prev => [...prev.slice(-9), metric]); // Keep last 10 metrics
    
    // Log slow renders
    if (renderTime > 16) { // 16ms = 60fps threshold
      console.warn(`Slow render detected in ${componentName}: ${renderTime.toFixed(2)}ms`);
    }
  });

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
