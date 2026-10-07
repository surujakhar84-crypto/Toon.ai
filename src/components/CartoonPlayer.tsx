import React, { useEffect, useRef, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, SkipForward, SkipBack, Maximize, Volume2, VolumeX, Sparkles, Wand2, Music } from 'lucide-react';
import { CartoonProject, CartoonScene, AspectRatio } from '../types/cartoon';
import { CartoonRenderer } from '../services/cartoonRenderer';
import { audioEngine } from '../services/audioEngine';

interface CartoonPlayerProps {
  project: CartoonProject;
  activeSceneIndex: number;
  onSceneChange: (sceneIndex: number) => void;
  onOpenSceneEditor: (sceneIndex: number) => void;
  onUpdateProject: (updated: CartoonProject) => void;
  language: string;
}

export const CartoonPlayer: React.FC<CartoonPlayerProps> = ({
  project,
  activeSceneIndex,
  onSceneChange,
  onOpenSceneEditor,
  onUpdateProject,
  language
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [sceneTime, setSceneTime] = useState<number>(0);
  const [isSpeaking, setIsSpeaking] = useState<boolean>(false);

  const activeScene: CartoonScene = project.scenes[activeSceneIndex] || project.scenes[0];
  const totalScenes = project.scenes.length;

  // Track playback time
  const animFrameRef = useRef<number | null>(null);
  const lastTimestampRef = useRef<number | null>(null);
  const sceneTimeRef = useRef<number>(0);

  // Play Sound Effect & Voice when scene starts
  const playSceneAudio = useCallback((scene: CartoonScene) => {
    if (!scene) return;

    // Sound FX
    if (scene.soundEffect && scene.soundEffect !== 'none') {
      audioEngine.playSoundEffect(scene.soundEffect);
    }

    // TTS Dialogue
    if (scene.dialogueText) {
      setIsSpeaking(true);
      const speakerChar = project.characters.find(c => scene.speakerName.includes(c.name));
      audioEngine.speakText(scene.dialogueText, {
        pitch: speakerChar?.voicePitch || 1.2,
        rate: speakerChar?.voiceRate || 1.05,
        lang: project.language === 'hi-IN' ? 'hi-IN' : 'en-US',
        onEnd: () => {
          setIsSpeaking(false);
        }
      });
    }
  }, [project.characters, project.language]);

  // Handle Play / Pause
  const togglePlay = () => {
    if (!isPlaying) {
      audioEngine.init();
      audioEngine.resume();
      audioEngine.playBGM(project.bgMusic);
      playSceneAudio(activeScene);
      setIsPlaying(true);
    } else {
      setIsPlaying(false);
      audioEngine.stopBGM();
      audioEngine.stopSpeaking();
      setIsSpeaking(false);
    }
  };

  // Change Scene manually
  const goToScene = (index: number) => {
    const clampedIndex = Math.max(0, Math.min(totalScenes - 1, index));
    sceneTimeRef.current = 0;
    setSceneTime(0);
    onSceneChange(clampedIndex);
    if (isPlaying) {
      playSceneAudio(project.scenes[clampedIndex]);
    }
  };

  // Main Render Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const renderLoop = (timestamp: number) => {
      if (lastTimestampRef.current === null) {
        lastTimestampRef.current = timestamp;
      }
      const deltaSeconds = ((timestamp - lastTimestampRef.current) / 1000) * playbackSpeed;
      lastTimestampRef.current = timestamp;

      if (isPlaying) {
        sceneTimeRef.current += deltaSeconds;
        setSceneTime(sceneTimeRef.current);

        const currentDuration = activeScene?.durationSeconds || 5;
        if (sceneTimeRef.current >= currentDuration) {
          // Transition to next scene
          if (activeSceneIndex < totalScenes - 1) {
            goToScene(activeSceneIndex + 1);
          } else {
            // Loop back to start
            goToScene(0);
          }
        }
      }

      // Draw current frame
      if (activeScene) {
        CartoonRenderer.drawFrame(ctx, canvas.width, canvas.height, activeScene, project.characters, {
          timeInScene: sceneTimeRef.current,
          currentSceneIndex: activeSceneIndex,
          totalSceneDuration: activeScene.durationSeconds || 5,
          isSpeaking: isSpeaking || (isPlaying && sceneTimeRef.current < (activeScene.durationSeconds || 5) * 0.65)
        });
      }

      animFrameRef.current = requestAnimationFrame(renderLoop);
    };

    animFrameRef.current = requestAnimationFrame(renderLoop);

    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
      }
    };
  }, [isPlaying, activeSceneIndex, activeScene, project.characters, playbackSpeed, totalScenes, isSpeaking]);

  // Change Aspect Ratio
  const setAspectRatio = (ratio: AspectRatio) => {
    onUpdateProject({
      ...project,
      aspectRatio: ratio,
      updatedAt: Date.now()
    });
  };

  // Change BGM
  const changeBgMusic = (bgMusic: CartoonProject['bgMusic']) => {
    onUpdateProject({
      ...project,
      bgMusic,
      updatedAt: Date.now()
    });
    if (isPlaying) {
      audioEngine.playBGM(bgMusic);
    }
  };

  // Fullscreen
  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(err => console.warn(err));
    } else {
      document.exitFullscreen().catch(err => console.warn(err));
    }
  };

  // Dimensions
  const canvasWidth = project.aspectRatio === '9:16' ? 720 : 1280;
  const canvasHeight = project.aspectRatio === '9:16' ? 1280 : project.aspectRatio === '1:1' ? 1280 : 720;

  return (
    <div className="flex flex-col gap-4">
      {/* Player Container */}
      <div
        ref={containerRef}
        className="relative bg-[#1c1b1f] rounded-3xl overflow-hidden shadow-2xl border-2 border-[#e8def8] flex flex-col items-center justify-center group"
      >
        {/* Top Floating Badge Bar */}
        <div className="absolute top-3 left-3 right-3 z-20 flex items-center justify-between pointer-events-none">
          <div className="bg-[#1c1b1f]/80 backdrop-blur-md px-3.5 py-1.5 rounded-full border border-white/20 text-xs font-bold text-[#eaddff] flex items-center gap-2 pointer-events-auto shadow-lg">
            <span className="w-2 h-2 rounded-full bg-[#b3ff00] animate-pulse" />
            <span>
              {language === 'hi-IN' ? `सीन ${activeSceneIndex + 1} / ${totalScenes}` : `Scene ${activeSceneIndex + 1} of ${totalScenes}`}
            </span>
            <span className="text-white/40">|</span>
            <span className="text-white font-medium truncate max-w-[140px] sm:max-w-[240px]">
              {activeScene?.title}
            </span>
          </div>

          <div className="flex items-center gap-2 pointer-events-auto">
            {/* Aspect Ratio Selector */}
            <div className="bg-[#1c1b1f]/80 backdrop-blur-md p-1 rounded-2xl border border-white/20 flex items-center text-xs">
              {(['16:9', '9:16', '1:1'] as AspectRatio[]).map(ratio => (
                <button
                  key={ratio}
                  onClick={() => setAspectRatio(ratio)}
                  className={`px-2.5 py-1 rounded-xl font-bold transition ${
                    project.aspectRatio === ratio
                      ? 'bg-[#6750a4] text-white shadow-sm'
                      : 'text-[#cac4d0] hover:text-white'
                  }`}
                >
                  {ratio === '16:9' ? '📺 16:9' : ratio === '9:16' ? '📱 9:16' : '⏹️ 1:1'}
                </button>
              ))}
            </div>

            {/* Fullscreen Button */}
            <button
              onClick={toggleFullscreen}
              className="p-2 bg-[#1c1b1f]/80 backdrop-blur-md rounded-2xl text-white hover:bg-white/20 border border-white/20 transition"
              title="Fullscreen"
            >
              <Maximize className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Main Canvas Viewport */}
        <div className="w-full flex items-center justify-center p-2 sm:p-4 min-h-[360px] sm:min-h-[460px] max-h-[580px]">
          <canvas
            ref={canvasRef}
            width={canvasWidth}
            height={canvasHeight}
            onClick={togglePlay}
            className="max-h-[520px] max-w-full rounded-2xl shadow-2xl cursor-pointer ring-1 ring-white/10 transition-transform duration-200"
            style={{
              aspectRatio: project.aspectRatio === '16:9' ? '16/9' : project.aspectRatio === '9:16' ? '9/16' : '1/1',
              objectFit: 'contain'
            }}
          />
        </div>

        {/* Big Center Play Overlay Button when paused */}
        {!isPlaying && (
          <button
            onClick={togglePlay}
            className="absolute inset-0 m-auto w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-gradient-to-br from-[#6750a4] via-[#7f67be] to-[#ffb4ab] text-white flex items-center justify-center shadow-2xl shadow-[#6750a4]/50 hover:scale-110 active:scale-95 transition ring-4 ring-white/40 z-20 cursor-pointer"
          >
            <Play className="w-8 h-8 sm:w-10 sm:h-10 fill-current ml-1" />
          </button>
        )}

        {/* Bottom Playback Control Bar */}
        <div className="w-full bg-[#fdf8ff] border-t border-[#e8def8] px-4 py-3.5 flex flex-col gap-2.5 z-20">
          {/* Progress Slider */}
          <div className="flex items-center gap-3">
            <span className="text-xs font-mono font-bold text-[#49454f]">
              {sceneTime.toFixed(1)}s
            </span>
            <div className="flex-1 relative flex items-center">
              <input
                type="range"
                min={0}
                max={activeScene?.durationSeconds || 5}
                step={0.1}
                value={sceneTime}
                onChange={(e) => {
                  const newTime = parseFloat(e.target.value);
                  sceneTimeRef.current = newTime;
                  setSceneTime(newTime);
                }}
                className="w-full h-2 bg-[#e8def8] rounded-lg appearance-none cursor-pointer accent-[#6750a4]"
              />
            </div>
            <span className="text-xs font-mono font-bold text-[#49454f]">
              {(activeScene?.durationSeconds || 5).toFixed(1)}s
            </span>
          </div>

          {/* Buttons Row */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {/* Previous Scene */}
              <button
                onClick={() => goToScene(activeSceneIndex - 1)}
                disabled={activeSceneIndex === 0}
                className="p-2 rounded-2xl text-[#49454f] hover:bg-[#eaddff] hover:text-[#21005d] disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Previous Scene"
              >
                <SkipBack className="w-4 h-4" />
              </button>

              {/* Play / Pause */}
              <button
                onClick={togglePlay}
                className="px-5 py-2 rounded-2xl bg-[#6750a4] hover:bg-[#523e85] text-white font-bold flex items-center gap-2 shadow-md shadow-[#6750a4]/25 transition hover:scale-105 active:scale-95 cursor-pointer"
              >
                {isPlaying ? <Pause className="w-4 h-4 fill-current" /> : <Play className="w-4 h-4 fill-current" />}
                <span className="text-xs">{isPlaying ? 'Pause' : 'Play Cartoon'}</span>
              </button>

              {/* Next Scene */}
              <button
                onClick={() => goToScene(activeSceneIndex + 1)}
                disabled={activeSceneIndex === totalScenes - 1}
                className="p-2 rounded-2xl text-[#49454f] hover:bg-[#eaddff] hover:text-[#21005d] disabled:opacity-30 disabled:hover:bg-transparent transition"
                title="Next Scene"
              >
                <SkipForward className="w-4 h-4" />
              </button>

              {/* Reset to Start */}
              <button
                onClick={() => goToScene(0)}
                className="p-2 rounded-2xl text-[#79747e] hover:text-[#1c1b1f] hover:bg-[#eaddff] transition"
                title="Restart from Beginning"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
            </div>

            {/* BGM Music & Speed controls */}
            <div className="flex items-center gap-2">
              {/* Background Music Selector */}
              <div className="hidden sm:flex items-center gap-1.5 bg-[#f3edf7] px-3 py-1.5 rounded-2xl border border-[#e8def8]">
                <Music className="w-3.5 h-3.5 text-[#6750a4]" />
                <select
                  value={project.bgMusic}
                  onChange={(e) => changeBgMusic(e.target.value as any)}
                  className="bg-transparent text-xs text-[#1c1b1f] font-semibold focus:outline-none cursor-pointer"
                >
                  <option value="bouncy_playful" className="bg-white">🎵 Bouncy Playful</option>
                  <option value="desi_dholak_beat" className="bg-white">🥁 Desi Dholak Beat</option>
                  <option value="adventure_epic" className="bg-white">🚀 Epic Adventure</option>
                  <option value="cute_xylophone" className="bg-white">✨ Cute Xylophone</option>
                  <option value="none" className="bg-white">🔇 No Music</option>
                </select>
              </div>

              {/* Playback Speed */}
              <select
                value={playbackSpeed}
                onChange={(e) => setPlaybackSpeed(parseFloat(e.target.value))}
                className="bg-[#eaddff] text-xs font-extrabold text-[#21005d] px-3 py-1.5 rounded-2xl border border-[#d0bcff] focus:outline-none cursor-pointer"
              >
                <option value="0.75" className="bg-white text-[#1c1b1f]">0.75x</option>
                <option value="1.0" className="bg-white text-[#1c1b1f]">1.0x</option>
                <option value="1.25" className="bg-white text-[#1c1b1f]">1.25x</option>
                <option value="1.5" className="bg-white text-[#1c1b1f]">1.5x</option>
              </select>

              {/* Edit Current Scene Button */}
              <button
                onClick={() => onOpenSceneEditor(activeSceneIndex)}
                className="px-3.5 py-1.5 rounded-2xl bg-[#eaddff] hover:bg-[#d0bcff] text-[#21005d] border border-[#d0bcff] text-xs font-bold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Wand2 className="w-3.5 h-3.5 text-[#6750a4]" />
                <span className="hidden md:inline">{language === 'hi-IN' ? 'सीन एडिट करें' : 'Edit Scene'}</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
