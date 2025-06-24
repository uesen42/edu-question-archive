//src/App.tsx
import React from 'react';
import { Suspense, lazy, useEffect } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
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
const Exams = lazy(() => import("@/pages/Exams"));
const Categories = lazy(() => import("@/pages/Categories"));
const Settings = lazy(() => import("@/pages/Settings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Students = lazy(() => import("@/pages/Students"));
const Layout = lazy(() => import("@/components/Layout"));

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
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <Routes>
                      <Route path="/" element={<Layout />}>
                        <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
                        <Route path="tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
                        <Route path="exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
                        <Route path="categories" element={<ProtectedRoute adminOnly><Categories /></ProtectedRoute>} />
                        <Route path="analytics" element={<ProtectedRoute adminOnly><Analytics /></ProtectedRoute>} />
                        <Route path="students" element={<ProtectedRoute adminOnly><Students /></ProtectedRoute>} />
                        <Route path="settings" element={<ProtectedRoute adminOnly><Settings /></ProtectedRoute>} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
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
