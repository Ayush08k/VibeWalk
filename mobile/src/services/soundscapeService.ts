/**
 * Soundscape Service — Ambient audio beat sync engine matching walking cadence
 */

export type SoundscapeTrackId = 'none' | 'synthwave' | 'cyber_rain' | 'lofi_beat';

export interface SoundscapeTrack {
  id: SoundscapeTrackId;
  title: string;
  genre: string;
  baseBpm: number;
  icon: string;
}

export const SOUNDSCAPE_TRACKS: SoundscapeTrack[] = [
  { id: 'none', title: 'Mute Audio', genre: 'Off', baseBpm: 0, icon: '🔇' },
  { id: 'synthwave', title: 'Synthwave Pulse', genre: 'Electro / 120 BPM', baseBpm: 120, icon: '⚡' },
  { id: 'cyber_rain', title: 'Cyber Rain Ambient', genre: 'Chill / 95 BPM', baseBpm: 95, icon: '🌧️' },
  { id: 'lofi_beat', title: 'Lo-Fi Walk Groove', genre: 'Hip Hop / 105 BPM', baseBpm: 105, icon: '🎧' },
];

let activeTrackId: SoundscapeTrackId = 'synthwave';
let isPlaying: boolean = false;

/**
 * Calculates dynamic audio tempo multiplier based on current cadence (steps/min).
 * Target baseline: 110 spm = 1.0x tempo multiplier.
 */
export function calculateCadenceTempoMultiplier(currentCadenceSpm: number): number {
  if (currentCadenceSpm <= 0) return 1.0;
  const ratio = currentCadenceSpm / 110;
  // Clamp between 0.85x and 1.35x for comfortable listening
  return Number(Math.min(Math.max(ratio, 0.85), 1.35).toFixed(2));
}

export function setActiveSoundscape(trackId: SoundscapeTrackId): SoundscapeTrack {
  activeTrackId = trackId;
  const track = SOUNDSCAPE_TRACKS.find((t) => t.id === trackId) || SOUNDSCAPE_TRACKS[1];
  return track;
}

export function getActiveSoundscapeTrack(): SoundscapeTrack {
  return SOUNDSCAPE_TRACKS.find((t) => t.id === activeTrackId) || SOUNDSCAPE_TRACKS[1];
}

export function toggleSoundscapePlayback(): boolean {
  isPlaying = !isPlaying;
  return isPlaying;
}

export function getSoundscapePlaybackStatus(): boolean {
  return isPlaying;
}
