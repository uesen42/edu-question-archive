// src/components/Layout.tsx
import React, { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { SidebarProvider } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { ThemeToggle } from '@/components/ThemeToggle';
import { useQuestionStore } from '@/store/questionStore';

/**
 * Uygulamanın ana düzenini sağlayan bileşen
 */
export default function Layout() {
  const initDatabase = useQuestionStore((state) => state.initDatabase);

  // Veritabanı başlatma
  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-background">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          {/* Header */}
          <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 p-4 sticky top-0 z-40">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <SidebarProvider.SidebarTrigger />
                <h1 className="text-xl md:text-2xl font-bold text-foreground">
                  Soru Bankası Yönetim Sistemi
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Ana içerik alanı */}
          <div className="flex-1 p-4 md:p-6 overflow-auto">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}