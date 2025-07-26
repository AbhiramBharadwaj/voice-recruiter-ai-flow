import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';
import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, FileText, BarChart3, Users, Bot, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-primary-glow/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
        </div>

        {/* Minimal Header */}
        <header className="border-b border-border/10 bg-background/5 backdrop-blur-xl sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
                  <Bot className="h-5 w-5 text-white" />
                </div>
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary-glow bg-clip-text text-transparent">
                  AI Recruiter
                </h1>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-6">
              <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-white via-primary-glow to-white bg-clip-text text-transparent">
                AI-Powered Recruiting
              </h1>
              <p className="text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
                Transform your hiring process with intelligent candidate matching, automated interviews, and data-driven insights.
              </p>
            </div>
            <div className="flex justify-center space-x-6 mb-8">
              <div className="flex items-center space-x-2 text-primary-glow">
                <Sparkles className="h-5 w-5" />
                <span className="text-sm font-medium">AI-Powered</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-glow">
                <BarChart3 className="h-5 w-5" />
                <span className="text-sm font-medium">Data-Driven</span>
              </div>
              <div className="flex items-center space-x-2 text-primary-glow">
                <Users className="h-5 w-5" />
                <span className="text-sm font-medium">Candidate-First</span>
              </div>
            </div>
          </div>

          {/* Role-Based Dashboard */}
          <div className="animate-slide-up">
            <RoleBasedDashboard />
          </div>

          {/* CTA Section */}
          <div className="text-center mt-16 animate-scale-in">
            <Card className="max-w-3xl mx-auto bg-gradient-card border-primary/20 shadow-elegant rounded-3xl backdrop-blur-xl">
              <CardHeader className="pb-6">
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-white to-primary-glow bg-clip-text text-transparent">
                  Ready to revolutionize your hiring process?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-4">
                  Join thousands of companies using AI to find the perfect candidates faster and more efficiently.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link to="/interviews">
                    <Button 
                      size="lg" 
                      className="text-lg px-12 py-4 bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105 rounded-2xl font-semibold"
                    >
                      <Mic className="h-5 w-5 mr-2" />
                      Start Your First Interview
                    </Button>
                  </Link>
                  <Link to="/candidates">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-12 py-4 border-primary/30 bg-background/10 backdrop-blur-sm hover:bg-primary/10 transition-all duration-300 transform hover:scale-105 rounded-2xl font-semibold"
                    >
                      <Users className="h-5 w-5 mr-2" />
                      Manage Candidates
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          </div>
        </main>
      </div>
    </ProtectedRoute>
  );
};

export default Index;
