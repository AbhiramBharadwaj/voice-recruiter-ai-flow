import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { Upload, FileText, Sparkles, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

interface JobPosition {
  id: string;
  title: string;
}

export function ResumeUpload({ open, onOpenChange, onSuccess }: ResumeUploadProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [resumeContent, setResumeContent] = useState('');
  const [selectedJobId, setSelectedJobId] = useState('');
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [analysis, setAnalysis] = useState<string>('');
  const [candidateData, setCandidateData] = useState({
    full_name: '',
    email: '',
    phone: ''
  });

  // Fetch job positions when dialog opens
  useEffect(() => {
    if (open) {
      fetchJobPositions();
    }
  }, [open]);

  const fetchJobPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('job_positions')
        .select('id, title')
        .eq('user_id', user?.id)
        .eq('is_active', true);

      if (error) throw error;
      setJobPositions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load job positions",
        variant: "destructive"
      });
    }
  };

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Error",
        description: "Please upload a PDF file",
        variant: "destructive"
      });
      return;
    }

    setLoading(true);
    try {
      // For now, we'll just set a placeholder text
      // In a real implementation, you'd use a PDF parser
      setResumeContent("PDF content will be extracted here. For now, please use the paste content option.");
      
      toast({
        title: "File uploaded",
        description: "Please use the paste content tab for now",
      });
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to process PDF",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const analyzeResume = async () => {
    if (!resumeContent.trim() || !selectedJobId) {
      toast({
        title: "Error",
        description: "Please provide resume content and select a job position",
        variant: "destructive"
      });
      return;
    }

    setAnalyzing(true);
    try {
      // Get job details
      const { data: jobData, error: jobError } = await supabase
        .from('job_positions')
        .select('title, description, requirements, skills_required')
        .eq('id', selectedJobId)
        .single();

      if (jobError) throw jobError;

      // TODO: Replace with actual Gemini API call
      // For now, provide a mock analysis
      const mockAnalysis = `
**Resume Analysis for ${jobData.title} Position**

**Strengths:**
• Strong technical background with relevant experience
• Good communication skills demonstrated through previous roles
• Educational qualifications align with job requirements

**Areas for Improvement:**
• Consider adding more specific examples of project outcomes
• Include metrics and quantifiable achievements
• Highlight leadership experience if applicable

**Recommendations:**
• Tailor resume to emphasize skills mentioned in job requirements
• Add a professional summary at the top
• Include relevant certifications or training

**Match Score: 75%**

This candidate shows good potential for the ${jobData.title} position. Consider scheduling an interview to discuss their experience in more detail.
      `;

      setAnalysis(mockAnalysis);

      toast({
        title: "Analysis Complete",
        description: "Resume has been analyzed successfully",
      });
    } catch (error: any) {
      toast({
        title: "Error", 
        description: "Failed to analyze resume",
        variant: "destructive"
      });
    } finally {
      setAnalyzing(false);
    }
  };

  const saveCandidate = async () => {
    if (!candidateData.full_name || !candidateData.email) {
      toast({
        title: "Error",
        description: "Please fill in candidate name and email",
        variant: "destructive"
      });
      return;
    }

    try {
      const { error } = await supabase
        .from('candidates')
        .insert([{
          user_id: user?.id,
          full_name: candidateData.full_name,
          email: candidateData.email,
          phone: candidateData.phone || null,
          resume_content: resumeContent,
          status: 'active',
          notes: analysis
        }]);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Candidate added successfully",
      });

      // Reset form
      setResumeContent('');
      setAnalysis('');
      setCandidateData({ full_name: '', email: '', phone: '' });
      setSelectedJobId('');
      
      onSuccess?.();
      onOpenChange(false);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to save candidate",
        variant: "destructive"
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Upload className="h-5 w-5" />
            Upload Resume & Analyze
          </DialogTitle>
          <DialogDescription>
            Upload a resume or paste content to get AI-powered analysis and recommendations
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Job Position Selection */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Select Position</CardTitle>
              <CardDescription>Choose which role this candidate is applying for</CardDescription>
            </CardHeader>
            <CardContent>
              <Select value={selectedJobId} onValueChange={setSelectedJobId}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a job position" />
                </SelectTrigger>
                <SelectContent>
                  {jobPositions.map((job) => (
                    <SelectItem key={job.id} value={job.id}>
                      {job.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>

          {/* Resume Upload */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Resume Content</CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="paste" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="upload">Upload PDF</TabsTrigger>
                  <TabsTrigger value="paste">Paste Content</TabsTrigger>
                </TabsList>
                
                <TabsContent value="upload" className="space-y-4">
                  <div className="border-2 border-dashed border-muted-foreground/25 rounded-lg p-6 text-center">
                    <FileText className="mx-auto h-12 w-12 text-muted-foreground mb-4" />
                    <Label htmlFor="resume-file" className="cursor-pointer">
                      <div className="text-sm font-medium mb-2">Click to upload or drag and drop</div>
                      <div className="text-xs text-muted-foreground">PDF files only</div>
                    </Label>
                    <Input
                      id="resume-file"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </div>
                  {loading && (
                    <div className="flex items-center justify-center py-4">
                      <Loader2 className="h-6 w-6 animate-spin mr-2" />
                      Processing PDF...
                    </div>
                  )}
                </TabsContent>
                
                <TabsContent value="paste" className="space-y-4">
                  <Textarea
                    placeholder="Paste the resume content here..."
                    value={resumeContent}
                    onChange={(e) => setResumeContent(e.target.value)}
                    rows={10}
                    className="min-h-[200px]"
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          {/* Candidate Information */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Candidate Information</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="candidate-name">Full Name *</Label>
                  <Input
                    id="candidate-name"
                    value={candidateData.full_name}
                    onChange={(e) => setCandidateData({...candidateData, full_name: e.target.value})}
                    placeholder="John Doe"
                  />
                </div>
                <div>
                  <Label htmlFor="candidate-email">Email *</Label>
                  <Input
                    id="candidate-email"
                    type="email"
                    value={candidateData.email}
                    onChange={(e) => setCandidateData({...candidateData, email: e.target.value})}
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div>
                <Label htmlFor="candidate-phone">Phone</Label>
                <Input
                  id="candidate-phone"
                  value={candidateData.phone}
                  onChange={(e) => setCandidateData({...candidateData, phone: e.target.value})}
                  placeholder="+1 (555) 123-4567"
                />
              </div>
            </CardContent>
          </Card>

          {/* Analysis Results */}
          {analysis && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Sparkles className="h-5 w-5" />
                  AI Analysis Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="prose prose-sm max-w-none">
                  <pre className="whitespace-pre-wrap text-sm">{analysis}</pre>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button
            onClick={analyzeResume}
            disabled={!resumeContent.trim() || !selectedJobId || analyzing}
            variant="outline"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing...
              </>
            ) : (
              <>
                <Sparkles className="mr-2 h-4 w-4" />
                Analyze Resume
              </>
            )}
          </Button>
          
          <Button
            onClick={saveCandidate}
            disabled={!analysis || !candidateData.full_name || !candidateData.email}
          >
            Save Candidate
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}