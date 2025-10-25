export function formatAnalysisText(rawText: string): string {
  if (!rawText) return '';
  
  // DON'T remove * and # - they are MARKDOWN syntax!
  // Just return text as-is for ReactMarkdown to process
  
  let formattedText = rawText.trim();
  
  // Only clean up excessive newlines (more than 2 in a row)
  formattedText = formattedText.replace(/\n{3,}/g, '\n\n');
  
  return formattedText;
}
