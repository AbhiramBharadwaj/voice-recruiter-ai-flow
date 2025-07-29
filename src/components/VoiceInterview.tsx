import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Mic, MicOff, Play, Pause, RotateCcw } from 'lucide-react';

interface Question {
  question: string;
  category: string;
  difficulty: string;
}

interface VoiceInterviewProps {
  interviewId: string;
  role: string;
  interests: string[];
  onComplete: (results: any) => void;
}

const VoiceInterview: React.FC<VoiceInterviewProps> = ({ 
  interviewId, 
  role, 
  interests, 
  onComplete 
}) => {
  const { toast } = useToast();
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [transcript, setTranscript] = useState('');
  const [responses, setResponses] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [phase, setPhase] = useState<'setup' | 'questions' | 'analysis' | 'results'>('setup');
  const [results, setResults] = useState<any>(null);
  
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const recognitionRef = useRef<any>(null);
  const currentResponseRef = useRef('');

  useEffect(() => {
    initializeSpeechRecognition();
    generateQuestions();
  }, []);

  const initializeSpeechRecognition = () => {
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      
      recognitionRef.current.continuous = true;
      recognitionRef.current.interimResults = true;
      recognitionRef.current.lang = 'en-US';
      
      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = '';
        let interimTranscript = '';
        
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcript = event.results[i][0].transcript;
          if (event.results[i].isFinal) {
            finalTranscript += transcript;
          } else {
            interimTranscript += transcript;
          }
        }
        
        if (finalTranscript) {
          currentResponseRef.current += finalTranscript;
          setTranscript(prev => prev + finalTranscript);
        }
      };
      
      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error);
        toast({
          title: "Recognition Error",
          description: "Speech recognition encountered an error. Please try again.",
          variant: "destructive",
        });
      };
    } else {
      toast({
        title: "Not Supported",
        description: "Speech recognition is not supported in your browser.",
        variant: "destructive",
      });
    }
  };

  const generateQuestions = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.functions.invoke('voice-interview', {
        body: {
          action: 'generate_questions',
          role,
          interests
        }
      });

      if (error) throw error;
      
      setQuestions(data.questions || []);
      setPhase('questions');
      
      toast({
        title: "Questions Generated",
        description: `Generated ${data.questions?.length || 0} questions for your interview.`,
      });
    } catch (error) {
      console.error('Error generating questions:', error);
      toast({
        title: "Error",
        description: "Failed to generate questions. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      mediaRecorderRef.current = new MediaRecorder(stream);
      audioChunksRef.current = [];
      
      mediaRecorderRef.current.ondataavailable = (event) => {
        audioChunksRef.current.push(event.data);
      };
      
      mediaRecorderRef.current.start();
      recognitionRef.current?.start();
      
      setIsRecording(true);
      currentResponseRef.current = '';
      
      toast({
        title: "Recording Started",
        description: "Speak your answer clearly.",
      });
    } catch (error) {
      console.error('Error starting recording:', error);
      toast({
        title: "Recording Error",
        description: "Failed to start recording. Please check microphone permissions.",
        variant: "destructive",
      });
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      recognitionRef.current?.stop();
      
      mediaRecorderRef.current.onstop = () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/wav' });
        
        // Save the response
        const newResponse = {
          questionIndex: currentQuestionIndex,
          question: questions[currentQuestionIndex].question,
          answer: currentResponseRef.current,
          audioBlob: audioBlob,
          timestamp: new Date().toISOString()
        };
        
        setResponses(prev => [...prev, newResponse]);
        
        // Move to next question or finish
        if (currentQuestionIndex < questions.length - 1) {
          setCurrentQuestionIndex(prev => prev + 1);
        } else {
          analyzeInterview();
        }
      };
      
      setIsRecording(false);
      
      toast({
        title: "Recording Stopped",
        description: "Answer recorded successfully.",
      });
    }
  };

  const analyzeInterview = async () => {
    setPhase('analysis');
    setIsLoading(true);
    
    try {
      const { data, error } = await supabase.functions.invoke('voice-interview', {
        body: {
          action: 'analyze_responses',
          transcript,
          responses: responses.map(r => ({
            question: r.question,
            answer: r.answer,
            timestamp: r.timestamp
          }))
        }
      });

      if (error) throw error;
      
      const analysisResults = data.analysis;
      setResults(analysisResults);
      
      // Save to database
      await supabase.functions.invoke('voice-interview', {
        body: {
          action: 'save_interview',
          interviewId,
          transcript: JSON.stringify(analysisResults),
          responses: responses.map(r => ({
            question: r.question,
            answer: r.answer,
            timestamp: r.timestamp
          }))
        }
      });
      
      setPhase('results');
      onComplete(analysisResults);
      
      toast({
        title: "Analysis Complete",
        description: "Your interview has been analyzed and saved.",
      });
    } catch (error) {
      console.error('Error analyzing interview:', error);
      toast({
        title: "Analysis Error",
        description: "Failed to analyze interview. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const speakQuestion = (text: string) => {
    if ('speechSynthesis' in window) {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.8;
      utterance.pitch = 1;
      speechSynthesis.speak(utterance);
    }
  };

  const resetInterview = () => {
    setCurrentQuestionIndex(0);
    setTranscript('');
    setResponses([]);
    setResults(null);
    setPhase('questions');
  };

  if (phase === 'setup' || isLoading) {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Preparing Your AI Voice Interview</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p>Generating personalized questions for {role} role...</p>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'results' && results) {
    return (
      <Card className="w-full max-w-4xl mx-auto">
        <CardHeader>
          <CardTitle>Interview Results</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">{results.overall_score}%</div>
              <div className="text-sm text-muted-foreground">Overall</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-blue-600">{results.technical_score}%</div>
              <div className="text-sm text-muted-foreground">Technical</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-green-600">{results.communication_score}%</div>
              <div className="text-sm text-muted-foreground">Communication</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-purple-600">{results.sentiment_score}%</div>
              <div className="text-sm text-muted-foreground">Sentiment</div>
            </div>
          </div>
          
          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <h3 className="font-semibold mb-2 text-green-600">Strengths</h3>
              <ul className="list-disc list-inside space-y-1">
                {results.strengths?.map((strength: string, index: number) => (
                  <li key={index} className="text-sm">{strength}</li>
                ))}
              </ul>
            </div>
            
            <div>
              <h3 className="font-semibold mb-2 text-orange-600">Areas for Improvement</h3>
              <ul className="list-disc list-inside space-y-1">
                {results.improvements?.map((improvement: string, index: number) => (
                  <li key={index} className="text-sm">{improvement}</li>
                ))}
              </ul>
            </div>
          </div>
          
          <div>
            <h3 className="font-semibold mb-2">Detailed Feedback</h3>
            <p className="text-sm text-muted-foreground">{results.detailed_feedback}</p>
          </div>
          
          <div className="flex gap-2">
            <Button onClick={resetInterview} variant="outline">
              <RotateCcw className="w-4 h-4 mr-2" />
              Retake Interview
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (phase === 'analysis') {
    return (
      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Analyzing Your Performance</CardTitle>
        </CardHeader>
        <CardContent className="text-center">
          <div className="animate-pulse rounded-full h-12 w-12 bg-primary/20 mx-auto mb-4"></div>
          <p>Our AI is analyzing your responses and generating detailed feedback...</p>
          <Progress value={66} className="mt-4" />
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          Voice Interview in Progress
          <Badge variant="outline">
            Question {currentQuestionIndex + 1} of {questions.length}
          </Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        <Progress value={(currentQuestionIndex / questions.length) * 100} />
        
        {questions[currentQuestionIndex] && (
          <div className="space-y-4">
            <Card className="p-4 bg-muted/50">
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary">
                  {questions[currentQuestionIndex].category}
                </Badge>
                <Badge variant="outline">
                  {questions[currentQuestionIndex].difficulty}
                </Badge>
              </div>
              <p className="text-lg font-medium mb-3">
                {questions[currentQuestionIndex].question}
              </p>
              <Button
                variant="outline"
                size="sm"
                onClick={() => speakQuestion(questions[currentQuestionIndex].question)}
              >
                <Play className="w-4 h-4 mr-2" />
                Listen to Question
              </Button>
            </Card>
            
            <div className="text-center space-y-4">
              <Button
                size="lg"
                onClick={isRecording ? stopRecording : startRecording}
                className={`w-32 h-32 rounded-full ${
                  isRecording ? 'bg-red-500 hover:bg-red-600' : 'bg-primary hover:bg-primary/90'
                }`}
              >
                {isRecording ? (
                  <MicOff className="w-8 h-8" />
                ) : (
                  <Mic className="w-8 h-8" />
                )}
              </Button>
              
              <div>
                <p className="text-sm text-muted-foreground mb-2">
                  {isRecording ? 'Recording your answer...' : 'Tap to start recording your answer'}
                </p>
                {isRecording && (
                  <div className="flex items-center justify-center space-x-2">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm text-red-500">RECORDING</span>
                  </div>
                )}
              </div>
            </div>
            
            {currentResponseRef.current && (
              <Card className="p-3 bg-muted/30">
                <p className="text-sm">
                  <span className="font-medium">Your response: </span>
                  {currentResponseRef.current}
                </p>
              </Card>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default VoiceInterview;