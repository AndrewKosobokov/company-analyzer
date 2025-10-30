import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

export async function callVertexAI(
  prompt: string, 
  useGoogleSearch: boolean = true
): Promise<{ text: string; citations: { uri: string; title: string }[] }> {
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0523149055';
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const model = 'gemini-2.0-flash-exp';

  console.log(`[VertexAI] Initializing client for project: ${projectId}, location: ${location}`);

  try {
    const vertexAI = new VertexAI({ project: projectId, location: location });
    
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
        },
      ],
    });

    const tools = useGoogleSearch ? [{ googleSearchRetrieval: {} }] : [];

    console.log(`[VertexAI] Calling model: ${model} with search: ${useGoogleSearch}`);
    
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: tools,
    } as any;

    const response = await generativeModel.generateContent(request);
    
    const generatedText = response.response.candidates?.[0]?.content?.parts?.[0]?.text || '';
    
    const groundingMetadata = response.response.candidates?.[0]?.groundingMetadata;
    let citations: { uri: string; title: string }[] = [];
    
    if (groundingMetadata?.groundingChunks) {
      citations = groundingMetadata.groundingChunks
        .filter((chunk: any) => chunk.web)
        .map((chunk: any) => ({
          uri: chunk.web.uri,
          title: chunk.web.title || chunk.web.uri,
        }));
    }

    console.log(`[VertexAI] Successfully received response. Text length: ${generatedText.length}`);
    
    return {
      text: generatedText,
      citations: citations,
    };
    
  } catch (error) {
    console.error('[VertexAI] Error calling Vertex AI API:', error);
    throw new Error('Failed to analyze company using Vertex AI. Check server logs for details.');
  }
}


