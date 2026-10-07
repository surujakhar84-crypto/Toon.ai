import { CartoonScene, CartoonCharacter, SceneCharacterState, BgTheme, Emotion, Action, CharacterPosition } from '../types/cartoon';

export interface RenderState {
  timeInScene: number; // seconds
  currentSceneIndex: number;
  totalSceneDuration: number;
  isSpeaking: boolean;
  activeSpeakerId?: string;
}

export class CartoonRenderer {
  // Main draw function
  public static drawFrame(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    scene: CartoonScene,
    characters: CartoonCharacter[],
    renderState: RenderState
  ) {
    ctx.save();
    ctx.clearRect(0, 0, width, height);

    // Apply Camera Effects
    this.applyCameraEffect(ctx, width, height, scene.cameraEffect, renderState.timeInScene, scene.durationSeconds);

    // 1. Draw Background & Sky
    this.drawBackground(ctx, width, height, scene.bgTheme, scene.bgAnimation, renderState.timeInScene);

    // 2. Draw Characters (Supports up to 10 Locked Characters simultaneously with smart stage spacing)
    const activeChars = scene.characters || [];
    const totalInScene = activeChars.length;
    activeChars.forEach((charState, idx) => {
      const charDef = characters.find(c => c.id === charState.characterId) || {
        id: charState.characterId,
        name: 'Hero',
        avatarId: 'cute_bunny',
        primaryColor: '#FF6B6B',
        secondaryColor: '#4D96FF',
        role: 'protagonist',
        voicePitch: 1.2,
        voiceRate: 1.0,
        isLocked: true
      } as CartoonCharacter;

      const isSpeaking = renderState.isSpeaking && (scene.speakerName.includes(charDef.name) || idx === 0);
      this.drawCharacter(ctx, width, height, charDef, charState, renderState.timeInScene, isSpeaking, idx, totalInScene);
    });

    // 3. Draw Foreground Props & Particles
    this.drawForegroundEffects(ctx, width, height, scene.bgAnimation, scene.soundEffect, renderState.timeInScene);

    // Reset Camera transform for UI overlays
    ctx.restore();

    // 4. Draw Cartoon Speech Bubble & Subtitles (Screen space)
    if (scene.dialogueText) {
      this.drawSpeechBubble(ctx, width, height, scene.speakerName, scene.dialogueText, renderState.timeInScene);
    }
  }

  // Camera Transformation
  private static applyCameraEffect(
    ctx: CanvasRenderingContext2D,
    width: number,
    height: number,
    effect: CartoonScene['cameraEffect'],
    time: number,
    duration: number
  ) {
    const progress = Math.min(1, Math.max(0, time / duration));
    const cx = width / 2;
    const cy = height / 2;

    ctx.translate(cx, cy);

    switch (effect) {
      case 'zoom_in': {
        const scale = 1 + progress * 0.12;
        ctx.scale(scale, scale);
        break;
      }
      case 'zoom_out': {
        const scale = 1.12 - progress * 0.12;
        ctx.scale(scale, scale);
        break;
      }
      case 'pan_left': {
        const dx = (1 - progress) * 40 - 20;
        ctx.translate(dx, 0);
        break;
      }
      case 'pan_right': {
        const dx = progress * 40 - 20;
        ctx.translate(dx, 0);
        break;
      }
      case 'shake': {
        if (time < 0.6) {
          const shakeMag = (1 - time / 0.6) * 12;
          const sx = Math.sin(time * 50) * shakeMag;
          const sy = Math.cos(time * 45) * shakeMag;
          ctx.translate(sx, sy);
        }
        break;
      }
      case 'ken_burns': {
        const scale = 1 + Math.sin(progress * Math.PI) * 0.08;
        const dx = Math.sin(progress * Math.PI) * 15;
        ctx.scale(scale, scale);
        ctx.translate(dx, 0);
        break;
      }
      default:
        break;
    }

    ctx.translate(-cx, -cy);
  }

  // --- BACKGROUNDS ---
  private static drawBackground(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    theme: BgTheme,
    anim: CartoonScene['bgAnimation'],
    time: number
  ) {
    switch (theme) {
      case 'jungle':
        this.drawJungleBg(ctx, w, h, time);
        break;
      case 'space_planet':
        this.drawSpaceBg(ctx, w, h, time);
        break;
      case 'city_street':
        this.drawCityBg(ctx, w, h, time);
        break;
      case 'magic_forest':
        this.drawMagicForestBg(ctx, w, h, time);
        break;
      case 'candy_land':
        this.drawCandyLandBg(ctx, w, h, time);
        break;
      case 'classroom':
        this.drawClassroomBg(ctx, w, h, time);
        break;
      case 'castle':
        this.drawCastleBg(ctx, w, h, time);
        break;
      case 'beach_ocean':
        this.drawBeachBg(ctx, w, h, time);
        break;
      case 'superhero_rooftop':
        this.drawRooftopBg(ctx, w, h, time);
        break;
      default:
        this.drawJungleBg(ctx, w, h, time);
        break;
    }
  }

  // Jungle Theme
  private static drawJungleBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Sky
    const skyGrad = ctx.createLinearGradient(0, 0, 0, h);
    skyGrad.addColorStop(0, '#74B9FF');
    skyGrad.addColorStop(0.6, '#A8E6CF');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, h);

    // Smiling Sun
    const sunX = w * 0.85;
    const sunY = h * 0.18;
    const sunPulse = 1 + Math.sin(t * 3) * 0.05;
    ctx.save();
    ctx.fillStyle = '#FDCB6E';
    ctx.beginPath();
    ctx.arc(sunX, sunY, 36 * sunPulse, 0, Math.PI * 2);
    ctx.fill();
    // Sun rays
    ctx.strokeStyle = '#FFEAA7';
    ctx.lineWidth = 4;
    for (let i = 0; i < 8; i++) {
      const angle = (i * Math.PI) / 4 + t * 0.2;
      ctx.beginPath();
      ctx.moveTo(sunX + Math.cos(angle) * 44, sunY + Math.sin(angle) * 44);
      ctx.lineTo(sunX + Math.cos(angle) * 58, sunY + Math.sin(angle) * 58);
      ctx.stroke();
    }
    // Sun face
    ctx.fillStyle = '#2D3436';
    ctx.beginPath();
    ctx.arc(sunX - 10, sunY - 4, 3.5, 0, Math.PI * 2);
    ctx.arc(sunX + 10, sunY - 4, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(sunX, sunY + 6, 12, 0, Math.PI);
    ctx.stroke();
    ctx.restore();

    // Fluffy clouds drifting
    const cloud1X = ((t * 18 + w * 0.1) % (w + 140)) - 70;
    const cloud2X = ((t * 12 + w * 0.55) % (w + 140)) - 70;
    this.drawCloud(ctx, cloud1X, h * 0.15, 45);
    this.drawCloud(ctx, cloud2X, h * 0.26, 35);

    // Distant jungle hills
    ctx.fillStyle = '#55EFC4';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.65);
    ctx.quadraticCurveTo(w * 0.25, h * 0.52, w * 0.5, h * 0.64);
    ctx.quadraticCurveTo(w * 0.75, h * 0.56, w, h * 0.62);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Foreground lush grass hills
    ctx.fillStyle = '#00B894';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.quadraticCurveTo(w * 0.35, h * 0.68, w * 0.7, h * 0.75);
    ctx.quadraticCurveTo(w * 0.85, h * 0.73, w, h * 0.7);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Cartoon Palm Tree on left
    const treeSway = Math.sin(t * 2) * 6;
    ctx.save();
    ctx.fillStyle = '#833471'; // stylized trunk
    ctx.beginPath();
    ctx.moveTo(40, h * 0.75);
    ctx.quadraticCurveTo(55 + treeSway * 0.5, h * 0.55, 60 + treeSway, h * 0.38);
    ctx.lineTo(75 + treeSway, h * 0.38);
    ctx.quadraticCurveTo(68 + treeSway * 0.5, h * 0.55, 58, h * 0.75);
    ctx.fill();

    // Palm leaves
    const leavesCenter = { x: 67 + treeSway, y: h * 0.38 };
    ctx.fillStyle = '#10AC84';
    for (let i = 0; i < 5; i++) {
      const leafAngle = (i * Math.PI) / 3 - Math.PI / 1.5 + Math.sin(t * 2.5 + i) * 0.1;
      ctx.beginPath();
      ctx.ellipse(
        leavesCenter.x + Math.cos(leafAngle) * 35,
        leavesCenter.y + Math.sin(leafAngle) * 20,
        38,
        14,
        leafAngle,
        0,
        Math.PI * 2
      );
      ctx.fill();
    }
    // Coconuts
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(leavesCenter.x - 8, leavesCenter.y + 6, 8, 0, Math.PI * 2);
    ctx.arc(leavesCenter.x + 8, leavesCenter.y + 6, 8, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Little flowers on grass
    this.drawLittleFlower(ctx, w * 0.18, h * 0.78, '#FD79A8');
    this.drawLittleFlower(ctx, w * 0.82, h * 0.82, '#FEEAA7');
    this.drawLittleFlower(ctx, w * 0.9, h * 0.76, '#74B9FF');
  }

  // Space Theme
  private static drawSpaceBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const bgGrad = ctx.createLinearGradient(0, 0, 0, h);
    bgGrad.addColorStop(0, '#0F0C29');
    bgGrad.addColorStop(0.5, '#302B63');
    bgGrad.addColorStop(1, '#24243E');
    ctx.fillStyle = bgGrad;
    ctx.fillRect(0, 0, w, h);

    // Glowing Nebula
    const neb = ctx.createRadialGradient(w * 0.3, h * 0.3, 10, w * 0.3, h * 0.3, 180);
    neb.addColorStop(0, 'rgba(255, 107, 129, 0.3)');
    neb.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = neb;
    ctx.fillRect(0, 0, w, h);

    // Stars
    for (let i = 0; i < 35; i++) {
      const sx = ((i * 67 + 23) % w);
      const sy = ((i * 91 + 17) % (h * 0.7));
      const twinkle = Math.sin(t * 4 + i) * 0.5 + 0.5;
      ctx.fillStyle = `rgba(255, 255, 255, ${0.4 + twinkle * 0.6})`;
      ctx.beginPath();
      ctx.arc(sx, sy, (i % 3 === 0 ? 3 : 1.8) * (0.8 + twinkle * 0.4), 0, Math.PI * 2);
      ctx.fill();
    }

    // Giant Ringed Cartoon Planet
    const px = w * 0.8;
    const py = h * 0.28;
    ctx.save();
    ctx.fillStyle = '#FD79A8';
    ctx.beginPath();
    ctx.arc(px, py, 42, 0, Math.PI * 2);
    ctx.fill();
    // Planet stripes
    ctx.fillStyle = '#6C5CE7';
    ctx.beginPath();
    ctx.ellipse(px, py, 42, 12, 0.2, 0, Math.PI * 2);
    ctx.fill();
    // Planet ring
    ctx.strokeStyle = '#FEEAA7';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.ellipse(px, py, 75, 18, -0.35, 0, Math.PI * 2);
    ctx.stroke();
    ctx.restore();

    // Floating Alien Space Station / Ground
    ctx.fillStyle = '#2C2C54';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.quadraticCurveTo(w * 0.5, h * 0.68, w, h * 0.75);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Futuristic Neon Ground Trim
    ctx.strokeStyle = '#00CEC9';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.75);
    ctx.quadraticCurveTo(w * 0.5, h * 0.68, w, h * 0.75);
    ctx.stroke();
  }

  // City Street Theme
  private static drawCityBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.7);
    sky.addColorStop(0, '#FFA07A');
    sky.addColorStop(1, '#87CEEB');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Distant buildings
    ctx.fillStyle = '#B2BEC3';
    const bCount = 8;
    const bW = w / bCount;
    for (let i = 0; i < bCount; i++) {
      const bH = 120 + ((i * 37) % 100);
      ctx.fillRect(i * bW, h * 0.65 - bH, bW - 4, bH);
      // Windows
      ctx.fillStyle = '#DFE6E9';
      for (let r = 0; r < 4; r++) {
        for (let c = 0; c < 2; c++) {
          ctx.fillRect(i * bW + 8 + c * 14, h * 0.65 - bH + 12 + r * 22, 8, 12);
        }
      }
      ctx.fillStyle = '#B2BEC3';
    }

    // Road
    ctx.fillStyle = '#636E72';
    ctx.fillRect(0, h * 0.65, w, h * 0.35);

    // Sidewalk
    ctx.fillStyle = '#B2BEC3';
    ctx.fillRect(0, h * 0.65, w, 22);

    // Road dashed stripes
    ctx.fillStyle = '#FFEAA7';
    for (let i = 0; i < w; i += 60) {
      ctx.fillRect(i, h * 0.82, 35, 6);
    }
  }

  // Magic Forest Theme
  private static drawMagicForestBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#2D142C');
    sky.addColorStop(0.6, '#510A32');
    sky.addColorStop(1, '#801336');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Glowing Magical Moon
    ctx.fillStyle = '#E5E5FF';
    ctx.beginPath();
    ctx.arc(w * 0.2, h * 0.2, 40, 0, Math.PI * 2);
    ctx.fill();

    // Floating fairy sparkles
    for (let i = 0; i < 20; i++) {
      const fx = (w * 0.1 + i * 47 + Math.sin(t * 2 + i) * 20) % w;
      const fy = (h * 0.2 + (i * 31 + t * 25) % (h * 0.6));
      ctx.fillStyle = i % 2 === 0 ? '#FFEAA7' : '#00CEC9';
      ctx.beginPath();
      ctx.arc(fx, fy, 3 + Math.sin(t * 4 + i) * 1.5, 0, Math.PI * 2);
      ctx.fill();
    }

    // Glowing Mushrooms on hills
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.4, h * 0.6, w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Giant magical mushroom
    this.drawMushroom(ctx, w * 0.15, h * 0.72, '#FD79A8', '#FFEAA7');
    this.drawMushroom(ctx, w * 0.85, h * 0.74, '#00CEC9', '#FFFFFF');
  }

  // Candy Land Theme
  private static drawCandyLandBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#FF9FF3');
    sky.addColorStop(0.7, '#FECA57');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Rainbow arch
    ctx.save();
    ctx.lineWidth = 10;
    const colors = ['#FF6B6B', '#FECA57', '#48DBFB', '#1DD1A1', '#5F27CD'];
    colors.forEach((c, idx) => {
      ctx.strokeStyle = c;
      ctx.beginPath();
      ctx.arc(w * 0.5, h * 0.7, 180 + idx * 10, Math.PI, 0);
      ctx.stroke();
    });
    ctx.restore();

    // Marshmallow ground
    ctx.fillStyle = '#FF9FF3';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.7);
    ctx.quadraticCurveTo(w * 0.3, h * 0.62, w * 0.6, h * 0.7);
    ctx.quadraticCurveTo(w * 0.85, h * 0.65, w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();

    // Giant Lollipop on right
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(w * 0.88 - 4, h * 0.4, 8, h * 0.35);
    ctx.fillStyle = '#FF6B6B';
    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.38, 30, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = '#FFFFFF';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.arc(w * 0.88, h * 0.38, 16, 0, Math.PI * 2);
    ctx.stroke();
  }

  // Classroom Theme
  private static drawClassroomBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Wall
    ctx.fillStyle = '#FFF9E6';
    ctx.fillRect(0, 0, w, h);

    // Blackboard
    ctx.fillStyle = '#2C3E50';
    ctx.fillRect(w * 0.15, h * 0.15, w * 0.7, h * 0.45);
    ctx.strokeStyle = '#D35400';
    ctx.lineWidth = 10;
    ctx.strokeRect(w * 0.15, h * 0.15, w * 0.7, h * 0.45);

    // Blackboard Text
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 22px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('✏️ Toon School ABC 123 🎨', w * 0.5, h * 0.32);
    ctx.font = '16px sans-serif';
    ctx.fillStyle = '#FFEAA7';
    ctx.fillText('★ Welcome Friends! ★', w * 0.5, h * 0.42);

    // Floor
    ctx.fillStyle = '#E67E22';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
  }

  // Castle Theme
  private static drawCastleBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#686DE0');
    sky.addColorStop(1, '#E056FD');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Castle Silhouette
    ctx.fillStyle = '#4834D4';
    // Center tower
    ctx.fillRect(w * 0.4, h * 0.35, w * 0.2, h * 0.4);
    // Left tower
    ctx.fillRect(w * 0.25, h * 0.42, w * 0.12, h * 0.35);
    // Right tower
    ctx.fillRect(w * 0.63, h * 0.42, w * 0.12, h * 0.35);
    // Cone roofs
    ctx.fillStyle = '#FF5252';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h * 0.35);
    ctx.lineTo(w * 0.5, h * 0.22);
    ctx.lineTo(w * 0.6, h * 0.35);
    ctx.fill();

    // Rolling hill
    ctx.fillStyle = '#6AB04C';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.72);
    ctx.quadraticCurveTo(w * 0.5, h * 0.66, w, h * 0.72);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }

  // Beach Theme
  private static drawBeachBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Sky
    const sky = ctx.createLinearGradient(0, 0, 0, h * 0.5);
    sky.addColorStop(0, '#00D2D3');
    sky.addColorStop(1, '#54A0FF');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Ocean Water
    ctx.fillStyle = '#2E86DE';
    ctx.fillRect(0, h * 0.48, w, h * 0.22);
    // Animated Waves
    ctx.fillStyle = '#FFFFFF';
    for (let i = 0; i < w; i += 40) {
      const waveY = h * 0.52 + Math.sin(t * 3 + i) * 4;
      ctx.beginPath();
      ctx.arc(i + 20, waveY, 15, 0, Math.PI);
      ctx.fill();
    }

    // Sandy Beach
    ctx.fillStyle = '#FECA57';
    ctx.beginPath();
    ctx.moveTo(0, h * 0.68);
    ctx.quadraticCurveTo(w * 0.5, h * 0.64, w, h * 0.7);
    ctx.lineTo(w, h);
    ctx.lineTo(0, h);
    ctx.fill();
  }

  // Superhero Rooftop
  private static drawRooftopBg(ctx: CanvasRenderingContext2D, w: number, h: number, t: number) {
    // Night sky
    const sky = ctx.createLinearGradient(0, 0, 0, h);
    sky.addColorStop(0, '#130F40');
    sky.addColorStop(1, '#30336B');
    ctx.fillStyle = sky;
    ctx.fillRect(0, 0, w, h);

    // Big Yellow Full Moon
    ctx.fillStyle = '#F9CA24';
    ctx.beginPath();
    ctx.arc(w * 0.8, h * 0.22, 45, 0, Math.PI * 2);
    ctx.fill();

    // Spotlight beam
    ctx.save();
    const spotAngle = Math.sin(t * 1.5) * 0.3 - 0.2;
    ctx.translate(w * 0.3, h * 0.7);
    ctx.rotate(spotAngle);
    const spotGrad = ctx.createLinearGradient(0, 0, 0, -h * 0.8);
    spotGrad.addColorStop(0, 'rgba(255, 255, 255, 0.4)');
    spotGrad.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = spotGrad;
    ctx.beginPath();
    ctx.moveTo(-10, 0);
    ctx.lineTo(-60, -h * 0.7);
    ctx.lineTo(60, -h * 0.7);
    ctx.lineTo(10, 0);
    ctx.fill();
    ctx.restore();

    // Rooftop floor
    ctx.fillStyle = '#222F3E';
    ctx.fillRect(0, h * 0.7, w, h * 0.3);
    // Rooftop fence/brick trim
    ctx.fillStyle = '#576574';
    ctx.fillRect(0, h * 0.67, w, 16);
  }

  // --- CHARACTER DRAWING ---
  private static drawCharacter(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    char: CartoonCharacter,
    state: SceneCharacterState,
    t: number,
    isSpeaking: boolean,
    charIndex: number = 0,
    totalInScene: number = 1
  ) {
    // Compute X position with smart multi-character distribution (up to 10 characters)
    let x = w * 0.5;
    if (totalInScene > 2) {
      const margin = w * 0.14;
      const usableW = w - margin * 2;
      x = margin + (usableW * charIndex) / Math.max(1, totalInScene - 1);
      if (state.position === 'moving_left_to_right') {
        const progress = (t % 5) / 5;
        x = w * 0.1 + progress * (w * 0.8);
      }
    } else {
      if (state.position === 'left') x = w * 0.25;
      if (state.position === 'right') x = w * 0.75;
      if (state.position === 'moving_left_to_right') {
        const progress = (t % 5) / 5;
        x = w * 0.1 + progress * (w * 0.8);
      }
    }

    const rowOffset = totalInScene > 4 ? (charIndex % 2 === 0 ? -12 : 14) : 0;
    let y = h * 0.74 + rowOffset; // ground level baseline
    let scale = state.scale || (totalInScene > 5 ? 0.78 : totalInScene > 3 ? 0.88 : 1.0);

    // Action offsets and rotations
    let bodyBob = Math.sin(t * 6) * 4;
    let armLeftAngle = 0;
    let armRightAngle = 0;
    let legAngle = 0;
    let jumpY = 0;

    switch (state.action) {
      case 'walking':
      case 'running': {
        const speed = state.action === 'running' ? 12 : 7;
        bodyBob = Math.abs(Math.sin(t * speed)) * 8;
        legAngle = Math.sin(t * speed) * 0.5;
        armLeftAngle = -Math.sin(t * speed) * 0.6;
        armRightAngle = Math.sin(t * speed) * 0.6;
        break;
      }
      case 'jumping': {
        jumpY = -Math.abs(Math.sin(t * 5)) * 45;
        armLeftAngle = -1.2;
        armRightAngle = 1.2;
        break;
      }
      case 'dancing': {
        bodyBob = Math.sin(t * 8) * 8;
        armLeftAngle = Math.sin(t * 6) * 1.0 - 0.5;
        armRightAngle = -Math.cos(t * 6) * 1.0 + 0.5;
        scale *= 1 + Math.sin(t * 8) * 0.04;
        break;
      }
      case 'flying': {
        jumpY = -40 + Math.sin(t * 4) * 12;
        armLeftAngle = -1.4;
        armRightAngle = 1.4;
        break;
      }
      case 'waving': {
        armRightAngle = -1.8 + Math.sin(t * 10) * 0.4;
        break;
      }
      case 'fighting': {
        bodyBob = Math.sin(t * 10) * 6;
        armLeftAngle = -1.0 + Math.sin(t * 12) * 0.5;
        armRightAngle = 0.8;
        break;
      }
      default: // talking / idle
        bodyBob = Math.sin(t * 4) * 3;
        if (isSpeaking) {
          armRightAngle = -0.6 + Math.sin(t * 8) * 0.3;
        }
        break;
    }

    ctx.save();
    ctx.translate(x, y + jumpY - bodyBob);
    ctx.scale(scale, scale);

    // Draw Character Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.ellipse(0, bodyBob - jumpY + 4, 34 * (1 - Math.min(1, Math.abs(jumpY) / 100) * 0.5), 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Render Specific Avatar Archetype
    switch (char.avatarId) {
      case 'cute_bunny':
        this.renderBunny(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'robot_friend':
        this.renderRobot(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'super_kid':
        this.renderSuperKid(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'clever_monkey':
        this.renderMonkey(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'friendly_dino':
        this.renderDino(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'tiger_sher':
        this.renderTiger(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      case 'girl_explorer':
        this.renderGirl(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
      default:
        this.renderKidHero(ctx, char, state.emotion, isSpeaking, armLeftAngle, armRightAngle, legAngle, t);
        break;
    }

    // Draw Character Nameplate & Lock Badge below feet
    ctx.save();
    const labelText = char.isLocked ? `🔒 ${char.name}` : char.name;
    ctx.font = 'bold 11px sans-serif';
    const textW = Math.max(48, ctx.measureText(labelText).width + 14);
    ctx.fillStyle = char.isLocked ? 'rgba(103, 80, 164, 0.9)' : 'rgba(28, 27, 31, 0.75)';
    ctx.beginPath();
    ctx.roundRect(-textW / 2, 12, textW, 18, 9);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(labelText, 0, 21);
    ctx.restore();

    ctx.restore();
  }

  // --- AVATAR RENDERING IMPLEMENTATIONS ---

  // 1. Bunny Khargosh
  private static renderBunny(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Fluffy Ears
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E0E0E0';
    ctx.lineWidth = 3;
    // Left ear
    ctx.beginPath();
    ctx.ellipse(-16, -95 + Math.sin(t * 5) * 3, 10, 32, -0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner ear
    ctx.fillStyle = '#FFB8B8';
    ctx.beginPath();
    ctx.ellipse(-16, -95 + Math.sin(t * 5) * 3, 5, 22, -0.15, 0, Math.PI * 2);
    ctx.fill();

    // Right ear
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(16, -95 + Math.cos(t * 5) * 3, 10, 32, 0.15, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    // Inner ear
    ctx.fillStyle = '#FFB8B8';
    ctx.beginPath();
    ctx.ellipse(16, -95 + Math.cos(t * 5) * 3, 5, 22, 0.15, 0, Math.PI * 2);
    ctx.fill();

    // Body (Shirt)
    ctx.fillStyle = char.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, -25, 26, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#FFFFFF';
    ctx.strokeStyle = '#E0E0E0';
    ctx.beginPath();
    ctx.arc(0, -60, 32, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Cheeks
    ctx.fillStyle = 'rgba(255, 107, 129, 0.4)';
    ctx.beginPath();
    ctx.arc(-18, -52, 7, 0, Math.PI * 2);
    ctx.arc(18, -52, 7, 0, Math.PI * 2);
    ctx.fill();

    // Eyes & Mouth
    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);

    // Bunny Nose & Whiskers
    ctx.fillStyle = '#FF7675';
    ctx.beginPath();
    ctx.arc(0, -56, 4, 0, Math.PI * 2);
    ctx.fill();

    // Arms
    this.renderCartoonArms(ctx, char.primaryColor, armL, armR, -30);
    // Feet
    this.renderCartoonFeet(ctx, '#FFFFFF', leg);
  }

  // 2. Robot Friend
  private static renderRobot(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Antenna
    ctx.strokeStyle = '#636E72';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(0, -85);
    ctx.lineTo(0, -102);
    ctx.stroke();
    // Blinking antenna bulb
    ctx.fillStyle = Math.sin(t * 8) > 0 ? '#00CEC9' : '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, -105, 7, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = char.primaryColor;
    ctx.beginPath();
    ctx.roundRect(-25, -45, 50, 42, 8);
    ctx.fill();
    // Chest screen / meters
    ctx.fillStyle = '#2D3436';
    ctx.fillRect(-16, -38, 32, 18);
    ctx.fillStyle = '#55EFC4';
    ctx.fillRect(-12, -34, 8 + Math.abs(Math.sin(t * 5)) * 14, 10);

    // Head
    ctx.fillStyle = char.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(-28, -88, 56, 42, 10);
    ctx.fill();

    // Visor Eye Screen
    ctx.fillStyle = '#1E272E';
    ctx.beginPath();
    ctx.roundRect(-22, -80, 44, 18, 6);
    ctx.fill();

    // Glowing Robot Eyes
    ctx.fillStyle = '#00CEC9';
    if (emotion === 'wink') {
      ctx.fillRect(-16, -74, 10, 4);
      ctx.beginPath();
      ctx.arc(10, -72, 4, 0, Math.PI * 2);
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(-10, -72, 4, 0, Math.PI * 2);
      ctx.arc(10, -72, 4, 0, Math.PI * 2);
      ctx.fill();
    }

    // Robot Mouth (grid LED)
    ctx.fillStyle = isSpeaking ? (Math.sin(t * 12) > 0 ? '#00CEC9' : '#FFEAA7') : '#00CEC9';
    ctx.fillRect(-12, -58, 24, 3);

    // Arms & Feet
    this.renderCartoonArms(ctx, '#B2BEC3', armL, armR, -32);
    this.renderCartoonFeet(ctx, '#636E72', leg);
  }

  // 3. Super Kid Hero
  private static renderSuperKid(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Flowing Cape behind
    ctx.fillStyle = '#E74C3C';
    ctx.beginPath();
    const capeFlap = Math.sin(t * 10) * 12;
    ctx.moveTo(-15, -45);
    ctx.lineTo(-32 + capeFlap, 5);
    ctx.lineTo(32 + capeFlap, 5);
    ctx.lineTo(15, -45);
    ctx.fill();

    // Body (Suit)
    ctx.fillStyle = char.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, -25, 24, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Gold Shield / Star Emblem on chest
    ctx.fillStyle = '#F1C40F';
    ctx.beginPath();
    ctx.arc(0, -26, 9, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 10px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText('⚡', 0, -22);

    // Head
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, -60, 30, 0, Math.PI * 2);
    ctx.fill();

    // Hero Mask
    ctx.fillStyle = char.secondaryColor;
    ctx.beginPath();
    ctx.roundRect(-24, -68, 48, 14, 6);
    ctx.fill();

    // Hair
    ctx.fillStyle = '#2C3E50';
    ctx.beginPath();
    ctx.arc(0, -75, 26, Math.PI, 0);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t, true);
    this.renderCartoonArms(ctx, char.primaryColor, armL, armR, -30);
    this.renderCartoonFeet(ctx, '#E74C3C', leg);
  }

  // 4. Monkey (Bandar Mama)
  private static renderMonkey(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Tail
    ctx.strokeStyle = '#D35400';
    ctx.lineWidth = 6;
    ctx.beginPath();
    ctx.moveTo(-10, -20);
    const tailWiggle = Math.sin(t * 6) * 15;
    ctx.bezierCurveTo(-35, -20, -45 + tailWiggle, -50, -30 + tailWiggle, -65);
    ctx.stroke();

    // Big Ears
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.arc(-32, -60, 12, 0, Math.PI * 2);
    ctx.arc(32, -60, 12, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(-32, -60, 6, 0, Math.PI * 2);
    ctx.arc(32, -60, 6, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.ellipse(0, -25, 24, 26, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tummy
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.ellipse(0, -22, 15, 18, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#E67E22';
    ctx.beginPath();
    ctx.arc(0, -60, 28, 0, Math.PI * 2);
    ctx.fill();

    // Muzzle
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.ellipse(0, -52, 18, 14, 0, 0, Math.PI * 2);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);
    this.renderCartoonArms(ctx, '#E67E22', armL, armR, -28);
    this.renderCartoonFeet(ctx, '#D35400', leg);
  }

  // 5. Dino Baby
  private static renderDino(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Back Spikes
    ctx.fillStyle = '#F1C40F';
    for (let i = 0; i < 4; i++) {
      const sy = -80 + i * 20;
      ctx.beginPath();
      ctx.moveTo(-24, sy);
      ctx.lineTo(-38, sy + 8);
      ctx.lineTo(-24, sy + 16);
      ctx.fill();
    }

    // Body
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.ellipse(0, -25, 28, 28, 0, 0, Math.PI * 2);
    ctx.fill();
    // Tummy
    ctx.fillStyle = '#A8E6CF';
    ctx.beginPath();
    ctx.ellipse(4, -22, 16, 20, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#2ECC71';
    ctx.beginPath();
    ctx.arc(0, -60, 32, 0, Math.PI * 2);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);
    this.renderCartoonArms(ctx, '#27AE60', armL, armR, -28);
    this.renderCartoonFeet(ctx, '#27AE60', leg);
  }

  // 6. Tiger Sheru
  private static renderTiger(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Ears
    ctx.fillStyle = '#FF9F43';
    ctx.beginPath();
    ctx.arc(-22, -85, 10, 0, Math.PI * 2);
    ctx.arc(22, -85, 10, 0, Math.PI * 2);
    ctx.fill();

    // Body
    ctx.fillStyle = '#FF9F43';
    ctx.beginPath();
    ctx.ellipse(0, -25, 26, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#FF9F43';
    ctx.beginPath();
    ctx.arc(0, -60, 30, 0, Math.PI * 2);
    ctx.fill();

    // Tiger Stripes
    ctx.fillStyle = '#2D3436';
    ctx.fillRect(-28, -62, 8, 4);
    ctx.fillRect(20, -62, 8, 4);
    ctx.fillRect(-4, -86, 8, 6);

    // Muzzle
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.ellipse(0, -50, 16, 12, 0, 0, Math.PI * 2);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);
    this.renderCartoonArms(ctx, '#FF9F43', armL, armR, -28);
    this.renderCartoonFeet(ctx, '#EE5253', leg);
  }

  // 7. Girl Explorer (Pinky / Maya)
  private static renderGirl(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Twin Hair Buns with Bows
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(-28, -78, 14, 0, Math.PI * 2);
    ctx.arc(28, -78, 14, 0, Math.PI * 2);
    ctx.fill();
    // Pink Bows
    ctx.fillStyle = '#FD79A8';
    ctx.beginPath();
    ctx.arc(-24, -68, 6, 0, Math.PI * 2);
    ctx.arc(24, -68, 6, 0, Math.PI * 2);
    ctx.fill();

    // Body (Dress)
    ctx.fillStyle = char.primaryColor;
    ctx.beginPath();
    ctx.moveTo(-15, -45);
    ctx.lineTo(-26, 0);
    ctx.lineTo(26, 0);
    ctx.lineTo(15, -45);
    ctx.fill();

    // Head
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, -60, 28, 0, Math.PI * 2);
    ctx.fill();

    // Bangs
    ctx.fillStyle = '#6D4C41';
    ctx.beginPath();
    ctx.arc(0, -72, 26, Math.PI, 0);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);
    this.renderCartoonArms(ctx, '#FFEAA7', armL, armR, -32);
    this.renderCartoonFeet(ctx, '#FD79A8', leg);
  }

  // 8. Boy Hero Kid (Chintu)
  private static renderKidHero(
    ctx: CanvasRenderingContext2D,
    char: CartoonCharacter,
    emotion: Emotion,
    isSpeaking: boolean,
    armL: number,
    armR: number,
    leg: number,
    t: number
  ) {
    // Cool Cap / Hair
    ctx.fillStyle = '#D63031';
    ctx.beginPath();
    ctx.arc(0, -72, 28, Math.PI, 0);
    ctx.fill();
    // Cap visor
    ctx.fillRect(8, -74, 26, 6);

    // Body (Hoodie)
    ctx.fillStyle = char.primaryColor;
    ctx.beginPath();
    ctx.ellipse(0, -25, 25, 28, 0, 0, Math.PI * 2);
    ctx.fill();

    // Head
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, -58, 28, 0, Math.PI * 2);
    ctx.fill();

    this.renderFacialFeatures(ctx, emotion, isSpeaking, t);
    this.renderCartoonArms(ctx, char.primaryColor, armL, armR, -30);
    this.renderCartoonFeet(ctx, '#0984E3', leg);
  }

  // Facial features (Eyes, Blinking, Mouth, Expression)
  private static renderFacialFeatures(
    ctx: CanvasRenderingContext2D,
    emotion: Emotion,
    isSpeaking: boolean,
    t: number,
    masked: boolean = false
  ) {
    const blink = Math.sin(t * 2.5) > 0.96;

    // Eyes
    ctx.fillStyle = '#2D3436';
    if (blink) {
      // Blinking lines
      ctx.lineWidth = 3;
      ctx.strokeStyle = '#2D3436';
      ctx.beginPath();
      ctx.moveTo(-16, -62);
      ctx.lineTo(-6, -62);
      ctx.moveTo(6, -62);
      ctx.lineTo(16, -62);
      ctx.stroke();
    } else if (emotion === 'wink') {
      // Left eye open, right eye winking
      ctx.beginPath();
      ctx.arc(-11, -62, 5, 0, Math.PI * 2);
      ctx.fill();
      // Eye reflection highlight
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-13, -64, 2, 0, Math.PI * 2);
      ctx.fill();
      // Wink arc
      ctx.strokeStyle = '#2D3436';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(11, -62, 6, Math.PI * 0.2, Math.PI * 0.8);
      ctx.stroke();
    } else if (emotion === 'shocked') {
      ctx.beginPath();
      ctx.arc(-11, -62, 7, 0, Math.PI * 2);
      ctx.arc(11, -62, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-11, -62, 3, 0, Math.PI * 2);
      ctx.arc(11, -62, 3, 0, Math.PI * 2);
      ctx.fill();
    } else {
      // Happy / excited eyes
      ctx.beginPath();
      ctx.arc(-11, -62, 5.5, 0, Math.PI * 2);
      ctx.arc(11, -62, 5.5, 0, Math.PI * 2);
      ctx.fill();
      // Shiny reflection
      ctx.fillStyle = '#FFFFFF';
      ctx.beginPath();
      ctx.arc(-13, -64, 2, 0, Math.PI * 2);
      ctx.arc(9, -64, 2, 0, Math.PI * 2);
      ctx.fill();
    }

    // Mouth
    ctx.fillStyle = '#D63031';
    ctx.strokeStyle = '#2D3436';
    ctx.lineWidth = 2.5;

    if (isSpeaking) {
      // Talking animation (opens and closes)
      const mouthOpen = Math.abs(Math.sin(t * 14)) * 9 + 3;
      ctx.beginPath();
      ctx.ellipse(0, -48, 8, mouthOpen, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
      // Tongue
      ctx.fillStyle = '#FF7675';
      ctx.beginPath();
      ctx.arc(0, -46, 5, 0, Math.PI);
      ctx.fill();
    } else if (emotion === 'laughing' || emotion === 'excited') {
      // Big open smile
      ctx.beginPath();
      ctx.arc(0, -50, 11, 0, Math.PI);
      ctx.fill();
      ctx.stroke();
      ctx.fillStyle = '#FF7675';
      ctx.beginPath();
      ctx.arc(0, -45, 6, 0, Math.PI);
      ctx.fill();
    } else if (emotion === 'sad') {
      // Downward curve
      ctx.beginPath();
      ctx.arc(0, -42, 9, Math.PI * 1.1, Math.PI * 1.9);
      ctx.stroke();
    } else {
      // Gentle smile
      ctx.beginPath();
      ctx.arc(0, -51, 8, 0.1 * Math.PI, 0.9 * Math.PI);
      ctx.stroke();
    }
  }

  // Arms Helper
  private static renderCartoonArms(
    ctx: CanvasRenderingContext2D,
    color: string,
    armL: number,
    armR: number,
    pivotY: number
  ) {
    ctx.lineWidth = 7;
    ctx.strokeStyle = color;
    ctx.lineCap = 'round';

    // Left Arm
    ctx.save();
    ctx.translate(-20, pivotY);
    ctx.rotate(armL);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.stroke();
    // Hand
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, 25, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Arm
    ctx.save();
    ctx.translate(20, pivotY);
    ctx.rotate(armR);
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, 24);
    ctx.stroke();
    // Hand
    ctx.fillStyle = '#FFEAA7';
    ctx.beginPath();
    ctx.arc(0, 25, 5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Feet Helper
  private static renderCartoonFeet(ctx: CanvasRenderingContext2D, color: string, legAngle: number) {
    ctx.fillStyle = color;
    // Left Foot
    ctx.save();
    ctx.translate(-12, 0);
    ctx.rotate(legAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();

    // Right Foot
    ctx.save();
    ctx.translate(12, 0);
    ctx.rotate(-legAngle);
    ctx.beginPath();
    ctx.ellipse(0, 0, 11, 6, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // --- FOREGROUND & PARTICLES ---
  private static drawForegroundEffects(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    anim: CartoonScene['bgAnimation'],
    sfx: CartoonScene['soundEffect'],
    t: number
  ) {
    // Sound FX comic banner explosion
    if (sfx && sfx !== 'none' && t < 1.2) {
      ctx.save();
      const popProgress = Math.min(1, t / 0.3);
      const fadeProgress = t > 0.8 ? (1.2 - t) / 0.4 : 1;
      ctx.globalAlpha = fadeProgress;
      ctx.translate(w * 0.5, h * 0.28);
      ctx.scale(popProgress, popProgress);

      // Starburst bubble
      ctx.fillStyle = '#FFEAA7';
      ctx.strokeStyle = '#D63031';
      ctx.lineWidth = 4;
      ctx.beginPath();
      const points = 12;
      for (let i = 0; i < points; i++) {
        const angle = (i * Math.PI * 2) / points;
        const radius = i % 2 === 0 ? 55 : 30;
        const px = Math.cos(angle) * radius;
        const py = Math.sin(angle) * radius;
        if (i === 0) ctx.moveTo(px, py);
        else ctx.lineTo(px, py);
      }
      ctx.closePath();
      ctx.fill();
      ctx.stroke();

      // Comic Sound Effect Word
      ctx.fillStyle = '#D63031';
      ctx.font = '900 20px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const label = sfx.toUpperCase() + '!';
      ctx.fillText(label, 0, 0);
      ctx.restore();
    }

    // Sparkles
    if (anim === 'sparkles' || anim === 'stars_twinkling') {
      for (let i = 0; i < 8; i++) {
        const sx = ((i * 123 + t * 40) % w);
        const sy = (h * 0.2 + (i * 87) % (h * 0.5));
        const scale = Math.sin(t * 6 + i) * 0.5 + 0.5;
        this.drawSparkle(ctx, sx, sy, 8 * scale, '#F1C40F');
      }
    }
  }

  // --- SPEECH BUBBLE & SUBTITLES ---
  private static drawSpeechBubble(
    ctx: CanvasRenderingContext2D,
    w: number,
    h: number,
    speaker: string,
    dialogue: string,
    t: number
  ) {
    ctx.save();
    // Floating Speech Bubble in top center/left
    const bubbleW = Math.min(w * 0.88, 520);
    const bubbleH = 76;
    const bubbleX = (w - bubbleW) / 2;
    const bubbleY = h * 0.08;

    // Typewriter effect
    const charsToShow = Math.min(dialogue.length, Math.floor(t * 30));
    const visibleText = dialogue.slice(0, charsToShow);

    // Bubble Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.15)';
    ctx.beginPath();
    ctx.roundRect(bubbleX + 4, bubbleY + 4, bubbleW, bubbleH, 18);
    ctx.fill();

    // Bubble Body
    ctx.fillStyle = '#FFFFFF';
    ctx.beginPath();
    ctx.roundRect(bubbleX, bubbleY, bubbleW, bubbleH, 18);
    ctx.fill();
    ctx.strokeStyle = '#6C5CE7';
    ctx.lineWidth = 3;
    ctx.stroke();

    // Speaker Name Tag Pill
    ctx.fillStyle = '#6C5CE7';
    ctx.beginPath();
    ctx.roundRect(bubbleX + 16, bubbleY - 14, Math.max(90, speaker.length * 10 + 20), 24, 12);
    ctx.fill();

    ctx.fillStyle = '#FFFFFF';
    ctx.font = 'bold 12px sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`🗣️ ${speaker}`, bubbleX + 16 + Math.max(90, speaker.length * 10 + 20) / 2, bubbleY + 2);

    // Dialogue Text
    ctx.fillStyle = '#2D3436';
    ctx.font = '600 15px sans-serif';
    ctx.textAlign = 'left';
    
    // Multi-line wrap
    this.drawWrappedText(ctx, visibleText, bubbleX + 18, bubbleY + 34, bubbleW - 36, 20);

    ctx.restore();
  }

  // --- DRAWING UTILS ---
  private static drawCloud(ctx: CanvasRenderingContext2D, x: number, y: number, r: number) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.arc(x + r * 0.7, y - r * 0.2, r * 0.8, 0, Math.PI * 2);
    ctx.arc(x + r * 1.4, y, r * 0.7, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawLittleFlower(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    for (let i = 0; i < 5; i++) {
      const angle = (i * Math.PI * 2) / 5;
      ctx.beginPath();
      ctx.arc(x + Math.cos(angle) * 6, y + Math.sin(angle) * 6, 4, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.fillStyle = '#FDCB6E';
    ctx.beginPath();
    ctx.arc(x, y, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawMushroom(ctx: CanvasRenderingContext2D, x: number, y: number, capColor: string, dotColor: string) {
    ctx.save();
    // Stem
    ctx.fillStyle = '#F5F6FA';
    ctx.fillRect(x - 8, y, 16, 26);
    // Cap
    ctx.fillStyle = capColor;
    ctx.beginPath();
    ctx.arc(x, y, 24, Math.PI, 0);
    ctx.fill();
    // Dots
    ctx.fillStyle = dotColor;
    ctx.beginPath();
    ctx.arc(x - 10, y - 10, 4, 0, Math.PI * 2);
    ctx.arc(x + 8, y - 12, 3.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  private static drawSparkle(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, color: string) {
    ctx.save();
    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.moveTo(x, y - r);
    ctx.quadraticCurveTo(x, y, x + r, y);
    ctx.quadraticCurveTo(x, y, x, y + r);
    ctx.quadraticCurveTo(x, y, x - r, y);
    ctx.quadraticCurveTo(x, y, x, y - r);
    ctx.fill();
    ctx.restore();
  }

  private static drawWrappedText(
    ctx: CanvasRenderingContext2D,
    text: string,
    x: number,
    y: number,
    maxWidth: number,
    lineHeight: number
  ) {
    const words = text.split(' ');
    let line = '';
    let currentY = y;

    for (let n = 0; n < words.length; n++) {
      const testLine = line + words[n] + ' ';
      const metrics = ctx.measureText(testLine);
      const testWidth = metrics.width;
      if (testWidth > maxWidth && n > 0) {
        ctx.fillText(line, x, currentY);
        line = words[n] + ' ';
        currentY += lineHeight;
        if (currentY > y + lineHeight * 2) break; // max 2 lines
      } else {
        line = testLine;
      }
    }
    ctx.fillText(line, x, currentY);
  }
}
