const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { text } = await req.json();

    if (!text || typeof text !== 'string' || text.trim().length === 0) {
      return new Response(JSON.stringify({ error: 'Text is required' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const apiKey = Deno.env.get('K2_THINK_API_KEY');
    if (!apiKey) {
      return new Response(JSON.stringify({ error: 'API key not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert cognitive bias analyst. Analyze the following text for cognitive biases.

For each bias found, provide:
1. The bias type (e.g., Overgeneralization, Black-and-White Thinking, Emotional Reasoning, Confirmation Bias, Survivorship Bias, Anchoring Bias, Bandwagon Effect, etc.)
2. A confidence score from 0.0 to 1.0
3. A detailed explanation of WHY this is biased and what might be the underlying reason the person feels/thinks this way
4. The specific trigger words/phrases from the text
5. A suggestion for how to reframe the thought more objectively

Also provide a brief psychological insight into what might be causing the person to think this way (e.g., stress, past experiences, cognitive shortcuts).

Respond ONLY in this exact JSON format:
{
  "biases": [
    {
      "biasType": "string",
      "confidence": number,
      "explanation": "string - explain why this is biased",
      "reasoning": "string - explain what might be causing this thinking pattern and why the person might feel this way",
      "triggers": ["string"],
      "reframe": "string - a healthier way to think about this",
      "color": "cyan" | "green" | "orange" | "red" | "purple"
    }
  ],
  "overallInsight": "string - a compassionate psychological insight about the overall thinking pattern"
}

If no biases are detected, return: { "biases": [], "overallInsight": "The text appears to reflect balanced reasoning." }

Use these color mappings:
- Overgeneralization → cyan
- Confirmation Bias → green  
- Emotional Reasoning → red
- Black-and-White Thinking → orange
- Survivorship Bias → purple
- Other biases → cyan`;

    const response = await fetch('https://api.k2think.ai/v1/chat/completions', {
      method: 'POST',
      headers: {
        'accept': 'application/json',
        'Authorization': `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'MBZUAI-IFM/K2-Think-v2',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this text for cognitive biases:\n\n"${text}"` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('K2 API error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed', details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from the response (handle markdown code blocks)
    let jsonStr = content;
    const jsonMatch = content.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      // Fallback: return the raw content as insight
      parsed = {
        biases: [],
        overallInsight: content,
      };
    }

    return new Response(JSON.stringify(parsed), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: 'Internal server error' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
