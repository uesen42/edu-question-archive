import React, { Suspense, lazy, useEffect, useState } from 'react';
import { Toaster } from "@/components/ui/toaster";
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

// Lazy load page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Questions = lazy(() => import("@/pages/Questions"));
const Tests = lazy(() => import("@/pages/Tests"));
const Exams = lazy(() => import("@/pages/Exams")); // Varsa!
const Categories = lazy(() => import("@/pages/Categories"));
const Settings = lazy(() => import("@/pages/Settings"));
const Analytics = lazy(() => import("@/pages/Analytics"));
const Students = lazy(() => import("@/pages/Students"));
const MathTopics = lazy(() => import("@/pages/MathTopics"));
const Grade9Topics = lazy(() => import("@/pages/Grade9Topics"));
const Grade10Topics = lazy(() => import("@/pages/Grade10Topics"));
const Grade11Topics = lazy(() => import("@/pages/Grade11Topics"));
const Grade12Topics = lazy(() => import("@/pages/Grade12Topics"));
const ProblemSolving = lazy(() => import("@/pages/ProblemSolving"));
const MathTools = lazy(() => import("@/pages/MathTools"));
const PracticeTests = lazy(() => import("@/pages/PracticeTests"));
const Layout = lazy(() => import("@/components/Layout"));

const queryClient = new QueryClient();

const App = () => {
  const [showPerformanceMonitor, setShowPerformanceMonitor] = useState(false);

  useEffect(() => {
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
              <BrowserRouter>
                <div>
                  <Toaster />
                  <Suspense fallback={<PageLoadingSkeleton />}>
                    <Routes>
                      <Route path="/" element={
                        <Suspense fallback={<PageLoadingSkeleton />}>
                          <Layout />
                        </Suspense>
                      }>
                        <Route index element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                        <Route path="questions" element={<ProtectedRoute><Questions /></ProtectedRoute>} />
                        <Route path="tests" element={<ProtectedRoute><Tests /></ProtectedRoute>} />
                        <Route path="exams" element={<ProtectedRoute><Exams /></ProtectedRoute>} />
                        <Route path="categories" element={<ProtectedRoute adminOnly={true}><Categories /></ProtectedRoute>} />
                        <Route path="analytics" element={<ProtectedRoute adminOnly={true}><Analytics /></ProtectedRoute>} />
                        <Route path="students" element={<ProtectedRoute adminOnly={true}><Students /></ProtectedRoute>} />
                        <Route path="settings" element={<ProtectedRoute adminOnly={true}><Settings /></ProtectedRoute>} />
                        <Route path="math-topics" element={<ProtectedRoute><MathTopics /></ProtectedRoute>} />
                        <Route path="math-topics/9" element={<ProtectedRoute><Grade9Topics /></ProtectedRoute>} />
                        <Route path="math-topics/10" element={<ProtectedRoute><Grade10Topics /></ProtectedRoute>} />
                        <Route path="math-topics/11" element={<ProtectedRoute><Grade11Topics /></ProtectedRoute>} />
                        <Route path="math-topics/12" element={<ProtectedRoute><Grade12Topics /></ProtectedRoute>} />
                        <Route path="problem-solving" element={<ProtectedRoute><ProblemSolving /></ProtectedRoute>} />
                        <Route path="math-tools" element={<ProtectedRoute><MathTools /></ProtectedRoute>} />
                        <Route path="practice-tests" element={<ProtectedRoute><PracticeTests /></ProtectedRoute>} />
                      </Route>
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </Suspense>
                  <PerformanceMonitor isVisible={showPerformanceMonitor} />
                </div>
              </BrowserRouter>
            </AuthProvider>
          </TooltipProvider>
        </QueryClientProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
};

export default App;