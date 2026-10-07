import React, { useState } from 'react';
import { Plus, Trash2, Copy, MoveLeft, MoveRight, Edit3, Volume2, Sparkles, Wand2, X, Play } from 'lucide-react';
import { CartoonProject, CartoonScene, BgTheme, BgAnimation, SoundEffectType, CameraEffect, Emotion, Action, CharacterPosition } from '../types/cartoon';
import { audioEngine } from '../services/audioEngine';

interface SceneTimelineEditorProps {
  project: CartoonProject;
  activeSceneIndex: number;
  onSelectScene: (index: number) => void;
  onUpdateProject: (updated: CartoonProject) => void;
  language: string;
}

const BG_THEMES: { id: BgTheme; name: string; icon: string }[] = [
  { id: 'jungle', name: 'Jungle & Trees', icon: '🌴' },
  { id: 'space_planet', name: 'Cosmic Space Planet', icon: '🚀' },
  { id: 'city_street', name: 'City Street', icon: '🏙️' },
  { id: 'magic_forest', name: 'Magic Forest', icon: '🍄' },
  { id: 'candy_land', name: 'Candy Land', icon: '🍭' },
  { id: 'classroom', name: 'Cartoon Classroom', icon: '🏫' },
  { id: 'castle', name: 'Magic Castle', icon: '🏰' },
  { id: 'beach_ocean', name: 'Sunny Beach', icon: '🏖️' },
  { id: 'superhero_rooftop', name: 'Superhero Rooftop', icon: '🦸' }
];

const SOUND_EFFECTS: { id: SoundEffectType; name: string; emoji: string }[] = [
  { id: 'none', name: 'No Sound FX', emoji: '🔇' },
  { id: 'boing', name: 'Spring Boing', emoji: '🦘' },
  { id: 'whoosh', name: 'Speed Whoosh', emoji: '💨' },
  { id: 'laugh', name: 'Toon Laugh', emoji: '😆' },
  { id: 'pop', name: 'Bubble Pop', emoji: '🫧' },
  { id: 'magic', name: 'Magic Chimes', emoji: '✨' },
  { id: 'tada', name: 'Tada Fanfare', emoji: '🎺' },
  { id: 'punch', name: 'Comic Punch', emoji: '💥' },
  { id: 'cheer', name: 'Victory Cheer', emoji: '🎉' }
];

export const SceneTimelineEditor: React.FC<SceneTimelineEditorProps> = ({
  project,
  activeSceneIndex,
  onSelectScene,
  onUpdateProject,
  language
}) => {
  const [editingSceneIndex, setEditingSceneIndex] = useState<number | null>(null);

  const scenes = project.scenes;
  const editingScene = editingSceneIndex !== null ? scenes[editingSceneIndex] : null;

  // Add new scene
  const handleAddScene = () => {
    const newSceneId = 'scene_' + Date.now();
    const prevScene = scenes[scenes.length - 1];
    const lockedChars = project.characters.filter(c => c.isLocked).slice(0, 10);
    const defaultChars = prevScene
      ? JSON.parse(JSON.stringify(prevScene.characters))
      : lockedChars.length > 0
        ? lockedChars.map((lc, i) => ({
            characterId: lc.id,
            position: i % 2 === 0 ? 'left' : 'right',
            action: 'talking',
            emotion: 'happy'
          }))
        : [
            { characterId: project.characters[0]?.id || 'char_1', position: 'center', action: 'dancing', emotion: 'happy' }
          ];

    const newScene: CartoonScene = {
      id: newSceneId,
      title: language === 'hi-IN' ? `सीन ${scenes.length + 1}: नया मोड़` : `Scene ${scenes.length + 1}: New Action`,
      durationSeconds: 5,
      order: scenes.length + 1,
      bgTheme: prevScene ? prevScene.bgTheme : 'magic_forest',
      bgAnimation: 'sparkles',
      characters: defaultChars,
      speakerName: project.characters[0]?.name || 'Hero',
      dialogueText: language === 'hi-IN' ? 'अरे वाह! चलो मिलकर नई मस्ती करते हैं!' : 'Look! Let\'s start a brand new cartoon moment!',
      soundEffect: 'magic',
      cameraEffect: 'zoom_in',
      subtitleText: language === 'hi-IN' ? 'नई मस्ती शुरू!' : 'New fun moment!'
    };

    const updatedScenes = [...scenes, newScene];
    onUpdateProject({
      ...project,
      scenes: updatedScenes,
      updatedAt: Date.now()
    });
    onSelectScene(updatedScenes.length - 1);
    setEditingSceneIndex(updatedScenes.length - 1);
  };

  // Duplicate Scene
  const handleDuplicateScene = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    const sourceScene = scenes[index];
    const newScene: CartoonScene = {
      ...JSON.parse(JSON.stringify(sourceScene)),
      id: 'scene_' + Date.now(),
      title: `${sourceScene.title} (Copy)`,
      order: index + 2
    };

    const updated = [...scenes.slice(0, index + 1), newScene, ...scenes.slice(index + 1)];
    // Reindex order
    updated.forEach((s, idx) => { s.order = idx + 1; });

    onUpdateProject({
      ...project,
      scenes: updated,
      updatedAt: Date.now()
    });
    onSelectScene(index + 1);
  };

  // Delete Scene
  const handleDeleteScene = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();
    if (scenes.length <= 1) return;
    const updated = scenes.filter((_, idx) => idx !== index);
    updated.forEach((s, idx) => { s.order = idx + 1; });

    onUpdateProject({
      ...project,
      scenes: updated,
      updatedAt: Date.now()
    });
    onSelectScene(Math.max(0, index - 1));
  };

  // Move Scene
  const handleMoveScene = (index: number, direction: 'left' | 'right', e: React.MouseEvent) => {
    e.stopPropagation();
    const targetIdx = direction === 'left' ? index - 1 : index + 1;
    if (targetIdx < 0 || targetIdx >= scenes.length) return;

    const updated = [...scenes];
    const temp = updated[index];
    updated[index] = updated[targetIdx];
    updated[targetIdx] = temp;
    updated.forEach((s, idx) => { s.order = idx + 1; });

    onUpdateProject({
      ...project,
      scenes: updated,
      updatedAt: Date.now()
    });
    onSelectScene(targetIdx);
  };

  // Update specific scene field
  const handleUpdateEditingScene = (updatedFields: Partial<CartoonScene>) => {
    if (editingSceneIndex === null) return;
    const updated = [...scenes];
    updated[editingSceneIndex] = {
      ...updated[editingSceneIndex],
      ...updatedFields
    };

    onUpdateProject({
      ...project,
      scenes: updated,
      updatedAt: Date.now()
    });
  };

  return (
    <div className="bg-white rounded-3xl p-5 border border-[#e8def8] shadow-sm flex flex-col gap-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center font-bold text-base border border-[#d0bcff] shadow-sm">
            🎬
          </div>
          <div>
            <h3 className="font-black text-[#1c1b1f] text-sm sm:text-base italic">
              {language === 'hi-IN' ? 'सीन टाइमलाइन (Story Timeline)' : 'Story Timeline & Scenes'}
            </h3>
            <p className="text-xs text-[#79747e]">
              {language === 'hi-IN' ? 'क्लिक करके सीन बदलें या एडिट करें' : 'Click any scene card to preview or customize'}
            </p>
          </div>
        </div>

        <button
          onClick={handleAddScene}
          className="flex items-center gap-1.5 px-4 py-2 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] text-white font-bold text-xs shadow-md shadow-[#6750a4]/20 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{language === 'hi-IN' ? 'नया सीन जोड़ें' : 'Add Scene'}</span>
        </button>
      </div>

      {/* Timeline Horizontal Scrollable Cards */}
      <div className="flex items-center gap-3 overflow-x-auto pb-2 pt-1">
        {scenes.map((scene, idx) => {
          const isActive = idx === activeSceneIndex;
          return (
            <div
              key={scene.id}
              onClick={() => onSelectScene(idx)}
              className={`flex-shrink-0 w-56 p-3.5 rounded-2xl border transition-all cursor-pointer group flex flex-col gap-2 relative ${
                isActive
                  ? 'bg-[#f3edf7] border-2 border-[#6750a4] shadow-md shadow-[#6750a4]/15 ring-2 ring-[#6750a4]/20'
                  : 'bg-[#fdf8ff] border-[#e8def8] hover:bg-[#f3edf7] hover:border-[#cac4d0]'
              }`}
            >
              {/* Scene Number & Duration Badge */}
              <div className="flex items-center justify-between text-xs">
                <span className="font-extrabold text-[#6750a4] flex items-center gap-1">
                  <span>#{idx + 1}</span>
                  <span className="text-[#79747e] font-medium text-[11px] truncate max-w-[90px]">
                    {scene.bgTheme.replace('_', ' ')}
                  </span>
                </span>
                <span className="bg-[#eaddff] text-[#21005d] text-[10px] px-2 py-0.5 rounded-full font-mono font-bold">
                  {scene.durationSeconds}s
                </span>
              </div>

              {/* Title */}
              <h4 className="font-bold text-xs text-[#1c1b1f] truncate">{scene.title}</h4>

              {/* Dialogue Snippet */}
              <p className="text-[11px] text-[#49454f] line-clamp-2 italic bg-white p-2 rounded-xl border border-[#e8def8]">
                "{scene.dialogueText}"
              </p>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1.5 border-t border-[#e8def8] text-[#49454f]">
                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => handleMoveScene(idx, 'left', e)}
                    disabled={idx === 0}
                    className="p-1 hover:text-[#6750a4] hover:bg-[#eaddff] rounded-lg disabled:opacity-20 transition"
                    title="Move Left"
                  >
                    <MoveLeft className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleMoveScene(idx, 'right', e)}
                    disabled={idx === scenes.length - 1}
                    className="p-1 hover:text-[#6750a4] hover:bg-[#eaddff] rounded-lg disabled:opacity-20 transition"
                    title="Move Right"
                  >
                    <MoveRight className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setEditingSceneIndex(idx);
                    }}
                    className="p-1 text-[#6750a4] hover:bg-[#eaddff] rounded-lg transition"
                    title="Edit Scene"
                  >
                    <Edit3 className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => handleDuplicateScene(idx, e)}
                    className="p-1 hover:text-[#6750a4] hover:bg-[#eaddff] rounded-lg transition"
                    title="Duplicate Scene"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>
                  {scenes.length > 1 && (
                    <button
                      onClick={(e) => handleDeleteScene(idx, e)}
                      className="p-1 text-[#ba1a1a] hover:bg-[#ffdad6] rounded-lg transition"
                      title="Delete Scene"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Full Scene Customization Modal in Artistic Flair */}
      {editingScene && editingSceneIndex !== null && (
        <div className="fixed inset-0 z-50 bg-[#1c1b1f]/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-[#fdf8ff] border-2 border-[#e8def8] rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 shadow-2xl flex flex-col gap-5 text-[#1c1b1f] animate-in fade-in zoom-in-95">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-[#e8def8] pb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center font-bold text-lg border border-[#d0bcff] shadow-sm">
                  ✨
                </div>
                <div>
                  <h3 className="font-black text-lg text-[#1c1b1f] italic">
                    {language === 'hi-IN' ? `सीन ${editingSceneIndex + 1} कस्टमाइज करें` : `Customize Scene ${editingSceneIndex + 1}`}
                  </h3>
                  <p className="text-xs text-[#79747e]">
                    {language === 'hi-IN' ? 'बैकग्राउंड, कैरेक्टर, डायलॉग और साउंड इफेक्ट्स सेट करें' : 'Configure background, animated characters, dialogues and SFX'}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setEditingSceneIndex(null)}
                className="p-2 rounded-2xl text-[#79747e] hover:text-[#1c1b1f] hover:bg-[#eaddff] transition"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scene Title & Duration */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2">
                <label className="text-xs font-bold text-[#49454f] block mb-1">
                  {language === 'hi-IN' ? 'सीन का नाम (Scene Title)' : 'Scene Title'}
                </label>
                <input
                  type="text"
                  value={editingScene.title}
                  onChange={(e) => handleUpdateEditingScene({ title: e.target.value })}
                  className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3.5 py-2.5 text-xs text-[#1c1b1f] focus:outline-none focus:border-[#6750a4] focus:ring-2 focus:ring-[#6750a4]/20"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-[#49454f] block mb-1">
                  {language === 'hi-IN' ? 'अवधि (Duration)' : 'Duration (Seconds)'}
                </label>
                <select
                  value={editingScene.durationSeconds}
                  onChange={(e) => handleUpdateEditingScene({ durationSeconds: parseInt(e.target.value) })}
                  className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3.5 py-2.5 text-xs text-[#1c1b1f] focus:outline-none focus:border-[#6750a4] cursor-pointer"
                >
                  <option value="3">3 Seconds (Fast)</option>
                  <option value="4">4 Seconds</option>
                  <option value="5">5 Seconds (Standard)</option>
                  <option value="6">6 Seconds</option>
                  <option value="8">8 Seconds (Long)</option>
                </select>
              </div>
            </div>

            {/* Background Theme Picker */}
            <div>
              <label className="text-xs font-bold text-[#49454f] block mb-2">
                {language === 'hi-IN' ? 'बैकग्राउंड थीम चुनें (Background Theme)' : 'Choose Background Theme'}
              </label>
              <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
                {BG_THEMES.map((theme) => {
                  const isSelected = editingScene.bgTheme === theme.id;
                  return (
                    <button
                      key={theme.id}
                      onClick={() => handleUpdateEditingScene({ bgTheme: theme.id })}
                      className={`p-2.5 rounded-2xl border text-center flex flex-col items-center gap-1 transition cursor-pointer ${
                        isSelected
                          ? 'bg-[#eaddff] border-2 border-[#6750a4] text-[#21005d] shadow-sm ring-2 ring-[#6750a4]/20'
                          : 'bg-white border-[#e8def8] text-[#49454f] hover:bg-[#f3edf7]'
                      }`}
                    >
                      <span className="text-xl">{theme.icon}</span>
                      <span className="text-[11px] font-bold truncate w-full">{theme.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Dialogue & Speaker Section */}
            <div className="bg-[#f3edf7] p-4 rounded-2xl border border-[#e8def8] flex flex-col gap-3">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-[#6750a4] flex items-center gap-1.5">
                  <span>🗣️</span>
                  <span>{language === 'hi-IN' ? 'बोलने वाला कैरेक्टर और डायलॉग' : 'Speaker & Dialogue Voiceover'}</span>
                </label>

                {/* Test Audio Voice */}
                <button
                  onClick={() => {
                    const speakerChar = project.characters.find(c => editingScene.speakerName.includes(c.name));
                    audioEngine.speakText(editingScene.dialogueText, {
                      pitch: speakerChar?.voicePitch || 1.2,
                      rate: speakerChar?.voiceRate || 1.05,
                      lang: project.language === 'hi-IN' ? 'hi-IN' : 'en-US'
                    });
                  }}
                  className="px-3 py-1 rounded-xl bg-[#eaddff] hover:bg-[#d0bcff] text-xs font-bold text-[#21005d] flex items-center gap-1 transition cursor-pointer"
                >
                  <Volume2 className="w-3.5 h-3.5 text-[#6750a4]" />
                  <span>{language === 'hi-IN' ? 'आवाज सुनें' : 'Test Voice'}</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <div>
                  <label className="text-[11px] font-semibold text-[#49454f] block mb-1">Speaker</label>
                  <select
                    value={editingScene.speakerName}
                    onChange={(e) => handleUpdateEditingScene({ speakerName: e.target.value })}
                    className="w-full bg-white border border-[#cac4d0] rounded-xl px-3 py-2 text-xs font-bold text-[#1c1b1f] focus:outline-none"
                  >
                    {project.characters.map(c => (
                      <option key={c.id} value={c.name}>{c.name} ({c.role})</option>
                    ))}
                    <option value="Narrator">Narrator (सूत्रधार)</option>
                  </select>
                </div>

                <div className="sm:col-span-2">
                  <label className="text-[11px] font-semibold text-[#49454f] block mb-1">Dialogue Text</label>
                  <textarea
                    rows={2}
                    value={editingScene.dialogueText}
                    onChange={(e) => handleUpdateEditingScene({ dialogueText: e.target.value, subtitleText: e.target.value })}
                    className="w-full bg-white border border-[#cac4d0] rounded-xl px-3 py-2 text-xs text-[#1c1b1f] focus:outline-none focus:border-[#6750a4] resize-none"
                  />
                </div>
              </div>
            </div>

            {/* Character Actions & Expressions in Scene */}
            <div>
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <label className="text-xs font-bold text-[#49454f]">
                  {language === 'hi-IN' ? 'सीन में कैरेक्टर की स्थिति और एक्शन (लॉक कैरेक्टर्स)' : 'Scene Characters, Poses & Animations'}
                </label>

                {/* Quick Add Locked/Project Characters into this Scene */}
                <div className="flex flex-wrap items-center gap-1.5">
                  {project.characters.map((projChar) => {
                    const isInScene = editingScene.characters.some(sc => sc.characterId === projChar.id);
                    return (
                      <button
                        key={projChar.id}
                        type="button"
                        onClick={() => {
                          if (isInScene) {
                            if (editingScene.characters.length <= 1) return;
                            handleUpdateEditingScene({
                              characters: editingScene.characters.filter(sc => sc.characterId !== projChar.id)
                            });
                          } else {
                            handleUpdateEditingScene({
                              characters: [
                                ...editingScene.characters,
                                {
                                  characterId: projChar.id,
                                  position: editingScene.characters.length % 2 === 0 ? 'left' : 'right',
                                  action: 'talking',
                                  emotion: 'happy'
                                }
                              ]
                            });
                          }
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition cursor-pointer flex items-center gap-1 ${
                          isInScene
                            ? 'bg-[#eaddff] border-[#6750a4] text-[#21005d]'
                            : 'bg-white border-[#cac4d0] text-[#79747e] hover:border-[#6750a4]'
                        }`}
                        title={isInScene ? 'Click to remove from this scene' : 'Click to add to this scene'}
                      >
                        <span>{projChar.isLocked ? '🔒' : '👤'}</span>
                        <span>{projChar.name}</span>
                        <span>{isInScene ? '✓' : '+'}</span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex flex-col gap-2">
                {editingScene.characters.map((charState, cIdx) => {
                  const charInfo = project.characters.find(c => c.id === charState.characterId);
                  return (
                    <div key={cIdx} className="bg-white p-3.5 rounded-2xl border border-[#e8def8] grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                      <div>
                        <span className="text-[#79747e] block text-[10px] font-semibold">Character</span>
                        <div className="flex items-center gap-1">
                          <span className="font-bold text-[#1c1b1f]">{charInfo?.name || `Character ${cIdx + 1}`}</span>
                          {charInfo?.isLocked && (
                            <span className="text-[9px] bg-[#6750a4] text-white px-1.5 py-0.2 rounded-full font-bold">
                              🔒 LOCKED
                            </span>
                          )}
                        </div>
                      </div>

                      <div>
                        <span className="text-[#79747e] block text-[10px] font-semibold">Position</span>
                        <select
                          value={charState.position}
                          onChange={(e) => {
                            const updatedChars = [...editingScene.characters];
                            updatedChars[cIdx].position = e.target.value as CharacterPosition;
                            handleUpdateEditingScene({ characters: updatedChars });
                          }}
                          className="w-full bg-[#f3edf7] border border-[#e8def8] rounded-xl p-1.5 text-xs text-[#1c1b1f] font-medium"
                        >
                          <option value="left">Left</option>
                          <option value="center">Center</option>
                          <option value="right">Right</option>
                          <option value="moving_left_to_right">Walk Across</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[#79747e] block text-[10px] font-semibold">Action</span>
                        <select
                          value={charState.action}
                          onChange={(e) => {
                            const updatedChars = [...editingScene.characters];
                            updatedChars[cIdx].action = e.target.value as Action;
                            handleUpdateEditingScene({ characters: updatedChars });
                          }}
                          className="w-full bg-[#f3edf7] border border-[#e8def8] rounded-xl p-1.5 text-xs text-[#1c1b1f] font-medium"
                        >
                          <option value="talking">🗣️ Talking</option>
                          <option value="dancing">💃 Dancing</option>
                          <option value="jumping">🦘 Jumping</option>
                          <option value="walking">🚶 Walking</option>
                          <option value="running">🏃 Running</option>
                          <option value="flying">🚀 Flying</option>
                          <option value="waving">👋 Waving</option>
                          <option value="fighting">🥋 Action Pose</option>
                        </select>
                      </div>

                      <div>
                        <span className="text-[#79747e] block text-[10px] font-semibold">Emotion</span>
                        <select
                          value={charState.emotion}
                          onChange={(e) => {
                            const updatedChars = [...editingScene.characters];
                            updatedChars[cIdx].emotion = e.target.value as Emotion;
                            handleUpdateEditingScene({ characters: updatedChars });
                          }}
                          className="w-full bg-[#f3edf7] border border-[#e8def8] rounded-xl p-1.5 text-xs text-[#1c1b1f] font-medium"
                        >
                          <option value="happy">😊 Happy</option>
                          <option value="excited">🤩 Excited</option>
                          <option value="laughing">😆 Laughing</option>
                          <option value="wink">😉 Winking</option>
                          <option value="shocked">😲 Shocked</option>
                          <option value="angry">😠 Angry</option>
                          <option value="sad">😢 Sad</option>
                        </select>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Sound Effect & Camera Effect */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-[#49454f] block mb-1">
                  {language === 'hi-IN' ? 'साउंड इफेक्ट (Sound Effect)' : 'Cartoon Sound Effect'}
                </label>
                <div className="flex items-center gap-2">
                  <select
                    value={editingScene.soundEffect}
                    onChange={(e) => handleUpdateEditingScene({ soundEffect: e.target.value as SoundEffectType })}
                    className="flex-1 bg-white border border-[#cac4d0] rounded-2xl px-3 py-2 text-xs text-[#1c1b1f]"
                  >
                    {SOUND_EFFECTS.map(sfx => (
                      <option key={sfx.id} value={sfx.id}>{sfx.emoji} {sfx.name}</option>
                    ))}
                  </select>
                  <button
                    onClick={() => audioEngine.playSoundEffect(editingScene.soundEffect)}
                    className="p-2 rounded-2xl bg-[#eaddff] hover:bg-[#d0bcff] text-[#6750a4] border border-[#d0bcff] transition cursor-pointer"
                    title="Play Sound FX"
                  >
                    <Play className="w-4 h-4 fill-current" />
                  </button>
                </div>
              </div>

              <div>
                <label className="text-xs font-bold text-[#49454f] block mb-1">
                  {language === 'hi-IN' ? 'कैमरा इफेक्ट (Camera Motion)' : 'Camera Motion'}
                </label>
                <select
                  value={editingScene.cameraEffect}
                  onChange={(e) => handleUpdateEditingScene({ cameraEffect: e.target.value as CameraEffect })}
                  className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3 py-2 text-xs text-[#1c1b1f]"
                >
                  <option value="zoom_in">🔍 Smooth Zoom In</option>
                  <option value="zoom_out">🔎 Smooth Zoom Out</option>
                  <option value="pan_left">⬅️ Pan Left</option>
                  <option value="pan_right">➡️ Pan Right</option>
                  <option value="shake">💥 Dramatic Shake</option>
                  <option value="ken_burns">🎬 Ken Burns Cinematic</option>
                  <option value="static">⏹️ Static Frame</option>
                </select>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="flex items-center justify-end gap-2 pt-3 border-t border-[#e8def8]">
              <button
                onClick={() => setEditingSceneIndex(null)}
                className="px-6 py-2.5 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] text-white font-extrabold text-xs shadow-lg shadow-[#6750a4]/25 hover:scale-105 active:scale-95 transition cursor-pointer"
              >
                {language === 'hi-IN' ? 'हो गया (Done)' : 'Apply & Save'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
