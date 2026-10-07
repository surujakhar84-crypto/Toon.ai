export type AspectRatio = '16:9' | '9:16' | '1:1';
export type CartoonGenre = 
  | 'funny_comedy'
  | 'adventure'
  | 'panchatantra_moral'
  | 'superhero'
  | 'sci_fi_space'
  | 'fairy_tale'
  | 'mystery'
  | 'cute_animals';

export type CartoonStyle =
  | '3d_pixar'
  | 'classic_2d'
  | 'anime_chibi'
  | 'comic_book'
  | 'claymation'
  | 'paper_cutout';

export type Emotion = 'happy' | 'excited' | 'shocked' | 'angry' | 'sad' | 'wink' | 'laughing' | 'thinking';
export type Action = 'talking' | 'walking' | 'jumping' | 'dancing' | 'flying' | 'fighting' | 'running' | 'waving' | 'idle';
export type CharacterPosition = 'left' | 'center' | 'right' | 'floating' | 'moving_left_to_right' | 'moving_right_to_left';

export type SoundEffectType = 
  | 'none'
  | 'boing'
  | 'whoosh'
  | 'laugh'
  | 'pop'
  | 'magic'
  | 'tada'
  | 'punch'
  | 'cheer';

export type BgTheme = 
  | 'jungle'
  | 'city_street'
  | 'space_planet'
  | 'magic_forest'
  | 'candy_land'
  | 'classroom'
  | 'castle'
  | 'beach_ocean'
  | 'desert'
  | 'superhero_rooftop';

export type BgAnimation = 'clouds_drifting' | 'stars_twinkling' | 'trees_swaying' | 'rain' | 'bubbles' | 'sparkles' | 'none';

export type CameraEffect = 'static' | 'zoom_in' | 'zoom_out' | 'pan_left' | 'pan_right' | 'shake' | 'ken_burns';

export type BgMusicType = 'bouncy_playful' | 'adventure_epic' | 'suspense_funny' | 'desi_dholak_beat' | 'cute_xylophone' | 'none';

export interface CartoonCharacter {
  id: string;
  name: string;
  avatarId: string; // e.g. 'boy_hero', 'girl_explorer', 'cute_bunny', 'robot_friend', 'clever_monkey', 'friendly_dino', 'super_kid', 'wise_owl'
  primaryColor: string;
  secondaryColor: string;
  role: 'protagonist' | 'sidekick' | 'villain' | 'friend' | 'narrator';
  voicePitch: number; // 0.5 to 1.8
  voiceRate: number; // 0.8 to 1.4
  catchphrase?: string;
  isLocked?: boolean; // Character Lock for 100% consistent look, voice, and DNA across scenes & AI generations (Max 10)
  lockSeed?: string; // Unique consistency DNA seed e.g. 'SEED-2.5-8941'
  outfitTraits?: string; // Locked visual traits/outfit description for AI & visual consistency
}

export interface SceneCharacterState {
  characterId: string;
  position: CharacterPosition;
  action: Action;
  emotion: Emotion;
  scale?: number; // 0.8 to 1.3
}

export interface CartoonScene {
  id: string;
  title: string;
  durationSeconds: number; // usually 3 to 7 seconds per scene
  order: number;
  bgTheme: BgTheme;
  bgAnimation: BgAnimation;
  characters: SceneCharacterState[];
  speakerName: string;
  dialogueText: string;
  narrationText?: string;
  soundEffect: SoundEffectType;
  cameraEffect: CameraEffect;
  subtitleText: string;
  visualPrompt?: string;
}

export interface CartoonProject {
  id: string;
  title: string;
  synopsis: string;
  genre: CartoonGenre;
  style: CartoonStyle;
  language: 'hi-IN' | 'en-US' | 'hinglish';
  aspectRatio: AspectRatio;
  bgMusic: BgMusicType;
  characters: CartoonCharacter[];
  scenes: CartoonScene[];
  createdAt: number;
  updatedAt: number;
}
