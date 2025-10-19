// src/utils/constants.ts

export const AVAILABLE_COLORS = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57',
    '#FF9FF3', '#54A0FF', '#5F27CD', '#00D2D3', '#FF9F43',
    '#F8B500', '#78E08F', '#3742FA', '#2ED573', '#FF6348',
    '#1E90FF', '#FF1493', '#00CED1', '#FFD700', '#32CD32',
    '#FF4500', '#DA70D6', '#40E0D0', '#FF69B4', '#00FF7F',
    '#FF6347', '#4169E1', '#FF1493', '#00BFFF', '#ADFF2F'
  ]
  export const DEFAULT_STRUCTURE_TITLES = [
    'Caudate Nucleus',
    'Putamen',
    'Globus Pallidus',
    'Subthalamic Nucleus',
    'Thalamus',
    'Hippocampus',
    'Amygdala'
  ]
  
  export const DEFAULT_STRUCTURES = [
    { id: 1, title: 'Brain Tissue', color: '#F54927', coordinates: [] },
    { id: 2, title: 'STN', color: '#4ecdc4', coordinates: [] },
    { id: 3, title: 'Putamen', color: '#45b7d1', coordinates: [] }
  ]
  
  export const DEFAULT_VIEWER_SETTINGS = {
    brightness: 0.5,
    contrast: 0.5,
    opacity: 1.0,
    crosshair: true
  }
  
  export const BRUSH_SIZE = {
    MIN: 1,
    MAX: 20,
    DEFAULT: 5
  }
  
  export const API_ENDPOINTS = {
    SEGMENT: '/segment',
    UPLOAD: '/upload',
    BASE_URL: import.meta.env.VITE_API_URL || 'http://localhost:5000'
  }
  
  export const VOLUME_PATH = '../public/Data/MRI/brain.nii.gz'
  
  export const VIEW_MODES = ['single', 'quad', '3d', 'mosaic'] as const
  export const ORIENTATIONS = ['axial', 'coronal', 'sagittal'] as const
  export const TOOLS = ['draw', 'erase'] as const
  
  export const KEYBOARD_SHORTCUTS = {
    // View modes
    SINGLE_VIEW: '1',
    QUAD_VIEW: '4',
    THREE_D_VIEW: '3',
    MOSAIC_VIEW: 'm',
    
    // Navigation
    NEXT_SLICE: 'ArrowUp',
    PREV_SLICE: 'ArrowDown',
    NEXT_CORONAL: 'ArrowRight',
    PREV_CORONAL: 'ArrowLeft',
    
    // Editing
    DRAW_TOOL: 'd',
    ERASE_TOOL: 'e',
    UNDO: 'z',
    REDO: 'y',
    
    // General
    TOGGLE_CROSSHAIR: 'c',
    RESET_VIEW: 'r',
    SAVE: 'Enter',
    CANCEL: 'Escape'
  } as const
  
  export const HISTORY_SIZE = {
    MAX_UNDO_STEPS: 50,
    MAX_REDO_STEPS: 50
  } as const
  
  export const ZOOM_LIMITS = {
    MIN: 0.5,
    MAX: 10,
    STEP: 0.2,
    DEFAULT: 1
  } as const
  
  export const PAN_AMOUNT = 50 // pixels