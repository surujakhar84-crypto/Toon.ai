import React, { useState } from 'react';
import { Plus, Trash2, Volume2, Sparkles, UserCheck, Lock, Unlock, ShieldCheck, RefreshCw, AlertCircle } from 'lucide-react';
import { CartoonCharacter, CartoonProject } from '../types/cartoon';
import { AVATAR_PRESETS } from '../services/geminiService';
import { audioEngine } from '../services/audioEngine';

interface CharacterManagerProps {
  project: CartoonProject;
  onUpdateProject: (updated: CartoonProject) => void;
  language: string;
}

export const MAX_LOCKED_CHARACTERS = 10;

export const CharacterManager: React.FC<CharacterManagerProps> = ({
  project,
  onUpdateProject,
  language
}) => {
  const [selectedCharId, setSelectedCharId] = useState<string>(project.characters[0]?.id || '');
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const isHindi = language === 'hi-IN' || language === 'hinglish';

  const selectedChar = project.characters.find(c => c.id === selectedCharId) || project.characters[0];
  const lockedCount = project.characters.filter(c => c.isLocked).length;

  const showToast = (msg: string) => {
    setStatusMessage(msg);
    setTimeout(() => setStatusMessage(null), 3000);
  };

  const handleUpdateChar = (fields: Partial<CartoonCharacter>) => {
    if (!selectedChar) return;
    const updated = project.characters.map(c => c.id === selectedChar.id ? { ...c, ...fields } : c);
    onUpdateProject({
      ...project,
      characters: updated,
      updatedAt: Date.now()
    });
  };

  const handleToggleLock = (char: CartoonCharacter, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const currentlyLocked = Boolean(char.isLocked);

    if (!currentlyLocked && lockedCount >= MAX_LOCKED_CHARACTERS) {
      showToast(
        isHindi
          ? `अधिकतम ${MAX_LOCKED_CHARACTERS} कैरेक्टर ही एक वीडियो में लॉक किए जा सकते हैं!`
          : `Maximum ${MAX_LOCKED_CHARACTERS} characters can be locked in one video!`
      );
      return;
    }

    const nextLocked = !currentlyLocked;
    const lockSeed = char.lockSeed || `LOCK-S25-${Math.floor(100 + Math.random() * 900)}`;

    const updated = project.characters.map(c =>
      c.id === char.id
        ? { ...c, isLocked: nextLocked, lockSeed }
        : c
    );

    onUpdateProject({
      ...project,
      characters: updated,
      updatedAt: Date.now()
    });

    showToast(
      nextLocked
        ? (isHindi ? `🔒 "${char.name}" लॉक हो गया! अब यह पूरे वीडियो में एक जैसा (Consistent) रहेगा।` : `🔒 "${char.name}" locked for 100% video consistency!`)
        : (isHindi ? `🔓 "${char.name}" अनलॉक किया गया।` : `🔓 "${char.name}" unlocked.`)
    );
  };

  const handleLockAll = () => {
    let count = 0;
    const updated = project.characters.map((c, idx) => {
      if (count < MAX_LOCKED_CHARACTERS) {
        count++;
        return {
          ...c,
          isLocked: true,
          lockSeed: c.lockSeed || `LOCK-S25-${101 + idx}`
        };
      }
      return { ...c, isLocked: false };
    });

    onUpdateProject({
      ...project,
      characters: updated,
      updatedAt: Date.now()
    });

    showToast(
      isHindi
        ? `🔒 सभी ${count} कैरेक्टर्स एक साथ लॉक कर दिए गए (Consistent Mode Active)!`
        : `🔒 Locked ${count} characters for full video consistency!`
    );
  };

  const handleSyncLockedToAllScenes = () => {
    const lockedChars = project.characters.filter(c => c.isLocked).slice(0, MAX_LOCKED_CHARACTERS);
    if (lockedChars.length === 0) {
      showToast(
        isHindi
          ? 'कृपया पहले कम से कम 1 कैरेक्टर को लॉक (Lock) करें!'
          : 'Please lock at least 1 character first!'
      );
      return;
    }

    const positions: ('left' | 'center' | 'right' | 'floating' | 'moving_left_to_right')[] = [
      'left', 'right', 'center', 'floating', 'moving_left_to_right'
    ];

    const updatedScenes = project.scenes.map((scene, sIdx) => {
      const existingCharIds = new Set(scene.characters.map(sc => sc.characterId));
      const newSceneChars = [...scene.characters];

      lockedChars.forEach((lc, lIdx) => {
        if (!existingCharIds.has(lc.id)) {
          newSceneChars.push({
            characterId: lc.id,
            position: positions[(lIdx + sIdx) % positions.length],
            action: lIdx % 2 === 0 ? 'talking' : 'waving',
            emotion: 'happy'
          });
        }
      });

      return {
        ...scene,
        characters: newSceneChars
      };
    });

    onUpdateProject({
      ...project,
      scenes: updatedScenes,
      updatedAt: Date.now()
    });

    showToast(
      isHindi
        ? `✨ सभी ${lockedChars.length} लॉक किए गए कैरेक्टर्स को हर सीन में सिंक (Consistent) कर दिया गया है!`
        : `✨ Synced all ${lockedChars.length} locked characters across every scene!`
    );
  };

  const handleAddCharacter = () => {
    if (project.characters.length >= MAX_LOCKED_CHARACTERS) {
      showToast(
        isHindi
          ? `एक वीडियो में अधिकतम ${MAX_LOCKED_CHARACTERS} कैरेक्टर लॉक स्लॉट्स पूरे हो चुके हैं!`
          : `Maximum ${MAX_LOCKED_CHARACTERS} character slots reached for this video!`
      );
      return;
    }

    const newId = 'char_' + Date.now();
    const nextIndex = project.characters.length;
    const preset = AVATAR_PRESETS[nextIndex % AVATAR_PRESETS.length];
    const shouldAutoLock = lockedCount < MAX_LOCKED_CHARACTERS;

    const newChar: CartoonCharacter = {
      id: newId,
      name: isHindi ? `${preset.name.split('/')[0].trim()} ${nextIndex + 1}` : `${preset.name.split('/')[0].trim()} ${nextIndex + 1}`,
      avatarId: preset.id,
      primaryColor: preset.primaryColor,
      secondaryColor: preset.secondaryColor,
      role: nextIndex === 0 ? 'protagonist' : 'friend',
      voicePitch: 1.2,
      voiceRate: 1.05,
      catchphrase: isHindi ? 'मस्ती शुरू!' : 'Let\'s roll!',
      isLocked: shouldAutoLock,
      lockSeed: `LOCK-S25-${101 + nextIndex}`,
      outfitTraits: `Consistent ${preset.name} signature outfit & colors`
    };

    const updated = [...project.characters, newChar];
    onUpdateProject({
      ...project,
      characters: updated,
      updatedAt: Date.now()
    });
    setSelectedCharId(newId);

    showToast(
      isHindi
        ? `🔒 नया पात्र "${newChar.name}" जोड़ा और लॉक किया गया (${lockedCount + (shouldAutoLock ? 1 : 0)}/${MAX_LOCKED_CHARACTERS})`
        : `🔒 Added & Locked "${newChar.name}" (${lockedCount + (shouldAutoLock ? 1 : 0)}/${MAX_LOCKED_CHARACTERS})`
    );
  };

  const handleDeleteCharacter = (charId: string) => {
    if (project.characters.length <= 1) return;
    const target = project.characters.find(c => c.id === charId);
    if (target?.isLocked) {
      showToast(
        isHindi
          ? 'यह कैरेक्टर लॉक (Locked) है! हटाने से पहले इसे अनलॉक करें।'
          : 'This character is Locked! Unlock it first before deleting.'
      );
      return;
    }
    const updated = project.characters.filter(c => c.id !== charId);
    onUpdateProject({
      ...project,
      characters: updated,
      updatedAt: Date.now()
    });
    setSelectedCharId(updated[0]?.id || '');
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-[#e8def8] shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center font-bold text-base border border-[#d0bcff] shadow-sm">
            🔒
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="font-black text-[#1c1b1f] text-sm sm:text-base italic">
                {isHindi ? 'कैरेक्टर लॉक और कास्ट (Character Lock Studio)' : 'Character Lock & Cast Manager'}
              </h3>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-[#6750a4] text-white shadow-sm">
                <Lock className="w-3 h-3" />
                <span>{lockedCount} / {MAX_LOCKED_CHARACTERS} Locked</span>
              </span>
            </div>
            <p className="text-xs text-[#79747e]">
              {isHindi
                ? 'एक वीडियो में 10 कैरेक्टर तक लॉक करें ताकि हर सीन में चेहरा, कपड़े और आवाज 100% एक जैसी (Consistent) रहे'
                : 'Lock up to 10 characters per video to keep their face, outfit, colors, and voice 100% consistent across all scenes'}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleLockAll}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#eaddff] hover:bg-[#d0bcff] text-[#21005d] font-bold text-xs border border-[#d0bcff] transition cursor-pointer shadow-sm"
            title="Lock all characters for consistency"
          >
            <ShieldCheck className="w-4 h-4 text-[#6750a4]" />
            <span>{isHindi ? 'सभी लॉक करें' : 'Lock All'}</span>
          </button>

          <button
            onClick={handleSyncLockedToAllScenes}
            className="flex items-center gap-1.5 px-3 py-2 rounded-2xl bg-[#f3edf7] hover:bg-[#eaddff] text-[#6750a4] font-bold text-xs border border-[#e8def8] transition cursor-pointer shadow-sm"
            title="Apply locked characters consistently across all video scenes"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>{isHindi ? 'हर सीन में सिंक करें' : 'Sync to All Scenes'}</span>
          </button>

          <button
            onClick={handleAddCharacter}
            disabled={project.characters.length >= MAX_LOCKED_CHARACTERS}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] disabled:opacity-50 text-white font-bold text-xs transition hover:scale-105 active:scale-95 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>
              {isHindi
                ? `नया पात्र (+${MAX_LOCKED_CHARACTERS - project.characters.length})`
                : `Add Character (${project.characters.length}/${MAX_LOCKED_CHARACTERS})`}
            </span>
          </button>
        </div>
      </div>

      {/* 10-Slot Character Lock Capacity Bar */}
      <div className="bg-[#fdf8ff] border border-[#e8def8] rounded-2xl p-3 flex flex-col gap-2">
        <div className="flex items-center justify-between text-[11px]">
          <span className="font-bold text-[#49454f] flex items-center gap-1.5">
            <ShieldCheck className="w-3.5 h-3.5 text-[#6750a4]" />
            {isHindi
              ? `कैरेक्टर कंसिस्टेंसी स्लॉट्स (1 वीडियो में अधिकतम 10 कैरेक्टर लॉक):`
              : `Character Consistency Lock Slots (Up to 10 Locked Characters per Video):`}
          </span>
          <span className="font-mono font-extrabold text-[#6750a4]">
            {lockedCount} / {MAX_LOCKED_CHARACTERS} {isHindi ? 'लॉक एक्टिव' : 'Active Locks'}
          </span>
        </div>

        {/* 10 Visual Lock Slot Pills */}
        <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
          {Array.from({ length: MAX_LOCKED_CHARACTERS }).map((_, slotIdx) => {
            const charInSlot = project.characters[slotIdx];
            const isSlotLocked = Boolean(charInSlot?.isLocked);
            const preset = charInSlot ? AVATAR_PRESETS.find(p => p.id === charInSlot.avatarId) : null;

            return (
              <div
                key={slotIdx}
                onClick={() => {
                  if (charInSlot) {
                    setSelectedCharId(charInSlot.id);
                  } else {
                    handleAddCharacter();
                  }
                }}
                className={`p-1.5 rounded-xl border text-center flex flex-col items-center justify-center gap-0.5 cursor-pointer transition ${
                  charInSlot
                    ? isSlotLocked
                      ? 'bg-[#eaddff] border-[#6750a4] text-[#21005d] shadow-sm'
                      : 'bg-white border-[#cac4d0] text-[#49454f]'
                    : 'bg-[#f3edf7]/60 border-dashed border-[#cac4d0] text-[#79747e] hover:border-[#6750a4]'
                }`}
                title={
                  charInSlot
                    ? `${charInSlot.name} (${isSlotLocked ? 'Locked' : 'Unlocked'})`
                    : isHindi ? `स्लॉट ${slotIdx + 1}: नया कैरेक्टर जोड़ें` : `Slot ${slotIdx + 1}: Click to add character`
                }
              >
                <div className="flex items-center gap-0.5 text-xs">
                  <span>{preset?.emoji || '➕'}</span>
                  {charInSlot && (
                    <span className="text-[10px]">
                      {isSlotLocked ? '🔒' : '🔓'}
                    </span>
                  )}
                </div>
                <span className="text-[9px] font-bold truncate w-full">
                  {charInSlot ? charInSlot.name : `Slot ${slotIdx + 1}`}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Status Toast Notification */}
      {statusMessage && (
        <div className="bg-[#eaddff] border border-[#6750a4] text-[#21005d] px-3.5 py-2 rounded-2xl text-xs font-bold flex items-center justify-between animate-in fade-in">
          <span>{statusMessage}</span>
          <button onClick={() => setStatusMessage(null)} className="text-[#6750a4] font-black ml-2">✕</button>
        </div>
      )}

      {/* Characters List Badges with Instant Lock Toggle */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {project.characters.map((char, index) => {
          const isSelected = char.id === selectedChar?.id;
          const preset = AVATAR_PRESETS.find(p => p.id === char.avatarId);
          const isCharLocked = Boolean(char.isLocked);

          return (
            <div
              key={char.id}
              onClick={() => setSelectedCharId(char.id)}
              className={`flex items-center gap-2.5 px-3.5 py-2 rounded-2xl border transition flex-shrink-0 cursor-pointer ${
                isSelected
                  ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] ring-2 ring-[#6750a4]/20 shadow-sm'
                  : 'bg-[#fdf8ff] border-[#e8def8] text-[#49454f] hover:bg-[#f3edf7]'
              }`}
            >
              <span className="text-xl">{preset?.emoji || '🎭'}</span>
              <div className="text-left">
                <div className="flex items-center gap-1">
                  <p className="font-bold text-xs text-[#1c1b1f]">{char.name}</p>
                  {isCharLocked && (
                    <span className="text-[9px] bg-[#6750a4] text-white px-1.5 py-0.2 rounded-full font-extrabold">
                      LOCKED
                    </span>
                  )}
                </div>
                <p className="text-[10px] text-[#79747e] capitalize">
                  #{index + 1} • {char.role}
                </p>
              </div>

              {/* Lock / Unlock Quick Button */}
              <button
                type="button"
                onClick={(e) => handleToggleLock(char, e)}
                className={`p-1.5 rounded-xl border transition cursor-pointer ${
                  isCharLocked
                    ? 'bg-[#6750a4] text-white border-[#6750a4] hover:bg-[#523e85]'
                    : 'bg-white text-[#79747e] border-[#cac4d0] hover:text-[#1c1b1f]'
                }`}
                title={isCharLocked ? 'Character Locked (Click to Unlock)' : 'Click to Lock Character for Consistency'}
              >
                {isCharLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              </button>
            </div>
          );
        })}
      </div>

      {/* Selected Character Editor */}
      {selectedChar && (
        <div className="bg-[#f3edf7] p-4 sm:p-5 rounded-2xl border border-[#e8def8] flex flex-col gap-4 text-xs">
          {/* Character Consistency Lock Control Bar */}
          <div className="bg-white p-3.5 rounded-2xl border border-[#d0bcff] flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-sm">
            <div className="flex items-center gap-2.5">
              <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                selectedChar.isLocked ? 'bg-[#6750a4] text-white' : 'bg-[#f3edf7] text-[#79747e]'
              }`}>
                {selectedChar.isLocked ? <Lock className="w-4 h-4" /> : <Unlock className="w-4 h-4" />}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="font-black text-[#1c1b1f] text-xs sm:text-sm">
                    {selectedChar.isLocked
                      ? (isHindi ? 'कैरेक्टर लॉक सक्रिय (Consistent Character Locked)' : 'Character Consistency Lock ACTIVE')
                      : (isHindi ? 'कैरेक्टर अनलॉक है (Unlocked)' : 'Character is Unlocked')}
                  </span>
                  <span className="font-mono text-[10px] bg-[#eaddff] text-[#21005d] px-2 py-0.5 rounded-md font-bold border border-[#d0bcff]">
                    DNA: {selectedChar.lockSeed || 'LOCK-S25-101'}
                  </span>
                </div>
                <p className="text-[11px] text-[#79747e]">
                  {selectedChar.isLocked
                    ? (isHindi
                        ? 'लॉक होने पर इस पात्र का चेहरा, कपड़े, रंग और आवाज पूरे वीडियो और नए AI सीन में कभी नहीं बदलेगी।'
                        : 'Appearance, colors, outfit & voice pitch are locked across all scenes and AI story generations.')
                    : (isHindi
                        ? 'लॉक बटन दबाएं ताकि यह पात्र वीडियो के हर सीन में एक जैसा रहे।'
                        : 'Click Lock Character to freeze appearance and voice across all scenes.')}
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={() => handleToggleLock(selectedChar)}
              className={`px-4 py-2.5 rounded-2xl font-extrabold text-xs flex items-center justify-center gap-1.5 transition cursor-pointer flex-shrink-0 shadow-sm ${
                selectedChar.isLocked
                  ? 'bg-[#6750a4] hover:bg-[#523e85] text-white'
                  : 'bg-[#eaddff] hover:bg-[#d0bcff] text-[#21005d] border border-[#6750a4]'
              }`}
            >
              {selectedChar.isLocked ? (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'लॉक है (अनलॉक करें)' : 'Locked (Click to Unlock)'}</span>
                </>
              ) : (
                <>
                  <Unlock className="w-3.5 h-3.5" />
                  <span>{isHindi ? 'कैरेक्टर लॉक करें (Lock)' : 'Lock Character'}</span>
                </>
              )}
            </button>
          </div>

          {/* Avatar Archetype Picker */}
          <div>
            <label className="font-bold text-[#49454f] block mb-2">
              {isHindi ? 'अवतार लुक चुनें (Avatar Style)' : 'Select Avatar Preset'}
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
              {AVATAR_PRESETS.map((preset) => {
                const isSelected = selectedChar.avatarId === preset.id;
                return (
                  <button
                    key={preset.id}
                    onClick={() => handleUpdateChar({
                      avatarId: preset.id,
                      primaryColor: preset.primaryColor,
                      secondaryColor: preset.secondaryColor
                    })}
                    className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                      isSelected
                        ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] shadow-sm ring-2 ring-[#6750a4]/20'
                        : 'bg-white border-[#e8def8] text-[#49454f] hover:bg-[#fdf8ff]'
                    }`}
                  >
                    <span className="text-2xl">{preset.emoji}</span>
                    <span className="font-bold text-[11px] truncate w-full">{preset.name}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Name, Role, Colors & Consistent Outfit Traits */}
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
            <div>
              <label className="font-bold text-[#49454f] block mb-1">
                {isHindi ? 'पात्र का नाम (Name)' : 'Character Name'}
              </label>
              <input
                type="text"
                value={selectedChar.name}
                onChange={(e) => handleUpdateChar({ name: e.target.value })}
                className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3 py-2 text-[#1c1b1f] font-medium focus:outline-none focus:border-[#6750a4]"
              />
            </div>

            <div>
              <label className="font-bold text-[#49454f] block mb-1">
                {isHindi ? 'भूमिका (Role)' : 'Story Role'}
              </label>
              <select
                value={selectedChar.role}
                onChange={(e) => handleUpdateChar({ role: e.target.value as any })}
                className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3 py-2 text-[#1c1b1f] font-medium focus:outline-none focus:border-[#6750a4]"
              >
                <option value="protagonist">Protagonist (मुख्य नायक)</option>
                <option value="friend">Best Friend (साथी)</option>
                <option value="sidekick">Sidekick (मददगार)</option>
                <option value="villain">Funny Villain (नटखट विलेन)</option>
                <option value="narrator">Narrator (कथावाचक)</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-[#49454f] block mb-1">
                {isHindi ? 'लॉक किए गए कपड़े / पहचान (Locked Traits)' : 'Locked Outfit & Visual Traits'}
              </label>
              <input
                type="text"
                placeholder={isHindi ? 'उदा. लाल जैकेट, नीली टोपी, गोल चश्मा' : 'e.g. Red hoodie, blue cap, glasses'}
                value={selectedChar.outfitTraits || ''}
                onChange={(e) => handleUpdateChar({ outfitTraits: e.target.value })}
                className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3 py-2 text-[#1c1b1f] font-medium focus:outline-none focus:border-[#6750a4]"
              />
            </div>

            <div>
              <label className="font-bold text-[#49454f] block mb-1">
                {isHindi ? 'थीम रंग (Locked Colors)' : 'Locked Color Theme'}
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={selectedChar.primaryColor}
                  onChange={(e) => handleUpdateChar({ primaryColor: e.target.value })}
                  className="w-10 h-9 rounded-xl bg-white cursor-pointer border border-[#cac4d0]"
                />
                <input
                  type="color"
                  value={selectedChar.secondaryColor}
                  onChange={(e) => handleUpdateChar({ secondaryColor: e.target.value })}
                  className="w-10 h-9 rounded-xl bg-white cursor-pointer border border-[#cac4d0]"
                />
              </div>
            </div>
          </div>

          {/* Voice Pitch, Voice Test & Delete */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-2 border-t border-[#e8def8]">
            <div className="flex items-center gap-3 w-full sm:w-auto">
              <span className="text-[#49454f] font-semibold">Voice Pitch:</span>
              <input
                type="range"
                min="0.6"
                max="1.8"
                step="0.1"
                value={selectedChar.voicePitch}
                onChange={(e) => handleUpdateChar({ voicePitch: parseFloat(e.target.value) })}
                className="w-28 accent-[#6750a4] cursor-pointer"
              />
              <span className="font-mono font-bold text-[#6750a4]">{selectedChar.voicePitch}x</span>

              <button
                onClick={() => {
                  audioEngine.speakText(
                    isHindi ? `नमस्ते, मैं हूँ ${selectedChar.name}! मेरा लुक और आवाज इस वीडियो में लॉक है!` : `Hi, I am ${selectedChar.name}! My character is locked for consistency!`,
                    {
                      pitch: selectedChar.voicePitch,
                      rate: selectedChar.voiceRate,
                      lang: project.language === 'hi-IN' ? 'hi-IN' : 'en-US'
                    }
                  );
                }}
                className="px-2.5 py-1 rounded-xl bg-[#eaddff] hover:bg-[#d0bcff] text-[#21005d] flex items-center gap-1 font-bold transition cursor-pointer"
                title="Test Voice"
              >
                <Volume2 className="w-3.5 h-3.5 text-[#6750a4]" />
                <span>Test</span>
              </button>
            </div>

            {project.characters.length > 1 && (
              <button
                onClick={() => handleDeleteCharacter(selectedChar.id)}
                className={`px-2.5 py-1 rounded-xl flex items-center gap-1 font-bold transition cursor-pointer ${
                  selectedChar.isLocked
                    ? 'text-[#79747e] bg-[#e8def8]/50 cursor-not-allowed'
                    : 'text-[#ba1a1a] hover:bg-[#ffdad6]'
                }`}
                title={selectedChar.isLocked ? 'Unlock character first to delete' : 'Delete character'}
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{isHindi ? 'पात्र हटाएं' : 'Delete'}</span>
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

