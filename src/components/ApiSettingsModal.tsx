import React, { useState } from 'react';
import { X, Key, CheckCircle, Sparkles, ShieldCheck } from 'lucide-react';

interface ApiSettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  apiKey: string;
  onSaveApiKey: (key: string) => void;
  language: string;
}

export const ApiSettingsModal: React.FC<ApiSettingsModalProps> = ({
  isOpen,
  onClose,
  apiKey,
  onSaveApiKey,
  language
}) => {
  const [inputKey, setInputKey] = useState<string>(apiKey);
  const [saved, setSaved] = useState<boolean>(false);

  if (!isOpen) return null;

  const isHindi = language === 'hi-IN' || language === 'hinglish';

  const handleSave = () => {
    onSaveApiKey(inputKey.trim());
    setSaved(true);
    setTimeout(() => {
      setSaved(false);
      onClose();
    }, 1000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-[#1c1b1f]/60 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-[#fdf8ff] border-2 border-[#e8def8] rounded-3xl w-full max-w-md p-6 sm:p-7 shadow-2xl flex flex-col gap-5 text-[#1c1b1f] animate-in fade-in zoom-in-95">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#e8def8] pb-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#eaddff] text-[#6750a4] flex items-center justify-center text-xl shadow-sm border border-[#d0bcff]">
              <Key className="w-5 h-5 text-[#6750a4]" />
            </div>
            <div>
              <h2 className="font-black text-lg italic text-[#6750a4]">
                {isHindi ? 'AI सेटिंग्स (Gemini 2.5 Unlimited)' : 'AI Model & Key Settings'}
              </h2>
              <p className="text-xs text-[#79747e]">
                {isHindi ? 'Google Gemini 2.5 / 3.5 AI इंजन' : 'Gemini 2.5 & 3.5 AI Engine Configuration'}
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

        {/* Free & Unlimited Badge */}
        <div className="bg-[#eaddff] border border-[#d0bcff] p-3.5 rounded-2xl flex items-start gap-3 shadow-sm">
          <ShieldCheck className="w-5 h-5 text-[#6750a4] flex-shrink-0 mt-0.5" />
          <div className="text-xs">
            <p className="font-bold text-[#21005d]">
              {isHindi ? 'मुफ्त और अनलिमिटेड इस्तेमाल एक्टिव है' : 'Free & Unlimited AI Mode Active'}
            </p>
            <p className="text-[#49454f] text-[11px] mt-0.5">
              {isHindi 
                ? 'आप बिना किसी सीमा के असीमित कार्टून कहानियां, सीन और वीडियो बना सकते हैं।' 
                : 'You can create cartoon scripts, animation storyboards, and export unlimited videos for free.'}
            </p>
          </div>
        </div>

        {/* Custom API Key Input */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-bold text-[#49454f]">
            {isHindi ? 'कस्टम जेमिनी API Key (वैकल्पिक):' : 'Custom Gemini API Key (Optional):'}
          </label>
          <input
            type="password"
            placeholder="AIzaSy..."
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            className="w-full bg-white border border-[#cac4d0] rounded-2xl px-3.5 py-2.5 text-xs text-[#1c1b1f] placeholder:text-[#79747e] focus:outline-none focus:border-[#6750a4]"
          />
          <p className="text-[11px] text-[#79747e]">
            {isHindi 
              ? 'यदि आप अपनी खुद की API Key उपयोग करना चाहते हैं, तो यहाँ डालें या खाली छोड़ें।' 
              : 'Leave empty to use default unlimited mode or enter your personal Gemini API key.'}
          </p>
        </div>

        {/* Save Button */}
        <button
          onClick={handleSave}
          className="w-full py-3 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] text-white font-extrabold text-xs shadow-lg shadow-[#6750a4]/20 flex items-center justify-center gap-2 transition hover:scale-105 active:scale-95 cursor-pointer"
        >
          {saved ? (
            <>
              <CheckCircle className="w-4 h-4 text-white" />
              <span>{isHindi ? 'सहेजा गया!' : 'Saved Successfully!'}</span>
            </>
          ) : (
            <span>{isHindi ? 'सेव करें' : 'Save Settings'}</span>
          )}
        </button>
      </div>
    </div>
  );
};
