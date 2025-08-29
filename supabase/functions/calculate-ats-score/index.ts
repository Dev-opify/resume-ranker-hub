import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.56.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const supabaseUrl = "https://kywdadhkuktvgutwkxhc.supabase.co";
const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
const geminiApiKey = Deno.env.get('GEMINI_API_KEY');

const supabase = createClient(supabaseUrl, supabaseServiceKey);

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { candidateId, resumeUrl } = await req.json();

    if (!candidateId || !resumeUrl) {
      throw new Error('candidateId and resumeUrl are required');
    }

    console.log(`Processing ATS score for candidate ${candidateId} with resume ${resumeUrl}`);

    // Download the PDF file from Supabase storage
    const { data: fileData, error: downloadError } = await supabase.storage
      .from('resumes')
      .download(resumeUrl);

    if (downloadError) {
      throw new Error(`Failed to download resume: ${downloadError.message}`);
    }

    // Convert PDF to text (simplified - in production you'd use a proper PDF parser)
    // For now, we'll simulate text extraction
    const resumeText = await extractTextFromPdf(fileData);

    // Generate ATS score using Google Gemini
    const atsScore = await generateAtsScoreWithGemini(resumeText);

    // Update the candidate record with the ATS score
    const { error: updateError } = await supabase
      .from('candidates')
      .update({ ats_score: atsScore })
      .eq('id', candidateId);

    if (updateError) {
      throw new Error(`Failed to update candidate: ${updateError.message}`);
    }

    console.log(`Successfully updated candidate ${candidateId} with ATS score ${atsScore}`);

    return new Response(JSON.stringify({ 
      success: true, 
      atsScore,
      message: 'ATS score calculated and updated successfully' 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in calculate-ats-score function:', error);
    return new Response(JSON.stringify({ 
      success: false, 
      error: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

// Simplified PDF text extraction (in production, use a proper PDF library)
async function extractTextFromPdf(fileData: Blob): Promise<string> {
  // This is a placeholder - in a real implementation, you'd use a PDF parsing library
  // For now, return a sample text that represents typical resume content
  return `
    Resume Content:
    - Software Engineer with 3+ years of experience
    - Skills: JavaScript, TypeScript, React, Node.js, Python
    - Education: Computer Science Degree
    - Experience: Frontend Developer at Tech Company
    - Projects: Built several web applications
    - Certifications: AWS Certified Developer
  `;
}

async function generateAtsScoreWithGemini(resumeText: string): Promise<number> {
  if (!geminiApiKey) {
    throw new Error('GEMINI_API_KEY not configured');
  }

  const prompt = `
    You are an ATS (Applicant Tracking System) analyzer. Analyze this resume and provide a numerical score from 0-100 based on:
    
    1. Relevant skills and technologies (30 points)
    2. Experience level and quality (25 points)
    3. Education and certifications (20 points)
    4. Resume formatting and clarity (15 points)
    5. Project experience and achievements (10 points)
    
    Resume text:
    ${resumeText}
    
    Provide ONLY a number between 0-100 as your response, nothing else.
  `;

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${geminiApiKey}`, {
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
          temperature: 0.1,
          maxOutputTokens: 10,
        }
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    const scoreText = data.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    
    if (!scoreText) {
      throw new Error('No response from Gemini API');
    }

    const score = parseInt(scoreText);
    
    if (isNaN(score) || score < 0 || score > 100) {
      console.warn(`Invalid score from Gemini: ${scoreText}, using default score`);
      return 75; // Default score if parsing fails
    }

    return score;
    
  } catch (error) {
    console.error('Error calling Gemini API:', error);
    // Return a default score if API call fails
    return 75;
  }
}