
import { Suspense, lazy } from 'react';
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Layout } from "@/components/Layout";
import NotFound from "./pages/NotFound";

// Lazy load page components
const Dashboard = lazy(() => import("@/pages/Dashboard"));
const Questions = lazy(() => import("@/pages/Questions"));
const Tests = lazy(() => import("@/pages/Tests"));
const Categories = lazy(() => import("@/pages/Categories"));
const Settings = lazy(() => import("@/pages/Settings"));

const queryClient = new QueryClient();

// Loading component
const PageLoader = () => (
  <div className="flex items-center justify-center min-h-screen">
    <div className="flex flex-col items-center gap-4">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      <p className="text-gray-600">Sayfa yükleniyor...</p>
    </div>
  </div>
);

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <BrowserRouter>
        <Routes>
          <Route path="/" element={<Layout />}>
            <Route 
              index 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Dashboard />
                </Suspense>
              } 
            />
            <Route 
              path="questions" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Questions />
                </Suspense>
              } 
            />
            <Route 
              path="tests" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Tests />
                </Suspense>
              } 
            />
            <Route 
              path="categories" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Categories />
                </Suspense>
              } 
            />
            <Route 
              path="settings" 
              element={
                <Suspense fallback={<PageLoader />}>
                  <Settings />
                </Suspense>
              } 
            />
          </Route>
          <Route path="*" element={<NotFound />} />
        </Routes>
      </BrowserRouter>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
