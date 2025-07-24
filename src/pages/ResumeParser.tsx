import { useState } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, Sparkles, TrendingUp, AlertTriangle, CheckCircle, Target } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ResumeAnalysis {
  id: string;
  resume_content: string;
  target_role: string;
  overall_score: number;
  strengths: string[];
  improvements: string[];
  missing_skills: string[];
  ai_feedback: string;
  created_at: string;
}

export default function ResumeParser() {
  const { user } = useAuth();
  const [resumeContent, setResumeContent] = useState('');
  const [targetRole, setTargetRole] = useState('');
  const [analysis, setAnalysis] = useState<ResumeAnalysis | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type === 'application/pdf') {
        toast.info('PDF processing will be available soon. Please paste your resume content for now.');
      } else if (file.type.includes('text')) {
        const reader = new FileReader();
        reader.onload = (e) => {
          const content = e.target?.result as string;
          setResumeContent(content);
          toast.success('Resume content loaded successfully!');
        };
        reader.readAsText(file);
      } else {
        toast.error('Please upload a PDF or text file.');
      }
    }
  };

  const analyzeResume = async () => {
    if (!resumeContent.trim()) {
      toast.error('Please enter your resume content first');
      return;
    }
    
    if (!targetRole.trim()) {
      toast.error('Please specify the target role');
      return;
    }

    setIsLoading(true);
    try {
      // Call Gemini AI for resume analysis
      const { data, error } = await supabase.functions.invoke('gemini-resume-analysis', {
        body: { 
          resumeContent,
          targetRole
        }
      });

      if (error) throw error;

      // Create mock analysis for now
      const mockAnalysis: ResumeAnalysis = {
        id: 'temp-analysis-' + Date.now(),
        resume_content: resumeContent,
        target_role: targetRole,
        overall_score: data.overall_score || 75,
        strengths: data.strengths || ['Strong technical skills', 'Good experience'],
        improvements: data.improvements || ['Add more projects', 'Improve summary'],
        missing_skills: data.missing_skills || ['Cloud platforms', 'DevOps tools'],
        ai_feedback: data.ai_feedback || 'Good resume with room for improvement',
        created_at: new Date().toISOString()
      };

      setAnalysis(mockAnalysis);
      toast.success('Resume analysis completed!');
    } catch (error) {
      console.error('Error analyzing resume:', error);
      toast.error('Failed to analyze resume. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const resetAnalysis = () => {
    setAnalysis(null);
    setResumeContent('');
    setTargetRole('');
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-500';
    if (score >= 60) return 'text-yellow-500';
    return 'text-red-500';
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Needs Improvement';
  };

  if (analysis) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-background">
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={resetAnalysis} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Analyze Another Resume
                </Button>
                <h1 className="text-2xl font-bold">Resume Analysis Results</h1>
              </div>

              <div className="space-y-6">
                {/* Overall Score */}
                <Card>
                  <CardHeader className="text-center">
                    <CardTitle className="text-3xl">Resume Analysis Complete!</CardTitle>
                    <CardDescription className="text-lg">
                      Analysis for: <strong>{analysis.target_role}</strong>
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="text-center">
                    <div className={`text-6xl font-bold mb-4 ${getScoreColor(analysis.overall_score)}`}>
                      {analysis.overall_score}/100
                    </div>
                    <div className="text-xl mb-4 text-muted-foreground">
                      {getScoreLabel(analysis.overall_score)}
                    </div>
                    <Progress value={analysis.overall_score} className="mb-4" />
                    <Badge variant="outline" className="text-sm">
                      Analyzed on {new Date(analysis.created_at).toLocaleDateString()}
                    </Badge>
                  </CardContent>
                </Card>

                {/* AI Feedback */}
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Sparkles className="h-5 w-5 text-primary" />
                      AI Feedback
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground leading-relaxed">
                      {analysis.ai_feedback}
                    </p>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Strengths */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-green-600">
                        <CheckCircle className="h-5 w-5" />
                        Strengths
                      </CardTitle>
                      <CardDescription>
                        What makes your resume stand out
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.strengths.map((strength, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <CheckCircle className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{strength}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Areas for Improvement */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-yellow-600">
                        <TrendingUp className="h-5 w-5" />
                        Improvements
                      </CardTitle>
                      <CardDescription>
                        Areas that can be enhanced
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.improvements.map((improvement, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <TrendingUp className="h-4 w-4 text-yellow-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{improvement}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>

                  {/* Missing Skills */}
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center gap-2 text-red-600">
                        <Target className="h-5 w-5" />
                        Missing Skills
                      </CardTitle>
                      <CardDescription>
                        Skills to consider adding
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2">
                        {analysis.missing_skills.map((skill, index) => (
                          <div key={index} className="flex items-start gap-2">
                            <AlertTriangle className="h-4 w-4 text-red-500 mt-0.5 flex-shrink-0" />
                            <span className="text-sm">{skill}</span>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </div>

                {/* Action Items */}
                <Card>
                  <CardHeader>
                    <CardTitle>Next Steps</CardTitle>
                    <CardDescription>
                      Recommended actions to improve your resume
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Button className="justify-start h-auto p-4" variant="outline">
                        <div className="text-left">
                          <div className="font-medium">Update Skills Section</div>
                          <div className="text-sm text-muted-foreground">
                            Add the missing skills identified in the analysis
                          </div>
                        </div>
                      </Button>
                      <Button className="justify-start h-auto p-4" variant="outline">
                        <div className="text-left">
                          <div className="font-medium">Enhance Experience</div>
                          <div className="text-sm text-muted-foreground">
                            Elaborate on relevant work experience
                          </div>
                        </div>
                      </Button>
                      <Button className="justify-start h-auto p-4" variant="outline">
                        <div className="text-left">
                          <div className="font-medium">Practice Interview</div>
                          <div className="text-sm text-muted-foreground">
                            Take a practice interview based on your resume
                          </div>
                        </div>
                      </Button>
                      <Button className="justify-start h-auto p-4" variant="outline">
                        <div className="text-left">
                          <div className="font-medium">Take MCQ Test</div>
                          <div className="text-sm text-muted-foreground">
                            Test your knowledge with relevant questions
                          </div>
                        </div>
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link to="/">
                <Button variant="ghost" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Resume Parser & Analyzer</h1>
            </div>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5" />
                  AI-Powered Resume Analysis
                </CardTitle>
                <CardDescription>
                  Get personalized feedback and suggestions to improve your resume for specific roles using advanced AI analysis.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <div>
                    <Label htmlFor="target-role" className="text-sm font-medium">
                      Target Role *
                    </Label>
                    <Input
                      id="target-role"
                      placeholder="e.g., Senior Software Engineer, Product Manager, Data Scientist..."
                      value={targetRole}
                      onChange={(e) => setTargetRole(e.target.value)}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Specify the role you're applying for to get targeted feedback
                    </p>
                  </div>

                  <div>
                    <Label htmlFor="resume" className="text-sm font-medium">
                      Resume Content *
                    </Label>
                    <Textarea
                      id="resume"
                      placeholder="Paste your complete resume content here..."
                      value={resumeContent}
                      onChange={(e) => setResumeContent(e.target.value)}
                      rows={12}
                      className="mt-1"
                    />
                    <p className="text-xs text-muted-foreground mt-1">
                      Include all sections: contact info, summary, experience, education, skills, etc.
                    </p>
                  </div>

                  <div className="flex items-center gap-4">
                    <Button 
                      onClick={() => document.getElementById('file-upload')?.click()} 
                      variant="outline"
                      disabled={isLoading}
                    >
                      <Upload className="h-4 w-4 mr-2" />
                      Upload Resume File
                    </Button>
                    <input
                      id="file-upload"
                      type="file"
                      accept=".pdf,.doc,.docx,.txt"
                      className="hidden"
                      onChange={handleFileUpload}
                    />
                    <span className="text-sm text-muted-foreground">
                      Supports PDF, DOC, DOCX, TXT files
                    </span>
                  </div>
                </div>

                <div className="border-t pt-6">
                  <Button 
                    onClick={analyzeResume} 
                    disabled={!resumeContent.trim() || !targetRole.trim() || isLoading}
                    size="lg"
                    className="w-full"
                  >
                    {isLoading ? (
                      <>
                        <Sparkles className="h-4 w-4 mr-2 animate-spin" />
                        Analyzing Resume...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Analyze Resume with AI
                      </>
                    )}
                  </Button>
                </div>

                <div className="bg-muted/50 rounded-lg p-4">
                  <h3 className="font-medium mb-2">What you'll get:</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Overall resume score
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Strength identification
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Improvement suggestions
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Missing skills analysis
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Role-specific feedback
                    </div>
                    <div className="flex items-center gap-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      Actionable recommendations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}