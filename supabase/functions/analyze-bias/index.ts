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

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      return new Response(JSON.stringify({ error: 'LOVABLE_API_KEY is not configured' }), {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const systemPrompt = `You are an expert cognitive bias analyst and NLP researcher specializing in cognitive psychology, behavioral economics, and critical thinking analysis.

Analyze the following text for ALL possible cognitive biases from this comprehensive taxonomy:

**CORE COGNITIVE BIASES:**
1. Overgeneralization - Making broad conclusions from limited data
2. Black-and-White Thinking (Splitting) - Viewing situations as extremes with no middle ground
3. Emotional Reasoning - Treating emotions as factual evidence
4. Confirmation Bias - Focusing only on information that supports existing beliefs
5. Survivorship Bias - Ignoring failures while focusing only on successful cases
6. Anchoring Bias - Over-relying on the first piece of information encountered
7. Bandwagon Effect - Believing something because many others do
8. Dunning-Kruger Effect - Overestimating one's own abilities or knowledge
9. Sunk Cost Fallacy - Continuing investment because of previously invested resources
10. Ad Hominem - Attacking the person rather than the argument
11. Hasty Generalization - Drawing conclusions from insufficient evidence
12. Appeal to Authority - Using authority as evidence without proper justification
13. False Dichotomy - Presenting only two options when more exist
14. Catastrophizing - Assuming the worst possible outcome
15. Mind Reading - Assuming you know what others think
16. Fortune Telling - Predicting negative outcomes without evidence
17. Personalization - Taking excessive responsibility for external events
18. Labeling - Assigning global negative labels based on single events
19. Should Statements - Using rigid "should/must" rules
20. Availability Heuristic - Judging probability by ease of recall

For EACH bias found, provide:
1. The exact bias type name
2. A confidence score from 0.0 to 1.0 (be precise)
3. A detailed explanation of WHY this is biased
4. The psychological reasoning behind why the person thinks this way
5. The specific trigger words/phrases from the text
6. A constructive reframe for healthier thinking
7. The severity level: "low", "medium", or "high"

Also provide:
- A comprehensive psychological insight about the overall thinking pattern
- A sentiment analysis with: overall sentiment (positive/negative/neutral/mixed), valence score (-1.0 to 1.0), arousal score (0.0 to 1.0), dominance score (0.0 to 1.0)
- NLP metrics: estimated reading level, emotional intensity (0-100), logical coherence (0-100), persuasion tactics detected

Respond ONLY in this exact JSON format:
{
  "biases": [
    {
      "biasType": "string",
      "confidence": number,
      "explanation": "string",
      "reasoning": "string",
      "triggers": ["string"],
      "reframe": "string",
      "severity": "low" | "medium" | "high",
      "color": "cyan" | "green" | "orange" | "red" | "purple"
    }
  ],
  "overallInsight": "string - a compassionate, detailed psychological insight",
  "sentiment": {
    "overall": "positive" | "negative" | "neutral" | "mixed",
    "valence": number,
    "arousal": number,
    "dominance": number,
    "emotions": ["string"]
  },
  "nlpMetrics": {
    "readingLevel": "string",
    "emotionalIntensity": number,
    "logicalCoherence": number,
    "persuasionTactics": ["string"],
    "cognitiveComplexity": "low" | "medium" | "high"
  }
}

If no biases are detected, return empty biases array with balanced insight.

Use these color mappings:
- Overgeneralization, Hasty Generalization, Availability Heuristic → cyan
- Confirmation Bias, Appeal to Authority, Anchoring Bias → green
- Emotional Reasoning, Catastrophizing, Fortune Telling, Mind Reading → red
- Black-and-White Thinking, False Dichotomy, Should Statements → orange
- Survivorship Bias, Bandwagon Effect, Sunk Cost Fallacy, Dunning-Kruger → purple
- Ad Hominem, Personalization, Labeling → red
- Other biases → cyan`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `Analyze this text comprehensively for cognitive biases, sentiment, and NLP metrics:\n\n"${text}"` },
        ],
        stream: false,
      }),
    });

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(JSON.stringify({ error: 'Rate limit exceeded, please try again later.' }), {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      if (response.status === 402) {
        return new Response(JSON.stringify({ error: 'Payment required, please add credits.' }), {
          status: 402,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }
      const errorText = await response.text();
      console.error('AI gateway error:', response.status, errorText);
      return new Response(JSON.stringify({ error: 'AI analysis failed', details: errorText }), {
        status: 502,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content || '';

    // Extract JSON from response
    let jsonStr = content;
    
    // Remove thinking tags
    const thinkEnd = jsonStr.lastIndexOf('</think>');
    if (thinkEnd !== -1) {
      jsonStr = jsonStr.substring(thinkEnd + 8).trim();
    }
    
    // Extract from markdown code blocks
    const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
    if (jsonMatch) {
      jsonStr = jsonMatch[1].trim();
    }
    
    // Find balanced JSON
    if (!jsonStr.startsWith('{')) {
      const lastBrace = jsonStr.lastIndexOf('}');
      if (lastBrace !== -1) {
        let depth = 0;
        let startIdx = -1;
        for (let i = lastBrace; i >= 0; i--) {
          if (jsonStr[i] === '}') depth++;
          if (jsonStr[i] === '{') depth--;
          if (depth === 0) { startIdx = i; break; }
        }
        if (startIdx !== -1) {
          jsonStr = jsonStr.substring(startIdx, lastBrace + 1);
        }
      }
    }

    let parsed;
    try {
      parsed = JSON.parse(jsonStr);
    } catch {
      console.error('Failed to parse AI response:', content);
      parsed = { biases: [], overallInsight: content };
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
