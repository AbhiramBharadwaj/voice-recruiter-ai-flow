import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface VoiceInterviewRequest {
  action: 'generate_questions' | 'analyze_responses' | 'save_interview';
  role?: string;
  interests?: string[];
  transcript?: string;
  responses?: any[];
  interviewId?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? '',
      {
        global: {
          headers: { Authorization: req.headers.get('Authorization')! },
        },
      }
    );

    const { action, role, interests, transcript, responses, interviewId }: VoiceInterviewRequest = await req.json();

    const GEMINI_API_KEY = Deno.env.get('GEMINI_API_KEY');
    if (!GEMINI_API_KEY) {
      throw new Error('GEMINI_API_KEY not configured');
    }

    if (action === 'generate_questions') {
      // Generate 5 interview questions based on role and interests
      const prompt = `Generate 5 professional interview questions for a ${role} position. 
      Focus on these areas of interest: ${interests?.join(', ')}.
      
      Format the response as a JSON array of objects with this structure:
      [
        {
          "question": "Your question here",
          "category": "technical|behavioral|situational",
          "difficulty": "beginner|intermediate|advanced"
        }
      ]
      
      Make questions progressive in difficulty and relevant to the role.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            maxOutputTokens: 2048,
          }
        }),
      });

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\[[\s\S]*\]/);
      const questions = jsonMatch ? JSON.parse(jsonMatch[0]) : [];

      return new Response(JSON.stringify({ questions }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'analyze_responses') {
      // Analyze the transcript and responses using Gemini
      const prompt = `Analyze this voice interview transcript and provide detailed feedback:

      TRANSCRIPT:
      ${transcript}

      RESPONSES:
      ${JSON.stringify(responses, null, 2)}

      Please provide analysis in the following JSON format:
      {
        "overall_score": 85,
        "technical_score": 80,
        "communication_score": 90,
        "sentiment_score": 85,
        "strengths": ["Clear communication", "Good technical knowledge"],
        "improvements": ["Could provide more specific examples"],
        "detailed_feedback": "Comprehensive feedback paragraph here",
        "question_analysis": [
          {
            "question": "Question text",
            "response_quality": "good|average|poor",
            "feedback": "Specific feedback for this question"
          }
        ]
      }

      Score each category from 0-100. Be constructive and specific in feedback.`;

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 4096,
          }
        }),
      });

      const data = await response.json();
      const generatedText = data.candidates[0].content.parts[0].text;
      
      // Extract JSON from the response
      const jsonMatch = generatedText.match(/\{[\s\S]*\}/);
      const analysis = jsonMatch ? JSON.parse(jsonMatch[0]) : {};

      return new Response(JSON.stringify({ analysis }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'save_interview') {
      // Save interview results to database
      const { data: user, error: userError } = await supabaseClient.auth.getUser();
      if (userError) throw userError;

      const analysisData = JSON.parse(transcript || '{}');
      
      const { data, error } = await supabaseClient
        .from('interviews')
        .update({
          status: 'completed',
          transcript: transcript,
          responses: responses,
          ai_feedback: analysisData.detailed_feedback,
          overall_score: analysisData.overall_score,
          technical_score: analysisData.technical_score,
          communication_score: analysisData.communication_score,
          sentiment_score: analysisData.sentiment_score,
          updated_at: new Date().toISOString(),
        })
        .eq('id', interviewId)
        .eq('user_id', user.user.id);

      if (error) throw error;

      return new Response(JSON.stringify({ success: true, data }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in voice-interview function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});