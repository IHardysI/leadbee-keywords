"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { routes } from "@/components/Sidebar";

export default function BreadcrumbsNav() {
  const pathname = usePathname();
  const breadcrumbs = getBreadcrumbs(pathname);

  function getBreadcrumbs(path: string) {
    const segments = path.split('/').filter(Boolean);
    
    if (segments.length === 0) {
      return [{ name: 'Проекты', href: '/' }];
    }
    
    if (segments.length === 1) {
      if (segments[0] === 'groups') {
        return [{ name: 'Группы', href: '/groups' }];
      }
    }
    
    const isGroupsPath = segments[0] === 'groups';
    
    return [
      { 
        name: isGroupsPath ? 'Группы' : 'Проекты', 
        href: isGroupsPath ? '/groups' : '/'
      },
      ...segments.slice(1).map((segment, index) => {
        const href = `/${segments[0]}/${segments.slice(1, index + 2).join('/')}`;
        let name = segment.charAt(0).toUpperCase() + segment.slice(1);
        
        return {
          name,
          href,
        };
      }),
    ];
  }

  const getSegmentLabel = (path: string) => {
    const matchedRoute = routes.find(route => route.href === path);
    if (matchedRoute) return matchedRoute.label;
    
    const segment = path.split('/').pop() || '';
    
    const customLabels: {[key: string]: string} = {
      'projects': 'Проекты',
      'groups': 'Группы',
    };
    
    return customLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
  };
  
  const firstSegmentName = breadcrumbs.length > 0 
    ? breadcrumbs[0].name 
    : "Проекты";
  
  return (
    <nav className="flex items-center text-lg font-medium">
      <span className="font-medium">
        {firstSegmentName}
      </span>
      
      {/* Add remaining path segments if any */}
      {breadcrumbs.length > 1 && breadcrumbs.slice(1).map((breadcrumb, index) => {
        return (
          <span key={breadcrumb.href} className="flex items-center">
            <span className="mx-2 text-muted-foreground">/</span>
            <Link 
              href={breadcrumb.href}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              {breadcrumb.name}
            </Link>
          </span>
        );
      })}
    </nav>
  );
} 