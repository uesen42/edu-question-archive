
import { BookOpen, FileText, FolderOpen, BarChart3, Settings, Users, TrendingUp } from 'lucide-react';
import { Link, useLocation } from 'react-router-dom';
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from '@/components/ui/sidebar';

const items = [
  {
    title: 'Anasayfa',
    url: '/',
    icon: BarChart3,
  },
  {
    title: 'Sorular',
    url: '/questions',
    icon: BookOpen,
  },
  {
    title: 'Testler',
    url: '/tests',
    icon: FileText,
  },
  {
    title: 'Kategoriler',
    url: '/categories',
    icon: FolderOpen,
  },
  {
    title: 'Analytics',
    url: '/analytics',
    icon: TrendingUp,
  },
  {
    title: 'Öğrenciler',
    url: '/students',
    icon: Users,
  },
  {
    title: 'Ayarlar',
    url: '/settings',
    icon: Settings,
  },
];

export function AppSidebar() {
  const location = useLocation();

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-sidebar-foreground px-4 py-2">
            Menü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {items.map((item) => (
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
    </Sidebar>
  );
}
