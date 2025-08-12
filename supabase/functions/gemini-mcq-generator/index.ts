import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const openAIApiKey = Deno.env.get('OPENAI_API_KEY');

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { resumeContent, questionCount = 10 } = await req.json();

    console.log('Generating MCQ questions from resume:', { questionCount });

    if (!resumeContent) {
      throw new Error('Resume content is required');
    }

    if (!openAIApiKey) {
      throw new Error('OpenAI API key is not configured');
    }

    const prompt = `Based on the following resume content, generate ${questionCount} multiple choice questions that would test the candidate's knowledge and skills. Focus on their technical skills, experience, and domain knowledge mentioned in the resume.

Resume Content:
${resumeContent}

Generate questions in the following JSON format:
{
  "questions": [
    {
      "id": "unique-id",
      "question": "Question text",
      "option_a": "Option A text",
      "option_b": "Option B text", 
      "option_c": "Option C text",
      "option_d": "Option D text",
      "correct_answer": "A",
      "category": "resume_based",
      "difficulty_level": "medium"
    }
  ]
}

Make the questions relevant to the skills and experience mentioned in the resume. Include a mix of technical and conceptual questions. Ensure each question has exactly 4 options (A, B, C, D) and specify the correct answer as A, B, C, or D.`;

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${openAIApiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { 
            role: 'system', 
            content: 'You are an expert interviewer that generates relevant multiple choice questions based on resume content. Always respond with valid JSON.' 
          },
          { role: 'user', content: prompt }
        ],
        temperature: 0.7,
        max_tokens: 2000,
      }),
    });

    if (!response.ok) {
      throw new Error(`OpenAI API error: ${response.status}`);
    }

    const data = await response.json();
    const generatedContent = data.choices[0].message.content;

    console.log('Generated content:', generatedContent);

    // Parse the JSON response
    let parsedQuestions;
    try {
      parsedQuestions = JSON.parse(generatedContent);
    } catch (parseError) {
      console.error('Failed to parse generated questions:', parseError);
      throw new Error('Failed to parse generated questions');
    }

    // Add unique IDs to questions if not present
    if (parsedQuestions.questions) {
      parsedQuestions.questions = parsedQuestions.questions.map((q: any, index: number) => ({
        ...q,
        id: q.id || `resume-q-${Date.now()}-${index}`,
        category: 'resume_based',
        difficulty_level: q.difficulty_level || 'medium'
      }));
    }

    console.log('Successfully generated questions:', parsedQuestions.questions?.length || 0);

    return new Response(JSON.stringify(parsedQuestions), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in gemini-mcq-generator function:', error);
    return new Response(JSON.stringify({ 
      error: error.message,
      questions: []
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});