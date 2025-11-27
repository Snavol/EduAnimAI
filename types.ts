export enum ElementType {
  CHARACTER = 'character',
  SHAPE = 'shape',
  TEXT = 'text',
  MAP_MARKER = 'map-marker',
  ARROW = 'arrow',
  IMAGE = 'image'
}

export enum AnimationType {
  FADE_IN = 'fade-in',
  SLIDE_IN = 'slide-in',
  SCALE_UP = 'scale-up',
  NONE = 'none'
}

export interface CameraConfig {
  zoom: number; // 1.0 to 3.0
  x: number; // Pan X percentage (negative left, positive right)
  y: number; // Pan Y percentage (negative up, positive down)
}

export interface VisualElement {
  id: string;
  type: ElementType;
  label: string; // Text content or character name
  color?: string; // Hex code or Tailwind class
  x: number; // Percentage 0-100
  y: number; // Percentage 0-100
  size?: number; // Relative size unit
  targetX?: number; // For movement animations
  targetY?: number; // For movement animations
  icon?: string; // For characters (emoji or icon name)
  enterAnimation?: AnimationType;
}

export interface Scene {
  id: string;
  duration: number; // Seconds
  narrative: string; // Voiceover text
  backgroundStyle: 'default' | 'map' | 'grid' | 'space' | 'paper';
  camera?: CameraConfig; // Camera movement for the scene
  elements: VisualElement[];
}

export interface AnimationScript {
  title: string;
  visualStyle: string; // High-level visual style description
  scenes: Scene[];
}

export interface GenerateRequest {
  topic: string;
}