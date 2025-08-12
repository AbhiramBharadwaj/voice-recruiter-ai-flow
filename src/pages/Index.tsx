import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { RoleBasedDashboard } from '@/components/RoleBasedDashboard';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Brain, FileText, Sparkles, Target, Zap } from 'lucide-react';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-hero relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-accent/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-primary-glow/5 rounded-full blur-3xl"></div>
        </div>

        {/* Common Header */}
        

        {/* Main Content */}
        <main className="container mx-auto px-4 py-12 relative z-10">
          {/* Hero Section */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="mb-8">
              <h1 className="text-5xl lg:text-6xl font-bold mb-6 bg-gradient-to-r from-foreground via-primary to-primary-glow bg-clip-text text-transparent font-serif">
                Master Your Interview Skills
              </h1>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed font-medium">
                Professional AI-powered assessment platform for comprehensive interview preparation, resume optimization, and skill enhancement.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-6 mb-8">
              <div className="flex items-center space-x-2 bg-primary/10 px-4 py-2 rounded-full border border-primary/20">
                <Sparkles className="h-5 w-5 text-primary" />
                <span className="text-sm font-semibold text-foreground">AI-Enhanced</span>
              </div>
              <div className="flex items-center space-x-2 bg-accent/10 px-4 py-2 rounded-full border border-accent/20">
                <Target className="h-5 w-5 text-accent-foreground" />
                <span className="text-sm font-semibold text-foreground">Goal-Oriented</span>
              </div>
              <div className="flex items-center space-x-2 bg-secondary/10 px-4 py-2 rounded-full border border-secondary/20">
                <Zap className="h-5 w-5 text-secondary-foreground" />
                <span className="text-sm font-semibold text-foreground">Results-Driven</span>
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
                <CardTitle className="text-3xl font-bold bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent font-serif">
                  Ready to ace your next interview?
                </CardTitle>
                <CardDescription className="text-lg text-muted-foreground mt-4 font-medium">
                  Start with our comprehensive assessment suite and get personalized feedback to improve your skills.
                </CardDescription>
              </CardHeader>
              <CardContent className="pb-8">
                <div className="flex flex-col sm:flex-row gap-6 justify-center">
                  <Link to="/interviews">
                    <Button 
                      size="lg" 
                      className="text-lg px-12 py-4 bg-gradient-primary hover:shadow-glow transition-all duration-300 transform hover:scale-105 rounded-2xl font-semibold text-white"
                    >
                      <Brain className="h-5 w-5 mr-2" />
                      Start AI Interview
                    </Button>
                  </Link>
                  <Link to="/resume-parser">
                    <Button 
                      variant="outline" 
                      size="lg" 
                      className="text-lg px-12 py-4 border-primary/30 bg-background/50 backdrop-blur-sm hover:bg-primary/10 hover:border-primary/50 transition-all duration-300 transform hover:scale-105 rounded-2xl font-semibold"
                    >
                      <FileText className="h-5 w-5 mr-2" />
                      Analyze Resume
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
