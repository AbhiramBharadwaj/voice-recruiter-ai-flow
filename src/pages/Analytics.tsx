import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { AppHeader } from '@/components/AppHeader';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { BarChart3, TrendingUp, Users, Calendar, Award, MessageSquare, Brain, Clock } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';

interface AnalyticsData {
  totalCandidates: number;
  totalInterviews: number;
  completedInterviews: number;
  avgOverallScore: number;
  avgSentimentScore: number;
  avgTechnicalScore: number;
  avgCommunicationScore: number;
  statusDistribution: Array<{name: string, value: number, color: string}>;
  monthlyInterviews: Array<{month: string, interviews: number}>;
  scoreDistribution: Array<{scoreRange: string, count: number}>;
  interviewTypes: Array<{type: string, count: number}>;
}

export default function Analytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAnalytics();
    }
  }, [user]);

  const fetchAnalytics = async () => {
    try {
      // Fetch candidates data
      const { data: candidates, error: candidatesError } = await supabase
        .from('candidates')
        .select('status')
        .eq('user_id', user?.id);

      if (candidatesError) throw candidatesError;

      // Fetch interviews data
      const { data: interviews, error: interviewsError } = await supabase
        .from('interviews')
        .select('status, overall_score, sentiment_score, technical_score, communication_score, interview_type, created_at')
        .eq('user_id', user?.id);

      if (interviewsError) throw interviewsError;

      // Process the data
      const completedInterviews = interviews?.filter(i => i.status === 'completed') || [];
      
      // Calculate averages
      const avgOverallScore = completedInterviews.length > 0 
        ? completedInterviews.reduce((sum, i) => sum + (i.overall_score || 0), 0) / completedInterviews.length
        : 0;
      
      const avgSentimentScore = completedInterviews.length > 0
        ? completedInterviews.reduce((sum, i) => sum + (i.sentiment_score || 0), 0) / completedInterviews.length
        : 0;
      
      const avgTechnicalScore = completedInterviews.length > 0
        ? completedInterviews.reduce((sum, i) => sum + (i.technical_score || 0), 0) / completedInterviews.length
        : 0;
      
      const avgCommunicationScore = completedInterviews.length > 0
        ? completedInterviews.reduce((sum, i) => sum + (i.communication_score || 0), 0) / completedInterviews.length
        : 0;

      // Status distribution
      const statusCounts = candidates?.reduce((acc: any, candidate) => {
        acc[candidate.status] = (acc[candidate.status] || 0) + 1;
        return acc;
      }, {}) || {};

      const statusDistribution = [
        { name: 'Active', value: statusCounts.active || 0, color: '#3b82f6' },
        { name: 'Hired', value: statusCounts.hired || 0, color: '#10b981' },
        { name: 'Rejected', value: statusCounts.rejected || 0, color: '#ef4444' },
        { name: 'Withdrawn', value: statusCounts.withdrawn || 0, color: '#6b7280' }
      ];

      // Monthly interviews (last 6 months)
      const monthlyData: {[key: string]: number} = {};
      const last6Months = Array.from({length: 6}, (_, i) => {
        const date = new Date();
        date.setMonth(date.getMonth() - i);
        return date.toISOString().slice(0, 7); // YYYY-MM format
      }).reverse();

      last6Months.forEach(month => {
        monthlyData[month] = 0;
      });

      interviews?.forEach(interview => {
        const month = interview.created_at.slice(0, 7);
        if (monthlyData.hasOwnProperty(month)) {
          monthlyData[month]++;
        }
      });

      const monthlyInterviews = Object.entries(monthlyData).map(([month, count]) => ({
        month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
        interviews: count
      }));

      // Score distribution
      const scoreRanges = ['0-20%', '21-40%', '41-60%', '61-80%', '81-100%'];
      const scoreDistribution = scoreRanges.map(range => {
        const [min, max] = range.split('-').map(s => parseInt(s.replace('%', '')));
        const count = completedInterviews.filter(i => {
          const score = (i.overall_score || 0) * 100;
          return score >= min && score <= max;
        }).length;
        return { scoreRange: range, count };
      });

      // Interview types
      const typeCounts = interviews?.reduce((acc: any, interview) => {
        acc[interview.interview_type] = (acc[interview.interview_type] || 0) + 1;
        return acc;
      }, {}) || {};

      const interviewTypes = Object.entries(typeCounts).map(([type, count]) => ({
        type: type.charAt(0).toUpperCase() + type.slice(1),
        count: count as number
      }));

      setAnalytics({
        totalCandidates: candidates?.length || 0,
        totalInterviews: interviews?.length || 0,
        completedInterviews: completedInterviews.length,
        avgOverallScore,
        avgSentimentScore,
        avgTechnicalScore,
        avgCommunicationScore,
        statusDistribution,
        monthlyInterviews,
        scoreDistribution,
        interviewTypes
      });

    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-hero">
          <AppHeader />
          <div className="container mx-auto px-4 py-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader className="pb-2">
                    <div className="h-4 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="h-8 bg-muted rounded w-1/3"></div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (!analytics) return null;

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-hero">
        <AppHeader />
        <div className="container mx-auto px-4 py-8">
          <div className="mb-8">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
              Analytics Dashboard
            </h1>
            <p className="text-muted-foreground mt-2">Comprehensive insights into your recruitment process</p>
          </div>

          {/* Key Metrics */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Candidates</CardTitle>
                <Users className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalCandidates}</div>
                <p className="text-xs text-muted-foreground">
                  In your pipeline
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Total Interviews</CardTitle>
                <Calendar className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{analytics.totalInterviews}</div>
                <p className="text-xs text-muted-foreground">
                  {analytics.completedInterviews} completed
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Overall Score</CardTitle>
                <Award className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.completedInterviews > 0 ? `${(analytics.avgOverallScore * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Across all interviews
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Avg Sentiment</CardTitle>
                <MessageSquare className="h-4 w-4 text-muted-foreground" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {analytics.completedInterviews > 0 ? `${(analytics.avgSentimentScore * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-xs text-muted-foreground">
                  Positive sentiment
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Score Breakdown */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Technical Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-primary">
                  {analytics.completedInterviews > 0 ? `${(analytics.avgTechnicalScore * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average technical assessment score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  Communication Score
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-secondary">
                  {analytics.completedInterviews > 0 ? `${(analytics.avgCommunicationScore * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Average communication assessment score
                </p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Completion Rate
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-accent">
                  {analytics.totalInterviews > 0 ? `${((analytics.completedInterviews / analytics.totalInterviews) * 100).toFixed(1)}%` : 'N/A'}
                </div>
                <p className="text-sm text-muted-foreground mt-2">
                  Interviews completed successfully
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Charts */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Candidate Status Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Candidate Status Distribution</CardTitle>
                <CardDescription>Current status of all candidates</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analytics.statusDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, value }) => `${name}: ${value}`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analytics.statusDistribution.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Monthly Interviews */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Trends</CardTitle>
                <CardDescription>Number of interviews scheduled per month</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analytics.monthlyInterviews}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="month" />
                    <YAxis />
                    <Tooltip />
                    <Line 
                      type="monotone" 
                      dataKey="interviews" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={{ fill: "hsl(var(--primary))" }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Score Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Score Distribution</CardTitle>
                <CardDescription>Distribution of overall interview scores</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.scoreDistribution}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="scoreRange" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--primary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Interview Types */}
            <Card>
              <CardHeader>
                <CardTitle>Interview Types</CardTitle>
                <CardDescription>Distribution of interview types conducted</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analytics.interviewTypes}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="type" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="count" fill="hsl(var(--secondary))" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>

          {analytics.totalCandidates === 0 && (
            <div className="text-center py-12">
              <BarChart3 className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No data available</h3>
              <p className="text-muted-foreground">
                Start adding candidates and conducting interviews to see analytics
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}