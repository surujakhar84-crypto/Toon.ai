import React, { useState } from 'react';
import { Sparkles, Wand2, X, Film, Compass, Smile, Flame, Rocket, Star, HeartHandshake, Lock, ShieldCheck } from 'lucide-react';
import { CartoonGenre, CartoonStyle, AspectRatio, CartoonProject, CartoonCharacter } from '../types/cartoon';
import { generateCartoonWithAI, AVATAR_PRESETS } from '../services/geminiService';
import confetti from 'canvas-confetti';

interface PromptCreationModalProps {
  isOpen: boolean;
  onClose: () => void;
  onProjectCreated: (project: CartoonProject) => void;
  language: 'hi-IN' | 'en-US' | 'hinglish';
  apiKey: string;
  currentCharacters?: CartoonCharacter[];
}

const GENRES: { id: CartoonGenre; name: string; nameHi: string; icon: string; desc: string }[] = [
  { id: 'funny_comedy', name: 'Comedy & Fun', nameHi: 'मजेदार कॉमेडी', icon: '😂', desc: 'Laugh out loud funny cartoon' },
  { id: 'adventure', name: 'Epic Adventure', nameHi: 'रोमांचक यात्रा', icon: '🗺️', desc: 'Exciting quest with heroes' },
  { id: 'panchatantra_moral', name: 'Panchatantra / Moral', nameHi: 'पंचतंत्र नीति कथा', icon: '📖', desc: 'Clever animals & life lessons' },
  { id: 'superhero', name: 'Superhero Action', nameHi: 'सुपरहीरो एक्शन', icon: '🦸', desc: 'Powers, saving the city' },
  { id: 'sci_fi_space', name: 'Space & Robots', nameHi: 'स्पेस और रोबोट्स', icon: '🚀', desc: 'Rockets, aliens and planets' },
  { id: 'fairy_tale', name: 'Magical Fairy Tale', nameHi: 'जादुई परियों की कहानी', icon: '🧚', desc: 'Castles, wizards, magic' },
  { id: 'cute_animals', name: 'Cute Animals', nameHi: 'प्यारे जानवर', icon: '🐾', desc: 'Bunnies, puppies, jungle friends' }
];

const STYLES: { id: CartoonStyle; name: string; icon: string }[] = [
  { id: '3d_pixar', name: '3D Pixar Style', icon: '✨' },
  { id: 'classic_2d', name: 'Classic 2D Cartoon', icon: '🎨' },
  { id: 'anime_chibi', name: 'Anime Chibi', icon: '🌸' },
  { id: 'comic_book', name: 'Comic Book', icon: '💥' }
];

const SUGGESTED_PROMPTS_HI = [
  'शेर और चतुर खरगोश की मजेदार कॉमेडी कार्टून कहानी',
  'छोटू सुपरहीरो और उड़ने वाली जादुई कार',
  'रोबो-एक्स और स्पेस बनी का एलियन प्लैनेट पर एडवेंचर',
  'मोटू भालू और मीठे शहद की तलाश',
  'नटखट बन्दर और मगरमच्छ की मस्ती'
];

const SUGGESTED_PROMPTS_EN = [
  'Clever Bunny and the grumpy bear find magical honey',
  'Super Kid saves the flying school bus in the city',
  'Robo-X and Space Bunny explore the Candy Galaxy',
  'Baby Dinosaur\'s first hilarious flying lesson',
  'Detective Puppy solves the case of the missing giant pizza'
];

export const PromptCreationModal: React.FC<PromptCreationModalProps> = ({
  isOpen,
  onClose,
  onProjectCreated,
  language,
  apiKey,
  currentCharacters = []
}) => {
  const [prompt, setPrompt] = useState<string>('');
  const [genre, setGenre] = useState<CartoonGenre>('funny_comedy');
  const [style, setStyle] = useState<CartoonStyle>('3d_pixar');
  const [aspectRatio, setAspectRatio] = useState<AspectRatio>('16:9');
  const [sceneCount, setSceneCount] = useState<number>(4);
  const [keepLockedCharacters, setKeepLockedCharacters] = useState<boolean>(true);
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  if (!isOpen) return null;

  const isHindi = language === 'hi-IN' || language === 'hinglish';
  const suggestedPrompts = isHindi ? SUGGESTED_PROMPTS_HI : SUGGESTED_PROMPTS_EN;
  const lockedCharacters = currentCharacters.filter(c => c.isLocked).slice(0, 10);

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    setIsGenerating(true);

    try {
      const project = await generateCartoonWithAI(prompt, {
        genre,
        style,
        language,
        aspectRatio,
        sceneCount,
        userApiKey: apiKey,
        lockedCharacters: keepLockedCharacters ? lockedCharacters : []
      });

      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });

      onProjectCreated(project);
      onClose();
    } catch (e) {
      console.error('Error generating cartoon:', e);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1b1f]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#fdf8ff] border-2 border-[#e8def8] rounded-3xl w-full max-w-2xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1c1b1f] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8def8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center text-xl shadow-sm border border-[#d0bcff]">
              🪄
            </div>
            <div>
              <h2 className="font-black text-xl italic text-[#6750a4]">
                {isHindi ? 'AI से कार्टून वीडियो बनाएं' : 'Create AI Cartoon Video'}
              </h2>
              <p className="text-xs text-[#79747e]">
                {isHindi ? 'अपना विचार लिखें और AI तुरंत पूरी एनिमेटेड कार्टून कहानी बनाएगा' : 'Describe your idea and AI will generate scenes, voices, and animated characters'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            disabled={isGenerating}
            className="p-2 rounded-2xl text-[#79747e] hover:text-[#1c1b1f] hover:bg-[#eaddff] disabled:opacity-50 transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Prompt Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#6750a4] flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{isHindi ? 'कार्टून का विषय / कहानी का विचार:' : 'Cartoon Story Topic / Idea:'}</span>
          </label>
          <textarea
            rows={3}
            placeholder={
              isHindi
                ? 'उदा. एक नटखट खरगोश और भालू की मजेदार कॉमेडी कहानी जहां वे जंगल में जादुई शहद ढूंढते हैं...'
                : 'e.g. A funny cartoon about a clever bunny and a friendly robot exploring a colorful candy galaxy...'
            }
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            className="w-full bg-white border border-[#cac4d0] rounded-2xl p-3.5 text-xs text-[#1c1b1f] placeholder:text-[#79747e] focus:outline-none focus:border-[#6750a4] focus:ring-2 focus:ring-[#6750a4]/20 resize-none transition shadow-inner"
          />

          {/* Quick Prompt Suggestions */}
          <div className="flex flex-wrap gap-1.5 mt-1">
            <span className="text-[11px] text-[#79747e] flex items-center gap-1 mr-1 font-semibold">
              💡 {isHindi ? 'सुझाव:' : 'Try:'}
            </span>
            {suggestedPrompts.slice(0, 3).map((item, idx) => (
              <button
                key={idx}
                onClick={() => setPrompt(item)}
                className="text-[11px] bg-[#f3edf7] hover:bg-[#eaddff] text-[#49454f] hover:text-[#21005d] px-3 py-1 rounded-xl border border-[#e8def8] transition truncate max-w-[220px] font-medium cursor-pointer"
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Character Lock Consistency Box (Up to 10 Characters) */}
        {lockedCharacters.length > 0 && (
          <div className="bg-[#f3edf7] border border-[#d0bcff] rounded-2xl p-3.5 flex flex-col gap-2.5">
            <div className="flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="w-7 h-7 rounded-xl bg-[#6750a4] text-white flex items-center justify-center">
                  <Lock className="w-3.5 h-3.5" />
                </span>
                <div>
                  <p className="text-xs font-extrabold text-[#21005d] flex items-center gap-1.5">
                    <span>{isHindi ? 'कैरेक्टर लॉक कंसिस्टेंसी (Character Lock)' : 'Character Lock Consistency'}</span>
                    <span className="bg-[#eaddff] text-[#6750a4] px-2 py-0.5 rounded-full text-[10px] border border-[#d0bcff]">
                      {lockedCharacters.length}/10 Locked
                    </span>
                  </p>
                  <p className="text-[10px] text-[#49454f]">
                    {isHindi
                      ? 'लॉक किए गए पात्र नए वीडियो के सभी सीन में बिल्कुल एक जैसे (Same Look & Voice) रहेंगे'
                      : 'Keep your locked characters 100% consistent in look, colors & voice across the new video'}
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setKeepLockedCharacters(!keepLockedCharacters)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold border transition cursor-pointer ${
                  keepLockedCharacters
                    ? 'bg-[#6750a4] text-white border-[#6750a4]'
                    : 'bg-white text-[#79747e] border-[#cac4d0]'
                }`}
              >
                {keepLockedCharacters
                  ? (isHindi ? '🔒 लॉक चालू है (ON)' : '🔒 Lock Active (ON)')
                  : (isHindi ? '🔓 बंद है (OFF)' : '🔓 Lock OFF')}
              </button>
            </div>

            {keepLockedCharacters && (
              <div className="flex flex-wrap gap-1.5 pt-1">
                {lockedCharacters.map((c) => {
                  const preset = AVATAR_PRESETS.find(p => p.id === c.avatarId);
                  return (
                    <span
                      key={c.id}
                      className="inline-flex items-center gap-1 px-2.5 py-1 rounded-xl bg-white border border-[#d0bcff] text-[11px] font-bold text-[#21005d] shadow-xs"
                    >
                      <span>{preset?.emoji || '🎭'}</span>
                      <span>{c.name}</span>
                      <span className="text-[9px] text-[#6750a4] font-mono">🔒</span>
                    </span>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* Genre Selection */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#49454f]">
            {isHindi ? 'शैली / विधा (Genre)' : 'Cartoon Genre'}
          </label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {GENRES.map((g) => {
              const isSelected = genre === g.id;
              return (
                <button
                  key={g.id}
                  onClick={() => setGenre(g.id)}
                  className={`p-2.5 rounded-2xl border text-left flex items-center gap-2 transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] ring-2 ring-[#6750a4]/20 shadow-sm'
                      : 'bg-white border-[#e8def8] text-[#49454f] hover:bg-[#f3edf7]'
                  }`}
                >
                  <span className="text-xl">{g.icon}</span>
                  <div className="overflow-hidden">
                    <p className="font-bold text-xs truncate">{isHindi ? g.nameHi : g.name}</p>
                    <p className="text-[10px] text-[#79747e] truncate">{g.desc}</p>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Visual Style & Aspect Ratio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {/* Style */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#49454f]">
              {isHindi ? 'विजुअल स्टाइल (Visual Style)' : 'Visual Style'}
            </label>
            <div className="grid grid-cols-2 gap-2">
              {STYLES.map((st) => (
                <button
                  key={st.id}
                  onClick={() => setStyle(st.id)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex items-center gap-2 transition cursor-pointer ${
                    style === st.id
                      ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] shadow-sm'
                      : 'bg-white border-[#e8def8] text-[#49454f] hover:bg-[#f3edf7]'
                  }`}
                >
                  <span>{st.icon}</span>
                  <span className="truncate">{st.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Aspect Ratio & Scene count */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-bold text-[#49454f]">
              {isHindi ? 'वीडियो फॉर्मेट (Aspect Ratio)' : 'Video Format'}
            </label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: '16:9', label: '16:9 YouTube', icon: '📺' },
                { id: '9:16', label: '9:16 Shorts/Reel', icon: '📱' },
                { id: '1:1', label: '1:1 Post', icon: '⏹️' }
              ].map((r) => (
                <button
                  key={r.id}
                  onClick={() => setAspectRatio(r.id as AspectRatio)}
                  className={`p-2.5 rounded-2xl border text-xs font-bold flex flex-col items-center gap-1 transition cursor-pointer ${
                    aspectRatio === r.id
                      ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] shadow-sm'
                      : 'bg-white border-[#e8def8] text-[#49454f] hover:bg-[#f3edf7]'
                  }`}
                >
                  <span className="text-base">{r.icon}</span>
                  <span className="text-[10px]">{r.label}</span>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Generate Button */}
        <div className="pt-3 border-t border-[#e8def8] flex items-center justify-between">
          <span className="text-xs text-[#79747e] font-semibold flex items-center gap-1">
            ⚡ {isHindi ? 'असीमित मुफ्त जनरेशन (Unlimited Free)' : 'Unlimited Free AI Generation'}
          </span>

          <button
            onClick={handleGenerate}
            disabled={!prompt.trim() || isGenerating}
            className="px-6 py-3 rounded-2xl bg-gradient-to-r from-[#6750a4] to-[#7f67be] hover:from-[#523e85] hover:to-[#6750a4] text-white font-extrabold text-xs sm:text-sm shadow-xl shadow-[#6750a4]/25 flex items-center gap-2 transition hover:scale-105 active:scale-95 disabled:opacity-50 disabled:hover:scale-100 cursor-pointer"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                <span>{isHindi ? 'कार्टून बन रहा है...' : 'AI is Creating Cartoon...'}</span>
              </>
            ) : (
              <>
                <Wand2 className="w-4 h-4" />
                <span>{isHindi ? 'AI से कार्टून वीडियो बनाएं' : 'Generate Full Cartoon Video'}</span>
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
};
