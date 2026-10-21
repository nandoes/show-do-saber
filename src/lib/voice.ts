import manifest from "@/data/audio.json";

const urls = manifest as Record<string, string>;
let current: HTMLAudioElement | null = null;

export function stopVoice() {
  current?.pause();
  current = null;
  if (typeof window !== "undefined") window.speechSynthesis?.cancel();
}

/** Plays the pre-recorded clip (no AI cost). Falls back to the free browser voice if a clip is missing. */
export function speak(key: string, fallbackText: string, volume = 1): Promise<void> {
  stopVoice();
  return new Promise((resolve) => {
    const url = urls[key];
    if (url) {
      const a = new Audio(url);
      a.volume = volume;
      current = a;
      a.onended = () => resolve();
      a.onerror = () => resolve();
      a.play().catch(() => resolve());
      return;
    }
    const s = window.speechSynthesis;
    if (!s) return resolve();
    const u = new SpeechSynthesisUtterance(fallbackText);
    u.lang = "pt-BR";
    u.pitch = 0.6;
    u.volume = volume;
    const v = s.getVoices().find((v) => v.lang.startsWith("pt"));
    if (v) u.voice = v;
    u.onend = () => resolve();
    u.onerror = () => resolve();
    s.speak(u);
  });
}

export function hasRecording(key: string) {
  return !!urls[key];
}
