import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BackButton } from '@/components/BackButton';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Calendar, Clock, Mic, Video, Code, MessageSquare, Play, BarChart3 } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import VoiceInterview from '@/components/VoiceInterview';

interface Interview {
  id: string;
  title: string;
  description?: string;
  scheduled_at?: string;
  duration_minutes: number;
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  interview_type: string;
  overall_score?: number;
  sentiment_score?: number;
  technical_score?: number;
  communication_score?: number;
  created_at: string;
}

export default function Interviews() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [interviews, setInterviews] = useState<Interview[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingInterview, setEditingInterview] = useState<Interview | null>(null);
  const [activeInterviewId, setActiveInterviewId] = useState<string | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    scheduled_at: '',
    duration_minutes: '30',
    interview_type: 'voice'
  });

  useEffect(() => {
    if (user) {
      fetchInterviews();
    }
  }, [user]);

  const fetchInterviews = async () => {
    try {
      const { data, error } = await supabase
        .from('interviews')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setInterviews(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load interviews",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const interviewData = {
        user_id: user?.id,
        title: formData.title,
        description: formData.description || null,
        scheduled_at: formData.scheduled_at || null,
        duration_minutes: parseInt(formData.duration_minutes),
        interview_type: formData.interview_type,
        role_focus: formData.title || formData.interview_type,
        interview_phase: 'scheduled'
      };

      if (editingInterview) {
        const { error } = await supabase
          .from('interviews')
          .update(interviewData)
          .eq('id', editingInterview.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Interview updated successfully" });
      } else {
        const { error } = await supabase
          .from('interviews')
          .insert([interviewData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Interview scheduled successfully" });
      }

      setShowAddDialog(false);
      setEditingInterview(null);
      setFormData({
        title: '', description: '', scheduled_at: '', 
        duration_minutes: '30', interview_type: 'voice'
      });
      fetchInterviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save interview",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (interview: Interview) => {
    setEditingInterview(interview);
    setFormData({
      title: interview.title,
      description: interview.description || '',
      scheduled_at: interview.scheduled_at ? new Date(interview.scheduled_at).toISOString().slice(0, 16) : '',
      duration_minutes: interview.duration_minutes.toString(),
      interview_type: interview.interview_type
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (interviewId: string) => {
    try {
      const { error } = await supabase
        .from('interviews')
        .delete()
        .eq('id', interviewId);

      if (error) throw error;
      toast({ title: "Success", description: "Interview deleted successfully" });
      fetchInterviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete interview",
        variant: "destructive"
      });
    }
  };

  const updateInterviewStatus = async (interviewId: string, status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled') => {
    try {
      const { error } = await supabase
        .from('interviews')
        .update({ status })
        .eq('id', interviewId);

      if (error) throw error;
      toast({ title: "Success", description: `Interview ${status}` });
      fetchInterviews();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update interview status",
        variant: "destructive"
      });
    }
  };

  const filteredInterviews = interviews.filter(interview =>
    interview.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    interview.interview_type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'completed': return 'default';
      case 'in_progress': return 'secondary';
      case 'cancelled': return 'destructive';
      default: return 'outline';
    }
  };

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  // Show voice interview when active
  if (activeInterviewId) {
    const activeInterview = interviews.find(i => i.id === activeInterviewId);
    if (activeInterview) {
      return (
        <ProtectedRoute>
          <div className="min-h-screen bg-gradient-hero">
      <BackButton />
            <div className="p-8">
            <div className="mb-4">
              <Button 
                variant="outline" 
                onClick={() => setActiveInterviewId(null)}
                className="mb-4"
              >
                ← Back to Interviews
              </Button>
            </div>
            <VoiceInterview
              interviewId={activeInterview.id}
              role={activeInterview.title || activeInterview.interview_type}
              interests={activeInterview.description ? [activeInterview.description] : ['general']}
              onComplete={(results) => {
                setActiveInterviewId(null);
                fetchInterviews();
                toast({
                  title: "Interview Completed!",
                  description: `Your overall score: ${results.overall_score}%`,
                });
              }}
            />
            </div>
          </div>
        </ProtectedRoute>
      );
    }
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-hero">
        <BackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                My Interviews
              </h1>
              <p className="text-muted-foreground mt-2">Schedule and practice for your interviews</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Book Interview
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl">
                <DialogHeader>
                  <DialogTitle>{editingInterview ? 'Edit Interview' : 'Book New Interview'}</DialogTitle>
                  <DialogDescription>
                    {editingInterview ? 'Update your interview details' : 'Schedule a new practice interview session'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="interview_type">Interview Type *</Label>
                    <Select value={formData.interview_type} onValueChange={(value) => setFormData({...formData, interview_type: value})} required>
                      <SelectTrigger>
                        <SelectValue placeholder="Choose interview type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="voice">
                          <div className="flex items-center gap-2">
                            <Mic className="h-4 w-4" />
                            Voice Interview
                          </div>
                        </SelectItem>
                        <SelectItem value="video">
                          <div className="flex items-center gap-2">
                            <Video className="h-4 w-4" />
                            Video Interview
                          </div>
                        </SelectItem>
                        <SelectItem value="technical">
                          <div className="flex items-center gap-2">
                            <Code className="h-4 w-4" />
                            Technical Assessment
                          </div>
                        </SelectItem>
                        <SelectItem value="behavioral">
                          <div className="flex items-center gap-2">
                            <MessageSquare className="h-4 w-4" />
                            Behavioral Interview
                          </div>
                        </SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div>
                    <Label htmlFor="title">Interview Title (Optional)</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="e.g., Frontend Developer Practice"
                    />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="scheduled_at">Scheduled Date & Time</Label>
                      <Input
                        id="scheduled_at"
                        type="datetime-local"
                        value={formData.scheduled_at}
                        onChange={(e) => setFormData({...formData, scheduled_at: e.target.value})}
                      />
                    </div>
                    <div>
                      <Label htmlFor="duration_minutes">Duration (minutes)</Label>
                      <Input
                        id="duration_minutes"
                        type="number"
                        value={formData.duration_minutes}
                        onChange={(e) => setFormData({...formData, duration_minutes: e.target.value})}
                        min="15"
                        max="180"
                      />
                    </div>
                  </div>
                  
                  
                  <div>
                    <Label htmlFor="description">Notes (Optional)</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={3}
                      placeholder="Add any specific topics you want to focus on..."
                    />
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">
                      {editingInterview ? 'Update Interview' : 'Book Interview'}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <div className="mb-6">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search by title or type..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="h-3 bg-muted rounded w-1/2"></div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="h-3 bg-muted rounded"></div>
                      <div className="h-3 bg-muted rounded w-2/3"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredInterviews.map((interview) => (
                <Card key={interview.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg">
                        {interview.title || `${interview.interview_type.charAt(0).toUpperCase() + interview.interview_type.slice(1)} Interview`}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={getStatusBadgeVariant(interview.status)}>
                          {interview.status.replace('_', ' ')}
                        </Badge>
                        <Badge variant="outline" className="text-xs flex items-center gap-1">
                          {interview.interview_type === 'voice' && <Mic className="h-3 w-3" />}
                          {interview.interview_type === 'video' && <Video className="h-3 w-3" />}
                          {interview.interview_type === 'technical' && <Code className="h-3 w-3" />}
                          {interview.interview_type === 'behavioral' && <MessageSquare className="h-3 w-3" />}
                          {interview.interview_type}
                        </Badge>
                      </div>
                    </div>
                    
                     <div className="flex gap-2">
                       {interview.status === 'scheduled' && interview.interview_type === 'voice' && (
                         <Button 
                           size="sm" 
                           onClick={() => setActiveInterviewId(interview.id)}
                           className="h-8"
                         >
                           <Play className="mr-1 h-3 w-3" />
                           Start AI Voice
                         </Button>
                       )}
                       {interview.status === 'scheduled' && interview.interview_type !== 'voice' && (
                         <Button 
                           size="sm" 
                           onClick={() => updateInterviewStatus(interview.id, 'in_progress')}
                           className="h-8"
                         >
                           <Play className="mr-1 h-3 w-3" />
                           Start
                         </Button>
                       )}
                       <Button 
                         variant="ghost" 
                         size="sm" 
                         onClick={() => handleEdit(interview)}
                         className="h-8"
                       >
                         Edit
                       </Button>
                     </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-3">
                    
                    {interview.scheduled_at && (
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Calendar className="h-3 w-3" />
                        {formatDateTime(interview.scheduled_at)}
                      </div>
                    )}
                    
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="h-3 w-3" />
                      {interview.duration_minutes} minutes
                    </div>
                    
                    {interview.description && (
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {interview.description}
                      </p>
                    )}
                    
                    {interview.status === 'completed' && interview.overall_score && (
                      <div className="pt-2 border-t">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Overall Score:</span>
                          <Badge variant="secondary">
                            {(interview.overall_score * 100).toFixed(0)}%
                          </Badge>
                        </div>
                        {interview.sentiment_score && (
                          <div className="flex items-center justify-between text-sm mt-1">
                            <span className="text-muted-foreground">Sentiment:</span>
                            <span className="text-xs">
                              {(interview.sentiment_score * 100).toFixed(0)}%
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredInterviews.length === 0 && (
            <div className="text-center py-12">
              <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No interviews found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by booking your first practice interview'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}