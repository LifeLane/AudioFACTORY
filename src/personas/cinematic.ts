/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Cinematic Personas
 */

import { IntroStyle } from '../../shared/types';

export const cinematicPersonas: IntroStyle[] = [
  {
    id: 'documentary_narrator',
    name: 'Documentary Narrator',
    description: `A calm, intelligent, and authoritative cinematic voice ideal for history, science, geography, technology, nature, and documentary scripts. This persona communicates depth and precision with cinematic gravitas.`,
    defaultVoice: 'Sadaltager',
    templateText: `Deep in the heart of the ancient forest, a silent sentinel has stood for over two thousand years, witnessing the rise and fall of empires, untouched by the passage of time.`,
    color: 'black',
    icon: 'circle',
    category: 'cinematic',
    languages: ['English'],
    useCases: ['history', 'science', 'geography', 'technology', 'nature', 'documentary'],
    tags: ['calm', 'intelligent', 'cinematic', 'authoritative'],
    systemPrompt: `Deliver in a calm, intelligent, cinematic, and authoritative documentary narrator voice. Maintain dynamic pacing with natural pauses, subtle emotional shifts, and clear narration. Speak with gravitas and avoid excessive theatricality or dramatic over-projection.`
  }
];
