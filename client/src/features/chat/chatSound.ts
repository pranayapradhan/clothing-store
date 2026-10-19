
let audioContext: AudioContext | null = null;

const getAudioContext = (): AudioContext | null => {
  try {
    if (!audioContext) {
      audioContext = new AudioContext();
    }

    return audioContext;
  } catch {
    return null;
  }
};

export const initializeChatAudio = async (): Promise<void> => {
  const context = getAudioContext();

  if (!context) return;

  try {
    if (context.state === "suspended") {
      await context.resume();
    }
  } catch {
    // Browser may prevent audio initialization.
  }
};

export const playChatNotificationSound = () => {
  const context = getAudioContext();

  if (!context || context.state !== "running") return;

  try {
    const oscillator = context.createOscillator();
    const gain = context.createGain();

    const now = context.currentTime;

    oscillator.type = "sine";
    oscillator.frequency.setValueAtTime(880, now);
    oscillator.frequency.exponentialRampToValueAtTime(
      660,
      now + 0.15,
    );

    gain.gain.setValueAtTime(0.08, now);
    gain.gain.exponentialRampToValueAtTime(
      0.001,
      now + 0.15,
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start(now);
    oscillator.stop(now + 0.15);
  } catch {
    // Ignore audio playback failures.
  }
};
