import React, { useState, useEffect } from 'react';
import { Navbar } from './components/Navbar';
import { CartoonPlayer } from './components/CartoonPlayer';
import { SceneTimelineEditor } from './components/SceneTimelineEditor';
import { CharacterManager } from './components/CharacterManager';
import { PromptCreationModal } from './components/PromptCreationModal';
import { TemplateGalleryModal } from './components/TemplateGalleryModal';
import { ExportModal } from './components/ExportModal';
import { ApiSettingsModal } from './components/ApiSettingsModal';
import { PRESET_CARTOON_TEMPLATES } from './services/geminiService';
import { CartoonProject } from './types/cartoon';
import { audioEngine } from './services/audioEngine';
import { Sparkles, Wand2, Film, Heart, Share2, Play } from 'lucide-react';
import appIconImg from './assets/images/app_icon_1787633708216.jpg';

export default function App() {
  // Default to first preset
  const [project, setProject] = useState<CartoonProject>(() => {
    const saved = localStorage.getItem('toonai_current_project');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // fallback
      }
    }
    return {
      ...PRESET_CARTOON_TEMPLATES[0],
      id: 'proj_' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
  });

  const [activeSceneIndex, setActiveSceneIndex] = useState<number>(0);
  const [isPromptModalOpen, setIsPromptModalOpen] = useState<boolean>(false);
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [isApiModalOpen, setIsApiModalOpen] = useState<boolean>(false);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [language, setLanguage] = useState<'hi-IN' | 'en-US' | 'hinglish'>('hi-IN');
  const [apiKey, setApiKey] = useState<string>(() => localStorage.getItem('gemini_api_key') || '');
  const [quickPrompt, setQuickPrompt] = useState<string>('');

  // Save project to localStorage on change
  useEffect(() => {
    try {
      localStorage.setItem('toonai_current_project', JSON.stringify(project));
    } catch (e) {
      console.warn('LocalStorage save failed:', e);
    }
  }, [project]);

  // Audio mute sync
  const toggleMute = () => {
    const nextMuted = !isMuted;
    setIsMuted(nextMuted);
    audioEngine.setMuted(nextMuted);
  };

  const handleSaveApiKey = (key: string) => {
    setApiKey(key);
    localStorage.setItem('gemini_api_key', key);
  };

  const isHindi = language === 'hi-IN' || language === 'hinglish';

  return (
    <div className="min-h-screen bg-[#fdf8ff] text-[#1c1b1f] flex flex-col font-sans selection:bg-[#eaddff] selection:text-[#21005d]">
      {/* Top Navigation */}
      <Navbar
        onNewProject={() => setIsPromptModalOpen(true)}
        onOpenTemplates={() => setIsTemplateModalOpen(true)}
        onExport={() => setIsExportModalOpen(true)}
        isMuted={isMuted}
        onToggleMute={toggleMute}
        language={language}
        onChangeLanguage={setLanguage}
        apiKeySet={Boolean(apiKey)}
        onOpenApiSettings={() => setIsApiModalOpen(true)}
      />

      {/* Main Studio Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 flex flex-col gap-6">
        {/* Quick AI Cartoon Prompt Banner / Hero Card in Artistic Flair */}
        <div className="relative group">
          <div className="absolute -inset-1 bg-gradient-to-r from-[#6750a4] via-[#b69df8] to-[#ffb4ab] rounded-3xl blur opacity-25 group-hover:opacity-40 transition duration-500" />
          <div className="relative bg-gradient-to-br from-[#6750a4] via-[#523e85] to-[#381e72] text-white rounded-3xl p-6 sm:p-7 shadow-xl flex flex-col md:flex-row items-center justify-between gap-6 overflow-hidden">
            {/* Decorative background flare circles */}
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-white/10 blur-2xl pointer-events-none" />
            <div className="absolute -bottom-12 -left-12 w-48 h-48 rounded-full bg-[#ffb4ab]/20 blur-2xl pointer-events-none" />

            <div className="relative z-10 flex items-center gap-4">
              <div className="w-14 h-14 rounded-2xl overflow-hidden border-2 border-white/40 shadow-lg flex-shrink-0">
                <img 
                  src={appIconImg} 
                  alt="ToonAI Studio App Icon" 
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex flex-col gap-1">
                <div className="flex flex-wrap items-center gap-2">
                  <span className="inline-flex items-center gap-1.5 bg-white/20 backdrop-blur-md px-3 py-0.5 rounded-full text-[10px] font-extrabold text-white uppercase tracking-wider border border-white/20">
                    <span className="w-2 h-2 rounded-full bg-[#b3ff00] animate-pulse" />
                    Gemini 2.5 Unlimited
                  </span>
                  <span className="bg-[#eaddff] text-[#21005d] text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                    FREE STUDIO
                  </span>
                  <span className="bg-white/20 text-white text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border border-white/25">
                    🔒 {project.characters.filter(c => c.isLocked).length}/10 Character Lock
                  </span>
                </div>
                <h1 className="text-xl sm:text-2xl font-black italic tracking-tight text-white drop-shadow-sm">
                  {isHindi ? 'AI कार्टून वीडियो स्टूडियो' : 'AI Cartoon Video Creator Studio'}
                </h1>
                <p className="text-xs sm:text-sm text-[#eaddff] max-w-xl">
                  {isHindi 
                    ? 'अपनी कहानी का विचार लिखें और AI से सीधे फुल कार्टून वीडियो, डायलॉग और आवाज बनाएं।' 
                    : 'Turn your creative ideas into animated cartoon videos with expressive characters, synchronized voices & sound effects.'}
                </p>
              </div>
            </div>

            {/* Quick Prompt Bar & Button */}
            <div className="relative z-10 flex items-center gap-3 w-full md:w-auto flex-shrink-0">
              <button
                onClick={() => setIsPromptModalOpen(true)}
                className="flex-1 md:flex-initial px-6 py-3.5 rounded-2xl bg-white text-[#6750a4] hover:bg-[#fdf8ff] font-extrabold text-xs sm:text-sm shadow-xl hover:shadow-2xl transition-all duration-200 hover:scale-105 active:scale-95 flex items-center justify-center gap-2 cursor-pointer"
              >
                <Wand2 className="w-4 h-4 text-[#6750a4]" />
                <span>{isHindi ? 'नया कार्टून बनाएं' : 'Generate AI Cartoon'}</span>
              </button>

              <button
                onClick={() => setIsTemplateModalOpen(true)}
                className="px-4 py-3.5 rounded-2xl bg-white/15 hover:bg-white/25 text-white border border-white/30 text-xs sm:text-sm font-bold flex items-center gap-2 backdrop-blur-md transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                <Film className="w-4 h-4 text-[#eaddff]" />
                <span className="hidden sm:inline">{isHindi ? 'टेम्प्लेट्स' : 'Templates'}</span>
              </button>
            </div>
          </div>
        </div>

        {/* Studio Grid: Cartoon Player & Controls */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Cartoon Player Column */}
          <div className="lg:col-span-12 flex flex-col gap-6">
            <CartoonPlayer
              project={project}
              activeSceneIndex={activeSceneIndex}
              onSceneChange={setActiveSceneIndex}
              onOpenSceneEditor={(idx) => setActiveSceneIndex(idx)}
              onUpdateProject={setProject}
              language={language}
            />

            {/* Story Scenes Timeline Editor */}
            <SceneTimelineEditor
              project={project}
              activeSceneIndex={activeSceneIndex}
              onSelectScene={setActiveSceneIndex}
              onUpdateProject={setProject}
              language={language}
            />

            {/* Characters & Cast Manager */}
            <CharacterManager
              project={project}
              onUpdateProject={setProject}
              language={language}
            />
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-[#e8def8] bg-[#f3edf7] py-6 text-center text-xs text-[#79747e] flex flex-col items-center gap-1 mt-auto">
        <p className="flex items-center gap-1 font-semibold text-[#49454f]">
          <span>ToonAI Studio • AI Cartoon Video Creator</span>
        </p>
        <p className="text-[11px] text-[#79747e]">
          Powered by Gemini 2.5 / 3.5 AI & Web Audio Synthesizer • Free & Unlimited
        </p>
      </footer>

      {/* Modals */}
      <PromptCreationModal
        isOpen={isPromptModalOpen}
        onClose={() => setIsPromptModalOpen(false)}
        onProjectCreated={(newProject) => {
          setProject(newProject);
          setActiveSceneIndex(0);
        }}
        language={language}
        apiKey={apiKey}
        currentCharacters={project.characters}
      />

      <TemplateGalleryModal
        isOpen={isTemplateModalOpen}
        onClose={() => setIsTemplateModalOpen(false)}
        onSelectTemplate={(tmplProject) => {
          setProject(tmplProject);
          setActiveSceneIndex(0);
        }}
        language={language}
      />

      <ExportModal
        isOpen={isExportModalOpen}
        onClose={() => setIsExportModalOpen(false)}
        project={project}
        language={language}
      />

      <ApiSettingsModal
        isOpen={isApiModalOpen}
        onClose={() => setIsApiModalOpen(false)}
        apiKey={apiKey}
        onSaveApiKey={handleSaveApiKey}
        language={language}
      />
    </div>
  );
}
