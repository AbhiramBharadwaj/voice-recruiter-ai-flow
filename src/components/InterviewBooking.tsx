import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { CalendarIcon, Upload } from 'lucide-react';
import { format } from 'date-fns';

interface InterviewBookingProps {
  onSuccess: () => void;
}

const InterviewBooking: React.FC<InterviewBookingProps> = ({ onSuccess }) => {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    role_focus: '',
    resume_content: '',
    scheduled_at: undefined as Date | undefined,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title || !formData.role_focus || !formData.resume_content || !formData.scheduled_at) {
      toast({
        title: "Missing Information",
        description: "Please fill in all required fields including resume and date.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      const { error } = await supabase.from('interviews').insert({
        user_id: user.id,
        title: formData.title,
        description: formData.description,
        role_focus: formData.role_focus,
        resume_content: formData.resume_content,
        scheduled_at: formData.scheduled_at.toISOString(),
        interview_phase: 'scheduled',
        status: 'scheduled'
      });

      if (error) throw error;

      toast({
        title: "Interview Booked",
        description: "Your interview has been scheduled successfully.",
      });
      
      onSuccess();
    } catch (error) {
      console.error('Error booking interview:', error);
      toast({
        title: "Booking Failed",
        description: "Failed to book interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== 'application/pdf') {
      toast({
        title: "Invalid File",
        description: "Please upload a PDF file.",
        variant: "destructive",
      });
      return;
    }

    // For now, just set placeholder content
    setFormData(prev => ({
      ...prev,
      resume_content: `Resume content from ${file.name} (PDF processing will be implemented)`
    }));
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Book Your AI Interview</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Interview Title *</Label>
            <Input
              id="title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              placeholder="e.g., Frontend Developer Interview"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="role_focus">Target Role *</Label>
            <Input
              id="role_focus"
              value={formData.role_focus}
              onChange={(e) => setFormData(prev => ({ ...prev, role_focus: e.target.value }))}
              placeholder="e.g., React Developer, Product Manager"
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Interview Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
              placeholder="Additional details about the interview..."
            />
          </div>

          <div className="space-y-2">
            <Label>Resume Upload *</Label>
            <div className="flex items-center space-x-2">
              <Input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="resume-upload"
              />
              <Label
                htmlFor="resume-upload"
                className="flex items-center space-x-2 px-4 py-2 border border-input bg-background hover:bg-accent hover:text-accent-foreground rounded-md cursor-pointer"
              >
                <Upload className="w-4 h-4" />
                <span>Upload Resume (PDF)</span>
              </Label>
            </div>
            {formData.resume_content && (
              <p className="text-sm text-muted-foreground">Resume uploaded successfully</p>
            )}
          </div>

          <div className="space-y-2">
            <Label>Interview Date & Time *</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-start text-left font-normal"
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {formData.scheduled_at ? format(formData.scheduled_at, 'PPP') : 'Pick a date'}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={formData.scheduled_at}
                  onSelect={(date) => setFormData(prev => ({ ...prev, scheduled_at: date }))}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? 'Booking...' : 'Book Interview'}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
};

export default InterviewBooking;