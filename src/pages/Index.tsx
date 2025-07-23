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
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-6 w-6 text-primary" />
                <h1 className="text-lg font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  AI Recruiter
                </h1>
              </div>
              <UserProfile />
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="container mx-auto px-4 py-8">
          <div className="text-center mb-12">
            <h2 className="text-4xl font-bold mb-4 bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Welcome to the Future of Recruitment
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Experience AI-powered voice interviews that revolutionize the hiring process with intelligent conversation and comprehensive analysis.
            </p>
          </div>

          {/* Role-Based Dashboard */}
          <RoleBasedDashboard />

          {/* CTA Section */}
          <div className="text-center">
            <Card className="max-w-2xl mx-auto bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
              <CardHeader>
                <CardTitle className="text-2xl">Ready to revolutionize your hiring process?</CardTitle>
                <CardDescription className="text-lg">
                  Join thousands of companies using AI to find the perfect candidates faster and more efficiently.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <Link to="/interviews">
                    <Button size="lg" className="text-lg px-8">
                      Start Your First Interview
                    </Button>
                  </Link>
                  <Link to="/candidates">
                    <Button variant="outline" size="lg" className="text-lg px-8">
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
