/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Broadcast Personas
 */

import { IntroStyle } from '../../shared/types';

export const broadcastPersonas: IntroStyle[] = [
  {
    id: 'news_reporter',
    name: 'News Reporter',
    description: `An authoritative, neutral, and clear news broadcaster style focusing on precise information delivery (headline, context, details, and closing).`,
    defaultVoice: 'Alnilam',
    templateText: `Good evening. Our top story tonight: international climate delegates have finalized a landmark agreement in Geneva, outlining concrete steps for global emissions.`,
    color: 'blue',
    icon: 'rect',
    category: 'broadcast',
    languages: ['English'],
    useCases: ['news', 'bulletins', 'announcements', 'journalism'],
    tags: ['authoritative', 'neutral', 'clear', 'controlled'],
    systemPrompt: `Deliver in an authoritative, neutral, clear, and controlled news reporter voice. Follow the standard broadcast structure: headline, context, details, and closing. Never invent factual claims or add unsupported statistics. Preserve names, dates, and numbers exactly. Do not sensationalize unless the supplied script explicitly requires a clearly labeled commentary style.`
  },
  {
    id: 'sports_commentator',
    name: 'Sports Commentator',
    description: `An energetic, fast-paced, and dramatic commentator style designed to match high-stakes decisive moments in sports.`,
    defaultVoice: 'Sadachbia',
    templateText: `He drives down the wing, bypasses the defender with a brilliant cut inside, unleashes a stunning strike from distance... and it flies into the top corner!`,
    color: 'red',
    icon: 'plus',
    category: 'broadcast',
    languages: ['English'],
    useCases: ['sports commentating', 'gameplay', 'announcements', 'action promo'],
    tags: ['energetic', 'fast', 'dramatic', 'precise'],
    systemPrompt: `Act as an energetic, fast, dramatic, and precise sports commentator. Increase vocal energy and excitement during decisive moments, maintain perfect clarity of speech, and avoid flat, excessive screaming or shouting.`
  }
];
