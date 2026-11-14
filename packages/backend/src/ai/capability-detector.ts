// ============================================================
// Aary's IDE — Model Capability Detector
// ============================================================

import type { ModelCapabilities } from '@aarys-ide/shared';

export function detectCapabilities(modelId: string, providerType: string): ModelCapabilities {
  const id = modelId.toLowerCase();

  // Default capabilities
  const caps: ModelCapabilities = {
    toolCalling: true, vision: false, audio: false, speech: false,
    structuredOutput: true, streaming: true, longContext: false,
    coding: true, reasoning: false,
  };

  // OpenAI models
  if (id.includes('gpt-4o')) { caps.vision = true; caps.audio = true; caps.longContext = true; }
  if (id.includes('gpt-4')) { caps.longContext = true; }
  if (id.startsWith('o1') || id.startsWith('o3') || id.startsWith('o4')) { caps.reasoning = true; caps.toolCalling = false; caps.streaming = false; }

  // Anthropic models
  if (id.includes('claude')) { caps.vision = true; caps.longContext = true; caps.reasoning = true; }
  if (id.includes('opus')) { caps.reasoning = true; }

  // Gemini models
  if (id.includes('gemini')) { caps.vision = true; caps.longContext = true; }
  if (id.includes('gemini-2')) { caps.audio = true; }

  // Local models
  if (providerType === 'ollama') { caps.longContext = false; caps.structuredOutput = false; }
  if (id.includes('llava') || id.includes('vision')) { caps.vision = true; }

  return caps;
}
