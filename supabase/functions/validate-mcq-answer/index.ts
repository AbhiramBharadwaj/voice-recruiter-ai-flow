import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

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
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Authorization required' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const { questionId, userAnswer } = await req.json();
    
    console.log('Validating MCQ answer:', { questionId, userAnswer });

    // Use the secure function to validate the answer
    const { data, error } = await supabase.rpc('validate_mcq_answer', {
      p_question_id: questionId,
      p_user_answer: userAnswer
    });

    if (error) {
      console.error('Error validating answer:', error);
      throw error;
    }

    const result = data?.[0];
    console.log('Validation result:', result);

    return new Response(JSON.stringify({
      isCorrect: result?.is_correct || false,
      correctAnswer: result?.correct_answer
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in validate-mcq-answer function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});