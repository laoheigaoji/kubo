export type VideoSize = 'default' | '16:9' | '4:3' | 'full' | 'stretch';
export type MirrorEffect = 'none' | 'horizontal' | 'vertical';
export type DeDuplicationFilter = 'none' | 'filter1' | 'blur' | 'bw' | 'brightness' | 'filter5';
export type VideoSource = 'local' | 'network' | 'relay';
export type PlaybackMode = 'sequential' | 'random';

export interface VideoSettings {
  enabled: boolean;
  size: VideoSize;
  mirror: MirrorEffect;
  filter: DeDuplicationFilter;
  intensity: number;
  volume: number;
  source: VideoSource;
  relayUrl: string;
  localVideoUrl: string | null;
}

export interface AudioSettings {
  enabled: boolean;
  mode: PlaybackMode;
  volume: number;
  interval: number;
  localAudioUrl: string | null;
}

export interface DigitalHuman {
  id: string;
  name: string;
  thumbnail: string;
}

export interface LiveComponent {
  id: string;
  name: string;
  icon: string;
  type: 'button' | 'arrow' | 'effect' | 'clock';
}

export interface CameraSettings {
  enabled: boolean;
  position: 'front' | 'back';
  aiMatting: boolean;
  smoothing: number;
  brightness: number;
  contrast: number;
  scale: number;
}

export interface AppState {
  video: VideoSettings;
  audio: AudioSettings;
  camera: CameraSettings;
  selectedDigitalHuman: string | null;
  digitalHumanScale: number;
  activeComponents: string[];
  componentStates: Record<string, { scale: number }>;
  activeEffect: string | null;
  activeEntertainment: string | null;
  isLive: boolean;
}
