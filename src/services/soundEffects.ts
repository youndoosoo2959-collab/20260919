/**
 * Web Audio API Sound Generator & Browser Speech Synthesis (TTS)
 * Provides instant, zero-latency audio feedback without relying on external mp3 assets.
 */

let audioCtx: AudioContext | null = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

/**
 * Play a sparkling ascending 4-note chime (C5 - E5 - G5 - C6)
 */
export function playChimeSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const notes = [523.25, 659.25, 783.99, 1046.5]; // C5, E5, G5, C6
  const now = ctx.currentTime;

  notes.forEach((freq, index) => {
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = 'triangle';
    osc.frequency.setValueAtTime(freq, now + index * 0.12);

    gain.gain.setValueAtTime(0, now + index * 0.12);
    gain.gain.linearRampToValueAtTime(0.25, now + index * 0.12 + 0.02);
    gain.gain.exponentialRampToValueAtTime(0.001, now + index * 0.12 + 0.55);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start(now + index * 0.12);
    osc.stop(now + index * 0.12 + 0.6);
  });
}

/**
 * Play a joyful star stamp pop sound
 */
export function playPopSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const now = ctx.currentTime;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();

  osc.type = 'sine';
  osc.frequency.setValueAtTime(400, now);
  osc.frequency.exponentialRampToValueAtTime(880, now + 0.08);

  gain.gain.setValueAtTime(0.3, now);
  gain.gain.exponentialRampToValueAtTime(0.01, now + 0.15);

  osc.connect(gain);
  gain.connect(ctx.destination);

  osc.start(now);
  osc.stop(now + 0.16);
}

/**
 * Play a bright celebration fanfare
 */
export function playFanfareSound() {
  const ctx = getAudioContext();
  if (!ctx) return;

  const chordProgression = [
    [523.25, 659.25], // C5, E5
    [659.25, 783.99], // E5, G5
    [783.99, 1046.5], // G5, C6
    [1046.5, 1318.5, 1567.98], // C6, E6, G6
  ];

  const now = ctx.currentTime;

  chordProgression.forEach((chord, step) => {
    const time = now + step * 0.15;
    const duration = step === chordProgression.length - 1 ? 0.8 : 0.25;

    chord.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.15, time);
      gain.gain.exponentialRampToValueAtTime(0.001, time + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + duration);
    });
  });
}

/**
 * Text-to-Speech (TTS) for special education students
 * Clear, warm, slightly relaxed speed for high comprehension.
 */
export function speakKoreanText(text: string, onEnd?: () => void) {
  if (typeof window === 'undefined' || !('speechSynthesis' in window)) {
    if (onEnd) onEnd();
    return;
  }

  // Cancel ongoing speech to avoid overlapping
  window.speechSynthesis.cancel();

  // Clean text from emojis for speech synthesis
  const speechText = text
    .replace(/[⭐🎉👏✨🐰🐻🦁🐶🐱🐼🐥🐨]/g, '')
    .replace(/!+/g, '!')
    .trim();

  const utterance = new SpeechSynthesisUtterance(speechText);
  utterance.lang = 'ko-KR';
  utterance.rate = 0.88; // Slightly slower for comfortable listening
  utterance.pitch = 1.1; // Friendly and cheerful tone

  if (onEnd) {
    utterance.onend = () => onEnd();
    utterance.onerror = () => onEnd();
  }

  // Try to find natural Korean voice if available
  const voices = window.speechSynthesis.getVoices();
  const koreanVoice = voices.find((v) => v.lang.startsWith('ko') || v.lang.includes('KR'));
  if (koreanVoice) {
    utterance.voice = koreanVoice;
  }

  window.speechSynthesis.speak(utterance);
}

export function stopSpeech() {
  if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
    window.speechSynthesis.cancel();
  }
}
