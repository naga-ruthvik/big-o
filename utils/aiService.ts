import { Problem, AISettings, MentalModel, Difficulty } from '../types';

// --- Types ---

interface StudyPlanResult {
    plan: Record<string, Problem[]>;
    error?: string;
}

// --- Public API ---

/**
 * Generates a personalized study plan.
 */
export const generateStudyPlanAI = async (
    problems: Problem[],
    settings: AISettings,
    days: number,
    mode: 'interview' | 'contest',
    providerOverride?: 'gemini' | 'ollama'
): Promise<StudyPlanResult> => {

    const systemPrompt = `
    You are an expert DSA Coach. Your goal is to create a personalized study plan.
    Output ONLY valid JSON where keys are "Day 1", "Day 2", etc., and values are arrays of problem IDs.
    Structure: { "Day 1": ["id1", "id2"] }
    `;

    // 1. Prepare Data Context
    const problemContext = problems.map(p => ({
        id: p.id,
        title: p.title,
        topic: p.topic,
        difficulty: p.difficulty,
        confidence: p.confidence,
        revisionCount: p.revisionCount,
        lastReviewed: new Date(p.lastReviewed).toISOString()
    }));

    const userPrompt = `
    Context: User is preparing for ${mode} mode.
    Duration: ${days} Days.
    Daily Limit: 3-4 problems.
    
    Problem History:
    ${JSON.stringify(problemContext)}

    Generate the JSON plan now.
    `;

    try {
        return await generateAIResponse(systemPrompt, userPrompt, settings, (json) => {
            const rawPlan = JSON.parse(json);
            const finalPlan: Record<string, Problem[]> = {};
            for (const [day, ids] of Object.entries(rawPlan)) {
                if (Array.isArray(ids)) {
                    finalPlan[day] = ids
                        .map((id: any) => problems.find(p => p.id === id))
                        .filter((p): p is Problem => !!p);
                }
            }
            return { plan: finalPlan };
        }, providerOverride);
    } catch (error: any) {
        console.error("AI Generation Failed:", error);
        return { plan: {}, error: error.message || "Unknown AI Error" };
    }
};

/**
 * Auto-fills semantic details for a problem based on title/trigger.
 */
export const autoFillProblemDetails = async (
    title: string,
    userNotes: string,
    settings: AISettings,
    providerOverride?: 'gemini' | 'ollama'
): Promise<Partial<Problem>> => {

    const systemPrompt = `
    You are an Algorithm Expert. Analyze the coding problem title and notes to populate a study card.
    Output generic JSON matching this schema:
    {
        "topic": "string",
        "pattern": "string",
        "difficulty": "Easy" | "Medium" | "Hard",
        "constraints": "string (inferred constraints)",
        "trigger": "string (signal keyword)",
        "aha": "string (core intuition)",
        "relatedTo": "string (similar problem)",
        "codeSnippet": "string (python/js solution)"
    }
    `;

    const userPrompt = `
    Title: "${title}"
    User Notes: "${userNotes}"
    
    Provide the JSON analysis.
    `;

    return await generateAIResponse(systemPrompt, userPrompt, settings, (json) => {
        return JSON.parse(json) as Partial<Problem>;
    }, providerOverride);
};

/**
 * Generates a Mental Model / Strategy Guide for a topic.
 */
export const generateMentalModel = async (
    topic: string,
    userProblems: Problem[],
    settings: AISettings,
    providerOverride?: 'gemini' | 'ollama'
): Promise<MentalModel | null> => {

    const relevantProblems = userProblems
        .filter(p => p.topic === topic)
        .map(p => ({
            title: p.title,
            pattern: p.pattern,
            mistake: p.mistake || "None",
        }))
        .slice(0, 8);

    const systemPrompt = `
        Act as a Senior Algorithm Engineer. 
        Generate a "Identify & Attack" Strategy Guide for the topic "${topic}".
        
        Output strict JSON with this structure:
        {
            "topic": "${topic}",
            "summary": "Strategy summary",
            "polya": {
                "understand": "string",
                "plan": "string",
                "execute": "string",
                "reflect": "string"
            },
            "edgeCases": [{ "name": "string", "rule": "string" }],
            "patternBridge": [{ "relatedTopic": "string", "relationship": "string", "description": "string" }],
            "complexity": [{ "scenario": "string", "time": "string", "space": "string" }],
            "mistakeAnalysis": [{ "commonPitfall": "string", "correction": "string", "myPastError": "string (optional)" }]
        }
    `;

    const userPrompt = `
    My Solved Problems in this topic: 
    ${JSON.stringify(relevantProblems)}
    
    Generate the guide based on my history.
    IMPORTANT: Look at my 'mistake' fields in the history. If I have specific mistakes, include them in the 'mistakeAnalysis' section as 'myPastError'. If not, provide general common pitfalls.
    `;

    try {
        return await generateAIResponse(systemPrompt, userPrompt, settings, (json) => {
            return JSON.parse(json) as MentalModel;
        }, providerOverride);
    } catch (e) {
        console.error("Mental Model Gen Error", e);
        return null;
    }
};


// --- Internal Logic ---

async function generateAIResponse<T>(
    systemPrompt: string,
    userPrompt: string,
    settings: AISettings,
    parser: (json: string) => T,
    providerOverride?: 'gemini' | 'ollama'
): Promise<T> {
    const fullPrompt = systemPrompt + "\n\n" + userPrompt;
    let rawText = "";

    // Prefer override, else fallback to settings
    const activeProvider = providerOverride || settings.provider;

    if (activeProvider === 'gemini') {
        rawText = await callGemini(fullPrompt, settings.geminiKey);
    } else {
        rawText = await callOllama(fullPrompt, settings.ollamaUrl, settings.ollamaModel);
    }

    // Clean Markdown
    const cleaned = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
    return parser(cleaned);
}

const callGemini = async (prompt: string, apiKey: string): Promise<string> => {
    if (!apiKey) throw new Error("Gemini API Key is missing. Please set it in Settings.");

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            contents: [{ parts: [{ text: prompt }] }],
            generationConfig: { response_mime_type: "application/json" } // Force JSON mode if supported
        })
    });

    if (!response.ok) {
        if (response.status === 429) {
            throw new Error("Gemini Quota Exceeded (Free Tier). Please switch to 'Ollama' using the selector above.");
        }
        const err = await response.json();
        throw new Error(err.error?.message || response.statusText);
    }

    const data = await response.json();
    const text = data.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!text) throw new Error("No content returned from Gemini.");

    return text;
};

const callOllama = async (prompt: string, baseUrl: string, model: string): Promise<string> => {
    // Sanitize URL
    let cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const lastHttpIndex = cleanBaseUrl.lastIndexOf('http');
    if (lastHttpIndex !== -1) {
        cleanBaseUrl = cleanBaseUrl.substring(lastHttpIndex);
    }

    const url = cleanBaseUrl + '/api/generate';

    console.log("--- Ollama Debug ---");
    console.log("URL:", url);
    console.log("Model:", model);
    console.log("Prompt Snippet:", prompt.substring(0, 50));

    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                model: model || 'llama3',
                prompt: prompt,
                stream: false,
                format: "json"
            })
        });

        if (!response.ok) {
            let errorMsg = response.statusText;
            try {
                const errBody = await response.json();
                if (errBody.error) {
                    errorMsg = errBody.error; // e.g. "model 'llama3' not found"
                }
            } catch (e) {
                // ignore json parse error, keep statusText 
            }
            throw new Error(`Ollama Error (${response.status}): ${errorMsg}`);
        }

        const data = await response.json();
        return data.response;
    } catch (e: any) {
        throw new Error(`Ollama Error: ${e.message}. Ensure 'ollama serve' is running.`);
    }
};

export const getOllamaModels = async (baseUrl: string): Promise<string[]> => {
    // Sanitize URL
    let cleanBaseUrl = baseUrl.replace(/\/$/, '');
    const lastHttpIndex = cleanBaseUrl.lastIndexOf('http');
    if (lastHttpIndex !== -1) {
        cleanBaseUrl = cleanBaseUrl.substring(lastHttpIndex);
    }
    const url = cleanBaseUrl + '/api/tags';

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error("Failed to fetch models");
        const data = await response.json();
        return data.models.map((m: any) => m.name);
    } catch (error) {
        console.error("Error fetching Ollama models:", error);
        return [];
    }
};
