import { Link, useLocation } from 'react-router-dom';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Bot, FileText, Brain, BarChart3, BookOpen } from 'lucide-react';

export const AppHeader = () => {
  const location = useLocation();
  
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

  return (
    <header className="border-b border-border bg-background/95 backdrop-blur-xl sticky top-0 z-50 shadow-card">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="p-2.5 bg-gradient-primary rounded-xl shadow-glow group-hover:scale-105 transition-transform">
              <Bot className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent font-serif">
                AI Interview Platform
              </h1>
              <p className="text-xs text-muted-foreground font-medium">Professional Assessment Suite</p>
            </div>
          </Link>

          {/* Navigation */}
          <nav className="hidden md:flex items-center space-x-2">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <Link key={item.href} to={item.href}>
                  <Button
                    variant={isActive(item.href) ? "default" : "ghost"}
                    size="sm"
                    className={`flex items-center space-x-2 px-4 py-2 transition-all duration-200 ${
                      isActive(item.href)
                        ? 'bg-gradient-primary text-primary-foreground shadow-glow'
                        : 'hover:bg-accent hover:scale-105'
                    }`}
                  >
                    <Icon className="h-4 w-4" />
                    <span className="font-medium">{item.name}</span>
                  </Button>
                </Link>
              );
            })}
          </nav>

          {/* User Profile */}
          <UserProfile />
        </div>
      </div>
    </header>
  );
};