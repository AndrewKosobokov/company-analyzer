import { VertexAI, HarmCategory, HarmBlockThreshold } from '@google-cloud/vertexai';

export async function callVertexAI(
  prompt: string, 
  useGoogleSearch: boolean = true
): Promise<{ text: string; citations: { uri: string; title: string }[] }> {
  
  const projectId = process.env.GOOGLE_CLOUD_PROJECT || 'gen-lang-client-0523149055';
  const location = process.env.VERTEX_AI_LOCATION || 'us-central1';
  const model = 'gemini-2.5-pro';

  console.log(`[VertexAI] Initializing client for project: ${projectId}, location: ${location}`);

  try {
    const vertexAI = new VertexAI({ project: projectId, location: location });
    
    const generativeModel = vertexAI.getGenerativeModel({
      model: model,
      safetySettings: [
        {
          category: HarmCategory.HARM_CATEGORY_HARASSMENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
        {
          category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
          threshold: HarmBlockThreshold.BLOCK_NONE,
        },
      ],
    });

    const tools = useGoogleSearch ? [{ googleSearch: {} }] : [];

    console.log(`[VertexAI] Calling model: ${model} with search: ${useGoogleSearch}`);
    
    const request = {
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      tools: tools,
    } as any;

    // Добавляем timeout 5 минут
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 минут

    try {
      const response = await generativeModel.generateContent(request);
      clearTimeout(timeoutId);
      
      const candidate = response.response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings;
      
      // Логирование блокировок
      if (finishReason === 'SAFETY') {
        console.error('🚫 [VertexAI] Response was BLOCKED by safety filters!');
        console.error('Safety Ratings:', JSON.stringify(safetyRatings, null, 2));
      } else if (finishReason) {
        console.log(`[VertexAI] Finish reason: ${finishReason}`);
      }
      
      if (safetyRatings && safetyRatings.length > 0) {
        console.log('[VertexAI] Safety ratings:', JSON.stringify(safetyRatings, null, 2));
      }
      
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
      
      // Verify Google Search was used
      if (groundingMetadata?.webSearchQueries?.length) {
        console.log(`✅ Google Search was used! Queries: ${groundingMetadata.webSearchQueries.length}`);
        console.log(`📚 Sources found: ${groundingMetadata.groundingChunks?.length || 0}`);
      } else {
        console.log('⚠️ Google Search was NOT used for this prompt');
      }
      
      return {
        text: generatedText,
        citations: citations,
      };
      
    } catch (error: any) {
      clearTimeout(timeoutId);
      if (error.name === 'AbortError') {
        throw new Error('Vertex AI request timeout after 5 minutes');
      }
      throw error;
    }
    
  } catch (error) {
    console.error('[VertexAI] Error calling Vertex AI API:', error);
    throw new Error('Failed to analyze company using Vertex AI. Check server logs for details.');
  }
}


