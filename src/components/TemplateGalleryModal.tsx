import React from 'react';
import { X, Play, Sparkles, Film } from 'lucide-react';
import { PRESET_CARTOON_TEMPLATES } from '../services/geminiService';
import { CartoonProject } from '../types/cartoon';

interface TemplateGalleryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectTemplate: (project: CartoonProject) => void;
  language: string;
}

export const TemplateGalleryModal: React.FC<TemplateGalleryModalProps> = ({
  isOpen,
  onClose,
  onSelectTemplate,
  language
}) => {
  if (!isOpen) return null;

  const isHindi = language === 'hi-IN' || language === 'hinglish';

  const handlePickTemplate = (template: typeof PRESET_CARTOON_TEMPLATES[0]) => {
    const project: CartoonProject = {
      ...template,
      id: 'proj_' + Date.now(),
      createdAt: Date.now(),
      updatedAt: Date.now()
    };
    onSelectTemplate(project);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1b1f]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#fdf8ff] border-2 border-[#e8def8] rounded-3xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1c1b1f] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8def8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center text-xl shadow-sm border border-[#d0bcff]">
              🎨
            </div>
            <div>
              <h2 className="font-black text-xl italic text-[#6750a4]">
                {isHindi ? 'कार्टून वीडियो टेम्प्लेट्स' : 'Pre-Built Cartoon Video Templates'}
              </h2>
              <p className="text-xs text-[#79747e]">
                {isHindi ? 'किसी भी कार्टून को एक क्लिक में लोड करें और एडिट या प्ले करें' : 'Pick a ready-made story to play, edit, or customize'}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-2xl text-[#79747e] hover:text-[#1c1b1f] hover:bg-[#eaddff] transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Templates Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PRESET_CARTOON_TEMPLATES.map((tmpl, idx) => (
            <div
              key={idx}
              className="bg-white rounded-3xl p-5 border border-[#e8def8] hover:border-[#6750a4] transition group flex flex-col justify-between gap-3 shadow-sm hover:shadow-md"
            >
              <div className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-extrabold px-2.5 py-0.5 rounded-full bg-[#eaddff] text-[#21005d] border border-[#d0bcff]">
                    {tmpl.genre.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className="text-xs text-[#79747e] font-semibold">
                    🎬 {tmpl.scenes.length} Scenes • {tmpl.aspectRatio}
                  </span>
                </div>

                <h3 className="font-black text-base text-[#1c1b1f] group-hover:text-[#6750a4] transition italic">
                  {tmpl.title}
                </h3>

                <p className="text-xs text-[#49454f] line-clamp-2">
                  {tmpl.synopsis}
                </p>

                {/* Character icons preview */}
                <div className="flex items-center gap-1.5 pt-1">
                  <span className="text-[11px] text-[#79747e] font-bold">Characters:</span>
                  {tmpl.characters.map((c) => (
                    <span
                      key={c.id}
                      className="text-xs px-2.5 py-0.5 rounded-full bg-[#f3edf7] text-[#1c1b1f] border border-[#e8def8] font-medium"
                    >
                      {c.name}
                    </span>
                  ))}
                </div>
              </div>

              <button
                onClick={() => handlePickTemplate(tmpl)}
                className="w-full py-2.5 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] text-white font-extrabold text-xs flex items-center justify-center gap-2 shadow-md shadow-[#6750a4]/20 transition hover:scale-[1.02] active:scale-98 cursor-pointer"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>{isHindi ? 'यह कार्टून लोड करें (Play & Edit)' : 'Load & Edit Cartoon'}</span>
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
