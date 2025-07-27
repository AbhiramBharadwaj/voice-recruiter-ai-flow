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

  // Show candidate dashboard for all users (removed recruiter flow)
  const isCandidate = true;

  // Dashboard for all users
  return (
    <div className="space-y-12 animate-fade-in">
      {/* Candidate Status Banner */}
      <Card className="bg-gradient-card border-primary/20 shadow-elegant overflow-hidden relative">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/5 to-primary-glow/5"></div>
        <CardHeader className="relative z-10">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-3 text-2xl">
                <div className="p-2 bg-gradient-primary rounded-xl shadow-glow">
                  <User className="h-6 w-6 text-white" />
                </div>
                <span className="bg-gradient-to-r from-foreground to-primary bg-clip-text text-transparent">
                  Welcome to AI Recruiter!
                </span>
              </CardTitle>
              <CardDescription className="text-lg mt-2 leading-relaxed">
                Ready to showcase your skills? Take an AI voice interview or practice with MCQs.
              </CardDescription>
            </div>
            <Badge variant="secondary" className="flex items-center gap-2 px-4 py-2 bg-gradient-secondary shadow-card rounded-xl">
              <User className="h-4 w-4" />
              {profile?.role === 'recruiter' ? 'Recruiter' : 'Candidate'} Mode
            </Badge>
          </div>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 animate-slide-up">
        <Card className="relative overflow-hidden group bg-gradient-card border-primary/20 hover:shadow-elegant transition-all duration-300 transform hover:scale-105">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
          <CardHeader className="pb-4">
            <div className="flex items-center space-x-3">
              <div className="p-3 bg-gradient-primary rounded-xl shadow-glow group-hover:animate-glow-pulse">
                <Mic className="h-6 w-6 text-white" />
              </div>
              <CardTitle className="text-xl">AI Voice Interview</CardTitle>
            </div>
            <CardDescription className="text-sm leading-relaxed">
              Voice-powered interview with 5 role-based questions. Get real-time transcript analysis and detailed feedback on your performance.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Link to="/interviews">
              <Button className="w-full bg-gradient-primary hover:shadow-glow h-12 text-base">
                <Mic className="mr-2 h-5 w-5" />
                Start AI Voice Interview
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