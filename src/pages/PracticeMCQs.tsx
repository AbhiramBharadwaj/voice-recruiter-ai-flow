import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { ProtectedRoute } from '@/components/ProtectedRoute';
import { BackButton } from '@/components/BackButton';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { ArrowLeft, Upload, FileText, Brain, Code, Database, Globe, Cpu, BookOpen, Clock, CheckCircle, XCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface MCQQuestion {
  id: string;
  question: string;
  option_a: string;
  option_b: string;
  option_c: string;
  option_d: string;
  correct_answer: string;
  category: string;
  difficulty_level: string;
}

interface MCQSession {
  id: string;
  session_type: string;
  category?: string;
  correct_answers: number;
  total_questions: number;
  score?: number;
  completed_at?: string;
}

interface MCQResponse {
  question_id: string;
  question_text: string;
  user_answer: string;
  correct_answer: string;
  is_correct: boolean;
  time_taken_seconds?: number;
}

const categories = [
  { id: 'algorithms', name: 'Algorithms', icon: Brain, color: 'bg-blue-500' },
  { id: 'data_structures', name: 'Data Structures', icon: Database, color: 'bg-green-500' },
  { id: 'frontend', name: 'Frontend', icon: Globe, color: 'bg-purple-500' },
  { id: 'backend', name: 'Backend', icon: Cpu, color: 'bg-orange-500' },
  { id: 'general', name: 'General Programming', icon: Code, color: 'bg-red-500' }
];

export default function PracticeMCQs() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('resume-based');
  const [resumeContent, setResumeContent] = useState('');
  const [currentSession, setCurrentSession] = useState<MCQSession | null>(null);
  const [questions, setQuestions] = useState<MCQQuestion[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [responses, setResponses] = useState<MCQResponse[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showResults, setShowResults] = useState(false);
  const [questionStartTime, setQuestionStartTime] = useState<number>(Date.now());
  const [selectedCategory, setSelectedCategory] = useState<string>('');

  const generateResumeBasedMCQs = async () => {
    if (!resumeContent.trim()) {
      toast.error('Please enter your resume content first');
      return;
    }

    setIsLoading(true);
    try {
      // Call Gemini AI to generate questions
      const { data, error } = await supabase.functions.invoke('gemini-mcq-generator', {
        body: { 
          resumeContent,
          questionCount: 10
        }
      });

      if (error) throw error;

      // Create mock session for now
      const mockSession: MCQSession = {
        id: 'temp-session-' + Date.now(),
        session_type: 'resume_based',
        correct_answers: 0,
        total_questions: 10
      };

      setCurrentSession(mockSession);
      setQuestions(data.questions || []);
      setCurrentQuestionIndex(0);
      setQuestionStartTime(Date.now());
      toast.success('Questions generated successfully!');
    } catch (error) {
      console.error('Error generating MCQs:', error);
      toast.error('Failed to generate questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const fetchPrebuiltQuestions = async (category: string) => {
    setIsLoading(true);
    try {
      // Fetch questions securely without answers
      const { data, error } = await supabase.functions.invoke('secure-mcq-questions', {
        body: { 
          category: category,
          limit: 10
        }
      });

      if (error) throw error;

      const fetchedQuestions = data.questions || [];
      
      if (fetchedQuestions.length === 0) {
        toast.error('No questions available for this category yet');
        return;
      }

      // Create session
      const mockSession: MCQSession = {
        id: 'temp-session-' + Date.now(),
        session_type: 'prebuilt',
        category: category,
        correct_answers: 0,
        total_questions: fetchedQuestions.length
      };

      setCurrentSession(mockSession);
      setQuestions(fetchedQuestions);
      setCurrentQuestionIndex(0);
      setQuestionStartTime(Date.now());
      setSelectedCategory(category);
      toast.success('Practice questions loaded!');
    } catch (error) {
      console.error('Error fetching questions:', error);
      toast.error('Failed to load questions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAnswerSubmit = async () => {
    if (!selectedAnswer || !currentSession) return;

    const currentQuestion = questions[currentQuestionIndex];
    const timeTaken = Math.floor((Date.now() - questionStartTime) / 1000);
    
    try {
      let isCorrect = false;
      let correctAnswer = '';

      // For prebuilt questions, validate securely via API
      if (currentSession.session_type === 'prebuilt') {
        const { data, error } = await supabase.functions.invoke('validate-mcq-answer', {
          body: { 
            questionId: currentQuestion.id,
            userAnswer: selectedAnswer
          }
        });

        if (error) throw error;
        
        isCorrect = data.isCorrect;
        correctAnswer = data.correctAnswer;
      } else {
        // For resume-based questions, we still have the correct answer in the question object
        isCorrect = selectedAnswer === currentQuestion.correct_answer;
        correctAnswer = currentQuestion.correct_answer;
      }

      const response: MCQResponse = {
        question_id: currentQuestion.id,
        question_text: currentQuestion.question,
        user_answer: selectedAnswer,
        correct_answer: correctAnswer,
        is_correct: isCorrect,
        time_taken_seconds: timeTaken
      };

      setResponses(prev => [...prev, response]);

      // Move to next question or show results
      if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex(prev => prev + 1);
        setSelectedAnswer('');
        setQuestionStartTime(Date.now());
      } else {
        // Quiz completed
        const correctAnswers = responses.filter(r => r.is_correct).length + (isCorrect ? 1 : 0);
        const score = (correctAnswers / questions.length) * 100;

        setShowResults(true);
      }
    } catch (error) {
      console.error('Error validating answer:', error);
      toast.error('Failed to validate answer. Please try again.');
    }
  };

  const resetQuiz = () => {
    setCurrentSession(null);
    setQuestions([]);
    setCurrentQuestionIndex(0);
    setSelectedAnswer('');
    setResponses([]);
    setShowResults(false);
    setSelectedCategory('');
  };

  const currentQuestion = questions[currentQuestionIndex];
  const progress = questions.length > 0 ? ((currentQuestionIndex + 1) / questions.length) * 100 : 0;

  if (showResults) {
    const correctCount = responses.filter(r => r.is_correct).length;
    const totalQuestions = responses.length;
    const finalScore = (correctCount / totalQuestions) * 100;

    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-hero">
      <BackButton />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-4xl mx-auto">
              <div className="flex items-center mb-6">
                <Button variant="ghost" onClick={resetQuiz} className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Practice
                </Button>
                <h1 className="text-2xl font-bold">Quiz Results</h1>
              </div>

              <Card className="mb-6">
                <CardHeader className="text-center">
                  <CardTitle className="text-3xl">Quiz Complete!</CardTitle>
                  <CardDescription className="text-lg">
                    You scored {correctCount} out of {totalQuestions} questions correctly
                  </CardDescription>
                </CardHeader>
                <CardContent className="text-center">
                  <div className="text-4xl font-bold mb-4 text-primary">
                    {finalScore.toFixed(1)}%
                  </div>
                  <Progress value={finalScore} className="mb-4" />
                  <div className="flex justify-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      {correctCount} Correct
                    </div>
                    <div className="flex items-center gap-1">
                      <XCircle className="h-4 w-4 text-red-500" />
                      {totalQuestions - correctCount} Incorrect
                    </div>
                  </div>
                </CardContent>
              </Card>

              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Question Review</h2>
                {responses.map((response, index) => (
                  <Card key={index} className={`${response.is_correct ? 'border-green-200' : 'border-red-200'}`}>
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-base">Question {index + 1}</CardTitle>
                        <Badge variant={response.is_correct ? 'default' : 'destructive'}>
                          {response.is_correct ? 'Correct' : 'Incorrect'}
                        </Badge>
                      </div>
                      <CardDescription>{response.question_text}</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-2 text-sm">
                        <div>
                          <span className="font-medium">Your answer: </span>
                          <span className={response.is_correct ? 'text-green-600' : 'text-red-600'}>
                            {response.user_answer}
                          </span>
                        </div>
                        {!response.is_correct && (
                          <div>
                            <span className="font-medium">Correct answer: </span>
                            <span className="text-green-600">{response.correct_answer}</span>
                          </div>
                        )}
                        {response.time_taken_seconds && (
                          <div className="flex items-center gap-1 text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            Time taken: {response.time_taken_seconds}s
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  if (currentSession && questions.length > 0) {
    return (
      <ProtectedRoute>
        <div className="min-h-screen bg-gradient-hero">
          <BackButton />
          <div className="container mx-auto px-4 py-8">
            <div className="max-w-2xl mx-auto">
              <div className="flex items-center justify-between mb-6">
                <Button variant="ghost" onClick={resetQuiz}>
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Exit Quiz
                </Button>
                <div className="text-sm text-muted-foreground">
                  Question {currentQuestionIndex + 1} of {questions.length}
                </div>
              </div>

              <div className="mb-6">
                <Progress value={progress} className="mb-2" />
                <div className="text-sm text-muted-foreground text-center">
                  {progress.toFixed(0)}% Complete
                </div>
              </div>

              <Card>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <Badge variant="outline">
                      {selectedCategory ? categories.find(c => c.id === selectedCategory)?.name : 'Resume-based'}
                    </Badge>
                    {currentQuestion.difficulty_level && (
                      <Badge variant="secondary">
                        {currentQuestion.difficulty_level}
                      </Badge>
                    )}
                  </div>
                  <CardTitle className="text-lg">{currentQuestion.question}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="A" id="option-a" />
                        <Label htmlFor="option-a" className="flex-1 cursor-pointer">
                          A) {currentQuestion.option_a}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="B" id="option-b" />
                        <Label htmlFor="option-b" className="flex-1 cursor-pointer">
                          B) {currentQuestion.option_b}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="C" id="option-c" />
                        <Label htmlFor="option-c" className="flex-1 cursor-pointer">
                          C) {currentQuestion.option_c}
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <RadioGroupItem value="D" id="option-d" />
                        <Label htmlFor="option-d" className="flex-1 cursor-pointer">
                          D) {currentQuestion.option_d}
                        </Label>
                      </div>
                    </div>
                  </RadioGroup>
                  
                  <Button 
                    onClick={handleAnswerSubmit} 
                    disabled={!selectedAnswer}
                    className="w-full mt-6"
                  >
                    {currentQuestionIndex < questions.length - 1 ? 'Next Question' : 'Finish Quiz'}
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </ProtectedRoute>
    );
  }

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gradient-hero">
        <BackButton />
        <div className="container mx-auto px-4 py-8">
          <div className="max-w-4xl mx-auto">
            <div className="flex items-center mb-6">
              <Link to="/">
                <Button variant="ghost" className="mr-4">
                  <ArrowLeft className="h-4 w-4 mr-2" />
                  Back to Dashboard
                </Button>
              </Link>
              <h1 className="text-3xl font-bold">Practice MCQs</h1>
            </div>

            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="resume-based" className="flex items-center gap-2">
                  <FileText className="h-4 w-4" />
                  Resume-Based Questions
                </TabsTrigger>
                <TabsTrigger value="prebuilt" className="flex items-center gap-2">
                  <BookOpen className="h-4 w-4" />
                  Topic-Based Questions
                </TabsTrigger>
              </TabsList>

              <TabsContent value="resume-based" className="space-y-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Brain className="h-5 w-5" />
                      AI-Generated Questions from Your Resume
                    </CardTitle>
                    <CardDescription>
                      Upload or paste your resume content, and our AI will generate personalized MCQ questions based on your skills and experience.
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <Label htmlFor="resume" className="text-sm font-medium">
                        Resume Content
                      </Label>
                      <Textarea
                        id="resume"
                        placeholder="Paste your resume content here or upload a file..."
                        value={resumeContent}
                        onChange={(e) => setResumeContent(e.target.value)}
                        rows={8}
                        className="mt-1"
                      />
                    </div>
                    
                    <div className="flex gap-4">
                      <Button onClick={() => document.getElementById('file-upload')?.click()} variant="outline">
                        <Upload className="h-4 w-4 mr-2" />
                        Upload Resume
                      </Button>
                      <input
                        id="file-upload"
                        type="file"
                        accept=".pdf,.doc,.docx,.txt"
                        className="hidden"
                        onChange={(e) => {
                          const file = e.target.files?.[0];
                          if (file) {
                            toast.info('File uploaded - content extraction coming soon!');
                          }
                        }}
                      />
                      <Button 
                        onClick={generateResumeBasedMCQs} 
                        disabled={!resumeContent.trim() || isLoading}
                      >
                        {isLoading ? 'Generating...' : 'Generate Questions'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="prebuilt" className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {categories.map((category) => {
                    const Icon = category.icon;
                    return (
                      <Card key={category.id} className="cursor-pointer hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${category.color} bg-opacity-20`}>
                              <Icon className="h-5 w-5" />
                            </div>
                            <CardTitle className="text-lg">{category.name}</CardTitle>
                          </div>
                          <CardDescription>
                            Test your knowledge with {category.name.toLowerCase()} questions
                          </CardDescription>
                        </CardHeader>
                        <CardContent>
                          <Button 
                            onClick={() => fetchPrebuiltQuestions(category.id)}
                            disabled={isLoading}
                            className="w-full"
                          >
                            {isLoading ? 'Loading...' : 'Start Practice'}
                          </Button>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}