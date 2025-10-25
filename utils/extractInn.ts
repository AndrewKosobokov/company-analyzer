/**
 * Extract Russian company INN (tax identification number) from text
 * INN format: 10 or 12 digits
 */
export function extractInn(text: string): string | null {
  if (!text) return null;

  // Pattern 1: "ИНН: 123456789012" or "ИНН 123456789012" (12 digits first)
  const innPattern1 = /ИНН[:\s]+(\d{12})/i;
  const match1 = text.match(innPattern1);
  if (match1) {
    return match1[1];
  }

  // Pattern 1b: "ИНН: 1234567890" or "ИНН 1234567890" (10 digits)
  const innPattern1b = /ИНН[:\s]+(\d{10})/i;
  const match1b = text.match(innPattern1b);
  if (match1b) {
    return match1b[1];
  }

  // Pattern 2: "ИНН компании: 123456789012" (12 digits first)
  const innPattern2 = /ИНН\s+компании[:\s]+(\d{12})/i;
  const match2 = text.match(innPattern2);
  if (match2) {
    return match2[1];
  }

  // Pattern 2b: "ИНН компании: 1234567890" (10 digits)
  const innPattern2b = /ИНН\s+компании[:\s]+(\d{10})/i;
  const match2b = text.match(innPattern2b);
  if (match2b) {
    return match2b[1];
  }

  // Pattern 3: Standalone 12 digit number after "ИНН"
  const innPattern3 = /ИНН[^\d]*(\d{12})/i;
  const match3 = text.match(innPattern3);
  if (match3) {
    return match3[1];
  }

  // Pattern 3b: Standalone 10 digit number after "ИНН"
  const innPattern3b = /ИНН[^\d]*(\d{10})/i;
  const match3b = text.match(innPattern3b);
  if (match3b) {
    return match3b[1];
  }

  // Pattern 4: Look for explicit INN section with markdown (12 digits first)
  const innPattern4 = /\*\*ИНН\*\*[:\s]*(\d{12})/i;
  const match4 = text.match(innPattern4);
  if (match4) {
    return match4[1];
  }

  // Pattern 4b: Look for explicit INN section with markdown (10 digits)
  const innPattern4b = /\*\*ИНН\*\*[:\s]*(\d{10})/i;
  const match4b = text.match(innPattern4b);
  if (match4b) {
    return match4b[1];
  }

  // Pattern 5: Any standalone number (less reliable, use as fallback)
  // Only use if explicitly labeled as INN nearby (12 digits first)
  const innPattern5 = /(?:инн|inn)[^\d]{0,20}(\d{12})/i;
  const match5 = text.match(innPattern5);
  if (match5) {
    return match5[1];
  }

  // Pattern 5b: Any standalone number (less reliable, use as fallback)
  // Only use if explicitly labeled as INN nearby (10 digits)
  const innPattern5b = /(?:инн|inn)[^\d]{0,20}(\d{10})/i;
  const match5b = text.match(innPattern5b);
  if (match5b) {
    return match5b[1];
  }

  return null;
}

/**
 * Validate Russian INN
 * @param inn - INN string (10 or 12 digits)
 * @returns true if INN format is valid
 */
export function validateInn(inn: string): boolean {
  if (!inn) return false;
  
  // Must be exactly 10 or 12 digits
  if (!/^\d{10}$|^\d{12}$/.test(inn)) {
    return false;
  }

  return true;
}

/**
 * Extract and validate INN from text
 * @param text - Text to search for INN
 * @returns Valid INN or null
 */
export function extractAndValidateInn(text: string): string | null {
  const inn = extractInn(text);
  
  if (!inn) return null;
  
  if (!validateInn(inn)) {
    console.log('Invalid INN format:', inn);
    return null;
  }
  
  return inn;
}
