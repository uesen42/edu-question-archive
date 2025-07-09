
import { BookOpen, FileText, FolderOpen, BarChart3, Settings, Users, TrendingUp, LogOut, GraduationCap, Calculator, Target, Wrench, ChevronRight } from 'lucide-react';
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
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
  SidebarFooter,
  SidebarHeader,
} from '@/components/ui/sidebar';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

const items = [
  {
    title: 'Anasayfa',
    url: '/',
    icon: BarChart3,
    roles: ['admin', 'user']
  },
  {
    title: 'Matematik Konuları',
    url: '/math-topics',
    icon: Calculator,
    roles: ['admin', 'user'],
    subItems: [
      { title: '9. Sınıf', url: '/math-topics/9' },
      { title: '10. Sınıf', url: '/math-topics/10' },
      { title: '11. Sınıf', url: '/math-topics/11' },
      { title: '12. Sınıf', url: '/math-topics/12' }
    ]
  },
  {
    title: 'Soru Çözme',
    url: '/problem-solving',
    icon: Target,
    roles: ['admin', 'user']
  },
  {
    title: 'Matematik Araçları',
    url: '/math-tools',
    icon: Wrench,
    roles: ['admin', 'user']
  },
  {
    title: 'Deneme Sınavları',
    url: '/practice-tests',
    icon: GraduationCap,
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

  const isTopicActive = (item: any) => {
    if (item.subItems) {
      return location.pathname.startsWith(item.url) || 
             item.subItems.some((subItem: any) => location.pathname.startsWith(subItem.url));
    }
    return location.pathname === item.url;
  };

  return (
    <Sidebar className="border-r border-border/40">
      <SidebarHeader className="p-4 border-b">
        <h2 className="text-lg font-semibold text-sidebar-foreground truncate">
          Soru Bankası
        </h2>
      </SidebarHeader>
      
      <SidebarContent className="bg-sidebar">
        <SidebarGroup>
          <SidebarGroupLabel className="text-lg font-semibold text-sidebar-foreground px-4 py-2">
            Menü
          </SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {filteredItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  {item.subItems ? (
                    <Collapsible defaultOpen={isTopicActive(item)}>
                      <CollapsibleTrigger asChild>
                        <SidebarMenuButton 
                          isActive={isTopicActive(item)}
                          className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                        >
                          <div className="flex items-center gap-3 px-4 py-2 w-full">
                            <item.icon className="h-5 w-5 flex-shrink-0" />
                            <span className="truncate flex-1 text-left">{item.title}</span>
                            <ChevronRight className="h-4 w-4 transition-transform data-[state=open]:rotate-90" />
                          </div>
                        </SidebarMenuButton>
                      </CollapsibleTrigger>
                      <CollapsibleContent>
                        <SidebarMenuSub>
                          {item.subItems.map((subItem: any) => (
                            <SidebarMenuSubItem key={subItem.title}>
                              <SidebarMenuSubButton 
                                asChild
                                isActive={location.pathname === subItem.url}
                              >
                                <Link to={subItem.url} className="pl-8">
                                  {subItem.title}
                                </Link>
                              </SidebarMenuSubButton>
                            </SidebarMenuSubItem>
                          ))}
                        </SidebarMenuSub>
                      </CollapsibleContent>
                    </Collapsible>
                  ) : (
                    <SidebarMenuButton 
                      asChild 
                      isActive={location.pathname === item.url}
                      className="w-full hover:bg-sidebar-accent hover:text-sidebar-accent-foreground data-[active=true]:bg-sidebar-primary data-[active=true]:text-sidebar-primary-foreground"
                    >
                      <Link to={item.url} className="flex items-center gap-3 px-4 py-2">
                        <item.icon className="h-5 w-5 flex-shrink-0" />
                        <span className="truncate">{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  )}
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      
      <SidebarFooter className="p-4 border-t">
        <div className="space-y-2">
          <div className="text-sm text-sidebar-foreground">
            <p className="font-medium truncate">{userProfile?.displayName}</p>
            <p className="text-xs text-sidebar-foreground/70">
              {isAdmin ? 'Admin' : 'Kullanıcı'}
            </p>
          </div>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={logout}
            className="w-full flex items-center gap-2 text-sm"
          >
            <LogOut className="h-4 w-4 flex-shrink-0" />
            <span className="truncate">Çıkış Yap</span>
          </Button>
        </div>
      </SidebarFooter>
    </Sidebar>
  );
}
