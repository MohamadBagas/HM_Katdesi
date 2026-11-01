/**
 * Background Audio Keep-Alive for Mobile Devices (Android & iOS).
 *
 * Browsers typically suspend JavaScript timers and throttle GPS when the phone
 * screen is turned off or locked to save battery.
 *
 * By initiating an inaudible, silent Web Audio buffer and registering
 * MediaSession metadata, the operating system treats the runner's applet as an
 * active media player (similar to Spotify or audio recorders), keeping the
 * Geolocation GPS worker alive in the background while running!
 */

class BackgroundKeepAliveService {
  private audioCtx: AudioContext | null = null;
  private oscillator: OscillatorNode | null = null;
  private gainNode: GainNode | null = null;
  private isRunning = false;

  public start(): boolean {
    if (this.isRunning) return true;

    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (!AudioContextClass) return false;

      this.audioCtx = new AudioContextClass();

      // Create an oscillator at very low gain (silent, 0.0001 volume)
      this.oscillator = this.audioCtx.createOscillator();
      this.gainNode = this.audioCtx.createGain();

      // Silent frequency
      this.oscillator.frequency.value = 25; // inaudible sub-bass
      this.gainNode.gain.value = 0.0001; // virtually silent

      this.oscillator.connect(this.gainNode);
      this.gainNode.connect(this.audioCtx.destination);

      this.oscillator.start();
      this.isRunning = true;

      // Register MediaSession so lock screen shows running status
      if ('mediaSession' in navigator) {
        navigator.mediaSession.metadata = new MediaMetadata({
          title: 'UGM Geodesy Half Marathon Live',
          artist: 'Pelacakan GPS Latar Belakang Aktif',
          album: 'HM Geodesi UGM 2026',
        });

        navigator.mediaSession.playbackState = 'playing';
      }

      return true;
    } catch (e) {
      console.warn('Could not start background keep-alive audio:', e);
      return false;
    }
  }

  public stop(): void {
    if (!this.isRunning) return;

    try {
      if (this.oscillator) {
        this.oscillator.stop();
        this.oscillator.disconnect();
        this.oscillator = null;
      }
      if (this.gainNode) {
        this.gainNode.disconnect();
        this.gainNode = null;
      }
      if (this.audioCtx) {
        this.audioCtx.close();
        this.audioCtx = null;
      }

      if ('mediaSession' in navigator) {
        navigator.mediaSession.playbackState = 'none';
      }

      this.isRunning = false;
    } catch (e) {
      console.warn('Error stopping background keep-alive:', e);
    }
  }

  public getStatus(): boolean {
    return this.isRunning;
  }
}

export const backgroundKeepAlive = new BackgroundKeepAliveService();
