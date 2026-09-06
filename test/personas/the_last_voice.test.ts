/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * AudioFACTORY Quality Verification Test for "The Last Voice" Persona
 */
import test from 'node:test';
import assert from 'node:assert/strict';
import { INTRO_STYLES } from '../../src/personas/index';

const GOLDEN_TEST_SCRIPT = `कभी सोचा है...
किसी इंसान से आख़िरी बार मिलते हुए
हमें पता क्यों नहीं चलता
कि यह आख़िरी बार है?

उस शाम भी सब कुछ बिल्कुल सामान्य था।

तुम मेरे साथ थीं।
मैं तुम्हारे साथ चल रहा था।

और हम दोनों को क्या पता था...

कि कुछ मुलाक़ातें
जाते-जाते नहीं कहतीं
कि अब दोबारा नहीं मिलेंगे।

अगर मुझे पता होता...
तो शायद उस शाम
तुम्हारे साथ थोड़ा और बैठता।

तुम्हें जाते हुए
थोड़ा और देखता।

और शायद...
वह बात कह देता
जो आज भी मेरे भीतर पड़ी है।`;

test('The Last Voice Persona Existence & Identity Metadata', () => {
  const lastVoice = INTRO_STYLES.find(s => s.id === 'the_last_voice');
  assert.ok(lastVoice, 'The Last Voice persona must be configured in the persona index');
  
  assert.equal(lastVoice.name, 'The Last Voice', 'Persona name must match "The Last Voice"');
  assert.equal(lastVoice.category, 'south_asian', 'Category must be "south_asian"');
  assert.ok(lastVoice.languages?.includes('Hindi'), 'Languages must support Hindi');
  assert.ok(lastVoice.languages?.includes('Hindustani'), 'Languages must support Hindustani');
  
  assert.ok(lastVoice.tags?.includes('last voice'), 'Search index must support "last voice"');
  assert.ok(lastVoice.tags?.includes('voice note'), 'Search index must support "voice note"');
  assert.ok(lastVoice.tags?.includes('hindi poetry'), 'Search index must support "hindi poetry"');
  assert.ok(lastVoice.tags?.includes('हिंदी कविता'), 'Search index must support "हिंदी कविता"');
  assert.ok(lastVoice.tags?.includes('विरह'), 'Search index must support "विरह"');
});

test('The Last Voice Persona System Prompt Fidelity', () => {
  const lastVoice = INTRO_STYLES.find(s => s.id === 'the_last_voice');
  assert.ok(lastVoice);
  
  const prompt = lastVoice.systemPrompt || '';
  
  // Verify core performance characteristics in prompt
  assert.ok(prompt.includes('The Last Voice Note'), 'Prompt must refer to the signature YouTube channel');
  assert.ok(prompt.includes('not a stage performer'), 'Must enforce non-performative natural reading');
  assert.ok(prompt.includes('not a dramatic movie-trailer narrator'), 'Must warn against announcer styles');
  assert.ok(prompt.includes('not an exaggerated "shayari voice"'), 'Must avoid typical artificial poetry recitation cadences');
  
  // Verify emotional guidelines
  assert.ok(prompt.includes('vulnerability'), 'Must support vulnerable emotional space');
  assert.ok(prompt.includes('restrained'), 'Must enforce emotional restraint');
  
  // Verify specific timing/pause hierarchies
  assert.ok(prompt.includes('0.88x'), 'Must contain slower pacing limits');
  assert.ok(prompt.includes('comma: ~150–300 ms'), 'Must specify comma pause metrics');
  assert.ok(prompt.includes('final emotional statement: ~1000–1800 ms'), 'Must respect the final emotional sentence pause');
  assert.ok(prompt.includes('Respect line breaks'), 'Must explicitly instruct the model to respect line-breaks and poetry spacing');
});

test('Golden Test Script Verification', () => {
  const lastVoice = INTRO_STYLES.find(s => s.id === 'the_last_voice');
  assert.ok(lastVoice);
  
  // Verify golden test script format & markers match
  assert.equal(lastVoice.templateText, GOLDEN_TEST_SCRIPT, 'Persona template text must match the Golden Test Script exactly');
  
  // Check presence of ellipses and conjuncts in script
  assert.ok(GOLDEN_TEST_SCRIPT.includes('...'), 'Golden script must include ellipses for pacing cues');
  assert.ok(GOLDEN_TEST_SCRIPT.includes('बिल्कुल'), 'Golden script must include typical conjuncts');
  assert.ok(GOLDEN_TEST_SCRIPT.includes('मुलाक़ातें'), 'Golden script must include proper Nuqta marks for Hindustani/Urdu sounds');
});
