/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Storytelling Personas
 */

import { IntroStyle } from '../../shared/types';

export const storytellingPersonas: IntroStyle[] = [
  {
    id: 'storyteller',
    name: 'Storyteller',
    description: `A cinematic, warm, and highly immersive voice for long-form creative storytelling, novels, and narrative projects.`,
    defaultVoice: 'Zubenelgenubi',
    templateText: `The wind carried the smell of rain across the plains as Sarah reached the edge of the forgotten valley, wondering if the old legends were true.`,
    color: 'green',
    icon: 'rect',
    category: 'storytelling',
    languages: ['English'],
    useCases: ['storytelling', 'novels', 'creative writing'],
    tags: ['cinematic', 'warm', 'immersive'],
    systemPrompt: `Deliver in a cinematic, warm, and immersive storytelling voice. Use dynamic pacing, natural pauses, subtle emotional shifts, and clear narration. Avoid excessive theatricality or flat reading.`
  },
  {
    id: 'audiobook_narrator',
    name: 'Audiobook Narrator',
    description: `A warm, consistent, and deeply immersive voice that respects sentence structures, handles character distinctions naturally, and maintains flow.`,
    defaultVoice: 'Sulafat',
    templateText: `He closed the heavy leather-bound ledger, sighed deeply, and stared out the frosted window. The streets below were already dark.`,
    color: 'blue',
    icon: 'square',
    category: 'storytelling',
    languages: ['English'],
    useCases: ['audiobooks', 'novels', 'memoirs', 'long-form reading'],
    tags: ['immersive', 'consistent', 'warm'],
    systemPrompt: `Perform as a warm, consistent, and immersive audiobook narrator. Maintain character distinctions naturally, preserve narrative continuity, respect paragraph and sentence boundaries, and avoid a trailer-like or commercial delivery.`
  },
  {
    id: 'horror_narrator',
    name: 'Horror Narrator',
    description: `A quiet, controlled, and uneasy voice designed to build suspense and dramatic tension through silence and pauses.`,
    defaultVoice: 'Algenib',
    templateText: `The floorboards groaned upstairs. I knew I was alone in the house, but then, from the darkness of the hallway, came a soft, rhythmic breathing.`,
    color: 'black',
    icon: 'triangle',
    category: 'storytelling',
    languages: ['English'],
    useCases: ['horror', 'thrillers', 'mystery', 'halloween'],
    tags: ['quiet', 'controlled', 'suspenseful', 'uneasy'],
    systemPrompt: `Deliver in a quiet, controlled, suspenseful, and uneasy horror narrator voice. Emphasize silence and pauses to build tension gradually. Do not shout; let the quietness carry the chilling narrative.`
  }
];
