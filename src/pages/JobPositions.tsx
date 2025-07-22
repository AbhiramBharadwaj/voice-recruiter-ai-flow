import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { useToast } from '@/hooks/use-toast';
import { Plus, Search, Briefcase, DollarSign, GraduationCap, MoreHorizontal, Edit, Trash2, Eye, EyeOff } from 'lucide-react';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';

interface JobPosition {
  id: string;
  title: string;
  description?: string;
  requirements?: string[];
  skills_required?: string[];
  experience_level?: string;
  salary_range?: string;
  is_active: boolean;
  created_at: string;
}

export default function JobPositions() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [jobPositions, setJobPositions] = useState<JobPosition[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [editingPosition, setEditingPosition] = useState<JobPosition | null>(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    requirements: '',
    skills_required: '',
    experience_level: '',
    salary_range: '',
    is_active: true
  });

  useEffect(() => {
    if (user) {
      fetchJobPositions();
    }
  }, [user]);

  const fetchJobPositions = async () => {
    try {
      const { data, error } = await supabase
        .from('job_positions')
        .select('*')
        .eq('user_id', user?.id)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobPositions(data || []);
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to load job positions",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const positionData = {
        user_id: user?.id,
        title: formData.title,
        description: formData.description || null,
        requirements: formData.requirements ? formData.requirements.split('\n').filter(r => r.trim()) : null,
        skills_required: formData.skills_required ? formData.skills_required.split(',').map(s => s.trim()) : null,
        experience_level: formData.experience_level || null,
        salary_range: formData.salary_range || null,
        is_active: formData.is_active
      };

      if (editingPosition) {
        const { error } = await supabase
          .from('job_positions')
          .update(positionData)
          .eq('id', editingPosition.id);
        
        if (error) throw error;
        toast({ title: "Success", description: "Job position updated successfully" });
      } else {
        const { error } = await supabase
          .from('job_positions')
          .insert([positionData]);
        
        if (error) throw error;
        toast({ title: "Success", description: "Job position created successfully" });
      }

      setShowAddDialog(false);
      setEditingPosition(null);
      setFormData({
        title: '', description: '', requirements: '', skills_required: '', 
        experience_level: '', salary_range: '', is_active: true
      });
      fetchJobPositions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message || "Failed to save job position",
        variant: "destructive"
      });
    }
  };

  const handleEdit = (position: JobPosition) => {
    setEditingPosition(position);
    setFormData({
      title: position.title,
      description: position.description || '',
      requirements: position.requirements?.join('\n') || '',
      skills_required: position.skills_required?.join(', ') || '',
      experience_level: position.experience_level || '',
      salary_range: position.salary_range || '',
      is_active: position.is_active
    });
    setShowAddDialog(true);
  };

  const handleDelete = async (positionId: string) => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .delete()
        .eq('id', positionId);

      if (error) throw error;
      toast({ title: "Success", description: "Job position deleted successfully" });
      fetchJobPositions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to delete job position",
        variant: "destructive"
      });
    }
  };

  const toggleActiveStatus = async (positionId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase
        .from('job_positions')
        .update({ is_active: !currentStatus })
        .eq('id', positionId);

      if (error) throw error;
      toast({ 
        title: "Success", 
        description: `Job position ${!currentStatus ? 'activated' : 'deactivated'}` 
      });
      fetchJobPositions();
    } catch (error: any) {
      toast({
        title: "Error",
        description: "Failed to update job position status",
        variant: "destructive"
      });
    }
  };

  const filteredPositions = jobPositions.filter(position =>
    position.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    position.experience_level?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-to-br from-primary/5 via-background to-secondary/5">
        <div className="container mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold bg-gradient-to-r from-primary to-primary/70 bg-clip-text text-transparent">
                Job Positions
              </h1>
              <p className="text-muted-foreground mt-2">Manage your open positions and requirements</p>
            </div>
            
            <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Create Position
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>{editingPosition ? 'Edit Job Position' : 'Create New Job Position'}</DialogTitle>
                  <DialogDescription>
                    {editingPosition ? 'Update job position details' : 'Define a new role and its requirements'}
                  </DialogDescription>
                </DialogHeader>
                
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div>
                    <Label htmlFor="title">Job Title *</Label>
                    <Input
                      id="title"
                      value={formData.title}
                      onChange={(e) => setFormData({...formData, title: e.target.value})}
                      placeholder="Senior Frontend Developer"
                      required
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="description">Job Description</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({...formData, description: e.target.value})}
                      rows={4}
                      placeholder="Detailed description of the role, responsibilities, and what you're looking for..."
                    />
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="experience_level">Experience Level</Label>
                      <Select value={formData.experience_level} onValueChange={(value) => setFormData({...formData, experience_level: value})}>
                        <SelectTrigger>
                          <SelectValue placeholder="Select experience level" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="entry">Entry Level (0-2 years)</SelectItem>
                          <SelectItem value="junior">Junior (2-4 years)</SelectItem>
                          <SelectItem value="mid">Mid Level (4-6 years)</SelectItem>
                          <SelectItem value="senior">Senior (6-10 years)</SelectItem>
                          <SelectItem value="lead">Lead/Principal (10+ years)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div>
                      <Label htmlFor="salary_range">Salary Range</Label>
                      <Input
                        id="salary_range"
                        value={formData.salary_range}
                        onChange={(e) => setFormData({...formData, salary_range: e.target.value})}
                        placeholder="$80,000 - $120,000"
                      />
                    </div>
                  </div>
                  
                  <div>
                    <Label htmlFor="requirements">Requirements (one per line)</Label>
                    <Textarea
                      id="requirements"
                      value={formData.requirements}
                      onChange={(e) => setFormData({...formData, requirements: e.target.value})}
                      rows={4}
                      placeholder="Bachelor's degree in Computer Science or related field
5+ years of experience in React development
Experience with TypeScript and modern web technologies
Strong problem-solving skills"
                    />
                  </div>
                  
                  <div>
                    <Label htmlFor="skills_required">Required Skills (comma-separated)</Label>
                    <Input
                      id="skills_required"
                      value={formData.skills_required}
                      onChange={(e) => setFormData({...formData, skills_required: e.target.value})}
                      placeholder="React, TypeScript, Node.js, AWS, Git"
                    />
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      id="is_active"
                      checked={formData.is_active}
                      onChange={(e) => setFormData({...formData, is_active: e.target.checked})}
                      className="rounded border border-input"
                    />
                    <Label htmlFor="is_active">Position is actively hiring</Label>
                  </div>
                  
                  <DialogFooter>
                    <Button type="submit">
                      {editingPosition ? 'Update Position' : 'Create Position'}
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
                placeholder="Search job positions..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {[...Array(4)].map((_, i) => (
                <Card key={i} className="animate-pulse">
                  <CardHeader>
                    <div className="h-6 bg-muted rounded w-3/4"></div>
                    <div className="h-4 bg-muted rounded w-1/2"></div>
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
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {filteredPositions.map((position) => (
                <Card key={position.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader className="flex flex-row items-start justify-between space-y-0 pb-2">
                    <div className="flex-1">
                      <CardTitle className="text-xl flex items-center gap-2">
                        <Briefcase className="h-5 w-5" />
                        {position.title}
                      </CardTitle>
                      <div className="flex items-center gap-2 mt-2">
                        <Badge variant={position.is_active ? 'default' : 'secondary'}>
                          {position.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                        {position.experience_level && (
                          <Badge variant="outline" className="flex items-center gap-1">
                            <GraduationCap className="h-3 w-3" />
                            {position.experience_level}
                          </Badge>
                        )}
                      </div>
                    </div>
                    
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="sm">
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => toggleActiveStatus(position.id, position.is_active)}>
                          {position.is_active ? <EyeOff className="mr-2 h-4 w-4" /> : <Eye className="mr-2 h-4 w-4" />}
                          {position.is_active ? 'Deactivate' : 'Activate'}
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => handleEdit(position)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Edit
                        </DropdownMenuItem>
                        <DropdownMenuItem 
                          onClick={() => handleDelete(position.id)}
                          className="text-destructive"
                        >
                          <Trash2 className="mr-2 h-4 w-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    {position.description && (
                      <p className="text-muted-foreground line-clamp-3">
                        {position.description}
                      </p>
                    )}
                    
                    {position.salary_range && (
                      <div className="flex items-center gap-2 text-sm">
                        <DollarSign className="h-4 w-4 text-green-600" />
                        <span className="font-medium">{position.salary_range}</span>
                      </div>
                    )}
                    
                    {position.requirements && position.requirements.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Key Requirements:</h4>
                        <ul className="text-sm text-muted-foreground space-y-1">
                          {position.requirements.slice(0, 3).map((req, index) => (
                            <li key={index} className="flex items-start gap-2">
                              <span className="w-1 h-1 bg-primary rounded-full mt-2 flex-shrink-0"></span>
                              {req}
                            </li>
                          ))}
                          {position.requirements.length > 3 && (
                            <li className="text-xs">
                              +{position.requirements.length - 3} more requirements
                            </li>
                          )}
                        </ul>
                      </div>
                    )}
                    
                    {position.skills_required && position.skills_required.length > 0 && (
                      <div>
                        <h4 className="font-medium text-sm mb-2">Required Skills:</h4>
                        <div className="flex flex-wrap gap-1">
                          {position.skills_required.slice(0, 4).map((skill, index) => (
                            <Badge key={index} variant="secondary" className="text-xs">
                              {skill}
                            </Badge>
                          ))}
                          {position.skills_required.length > 4 && (
                            <Badge variant="outline" className="text-xs">
                              +{position.skills_required.length - 4} more
                            </Badge>
                          )}
                        </div>
                      </div>
                    )}
                    
                    <div className="text-xs text-muted-foreground pt-2 border-t">
                      Created {new Date(position.created_at).toLocaleDateString()}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {!loading && filteredPositions.length === 0 && (
            <div className="text-center py-12">
              <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No job positions found</h3>
              <p className="text-muted-foreground">
                {searchTerm ? 'Try adjusting your search terms' : 'Get started by creating your first job position'}
              </p>
            </div>
          )}
        </div>
      </div>
    </ProtectedRoute>
  );
}