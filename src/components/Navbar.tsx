import React from 'react';
import { Sparkles, Film, PlusCircle, LayoutTemplate, Download, Volume2, VolumeX, Key, Globe } from 'lucide-react';
import appIconImg from '../assets/images/app_icon_1787633708216.jpg';

interface NavbarProps {
  onNewProject: () => void;
  onOpenTemplates: () => void;
  onExport: () => void;
  isMuted: boolean;
  onToggleMute: () => void;
  language: 'hi-IN' | 'en-US' | 'hinglish';
  onChangeLanguage: (lang: 'hi-IN' | 'en-US' | 'hinglish') => void;
  apiKeySet: boolean;
  onOpenApiSettings: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  onNewProject,
  onOpenTemplates,
  onExport,
  isMuted,
  onToggleMute,
  language,
  onChangeLanguage,
  apiKeySet,
  onOpenApiSettings
}) => {
  return (
    <header className="bg-[#fdf8ff]/95 backdrop-blur-md border-b border-[#e8def8] sticky top-0 z-40 px-4 py-3 text-[#1c1b1f] shadow-sm">
      <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
        {/* Brand Logo */}
        <div className="flex items-center gap-3 cursor-pointer group" onClick={onNewProject}>
          <div className="w-10 h-10 rounded-2xl overflow-hidden border-2 border-[#6750a4] shadow-sm flex-shrink-0 group-hover:scale-105 transition">
            <img 
              src={appIconImg} 
              alt="ToonAI Studio App Icon" 
              className="w-full h-full object-cover"
            />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-black text-xl tracking-tight italic text-[#6750a4]">
                ToonAI Studio
              </span>
              <span className="bg-[#eaddff] text-[#21005d] text-[10px] px-2.5 py-0.5 rounded-full font-extrabold border border-[#d0bcff] flex items-center gap-1">
                <Sparkles className="w-3 h-3 text-[#6750a4]" /> 2.5 Unlimited
              </span>
            </div>
            <p className="text-xs text-[#79747e] hidden sm:block">
              {language === 'hi-IN' ? 'मुफ्त और असीमित एआई कार्टून वीडियो क्रिएटर' : 'Free Unlimited AI Cartoon Video Maker'}
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Language Selector */}
          <div className="relative flex items-center bg-[#f3edf7] rounded-2xl p-1 border border-[#e8def8]">
            <Globe className="w-3.5 h-3.5 text-[#6750a4] ml-1.5 mr-1" />
            <select
              value={language}
              onChange={(e) => onChangeLanguage(e.target.value as any)}
              className="bg-transparent text-xs text-[#1c1b1f] font-semibold focus:outline-none pr-1 cursor-pointer"
            >
              <option value="hi-IN" className="bg-white text-[#1c1b1f]">हिंदी (Hindi)</option>
              <option value="hinglish" className="bg-white text-[#1c1b1f]">Hinglish</option>
              <option value="en-US" className="bg-white text-[#1c1b1f]">English</option>
            </select>
          </div>

          {/* Sound Mute Toggle */}
          <button
            onClick={onToggleMute}
            className={`p-2 rounded-2xl border transition-all ${
              isMuted
                ? 'bg-[#ffdad6] border-[#ffb4ab] text-[#ba1a1a]'
                : 'bg-[#f3edf7] border-[#e8def8] text-[#49454f] hover:bg-[#eaddff] hover:text-[#21005d]'
            }`}
            title={isMuted ? 'Unmute Audio' : 'Mute Audio'}
          >
            {isMuted ? <VolumeX className="w-4 h-4" /> : <Volume2 className="w-4 h-4" />}
          </button>

          {/* Templates Button */}
          <button
            onClick={onOpenTemplates}
            className="flex items-center gap-1.5 px-3.5 py-2 text-xs font-bold rounded-2xl bg-[#f3edf7] hover:bg-[#eaddff] text-[#49454f] hover:text-[#21005d] border border-[#e8def8] transition shadow-sm"
          >
            <LayoutTemplate className="w-4 h-4 text-[#6750a4]" />
            <span className="hidden md:inline">{language === 'hi-IN' ? 'टेम्प्लेट्स' : 'Templates'}</span>
          </button>

          {/* Create / Prompt Button */}
          <button
            onClick={onNewProject}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-gradient-to-r from-[#6750a4] to-[#7f67be] hover:from-[#523e85] hover:to-[#6750a4] text-white shadow-md shadow-[#6750a4]/20 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Sparkles className="w-4 h-4" />
            <span>{language === 'hi-IN' ? 'नया कार्टून' : 'New Cartoon'}</span>
          </button>

          {/* Export Video Button */}
          <button
            onClick={onExport}
            className="flex items-center gap-1.5 px-4 py-2 text-xs font-bold rounded-2xl bg-[#1c1b1f] hover:bg-[#313033] text-white shadow-md shadow-black/10 transition hover:scale-105 active:scale-95 cursor-pointer"
          >
            <Download className="w-4 h-4 text-[#eaddff]" />
            <span className="hidden sm:inline">{language === 'hi-IN' ? 'एक्सपोर्ट' : 'Export Video'}</span>
          </button>
        </div>
      </div>
    </header>
  );
};
