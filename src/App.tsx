//src/App.tsx
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { ThemeProvider } from "@/components/ThemeProvider";
import { AuthProvider } from "@/components/AuthProvider";
import { ProtectedRoute } from "@/components/ProtectedRoute";
import NotFound from "./pages/NotFound";
import { PerformanceMonitor } from "@/components/PerformanceMonitor";
import { PageLoadingSkeleton } from "@/components/LoadingStates";
import { useState } from 'react';

// Lazy load page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Questions = lazy(() => import("@/pages/Questions"));
const Tests = lazy(() => import("@/pages/Tests"));
const Categories = lazy(() => import("@/pages/Categories"));
const Settings = lazy(() => import("@/pages/Settings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Students = lazy(() => import("@/pages/Students"));

const queryClient = new QueryClient();

const App = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  useEffect(() => {
    // Show performance monitor in development
    if (process.env.NODE_ENV === 'development') {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.ctrlKey && e.shiftKey && e.key === 'P') {
          setShowPerformanceMonitor(prev => !prev);
        }
      };
      
      window.addEventListener('keydown', handleKeyDown);
      return () => window.removeEventListener('keydown', handleKeyDown);
    }
  }, []);

  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="system" storageKey="ui-theme">
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <AuthProvider>
              <Toaster />
              <Sonner />
              <BrowserRouter>
                <ErrorBoundary>
                  <Routes>
                    <Route path="/" element={<ProtectedRoute><Layout /></ProtectedRoute>}>
                      <Route 
                        index 
                        element={
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoadingSkeleton />}>
                              <Dashboard />
                            </Suspense>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="questions" 
                        element={
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoadingSkeleton />}>
                              <Questions />
                            </Suspense>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="tests" 
                        element={
                          <ErrorBoundary>
                            <Suspense fallback={<PageLoadingSkeleton />}>
                              <Tests />
                            </Suspense>
                          </ErrorBoundary>
                        } 
                      />
                      <Route 
                        path="categories" 
                        element={
                          <ProtectedRoute adminOnly>
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoadingSkeleton />}>
                                <Categories />
                              </Suspense>
                            </ErrorBoundary>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="analytics" 
                        element={
                          <ProtectedRoute adminOnly>
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoadingSkeleton />}>
                                <Analytics />
                              </Suspense>
                            </ErrorBoundary>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="students" 
                        element={
                          <ProtectedRoute adminOnly>
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoadingSkeleton />}>
                                <Students />
                              </Suspense>
                            </ErrorBoundary>
                          </ProtectedRoute>
                        } 
                      />
                      <Route 
                        path="settings" 
                        element={
                          <ProtectedRoute adminOnly>
                            <ErrorBoundary>
                              <Suspense fallback={<PageLoadingSkeleton />}>
                                <Settings />
                              </Suspense>
                            </ErrorBoundary>
                          </ProtectedRoute>
                        } 
                      />
                    </Route>
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </ErrorBoundary>
              </BrowserRouter>
              <PerformanceMonitor isVisible={showPerformanceMonitor} />
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;
