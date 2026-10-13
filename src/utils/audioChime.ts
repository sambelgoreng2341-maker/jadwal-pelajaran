/**
 * Web Audio API synthesizer for lesson bells and speech announcements.
 * 100% offline-ready with zero external audio assets required.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext {
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    audioCtx = new AudioContextClass();
  }
  if (audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

// Generate single bell chime note with harmonic decay
function playChimeNote(
  ctx: AudioContext,
  freq: number,
  startTime: number,
  duration: number,
  volume: number
) {
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  // Bell-like harmonic timbre using sine + overtone
  osc.type = 'sine';
  osc.frequency.setValueAtTime(freq, startTime);

  // Exponential decay envelope for authentic bell sound
  gain.gain.setValueAtTime(0.0001, startTime);
  gain.gain.linearRampToValueAtTime(volume * 0.7, startTime + 0.04);
  gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(startTime);
  osc.stop(startTime + duration + 0.1);

  // Add subtle high harmonic for crisp metallic resonance
  const harmonicOsc = ctx.createOscillator();
  const harmonicGain = ctx.createGain();
  harmonicOsc.type = 'triangle';
  harmonicOsc.frequency.setValueAtTime(freq * 2.76, startTime);
  harmonicGain.gain.setValueAtTime(volume * 0.18, startTime);
  harmonicGain.gain.exponentialRampToValueAtTime(0.00001, startTime + (duration * 0.6));

  harmonicOsc.connect(harmonicGain);
  harmonicGain.connect(ctx.destination);
  harmonicOsc.start(startTime);
  harmonicOsc.stop(startTime + duration);
}

export type ChimeType = 'pesantren' | 'westminster' | 'school_bell' | 'soft_chime';

export function playSchoolChime(type: ChimeType = 'pesantren', volume: number = 0.85): Promise<void> {
  return new Promise((resolve) => {
    try {
      const ctx = getAudioContext();
      const now = ctx.currentTime + 0.05;

      if (type === 'pesantren') {
        // Melodious Eastern / Islamic Boarding Quad-Chime (E5 -> G#5 -> B5 -> E6)
        const notes = [
          { freq: 659.25, time: 0.00, dur: 1.2 }, // E5
          { freq: 830.61, time: 0.35, dur: 1.2 }, // G#5
          { freq: 987.77, time: 0.70, dur: 1.4 }, // B5
          { freq: 1318.51, time: 1.05, dur: 2.2 }, // E6
        ];
        notes.forEach((n) => playChimeNote(ctx, n.freq, now + n.time, n.dur, volume));
        setTimeout(resolve, 3200);
      } else if (type === 'westminster') {
        // Westminster 4-bell chime sequence
        const notes = [
          { freq: 659.25, time: 0.0, dur: 1.1 }, // E5
          { freq: 523.25, time: 0.5, dur: 1.1 }, // C5
          { freq: 587.33, time: 1.0, dur: 1.1 }, // D5
          { freq: 392.00, time: 1.5, dur: 2.0 }, // G4
        ];
        notes.forEach((n) => playChimeNote(ctx, n.freq, now + n.time, n.dur, volume));
        setTimeout(resolve, 3500);
      } else if (type === 'school_bell') {
        // Classic acoustic double school strike
        const notes = [
          { freq: 880.00, time: 0.00, dur: 0.8 },
          { freq: 880.00, time: 0.28, dur: 1.6 },
          { freq: 1174.66, time: 0.85, dur: 1.8 },
        ];
        notes.forEach((n) => playChimeNote(ctx, n.freq, now + n.time, n.dur, volume));
        setTimeout(resolve, 2600);
      } else {
        // Soft ding-dong
        const notes = [
          { freq: 783.99, time: 0.0, dur: 0.9 }, // G5
          { freq: 1046.50, time: 0.4, dur: 1.6 }, // C6
        ];
        notes.forEach((n) => playChimeNote(ctx, n.freq, now + n.time, n.dur, volume));
        setTimeout(resolve, 2000);
      }
    } catch (e) {
      console.warn('Audio playback not allowed or failed:', e);
      resolve();
    }
  });
}

/**
 * Text-to-Speech in Indonesian language
 */
export function announceViaTTS(text: string): Promise<void> {
  return new Promise((resolve) => {
    if (!('speechSynthesis' in window)) {
      resolve();
      return;
    }

    try {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = 'id-ID';
      utterance.rate = 0.95;
      utterance.pitch = 1.0;

      // Select Indonesian voice if available
      const voices = window.speechSynthesis.getVoices();
      const idVoice = voices.find((v) => v.lang.startsWith('id') || v.lang.includes('ID'));
      if (idVoice) {
        utterance.voice = idVoice;
      }

      utterance.onend = () => resolve();
      utterance.onerror = () => resolve();
      window.speechSynthesis.speak(utterance);
    } catch (err) {
      console.warn('TTS Announcement error:', err);
      resolve();
    }
  });
}

/**
 * Request and display browser native notification
 */
export async function showBrowserNotification(title: string, body: string): Promise<void> {
  if (!('Notification' in window)) return;

  try {
    if (Notification.permission === 'default') {
      await Notification.requestPermission();
    }
    if (Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.ico',
        tag: 'iiqbs-lesson-change',
      });
    }
  } catch (e) {
    console.warn('Notification error:', e);
  }
}
