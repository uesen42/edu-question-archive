
import { BookOpen, FileText, FolderOpen, BarChart3, Settings, Users, TrendingUp, LogOut, GraduationCap } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarFooter,
} from '@/components/ui/sidebar';

const items = [
  {
    title: 'Anasayfa',
    url: '/',
    icon: BarChart3,
    roles: ['admin', 'user']
  },
  {
    title: 'Sorular',
    url: '/questions',
    icon: BookOpen,
    roles: ['admin', 'user']
  },
  {
    title: 'Testler',
    url: '/tests',
    icon: FileText,
    roles: ['admin', 'user']
  },
  {
    title: 'Sınavlar',
    url: '/exams',
    icon: GraduationCap,
    roles: ['admin', 'user']
  },
  {
    title: 'Kategoriler',
    url: '/categories',
    icon: FolderOpen,
    roles: ['admin']
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: TrendingUp,
    roles: ['admin']
  },
  {
    title: 'Öğrenciler',
    url: '/students',
    icon: Users,
    roles: ['admin']
  },
  {
    title: 'Ayarlar',
    url: '/settings',
    icon: Settings,
    roles: ['admin']
  },
];

export function AppSidebar() {
  const location = useLocation();
  const { userProfile, logout, isAdmin } = useAuth();

  const filteredItems = items.filter(item => 
    item.roles.includes(userProfile?.role || 'user')
  );

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-sidebar-foreground px-4 py-2">
            Menü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton 
                    asChild 
                    isActive={location.pathname === item.url}
                    className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                  >
                    <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                      <item.icon className="h-5 w-5" />
                      <span>{item.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-2">
          <div className="text-sm text-sidebar-foreground">
            <p className="font-medium">{userProfile?.displayName}</p>
            <p className="text-xs text-sidebar-foreground/70">
              {isAdmin ? 'Admin' : 'Kullanıcı'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="w-full flex items-center gap-2"
          >
            <LogOut className="h-4 w-4" />
            Çıkış Yap
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
