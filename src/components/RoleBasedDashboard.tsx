import { useAuth } from '@/hooks/useAuth';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Mic, FileText, BarChart3, Users, Bot, Sparkles, User, Briefcase, Calendar, MessageSquare } from 'lucide-react';

interface Profile {
  role: string | null;
}

export function RoleBasedDashboard() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchProfile();
    }
  }, [user]);

  const fetchProfile = async () => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('role')
        .eq('user_id', user?.id)
        .maybeSingle();

      if (error) throw error;
      setProfile(data);
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardHeader>
              <div className="h-4 bg-muted rounded w-3/4"></div>
              <div className="h-3 bg-muted rounded w-1/2"></div>
            </CardHeader>
            <CardContent>
              <div className="h-10 bg-muted rounded"></div>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  }

  const isRecruiter = profile?.role === 'recruiter';

  if (isRecruiter) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-6 w-6 text-primary" />
              <CardTitle>Voice Interviews</CardTitle>
            </div>
            <CardDescription>
              Conduct AI-powered voice interviews with candidates
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
              Upload and analyze resumes with AI insights
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
              View comprehensive hiring analytics and insights
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
              <CardTitle>Job Positions</CardTitle>
            </div>
            <CardDescription>
              Create and manage open job positions
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
              Get intelligent hiring recommendations
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
              <CardTitle>24/7 Automation</CardTitle>
            </div>
            <CardDescription>
              Automated screening and interview scheduling
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/interviews">
              <Button className="w-full">
                Setup Automation
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Candidate Dashboard
  return (
    <div className="space-y-8">
      {/* Candidate Status Banner */}
      <Card className="bg-gradient-to-r from-primary/10 to-secondary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <User className="h-5 w-5" />
                Welcome, Candidate!
              </CardTitle>
              <CardDescription className="text-lg">
                Ready to showcase your skills? Start with a voice interview or take practice MCQs.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-1">
              <User className="h-3 w-3" />
              Candidate Mode
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Mic className="h-6 w-6 text-primary" />
              <CardTitle>Voice Interview</CardTitle>
            </div>
            <CardDescription>
              Take an AI-powered voice interview to demonstrate your communication skills
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/interviews">
              <Button className="w-full">
                <Mic className="mr-2 h-4 w-4" />
                Start Voice Interview
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <MessageSquare className="h-6 w-6 text-primary" />
              <CardTitle>Practice MCQs</CardTitle>
            </div>
            <CardDescription>
              Test your knowledge with multiple choice questions tailored to your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/practice-mcqs">
              <Button variant="secondary" className="w-full">
                <MessageSquare className="mr-2 h-4 w-4" />
                Start Practice
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <FileText className="h-6 w-6 text-primary" />
              <CardTitle>Resume Parser</CardTitle>
            </div>
            <CardDescription>
              Get AI-powered feedback and suggestions for your resume
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/resume-parser">
              <Button variant="outline" className="w-full">
                <FileText className="mr-2 h-4 w-4" />
                Analyze Resume
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <BarChart3 className="h-6 w-6 text-primary" />
              <CardTitle>My Performance</CardTitle>
            </div>
            <CardDescription>
              View your interview scores and feedback
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/analytics">
              <Button variant="outline" className="w-full">
                View My Results
              </Button>
            </Link>
          </CardContent>
        </Card>

        <Card className="relative overflow-hidden group hover:shadow-lg transition-all duration-300">
          <div className="absolute inset-0 bg-gradient-to-br from-muted/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader>
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <CardTitle>Interview History</CardTitle>
            </div>
            <CardDescription>
              Track your completed and upcoming interviews
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/interviews">
              <Button variant="outline" className="w-full">
                View History
              </Button>
            </Link>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}