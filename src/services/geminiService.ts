import { GoogleGenAI } from '@google/genai';
import { CartoonProject, CartoonScene, CartoonCharacter, CartoonGenre, CartoonStyle, AspectRatio } from '../types/cartoon';

// Preset avatar styles
export const AVATAR_PRESETS = [
  { id: 'boy_hero', name: 'Chintu / Hero Kid', emoji: '👦', primaryColor: '#FF6B6B', secondaryColor: '#4D96FF' },
  { id: 'girl_explorer', name: 'Pinky / Maya Explorer', emoji: '👧', primaryColor: '#FF7675', secondaryColor: '#FD79A8' },
  { id: 'cute_bunny', name: 'Bunny Khargosh', emoji: '🐰', primaryColor: '#FDCB6E', secondaryColor: '#E17055' },
  { id: 'robot_friend', name: 'Robo-X 2.5', emoji: '🤖', primaryColor: '#00CEC9', secondaryColor: '#0984E3' },
  { id: 'clever_monkey', name: 'Bandar Mama', emoji: '🐒', primaryColor: '#E67E22', secondaryColor: '#D35400' },
  { id: 'friendly_dino', name: 'Dino Baby', emoji: '🦖', primaryColor: '#2ECC71', secondaryColor: '#27AE60' },
  { id: 'super_kid', name: 'Super Toon', emoji: '🦸', primaryColor: '#9B59B6', secondaryColor: '#F1C40F' },
  { id: 'wise_owl', name: 'Wise Owl Guru', emoji: '🦉', primaryColor: '#795548', secondaryColor: '#FF9800' },
  { id: 'tiger_sher', name: 'Sheru Tiger', emoji: '🐯', primaryColor: '#FF9F43', secondaryColor: '#EE5253' },
  { id: 'space_alien', name: 'Zoggy Alien', emoji: '👽', primaryColor: '#10AC84', secondaryColor: '#54A0FF' }
];

export const PRESET_CARTOON_TEMPLATES: Omit<CartoonProject, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    title: 'चतुर खरगोश और भोला भालू (The Clever Bunny)',
    synopsis: 'एक मजेदार जंगल कार्टून जहां नटखट खरगोश भालू को मीठे शहद का रास्ता बताता है और खूब मस्ती होती है!',
    genre: 'panchatantra_moral',
    style: '3d_pixar',
    language: 'hi-IN',
    aspectRatio: '16:9',
    bgMusic: 'desi_dholak_beat',
    characters: [
      {
        id: 'char_1',
        name: 'चीकू खरगोश',
        avatarId: 'cute_bunny',
        primaryColor: '#FDCB6E',
        secondaryColor: '#E17055',
        role: 'protagonist',
        voicePitch: 1.4,
        voiceRate: 1.1,
        catchphrase: 'अरे भालू दादा, देखो कमाल!',
        isLocked: true,
        lockSeed: 'LOCK-S25-101',
        outfitTraits: 'Yellow-orange vest, fluffy white bunny ears, cheerful face'
      },
      {
        id: 'char_2',
        name: 'गोलू भालू',
        avatarId: 'boy_hero',
        primaryColor: '#8D6E63',
        secondaryColor: '#5D4037',
        role: 'friend',
        voicePitch: 0.8,
        voiceRate: 0.95,
        catchphrase: 'मुझे तो बस मीठा शहद चाहिए!',
        isLocked: true,
        lockSeed: 'LOCK-S25-102',
        outfitTraits: 'Brown jacket, red cap, friendly chubby look'
      }
    ],
    scenes: [
      {
        id: 'scene_1',
        title: 'सीन 1: जंगल में मुलाकात',
        durationSeconds: 5,
        order: 1,
        bgTheme: 'jungle',
        bgAnimation: 'trees_swaying',
        characters: [
          { characterId: 'char_1', position: 'left', action: 'waving', emotion: 'excited' },
          { characterId: 'char_2', position: 'right', action: 'walking', emotion: 'happy' }
        ],
        speakerName: 'चीकू खरगोश',
        dialogueText: 'नमस्ते गोलू दादा! आज जंगल में इतनी जल्दी कहां जा रहे हो?',
        soundEffect: 'boing',
        cameraEffect: 'zoom_in',
        subtitleText: 'नमस्ते गोलू दादा! आज जंगल में इतनी जल्दी कहां जा रहे हो?'
      },
      {
        id: 'scene_2',
        title: 'सीन 2: शहद की खोज',
        durationSeconds: 5,
        order: 2,
        bgTheme: 'magic_forest',
        bgAnimation: 'sparkles',
        characters: [
          { characterId: 'char_2', position: 'center', action: 'jumping', emotion: 'excited' },
          { characterId: 'char_1', position: 'left', action: 'dancing', emotion: 'laughing' }
        ],
        speakerName: 'गोलू भालू',
        dialogueText: 'चीकू भाई! मुझे बहुत जोरों की भूख लगी है, कहीं मीठा शहद मिल जाता तो मजा आ जाता!',
        soundEffect: 'pop',
        cameraEffect: 'pan_right',
        subtitleText: 'चीकू भाई! मुझे बहुत जोरों की भूख लगी है!'
      },
      {
        id: 'scene_3',
        title: 'सीन 3: जादुई शहद का पेड़',
        durationSeconds: 6,
        order: 3,
        bgTheme: 'candy_land',
        bgAnimation: 'clouds_drifting',
        characters: [
          { characterId: 'char_1', position: 'left', action: 'flying', emotion: 'excited' },
          { characterId: 'char_2', position: 'right', action: 'dancing', emotion: 'happy' }
        ],
        speakerName: 'चीकू खरगोश',
        dialogueText: 'वो देखो दादा! सामने जादुई पेड़ पर शहद का छत्ता! चलो मिलकर दावत करते हैं!',
        soundEffect: 'magic',
        cameraEffect: 'zoom_in',
        subtitleText: 'सामने जादुई पेड़ पर शहद का छत्ता! चलो मिलकर दावत करते हैं!'
      },
      {
        id: 'scene_4',
        title: 'सीन 4: मस्ती और धमाल',
        durationSeconds: 5,
        order: 4,
        bgTheme: 'jungle',
        bgAnimation: 'sparkles',
        characters: [
          { characterId: 'char_1', position: 'center', action: 'dancing', emotion: 'happy' },
          { characterId: 'char_2', position: 'right', action: 'dancing', emotion: 'laughing' }
        ],
        speakerName: 'गोलू भालू',
        dialogueText: 'वाह चीकू! तुमने तो कमाल कर दिया! सच्ची दोस्ती और मस्ती जिंदाबाद!',
        soundEffect: 'tada',
        cameraEffect: 'shake',
        subtitleText: 'वाह चीकू! तुमने तो कमाल कर दिया! मस्ती जिंदाबाद!'
      }
    ]
  },
  {
    title: 'Super Robo & Space Bunny (स्पेस एडवेंचर)',
    synopsis: 'Super Robo and Space Bunny travel across candy galaxy to fix the flying star rocket!',
    genre: 'sci_fi_space',
    style: 'anime_chibi',
    language: 'en-US',
    aspectRatio: '16:9',
    bgMusic: 'adventure_epic',
    characters: [
      {
        id: 'char_1',
        name: 'Robo-X',
        avatarId: 'robot_friend',
        primaryColor: '#00CEC9',
        secondaryColor: '#0984E3',
        role: 'protagonist',
        voicePitch: 0.9,
        voiceRate: 1.1,
        catchphrase: 'Beep boop! All systems turbo ready!'
      },
      {
        id: 'char_2',
        name: 'Astro Bunny',
        avatarId: 'cute_bunny',
        primaryColor: '#FD79A8',
        secondaryColor: '#6C5CE7',
        role: 'sidekick',
        voicePitch: 1.5,
        voiceRate: 1.2,
        catchphrase: 'To the infinity moon carrots!'
      }
    ],
    scenes: [
      {
        id: 'scene_1',
        title: 'Scene 1: Blast Off to Star Orbit',
        durationSeconds: 5,
        order: 1,
        bgTheme: 'space_planet',
        bgAnimation: 'stars_twinkling',
        characters: [
          { characterId: 'char_1', position: 'left', action: 'flying', emotion: 'excited' },
          { characterId: 'char_2', position: 'right', action: 'jumping', emotion: 'happy' }
        ],
        speakerName: 'Robo-X',
        dialogueText: 'Hold on tight Astro Bunny! Engaging hyper-speed thrusters now!',
        soundEffect: 'whoosh',
        cameraEffect: 'zoom_in',
        subtitleText: 'Hold on tight Astro Bunny! Engaging hyper-speed thrusters now!'
      },
      {
        id: 'scene_2',
        title: 'Scene 2: The Neon Meteor Shower',
        durationSeconds: 5,
        order: 2,
        bgTheme: 'space_planet',
        bgAnimation: 'sparkles',
        characters: [
          { characterId: 'char_2', position: 'center', action: 'jumping', emotion: 'shocked' },
          { characterId: 'char_1', position: 'left', action: 'fighting', emotion: 'wink' }
        ],
        speakerName: 'Astro Bunny',
        dialogueText: 'Look out Robo-X! Glowing glitter meteors incoming from sector 9!',
        soundEffect: 'punch',
        cameraEffect: 'shake',
        subtitleText: 'Look out Robo-X! Glowing glitter meteors incoming!'
      },
      {
        id: 'scene_3',
        title: 'Scene 3: Mission Accomplished',
        durationSeconds: 5,
        order: 3,
        bgTheme: 'superhero_rooftop',
        bgAnimation: 'clouds_drifting',
        characters: [
          { characterId: 'char_1', position: 'center', action: 'dancing', emotion: 'happy' },
          { characterId: 'char_2', position: 'right', action: 'dancing', emotion: 'excited' }
        ],
        speakerName: 'Robo-X',
        dialogueText: 'We did it! The galaxy is safe and full of colorful stars!',
        soundEffect: 'tada',
        cameraEffect: 'zoom_out',
        subtitleText: 'We did it! The galaxy is safe and full of colorful stars!'
      }
    ]
  },
  {
    title: 'छोटू सुपरहीरो और खोई हुई बिल्ली (City Superhero)',
    synopsis: 'छोटू सुपरहीरो अपनी जादुई शक्तियों से शहर की सबसे ऊंची इमारत से प्यारी किट्टी को बचाता है।',
    genre: 'superhero',
    style: 'comic_book',
    language: 'hinglish',
    aspectRatio: '9:16',
    bgMusic: 'bouncy_playful',
    characters: [
      {
        id: 'char_1',
        name: 'छोटू सुपरहीरो',
        avatarId: 'super_kid',
        primaryColor: '#FF6B6B',
        secondaryColor: '#FFE66D',
        role: 'protagonist',
        voicePitch: 1.3,
        voiceRate: 1.15,
        catchphrase: 'सुपर पावर एक्टिवेट!'
      },
      {
        id: 'char_2',
        name: 'पिंकी',
        avatarId: 'girl_explorer',
        primaryColor: '#FD79A8',
        secondaryColor: '#6C5CE7',
        role: 'friend',
        voicePitch: 1.2,
        voiceRate: 1.1,
        catchphrase: 'थैंक यू सुपरहीरो!'
      }
    ],
    scenes: [
      {
        id: 'scene_1',
        title: 'सीन 1: मदद की पुकार',
        durationSeconds: 4,
        order: 1,
        bgTheme: 'city_street',
        bgAnimation: 'clouds_drifting',
        characters: [
          { characterId: 'char_2', position: 'left', action: 'waving', emotion: 'shocked' }
        ],
        speakerName: 'पिंकी',
        dialogueText: 'अरे कोई मदद करो! मेरी प्यारी बिल्ली छत पर फंस गई है!',
        soundEffect: 'whoosh',
        cameraEffect: 'zoom_in',
        subtitleText: 'अरे कोई मदद करो! मेरी बिल्ली छत पर फंस गई है!'
      },
      {
        id: 'scene_2',
        title: 'सीन 2: सुपरहीरो की एंट्री',
        durationSeconds: 5,
        order: 2,
        bgTheme: 'superhero_rooftop',
        bgAnimation: 'sparkles',
        characters: [
          { characterId: 'char_1', position: 'center', action: 'flying', emotion: 'wink' }
        ],
        speakerName: 'छोटू सुपरहीरो',
        dialogueText: 'डरो मत पिंकी! छोटू सुपरहीरो आ गया है, चुटकी में बिल्ली को नीचे लाऊंगा!',
        soundEffect: 'boing',
        cameraEffect: 'pan_left',
        subtitleText: 'डरो मत पिंकी! छोटू सुपरहीरो आ गया है!'
      },
      {
        id: 'scene_3',
        title: 'सीन 3: हैप्पी एंडिंग',
        durationSeconds: 5,
        order: 3,
        bgTheme: 'city_street',
        bgAnimation: 'clouds_drifting',
        characters: [
          { characterId: 'char_1', position: 'left', action: 'dancing', emotion: 'happy' },
          { characterId: 'char_2', position: 'right', action: 'jumping', emotion: 'excited' }
        ],
        speakerName: 'पिंकी',
        dialogueText: 'वाह सुपरहीरो! तुमने तो कमाल कर दिया! थैंक यू सो मच!',
        soundEffect: 'cheer',
        cameraEffect: 'zoom_out',
        subtitleText: 'वाह सुपरहीरो! तुमने तो कमाल कर दिया! थैंक यू!'
      }
    ]
  }
];

export async function generateCartoonWithAI(
  prompt: string,
  options: {
    genre: CartoonGenre;
    style: CartoonStyle;
    language: 'hi-IN' | 'en-US' | 'hinglish';
    aspectRatio: AspectRatio;
    sceneCount?: number;
    userApiKey?: string;
    lockedCharacters?: CartoonCharacter[];
  }
): Promise<CartoonProject> {
  const apiKey = options.userApiKey || process.env.GEMINI_API_KEY || (window as any).GEMINI_API_KEY || '';
  const lockedList = (options.lockedCharacters || []).filter(c => c.isLocked).slice(0, 10);

  // If apiKey is present, call Gemini 2.5 / 3.5
  if (apiKey && apiKey !== 'MY_GEMINI_API_KEY') {
    try {
      const ai = new GoogleGenAI({ apiKey });
      const lockedInstruction = lockedList.length > 0
        ? `
CRITICAL CHARACTER LOCK INSTRUCTION (MAX 10 LOCKED CHARACTERS):
The user has LOCKED ${lockedList.length} character(s) for 100% visual, voice, and personality consistency across the video!
You MUST include ALL of these locked characters in the "characters" array with their EXACT id, name, avatarId, primaryColor, secondaryColor, role, voicePitch, voiceRate, catchphrase, isLocked: true, lockSeed, and outfitTraits.
And you MUST feature these locked characters consistently across the scenes!
Locked Characters JSON:
${JSON.stringify(lockedList, null, 2)}
`
        : '';

      const promptInstruction = `
You are an expert Cartoon Storyboard & Video Animation Director.
The user wants to generate a complete animated cartoon video story.
Topic/Prompt: "${prompt}"
Genre: ${options.genre}
Visual Style: ${options.style}
Language: ${options.language}
Aspect Ratio: ${options.aspectRatio}
Desired Scene Count: ${options.sceneCount || 4}
${lockedInstruction}
Generate a rich, funny, entertaining cartoon video storyboard JSON.
Use characters with distinctive personalities, cute catchphrases, and lively cartoon actions.
For Hindi or Hinglish, write natural, catchy and entertaining dialogue.

Output ONLY a valid JSON object matching this exact TypeScript structure:
{
  "title": string,
  "synopsis": string,
  "genre": "${options.genre}",
  "style": "${options.style}",
  "language": "${options.language}",
  "aspectRatio": "${options.aspectRatio}",
  "bgMusic": "bouncy_playful" | "adventure_epic" | "suspense_funny" | "desi_dholak_beat" | "cute_xylophone",
  "characters": [
    {
      "id": "char_1",
      "name": string,
      "avatarId": "boy_hero" | "girl_explorer" | "cute_bunny" | "robot_friend" | "clever_monkey" | "friendly_dino" | "super_kid" | "wise_owl" | "tiger_sher" | "space_alien",
      "primaryColor": "#FF6B6B",
      "secondaryColor": "#4D96FF",
      "role": "protagonist" | "sidekick" | "villain" | "friend" | "narrator",
      "voicePitch": number (0.6 to 1.6),
      "voiceRate": number (0.9 to 1.3),
      "catchphrase": string,
      "isLocked": boolean,
      "lockSeed": string,
      "outfitTraits": string
    }
  ],
  "scenes": [
    {
      "id": "scene_1",
      "title": string,
      "durationSeconds": number (between 4 and 6),
      "order": 1,
      "bgTheme": "jungle" | "city_street" | "space_planet" | "magic_forest" | "candy_land" | "classroom" | "castle" | "beach_ocean" | "desert" | "superhero_rooftop",
      "bgAnimation": "clouds_drifting" | "stars_twinkling" | "trees_swaying" | "rain" | "bubbles" | "sparkles" | "none",
      "characters": [
        {
          "characterId": "char_1",
          "position": "left" | "center" | "right" | "floating" | "moving_left_to_right",
          "action": "talking" | "walking" | "jumping" | "dancing" | "flying" | "fighting" | "running" | "waving",
          "emotion": "happy" | "excited" | "shocked" | "angry" | "wink" | "laughing"
        }
      ],
      "speakerName": string,
      "dialogueText": string,
      "soundEffect": "boing" | "whoosh" | "laugh" | "pop" | "magic" | "tada" | "punch" | "cheer",
      "cameraEffect": "zoom_in" | "zoom_out" | "pan_left" | "pan_right" | "shake" | "static",
      "subtitleText": string
    }
  ]
}
`;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: promptInstruction,
        config: {
          responseMimeType: 'application/json'
        }
      });

      const text = response.text || '';
      const cleanJson = text.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed = JSON.parse(cleanJson);

      // Merge locked characters to guarantee 100% exact DNA & properties
      let finalCharacters: CartoonCharacter[] = [];
      if (lockedList.length > 0) {
        const aiChars: CartoonCharacter[] = Array.isArray(parsed.characters) ? parsed.characters : [];
        const extraAiChars = aiChars.filter(ac => !lockedList.some(lc => lc.id === ac.id || lc.name === ac.name));
        finalCharacters = [...lockedList, ...extraAiChars].slice(0, 10);
      } else if (parsed.characters && parsed.characters.length > 0) {
        finalCharacters = parsed.characters.slice(0, 10).map((c: CartoonCharacter, idx: number) => ({
          ...c,
          isLocked: c.isLocked ?? true,
          lockSeed: c.lockSeed || `LOCK-S25-${101 + idx}`
        }));
      } else {
        finalCharacters = [
          {
            id: 'char_1',
            name: 'Hero Toon',
            avatarId: 'cute_bunny',
            primaryColor: '#FF6B6B',
            secondaryColor: '#4D96FF',
            role: 'protagonist',
            voicePitch: 1.3,
            voiceRate: 1.1,
            catchphrase: 'Let\'s go!',
            isLocked: true,
            lockSeed: 'LOCK-S25-101'
          }
        ];
      }

      const project: CartoonProject = {
        id: 'proj_' + Date.now(),
        title: parsed.title || 'AI Cartoon Video',
        synopsis: parsed.synopsis || prompt,
        genre: parsed.genre || options.genre,
        style: parsed.style || options.style,
        language: options.language,
        aspectRatio: options.aspectRatio,
        bgMusic: parsed.bgMusic || 'bouncy_playful',
        characters: finalCharacters,
        scenes: parsed.scenes && parsed.scenes.length > 0 ? parsed.scenes : generateSmartFallbackScenes(prompt, options.language, finalCharacters),
        createdAt: Date.now(),
        updatedAt: Date.now()
      };

      return project;
    } catch (err) {
      console.warn('Gemini API call failed, generating smart custom cartoon story:', err);
    }
  }

  // Smart Offline / Instant Cartoon Generator
  return createSmartGeneratedProject(prompt, options);
}

function generateSmartFallbackScenes(prompt: string, lang: string, chars?: CartoonCharacter[]): CartoonScene[] {
  const isHindi = lang.includes('hi') || lang === 'hinglish';
  const c1 = chars?.[0]?.id || 'char_1';
  const c2 = chars?.[1]?.id || c1;
  const c1Name = chars?.[0]?.name || (isHindi ? 'चीकू' : 'Bunny Hero');
  const c2Name = chars?.[1]?.name || (isHindi ? 'गोलू' : 'Robo Friend');

  return [
    {
      id: 'scene_1',
      title: isHindi ? 'सीन 1: धमाकेदार शुरुआत' : 'Scene 1: Epic Intro',
      durationSeconds: 5,
      order: 1,
      bgTheme: 'magic_forest',
      bgAnimation: 'clouds_drifting',
      characters: [
        { characterId: c1, position: 'left', action: 'waving', emotion: 'excited' },
        { characterId: c2, position: 'right', action: 'jumping', emotion: 'happy' }
      ],
      speakerName: c1Name,
      dialogueText: isHindi ? `अरे दोस्तों! ${prompt} की नई मजेदार कहानी शुरू हो रही है!` : `Hey friends! Welcome to our fun cartoon adventure about ${prompt}!`,
      soundEffect: 'boing',
      cameraEffect: 'zoom_in',
      subtitleText: isHindi ? `मजेदार कार्टून कहानी शुरू!` : `Adventure begins!`
    },
    {
      id: 'scene_2',
      title: isHindi ? 'सीन 2: बड़ा ट्विस्ट' : 'Scene 2: The Big Challenge',
      durationSeconds: 5,
      order: 2,
      bgTheme: 'jungle',
      bgAnimation: 'sparkles',
      characters: [
        { characterId: c1, position: 'center', action: 'dancing', emotion: 'laughing' },
        { characterId: c2, position: 'left', action: 'walking', emotion: 'shocked' }
      ],
      speakerName: c2Name,
      dialogueText: isHindi ? 'अरे वाह! ये तो बहुत ही मजेदार है, चलो मिलकर धमाका करते हैं!' : 'Wow! Look at that colorful surprise! Let\'s check it out together!',
      soundEffect: 'magic',
      cameraEffect: 'shake',
      subtitleText: isHindi ? 'चलो मिलकर धमाका करते हैं!' : 'Let\'s check it out!'
    },
    {
      id: 'scene_3',
      title: isHindi ? 'सीन 3: हैप्पी एंडिंग' : 'Scene 3: Grand Celebration',
      durationSeconds: 5,
      order: 3,
      bgTheme: 'candy_land',
      bgAnimation: 'sparkles',
      characters: [
        { characterId: c1, position: 'left', action: 'jumping', emotion: 'happy' },
        { characterId: c2, position: 'right', action: 'dancing', emotion: 'excited' }
      ],
      speakerName: c1Name,
      dialogueText: isHindi ? 'देखा दोस्तों! जब साथ मिलकर काम करो तो हर मुश्किल आसान हो जाती है!' : 'Yay! Together we solved the mystery and won the day!',
      soundEffect: 'tada',
      cameraEffect: 'zoom_out',
      subtitleText: isHindi ? 'सच्ची दोस्ती और मस्ती जिंदाबाद!' : 'Friendship and Fun Forever!'
    }
  ];
}

function createSmartGeneratedProject(
  prompt: string,
  options: {
    genre: CartoonGenre;
    style: CartoonStyle;
    language: 'hi-IN' | 'en-US' | 'hinglish';
    aspectRatio: AspectRatio;
    lockedCharacters?: CartoonCharacter[];
  }
): CartoonProject {
  const isHindi = options.language === 'hi-IN' || options.language === 'hinglish';
  const lockedList = (options.lockedCharacters || []).filter(c => c.isLocked).slice(0, 10);

  // Pick matching theme & characters based on prompt keywords
  const promptLower = prompt.toLowerCase();
  let bgTheme: CartoonScene['bgTheme'] = 'magic_forest';
  let char1Avatar = 'cute_bunny';
  let char2Avatar = 'boy_hero';
  let char1Name = isHindi ? 'चीकू' : 'Toon Hero';
  let char2Name = isHindi ? 'गोलू' : 'Sunny Buddy';

  if (promptLower.includes('space') || promptLower.includes('alien') || promptLower.includes('rocket') || promptLower.includes('चाँद') || promptLower.includes('तारे')) {
    bgTheme = 'space_planet';
    char1Avatar = 'robot_friend';
    char2Avatar = 'space_alien';
    char1Name = isHindi ? 'रोबो-एक्स' : 'Robo-X';
    char2Name = isHindi ? 'एलियन ज़ोग' : 'Alien Zog';
  } else if (promptLower.includes('sher') || promptLower.includes('tiger') || promptLower.includes('jungle') || promptLower.includes('जंगल') || promptLower.includes('शेर')) {
    bgTheme = 'jungle';
    char1Avatar = 'tiger_sher';
    char2Avatar = 'clever_monkey';
    char1Name = isHindi ? 'शेरू राजा' : 'Sheru King';
    char2Name = isHindi ? 'नटखट बन्दर' : 'Naughty Monkey';
  } else if (promptLower.includes('superhero') || promptLower.includes('hero') || promptLower.includes('सुपरहीरो')) {
    bgTheme = 'superhero_rooftop';
    char1Avatar = 'super_kid';
    char2Avatar = 'robot_friend';
    char1Name = isHindi ? 'छोटू सुपरहीरो' : 'Super Kid';
    char2Name = isHindi ? 'रोबो साथी' : 'Robo Pal';
  } else if (promptLower.includes('dino') || promptLower.includes('dinosaur') || promptLower.includes('डायनासोर')) {
    bgTheme = 'jungle';
    char1Avatar = 'friendly_dino';
    char2Avatar = 'cute_bunny';
    char1Name = isHindi ? 'डिनो बेबी' : 'Dino Baby';
    char2Name = isHindi ? 'चीकू' : 'Bunny Pal';
  }

  let projectCharacters: CartoonCharacter[] = [];

  if (lockedList.length >= 2) {
    projectCharacters = lockedList;
  } else if (lockedList.length === 1) {
    const secondChar: CartoonCharacter = {
      id: 'char_' + (Date.now() + 1),
      name: char2Name,
      avatarId: char2Avatar,
      primaryColor: '#FDCB6E',
      secondaryColor: '#6C5CE7',
      role: 'friend',
      voicePitch: 0.9,
      voiceRate: 1.0,
      catchphrase: isHindi ? 'वाह भाई, क्या बात है!' : 'Awesome!',
      isLocked: true,
      lockSeed: 'LOCK-S25-102'
    };
    projectCharacters = [lockedList[0], secondChar];
  } else {
    const char1: CartoonCharacter = {
      id: 'char_1',
      name: char1Name,
      avatarId: char1Avatar,
      primaryColor: '#FF6B6B',
      secondaryColor: '#4D96FF',
      role: 'protagonist',
      voicePitch: 1.3,
      voiceRate: 1.1,
      catchphrase: isHindi ? 'चलो सब मिलकर धमाल मचाते हैं!' : 'Let\'s rock and roll!',
      isLocked: true,
      lockSeed: 'LOCK-S25-101'
    };

    const char2: CartoonCharacter = {
      id: 'char_2',
      name: char2Name,
      avatarId: char2Avatar,
      primaryColor: '#FDCB6E',
      secondaryColor: '#6C5CE7',
      role: 'friend',
      voicePitch: 0.9,
      voiceRate: 1.0,
      catchphrase: isHindi ? 'वाह भाई, क्या बात है!' : 'Awesome!',
      isLocked: true,
      lockSeed: 'LOCK-S25-102'
    };
    projectCharacters = [char1, char2];
  }

  const char1 = projectCharacters[0];
  const char2 = projectCharacters[1] || projectCharacters[0];

  // Build scene character states using all locked characters (up to 10) distributed across positions
  const positions: CartoonScene['characters'][0]['position'][] = ['left', 'right', 'center', 'floating', 'moving_left_to_right'];
  const actions1: CartoonScene['characters'][0]['action'][] = ['waving', 'walking', 'jumping', 'dancing', 'talking'];
  const actions2: CartoonScene['characters'][0]['action'][] = ['jumping', 'dancing', 'flying', 'waving', 'running'];
  const emotions: CartoonScene['characters'][0]['emotion'][] = ['excited', 'happy', 'laughing', 'wink', 'shocked'];

  const buildSceneCast = (sceneIdx: number) =>
    projectCharacters.map((c, idx) => ({
      characterId: c.id,
      position: positions[(idx + sceneIdx) % positions.length],
      action: idx % 2 === 0 ? actions1[(idx + sceneIdx) % actions1.length] : actions2[(idx + sceneIdx) % actions2.length],
      emotion: emotions[(idx + sceneIdx) % emotions.length]
    }));

  const scenes: CartoonScene[] = [
    {
      id: 'scene_1',
      title: isHindi ? 'सीन 1: नई यात्रा की शुरुआत' : 'Scene 1: The Adventure Begins',
      durationSeconds: 5,
      order: 1,
      bgTheme: bgTheme,
      bgAnimation: 'clouds_drifting',
      characters: buildSceneCast(0),
      speakerName: char1.name,
      dialogueText: isHindi 
        ? `नमस्ते दोस्तों! ${prompt || 'आज की रोमांचक कहानी'} में आपका स्वागत है!` 
        : `Hey everyone! Welcome to our cartoon story about ${prompt || 'an awesome adventure'}!`,
      soundEffect: 'boing',
      cameraEffect: 'zoom_in',
      subtitleText: isHindi ? `नमस्ते दोस्तों! कार्टून में स्वागत है!` : `Welcome to our cartoon adventure!`
    },
    {
      id: 'scene_2',
      title: isHindi ? 'सीन 2: जादुई ट्विस्ट' : 'Scene 2: Magical Discovery',
      durationSeconds: 5,
      order: 2,
      bgTheme: bgTheme === 'space_planet' ? 'space_planet' : 'candy_land',
      bgAnimation: 'sparkles',
      characters: buildSceneCast(1),
      speakerName: char2.name,
      dialogueText: isHindi 
        ? `अरे ${char1.name}! वो सामने देखो, कितना सुंदर और जादुई नजारा है!` 
        : `Look over there ${char1.name}! Look at that colorful magical discovery!`,
      soundEffect: 'magic',
      cameraEffect: 'pan_right',
      subtitleText: isHindi ? `वो सामने देखो, कितना जादुई नजारा है!` : `Look at that magical discovery!`
    },
    {
      id: 'scene_3',
      title: isHindi ? 'सीन 3: मस्ती भरा डांस' : 'Scene 3: Fun & Celebration',
      durationSeconds: 5,
      order: 3,
      bgTheme: bgTheme,
      bgAnimation: 'sparkles',
      characters: buildSceneCast(2),
      speakerName: char1.name,
      dialogueText: isHindi 
        ? 'वाह! आज तो बहुत मजा आया! वीडियो पसंद आया तो लाइक और शेयर जरूर करें!' 
        : 'Yay! We completed our cartoon mission! Don\'t forget to share the fun!',
      soundEffect: 'tada',
      cameraEffect: 'shake',
      subtitleText: isHindi ? 'वाह! आज तो बहुत मजा आया! जिंदाबाद!' : 'Yay! Mission accomplished!'
    }
  ];

  return {
    id: 'proj_' + Date.now(),
    title: prompt ? `${prompt.slice(0, 30)} - Cartoon Video` : (isHindi ? 'मजेदार कार्टून वीडियो' : 'Fun Animated Cartoon'),
    synopsis: prompt || 'An AI animated cartoon video created with ToonAI Studio.',
    genre: options.genre,
    style: options.style,
    language: options.language,
    aspectRatio: options.aspectRatio,
    bgMusic: 'bouncy_playful',
    characters: projectCharacters,
    scenes: scenes,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
}
