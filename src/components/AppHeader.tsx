import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Brain, BarChart3, BookOpen } from 'lucide-react';
import { useEffect, useState } from 'react';

export const AppHeader = () => {
  const location = useLocation();
  const [isVisible, setIsVisible] = useState(true);
  const [lastScrollY, setLastScrollY] = useState(0);
  
  const navItems = [
    { name: 'Dashboard', href: '/', icon: Bot },
    { name: 'Resume Parser', href: '/resume-parser', icon: FileText },
    { name: 'Practice MCQs', href: '/practice-mcqs', icon: BookOpen },
    { name: 'Interviews', href: '/interviews', icon: Brain },
    { name: 'Analytics', href: '/analytics', icon: BarChart3 },
  ];

  const isActive = (href: string) => {
    if (href === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(href);
  };

  useEffect(() => {
    const controlNavbar = () => {
      if (typeof window !== 'undefined') {
        if (window.scrollY > lastScrollY && window.scrollY > 100) {
          setIsVisible(false);
        } else {
          setIsVisible(true);
        }
        setLastScrollY(window.scrollY);
      }
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('scroll', controlNavbar);
      return () => {
        window.removeEventListener('scroll', controlNavbar);
      };
    }
  }, [lastScrollY]);

  return (
    <header className={`border-b border-border bg-background/95 backdrop-blur-xl fixed top-0 left-0 right-0 z-50 shadow-card transition-transform duration-300 ${
      isVisible ? 'translate-y-0' : '-translate-y-full'
    }`}>
      <div className="container mx-auto px-4 py-2">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-2 group">
            <div className="p-1.5 bg-gradient-primary rounded-lg shadow-glow group-hover:scale-105 transition-transform">
              <Bot className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-bold text-foreground font-serif">AI Interview</span>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center justify-center flex-1 mx-8">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                return (
                  <Link key={item.href} to={item.href}>
                    <Button
                      variant={isActive(item.href) ? "default" : "ghost"}
                      size="sm"
                      className={`flex items-center space-x-1.5 px-3 py-1.5 text-sm transition-all duration-200 ${
                        isActive(item.href)
                          ? 'bg-primary text-primary-foreground shadow-glow'
                          : 'text-foreground hover:bg-accent hover:text-accent-foreground'
                      }`}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      <span className="font-medium">{item.name}</span>
                    </Button>
                  </Link>
                );
              })}
            </div>
          </nav>

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
};