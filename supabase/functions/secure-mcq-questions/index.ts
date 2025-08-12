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

    const { category, limit = 10 } = await req.json();
    
    console.log('Fetching secure MCQ questions:', { category, limit });

    // Use the secure function to get questions without answers
    const { data, error } = await supabase.rpc('get_mcq_questions_safe', {
      p_category: category,
      p_limit: limit
    });

    if (error) {
      console.error('Error fetching questions:', error);
      throw error;
    }

    console.log('Successfully fetched questions:', data?.length);

    return new Response(JSON.stringify({ questions: data || [] }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in secure-mcq-questions function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});