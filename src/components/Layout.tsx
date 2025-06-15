
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Sidebar, SidebarContent, SidebarProvider, SidebarTrigger } from '@/components/ui/sidebar';
import { AppSidebar } from '@/components/Sidebar';
import { useQuestionStore } from '@/store/questionStore';

export function Layout() {
  const initDatabase = useQuestionStore(state => state.initDatabase);

  useEffect(() => {
    initDatabase();
  }, [initDatabase]);

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full">
        <AppSidebar />
        <main className="flex-1 flex flex-col">
          <header className="border-b bg-white p-4">
            <div className="flex items-center gap-4">
              <SidebarTrigger />
              <h1 className="text-2xl font-bold text-gray-900">Soru Bankası Yönetim Sistemi</h1>
            </div>
          </header>
          <div className="flex-1 p-6">
            <Outlet />
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
}
