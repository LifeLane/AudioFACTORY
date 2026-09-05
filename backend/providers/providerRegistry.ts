/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY AI Provider Registry
 * Provides unified access and fallbacks for AI provider implementations.
 */
import { AIProvider, ProviderName, VoiceInfo } from './AIProvider';
import { GeminiProvider } from './GeminiProvider';
import { ElevenLabsProvider } from './ElevenLabsProvider';

class ProviderRegistry {
  private geminiProvider: GeminiProvider;
  private elevenLabsProvider: ElevenLabsProvider;

  constructor() {
    this.geminiProvider = new GeminiProvider();
    this.elevenLabsProvider = new ElevenLabsProvider();
  }

  public getProvider(name?: ProviderName): AIProvider {
    if (name === 'elevenlabs') {
      return this.elevenLabsProvider;
    }
    // Default provider is Gemini
    return this.geminiProvider;
  }

  public getGeminiProvider(): GeminiProvider {
    return this.geminiProvider;
  }

  public getElevenLabsProvider(): ElevenLabsProvider {
    return this.elevenLabsProvider;
  }

  public getProvidersStatus(): { name: ProviderName; configured: boolean }[] {
    return [
      { name: 'gemini', configured: this.geminiProvider.isConfigured() },
      { name: 'elevenlabs', configured: this.elevenLabsProvider.isConfigured() },
    ];
  }

  public async getAllVoices(): Promise<VoiceInfo[]> {
    const geminiVoices = await this.geminiProvider.getVoices();
    const elevenLabsVoices = await this.elevenLabsProvider.getVoices();
    return [...geminiVoices, ...elevenLabsVoices];
  }
}

export const providerRegistry = new ProviderRegistry();
