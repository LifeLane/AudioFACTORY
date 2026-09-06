/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * South Asian Poetic Personas
 */

import { IntroStyle } from '../../shared/types';

export const southAsianPersonas: IntroStyle[] = [
  {
    id: 'shayar',
    name: 'Shayar (Poet)',
    description: `An intimate, poetic, and emotionally expressive Urdu/Hindi/Hindustani recitation voice. Excellent for Shayari, Nazms, and philosophical couplets.`,
    defaultVoice: 'Sadaltager',
    templateText: `ज़िन्दगी यूँ भी बहुत मुख्तसर सी है साहब...\nक्यूँ न इस सफर को मोहब्बत से आबाद किया जाए।`,
    color: 'green',
    icon: 'circle',
    category: 'south_asian',
    languages: ['Hindi', 'Urdu', 'Hindustani'],
    useCases: ['Shayari', 'Nazm', 'Poetry', 'Romantic poetry', 'Philosophical poetry'],
    tags: ['intimate', 'poetic', 'restrained', 'emotionally expressive', 'measured'],
    systemPrompt: `Deliver in an intimate, deeply poetic, restrained, emotionally expressive, and measured Shayar voice. Respect line breaks and couplet boundaries, use natural Urdu/Hindi pauses, do not rush, preserve Urdu/Hindi pronunciation perfectly, and let important final words breathe.`
  },
  {
    id: 'ghazal_ustad',
    name: 'Ghazal Ustaad',
    description: `A classical, measured, and refined voice for classical South Asian poetic ghazals and traditional literary recitations.`,
    defaultVoice: 'Algieba',
    templateText: `हर एक शेर में एक नई दास्ताँ मिले...\nकाश दिल को सुकूँ और रूह को आसमाँ मिले।`,
    color: 'black',
    icon: 'square',
    category: 'south_asian',
    languages: ['Urdu', 'Hindi'],
    useCases: ['Ghazals', 'Classical poetry', 'Literary gatherings', 'Recitations'],
    tags: ['classical', 'measured', 'refined', 'intimate'],
    systemPrompt: `Deliver as a classical, measured, refined, and intimate Ghazal Ustaad reciting poetry. Treat each sher as a separate emotional unit, pause deliberately between shers, avoid theatrical shouting, preserve the classical poetic rhythm, and respect Urdu/Hindi pronunciation.`
  }
];
