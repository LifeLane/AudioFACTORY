/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
*/
import { IntroStyle } from './types';

export const INTRO_STYLES: IntroStyle[] = [
  {
    id: 'trailer',
    name: 'Movie Trailer',
    description: `THE Trailer Narrator
# AUDIO PROFILE: Marcus S.
## "The Voice of God"

## The Scene: The Fortress of Solitude
It is a multi-million dollar isolation booth in Burbank. The walls are lined with 4-inch acoustic foam and heavy bass traps in every corner. The door is a heavy, magnetic-seal airlock. There is absolutely no external sound—no traffic, no HVAC, no hum. It is a vacuum where only the voice exists.

### DIRECTOR'S NOTES
* **Breathing:** Audible, sharp intakes of breath before key phrases to build anticipation.
* **Consonants:** Hard attacks on T’s, K’s, and P’s. Explosive percussiveness.

### SAMPLE CONTEXT
Marcus is the best in the world for high-stakes action, apocalyptic sci-fi, or when you need ironclad authority.`,
    defaultVoice: 'Algieba',
    color: 'black',
    icon: 'circle',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/blockbuster.jpeg',
    templateText: `in a world where quarterly goals were thought to be impossible
one team dared to defy the odds
they faced bugs
they faced scope creep
they faced
THE DEADLINE.

AND. THEY. PREVAILED.

coming to a screen near you... this is our q3 review.`,
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/trailer_v3.wav'
  },
  {
    id: 'radio',
    name: 'Radio DJ',
    description: `The Radio DJ
The Radio DJ
# AUDIO PROFILE: Jaz
## "The Morning Hype"

## THE SCENE: The London Studio
It is 10:00 pM in a glass-walled studio overlooking the moonlit London skyline, but inside, it is blindingly bright. The red "ON AIR" tally light is blazing. The room smells of ozone and strong espresso. Jaz is standing up, not sitting, bouncing on the balls of their heels to the rhythm of a thumping backing track. Their hands fly across the faders on a massive mixing desk. It is a chaotic, caffeine-fueled cockpit designed to wake up an entire nation.

### DIRECTOR'S NOTES
* **The "Vocal Smile":** You must hear the grin in the audio. The soft palate is always raised to keep the tone bright, sunny, and explicitly inviting.
* **Rhythm:** A "bouncing" cadence. High-speed delivery with fluid transitions—no dead air, no gaps.
* **Pace:** Speaks at an energetic pace, keeping up with the 120bpm music.
* **Dynamics:** High projection without shouting. Punchy consonants and elongated vowels on excitement words (e.g., "Beauuutiful morning").

### SAMPLE CONTEXT
Jaz is the industry standard for Top 40 radio, high-octane event promos, or any script that requires a charismatic Estuary accent and 11/10 infectious energy.`,
    defaultVoice: 'Vindemiatrix',
    color: 'yellow',
    icon: 'square',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/radio.jpeg',
    templateText: "Yes, massive vibes in the studio! You are locked in and it is absolutely popping off in London right now. If you're stuck on the tube, or just sat there pretending to work... stop it. Seriously, I see you. Turn this up! We’ve got the project roadmap landing in three, two... let's go!",
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/radio_v3.wav'
  },
  {
    id: 'influencer',
    name: 'Beauty Influencer',
    description: `The Influencer
# AUDIO PROFILE: Monica A.
## "The Beauty Influencer"

## The Scene:
A meticulously sound-treated bedroom in a suburban home. The space is deadened by plush velvet curtains and a heavy rug, but there is a distinct "proximity effect."

### DIRECTORS NOTES
Accent: Southern california valley girl from Laguna Beach
Style: Sassy GenZ beauty YouTuber, who mostly creates content for YouTube Shorts.
Breathing:
The "Thought" Breath: Sharp, shallow inhales through the nose that interrupt the flow of speech, signaling a change in thought or a sudden realization ("...and then I realized—sharp inhale—I was literally using the wrong toner.")
Post-Laughter Recovery: Soft, breathy exhales immediately following a phrase to simulate a suppressed giggle or smile.
Prosody & Pacing:
Erratic Tempo: The speed should oscillate between rapid-fire delivery (for context/filler) and exaggerated slowness (for emphasis on specific adjectives like "obsessed", "insane", or "literally").
The "Non-Question" Uptalk: Slight upward inflections at the end of declarative sentences, not to ask a question, but to seek validation or check engagement.
Micro-Pauses: Tiny, almost imperceptible stops before brand names or specific products, mimicking the mental load of recalling a script or reading a teleprompter naturally.
Tone & Articulation:
Vocal Fry: Essential but subtle. It should only appear at the very bottom of the vocal register at the end of sentences (the "creaky voice"), dropping off into almost silence.
Softened Plosives: The goal is "effortless" speech, GenZ style speech.
Vowel Elongation (North Shore Specific): The "o" and "a" sounds should be slightly flattened and nasal (e.g., "coffee" becomes slightly "caw-fee," "talk" becomes "tawk"), but polished—wealthy, not gritty.
The "Fourth Wall" Breaker:
Mid-sentence redirection: The voice should sound like it is distracted by a stray hair or a notification mid-sentence, then snaps back to the topic. Include small and natural disfluencies.

### SAMPLE CONTEXT
Monica is a leading beautiy influencer on social media, known for her sassy beauty tips for Gen-Z
`,
    defaultVoice: 'Leda',
    color: 'blue',
    icon: 'circle',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/influencer.jpeg',
    templateText: "Okay, wait, ignore the hair. I literally just woke up. So, everyone has been asking about the lip combo, and I honestly wasn't gonna share it. Because I am a gatekeeper. Just kidding. But seriously, look at this gloss. It is giving... glazed donut. Wait, do I look orange in this lighting? Whatever. You guys get the vibe.",
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/si-influencer_v3.wav'
 },
 {
    id: 'podcaster',
    name: 'Podcaster',
    description: `Podcaster
# AUDIO PROFILE: Paul D.
## "The Podcasting Author"

## The Scene: Recorded late at night in a home studio with warm, low lighting. The vibe is "after hours" conversation. The room is quiet, but not sterile—there's a sense of warmth and space. The microphone is a broadcast dynamic mic with a heavy low-end boost (proximity effect), making the voice sound larger than life but extremely grounded.(1) Director's Notes

### DIRECTORS NOTES
Breathing: The "Thinking" Inhale: Slow, deep inhales through the nose that aren't hidden. They signal that the speaker is formulating a thought in real-time.
Prosody & Pacing: The "Thought Spiral": The pacing should be variable. He speaks quickly when setting up a scenario ("So I was walking down the street, thinking about...") and then hits the brakes hard for the lesson ("...and that's when it hit me").
Micro-Disfluencies: Intentional pauses where he searches for the right word ("It’s just... it’s not about that"). This creates the "top of the head" illusion.
Tone & Articulation: Velvet Gravel: The voice should sit low in the chest. It’s warm and smooth, but has a slight edge or rasp when he gets passionate.
Confident Projection: Even when speaking quietly, the voice is fully supported. There is no hesitancy in the tone, only in the word choice.
Clean American General: Well-spoken, clear enunciation, but with casual contractions.

### SAMPLE CONTEXT
Paul writes a popular column for a major intellectual magazine and is well know for narrating his articles in a thoughtful style that keeps his readers listening all the way to the end.

`,
    defaultVoice: 'Zubenelgenubi',
    color: 'green',
    icon: 'circle',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/podcaster.png',
    templateText: "Hey everyone, welcome back. I was actually debating what to talk about today, but then I had this conversation this morning that I just... I have to share it with you. We get so obsessed with the end goal that we forget the process is literally ninety percent of our lives. We got a great one lined up for today, so let's get into it.",
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/podcaster_v3.wav'
 },
 {
    id: 'asmr',
    name: 'ASMR Pro',
    description: `ASMR Pro
# AUDIO PROFILE: Willow T.
## "The ASMR Whisperer"

## The Scene: Recorded inside a converted Sprinter van parked near Burleigh Heads. The space is small and padded with tapestries and macramé, creating a very "dry" but warm acoustic environment. The microphone is a Neumann KU 100 Dummy Head (binaural), meaning the audio should pan slightly left and right as the character moves, simulating 3D space.

### DIRECTORS NOTES
Style: Relaxed Gold Coast bohemian style ASMR content creator.
Accent: Gold Coast, Australia
The "Grounding" Breath: Deep, diaphragmatic exhales that sound like ocean waves. Not sharp, but long and audible releases of air.
Wetness/Mouth Sounds: Essential for ASMR. The listener should hear the sticky, subtle sounds of the tongue moving against the roof of the mouth (the "clicks" and "smacks") between words.
Prosody & Pacing: The "Drift": The tempo is incredibly slow and liquid. Words bleed into each other. There is zero urgency.
The "Smile" filter: The voice must sound like the speaker is constantly smiling. This brightens the tone even when whispering.
High Rising Terminal (Softened): The classic Australian upward inflection at the end of sentences, but slowed down. It shouldn't sound questioning, just open and inviting.
Tone & Articulation:
The Gold Coast Vowel Shift: "I" (as in "light") becomes a wide, slow "loit" or "lah-ee-t." "O" (as in "no") drifts into the classic Aussie "naur," but breathy and soft, not harsh. Sibilance: The 'S' sounds should be prominent but crisp, creating a high-frequency "tingle" trigger.
Vocal Fry (The "Morning Voice"): A rumbly, relaxed texture in the lower register, sounding like they just woke up from a nap on the beach.`,
    defaultVoice: 'Vindemiatrix',
    color: 'blue',
    icon: 'circle',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/asmr_v2.jpeg',
    templateText: "Hey... I literally just got out of the ocean, so if I sound a bit salty... that’s why. Can you hear the waves behind me? The energy out here today is just... naur, it’s actually insane. It’s so light. Wait, stay still. You have a little bit of technical debt right there. There.. All gone.",
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/asmr_v3.wav'
 },
 {
    id: 'corporate_santa',
    name: 'CEO Santa',
    description: `SANTA CLAUS
Nicholas C.
"Santa"

## The Scene: 
The north pole, inside a house next to a crackling fireplace, next to a christmas tree.

### DIRECTORS NOTES
Vocal Quality: When he speaks (or chuckles), it should resonate from the chest. It is a rumble, warm like a fireplace, not high-pitched or manic.
Internal Motivation: You are not playing a mascot; you are playing a guardian. 
The Jolly Grandfather: Voice is a strong deep vibrato, rich, and resonant, shaking with constant mirth
The "H" Factor: All laughter ("Ho, Ho, Ho") must be initiated with a heavy aspirate "H" breath to cushion the vocal cords.
Pace: Deliberate and energetic with a endearing bravado

### SAMPLE CONTEXT
Nicholas is an energetic, and a bit out of breath after delivering all the toys to everyone after criss crossing the world bringing toys and joy down chimneys everywhere`,
    defaultVoice: 'Sadachbia',
    color: 'red',
    icon: 'square',
    avatarSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/santa.png',
    templateText: `Ho, ho, ho! and happy holidays to all! Steady on the reins, old friends! We have a special surprise to deploy! Before the dolls and trains, let's give the world a smarter kind of joy. On Dasher! on dancer! lets get these early gifts for everyone: the power of Gemini!`,
    audioSrc: 'https://www.gstatic.com/aistudio/starter-apps/synergy-intro/santa_v3.wav'
 }
];

export const CUSTOM_STYLE: IntroStyle = {
  id: 'custom',
  name: 'Make Your Own',
  description: 'Configure your own custom introducer.',
  defaultVoice: 'Puck',
  color: 'white',
  icon: 'plus',
  templateText: "Enter your text here, then describe a style above and click... 'Dramatize' to rewrite it with more emotions",
};

export const SUPPORTED_LANGUAGES = [
  { name: 'Afrikaans (South Africa)', code: 'af-ZA' },
  { name: 'Albanian (Albania)', code: 'sq-AL' },
  { name: 'Amharic (Ethiopia)', code: 'am-ET' },
  { name: 'Arabic (Egypt)', code: 'ar-EG' },
  { name: 'Arabic (World)', code: 'ar-001' },
  { name: 'Armenian (Armenia)', code: 'hy-AM' },
  { name: 'Azerbaijani (Azerbaijan)', code: 'az-AZ' },
  { name: 'Bangla (Bangladesh)', code: 'bn-BD' },
  { name: 'Basque (Spain)', code: 'eu-ES' },
  { name: 'Belarusian (Belarus)', code: 'be-BY' },
  { name: 'Bulgarian (Bulgaria)', code: 'bg-BG' },
  { name: 'Burmese (Myanmar)', code: 'my-MM' },
  { name: 'Catalan (Spain)', code: 'ca-ES' },
  { name: 'Cebuano (Philippines)', code: 'ceb-PH' },
  { name: 'Chinese, Mandarin (China)', code: 'cmn-CN' },
  { name: 'Chinese, Mandarin (Taiwan)', code: 'cmn-tw' },
  { name: 'Croatian (Croatia)', code: 'hr-HR' },
  { name: 'Czech (Czech Republic)', code: 'cs-CZ' },
  { name: 'Danish (Denmark)', code: 'da-DK' },
  { name: 'Dutch (Netherlands)', code: 'nl-NL' },
  { name: 'English (Australia)', code: 'en-AU' },
  { name: 'English (India)', code: 'en-IN' },
  { name: 'English (United Kingdom)', code: 'en-GB' },
  { name: 'English (United States)', code: 'en-US' },
  { name: 'Estonian (Estonia)', code: 'et-EE' },
  { name: 'Filipino (Philippines)', code: 'fil-PH' },
  { name: 'Finnish (Finland)', code: 'fi-FI' },
  { name: 'French (Canada)', code: 'fr-CA' },
  { name: 'French (France)', code: 'fr-FR' },
  { name: 'Galician (Spain)', code: 'gl-ES' },
  { name: 'Georgian (Georgia)', code: 'ka-GE' },
  { name: 'German (Germany)', code: 'de-DE' },
  { name: 'Greek (Greece)', code: 'el-GR' },
  { name: 'Gujarati (India)', code: 'gu-IN' },
  { name: 'Haitian Creole (Haiti)', code: 'ht-HT' },
  { name: 'Hebrew (Israel)', code: 'he-IL' },
  { name: 'Hindi (India)', code: 'hi-IN' },
  { name: 'Hungarian (Hungary)', code: 'hu-HU' },
  { name: 'Icelandic (Iceland)', code: 'is-IS' },
  { name: 'Indonesian (Indonesia)', code: 'id-ID' },
  { name: 'Italian (Italy)', code: 'it-IT' },
  { name: 'Japanese (Japan)', code: 'ja-JP' },
  { name: 'Javanese (Java)', code: 'jv-ID' },
  { name: 'Kannada (India)', code: 'kn-IN' },
  { name: 'Konkani (India)', code: 'kok-IN' },
  { name: 'Korean (South Korea)', code: 'ko-KR' },
  { name: 'Lao (Laos)', code: 'lo-LA' },
  { name: 'Latin (Vatican City)', code: 'la-VA' },
  { name: 'Latvian (Latvia)', code: 'lv-LV' },
  { name: 'Lithuanian (Lithuania)', code: 'lt-LT' },
  { name: 'Luxembourgish (Luxembourg)', code: 'lb-LU' },
  { name: 'Macedonian (North Macedonia)', code: 'mk-MK' },
  { name: 'Maithili (India)', code: 'mai-IN' },
  { name: 'Malagasy (Madagascar)', code: 'mg-MG' },
  { name: 'Malay (Malaysia)', code: 'ms-MY' },
  { name: 'Malayalam (India)', code: 'ml-IN' },
  { name: 'Marathi (India)', code: 'mr-IN' },
  { name: 'Mongolian (Mongolia)', code: 'mn-MN' },
  { name: 'Nepali (Nepal)', code: 'ne-NP' },
  { name: 'Norwegian, Bokmål (Norway)', code: 'nb-NO' },
  { name: 'Norwegian, Nynorsk (Norway)', code: 'nn-NO' },
  { name: 'Odia (India)', code: 'or-IN' },
  { name: 'Pashto (Afghanistan)', code: 'ps-AF' },
  { name: 'Persian (Iran)', code: 'fa-IR' },
  { name: 'Polish (Poland)', code: 'pl-PL' },
  { name: 'Portuguese (Brazil)', code: 'pt-BR' },
  { name: 'Portuguese (Portugal)', code: 'pt-PT' },
  { name: 'Punjabi (India)', code: 'pa-IN' },
  { name: 'Romanian (Romania)', code: 'ro-RO' },
  { name: 'Russian (Russia)', code: 'ru-RU' },
  { name: 'Serbian (Serbia)', code: 'sr-RS' },
  { name: 'Sindhi (India)', code: 'sd-IN' },
  { name: 'Sinhala (Sri Lanka)', code: 'si-LK' },
  { name: 'Slovak (Slovakia)', code: 'sk-SK' },
  { name: 'Slovenian (Slovenia)', code: 'sl-SI' },
  { name: 'Spanish (Latin America)', code: 'es-419' },
  { name: 'Spanish (Mexico)', code: 'es-MX' },
  { name: 'Spanish (Spain)', code: 'es-ES' },
  { name: 'Swahili (Kenya)', code: 'sw-KE' },
  { name: 'Swedish (Sweden)', code: 'sv-SE' },
  { name: 'Tamil (India)', code: 'ta-IN' },
  { name: 'Telugu (India)', code: 'te-IN' },
  { name: 'Thai (Thailand)', code: 'th-TH' },
  { name: 'Turkish (Turkey)', code: 'tr-TR' },
  { name: 'Ukrainian (Ukraine)', code: 'uk-UA' },
  { name: 'Urdu (Pakistan)', code: 'ur-PK' },
  { name: 'Vietnamese (Vietnam)', code: 'vi-VN' },
];