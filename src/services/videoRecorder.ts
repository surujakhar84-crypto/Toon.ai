import { CartoonProject } from '../types/cartoon';
import { CartoonRenderer } from './cartoonRenderer';
import { audioEngine } from './audioEngine';

export interface ExportProgress {
  currentScene: number;
  totalScenes: number;
  progressPercent: number;
  statusText: string;
}

export class VideoExporter {
  public static async exportCartoonVideo(
    project: CartoonProject,
    onProgress: (prog: ExportProgress) => void
  ): Promise<Blob> {
    return new Promise(async (resolve, reject) => {
      try {
        // Dimensions based on aspect ratio
        let width = 1280;
        let height = 720;
        if (project.aspectRatio === '9:16') {
          width = 720;
          height = 1280;
        } else if (project.aspectRatio === '1:1') {
          width = 720;
          height = 720;
        }

        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        if (!ctx) {
          throw new Error('Canvas 2D context not available');
        }

        // Prepare video stream
        const canvasStream = canvas.captureStream(30); // 30 FPS
        const audioStream = audioEngine.getAudioStream();
        
        const combinedStream = new MediaStream();
        canvasStream.getVideoTracks().forEach(track => combinedStream.addTrack(track));
        if (audioStream) {
          audioStream.getAudioTracks().forEach(track => combinedStream.addTrack(track));
        }

        // Determine supported mime type
        let mimeType = 'video/webm;codecs=vp9';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm;codecs=vp8';
        }
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'video/webm';
        }

        const recorder = new MediaRecorder(combinedStream, {
          mimeType: mimeType,
          videoBitsPerSecond: 2500000
        });

        const recordedChunks: Blob[] = [];
        recorder.ondataavailable = (e) => {
          if (e.data && e.data.size > 0) {
            recordedChunks.push(e.data);
          }
        };

        recorder.onstop = () => {
          const videoBlob = new Blob(recordedChunks, { type: 'video/webm' });
          resolve(videoBlob);
        };

        recorder.start();

        // Start BGM for export recording
        audioEngine.playBGM(project.bgMusic);

        const totalScenes = project.scenes.length;
        const fps = 30;
        const frameDuration = 1000 / fps;

        for (let sIdx = 0; sIdx < totalScenes; sIdx++) {
          const scene = project.scenes[sIdx];
          const sceneDurationSec = scene.durationSeconds || 5;
          const totalFramesInScene = Math.round(sceneDurationSec * fps);

          // Play Sound Effect
          if (scene.soundEffect && scene.soundEffect !== 'none') {
            audioEngine.playSoundEffect(scene.soundEffect);
          }

          // Trigger TTS Narration / Dialogue Voice
          const char = project.characters.find(c => scene.speakerName.includes(c.name));
          audioEngine.speakText(scene.dialogueText, {
            pitch: char?.voicePitch || 1.1,
            rate: char?.voiceRate || 1.0,
            lang: project.language === 'hi-IN' ? 'hi-IN' : 'en-US'
          });

          for (let f = 0; f < totalFramesInScene; f++) {
            const timeInScene = f / fps;
            const progress = ((sIdx + timeInScene / sceneDurationSec) / totalScenes) * 100;

            onProgress({
              currentScene: sIdx + 1,
              totalScenes,
              progressPercent: Math.round(progress),
              statusText: `Rendering Scene ${sIdx + 1} of ${totalScenes}...`
            });

            // Draw current frame
            CartoonRenderer.drawFrame(ctx, width, height, scene, project.characters, {
              timeInScene,
              currentSceneIndex: sIdx,
              totalSceneDuration: sceneDurationSec,
              isSpeaking: timeInScene < sceneDurationSec * 0.7
            });

            // Wait frame time
            await new Promise(r => setTimeout(r, frameDuration));
          }
        }

        // Finalize recording
        onProgress({
          currentScene: totalScenes,
          totalScenes,
          progressPercent: 100,
          statusText: 'Finalizing high-quality cartoon video file...'
        });

        audioEngine.stopBGM();
        audioEngine.stopSpeaking();
        recorder.stop();

      } catch (err) {
        audioEngine.stopBGM();
        audioEngine.stopSpeaking();
        reject(err);
      }
    });
  }
}
