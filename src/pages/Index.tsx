import { Link } from 'react-router-dom';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { UserProfile } from '@/components/UserProfile';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mic, FileText, BarChart3, Users, Bot, Sparkles } from 'lucide-react';

const Index = () => {
  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        {/* Header */}
        <header className="border-b bg-background/80 backdrop-blur-sm sticky top-0 z-50">
          <div className="container mx-auto px-4 py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Bot className="h-8 w-8 text-primary" />
                <h1 className="text-2xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                  AI Recruiter Voice Agent
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

          {/* Features Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Mic className="h-6 w-6 text-primary" />
                  <CardTitle>Voice Interviews</CardTitle>
                </div>
                <CardDescription>
                  Conduct natural voice interviews with AI-powered conversation flow
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/interviews">
                  <Button className="w-full">
                    <Sparkles className="mr-2 h-4 w-4" />
                    Start Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <FileText className="h-6 w-6 text-primary" />
                  <CardTitle>Resume Analysis</CardTitle>
                </div>
                <CardDescription>
                  Upload and automatically parse resumes with NLP technology
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/candidates">
                  <Button variant="secondary" className="w-full">
                    Manage Candidates
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <BarChart3 className="h-6 w-6 text-primary" />
                  <CardTitle>Analytics Dashboard</CardTitle>
                </div>
                <CardDescription>
                  Comprehensive reports with sentiment analysis and scoring
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/analytics">
                  <Button variant="outline" className="w-full">
                    View Reports
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Users className="h-6 w-6 text-primary" />
                  <CardTitle>Candidate Management</CardTitle>
                </div>
                <CardDescription>
                  Track and manage candidates throughout the interview process
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/positions">
                  <Button variant="outline" className="w-full">
                    Manage Positions
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Bot className="h-6 w-6 text-primary" />
                  <CardTitle>AI Insights</CardTitle>
                </div>
                <CardDescription>
                  Get intelligent recommendations and improvement suggestions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/analytics">
                  <Button variant="secondary" className="w-full">
                    View Insights
                  </Button>
                </Link>
              </CardContent>
            </Card>

            <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
              <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
              <CardHeader>
                <div className="flex items-center space-x-2">
                  <Sparkles className="h-6 w-6 text-primary" />
                  <CardTitle>24/7 Availability</CardTitle>
                </div>
                <CardDescription>
                  Schedule interviews anytime with our AI-powered system
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Link to="/interviews">
                  <Button className="w-full">
                    Schedule Interview
                  </Button>
                </Link>
              </CardContent>
            </Card>
          </div>

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
