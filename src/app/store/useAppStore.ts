import { create } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export interface UploadProgress {
  sessionId: string | null;
  status: 'idle' | 'uploading' | 'converting' | 'processing' | 'completed' | 'error';
  progress: number; // 0-100
  totalPages: number;
  processedPages: number;
  error: string | null;
  message: string | null;
}

export interface OutputFile {
  sessionId: string;
  format: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx';
  content: string;
  createdAt: string;
  totalPages: number;
}

interface AppState {
  // Upload state
  uploadProgress: UploadProgress;

  // Output state
  outputFiles: OutputFile[];
  currentOutput: OutputFile | null;

  // UI state
  isDragging: boolean;
  selectedFormat: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx';

  // API Key state (stored in sessionStorage)
  apiKey: string | null;

  // Actions
  setUploadProgress: (progress: Partial<UploadProgress>) => void;
  resetUploadProgress: () => void;
  setOutputFiles: (files: OutputFile[]) => void;
  addOutputFile: (file: OutputFile) => void;
  setCurrentOutput: (file: OutputFile | null) => void;
  setIsDragging: (dragging: boolean) => void;
  setSelectedFormat: (format: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx') => void;
  setApiKey: (key: string | null) => void;
  getApiKey: () => string | null;

}

const initialUploadProgress: UploadProgress = {
  sessionId: null,
  status: 'idle',
  progress: 0,
  totalPages: 0,
  processedPages: 0,
  error: null,
  message: null,
};

export const useAppStore = create<AppState>((set, get) => ({
  // Initial state
  uploadProgress: initialUploadProgress,
  outputFiles: [],
  currentOutput: null,
  isDragging: false,
  selectedFormat: 'markdown',
  apiKey: typeof window !== 'undefined' ? sessionStorage.getItem('gemini_api_key') : null,

  // Actions
  setUploadProgress: (progressUpdate) => {
    set((state) => ({
      uploadProgress: { ...state.uploadProgress, ...progressUpdate }
    }));
  },

  resetUploadProgress: () => {
    set({ uploadProgress: initialUploadProgress });
  },

  setOutputFiles: (files) => {
    set({ outputFiles: files });
  },

  addOutputFile: (file) => {
    set((state) => ({
      outputFiles: [...state.outputFiles.filter(f => f.sessionId !== file.sessionId), file]
    }));
  },

  setCurrentOutput: (file) => {
    set({ currentOutput: file });
  },

  setIsDragging: (dragging) => {
    set({ isDragging: dragging });
  },

  setSelectedFormat: (format) => {
    set({ selectedFormat: format });
  },

  setApiKey: (key) => {
    if (typeof window !== 'undefined') {
      if (key) {
        sessionStorage.setItem('gemini_api_key', key);
      } else {
        sessionStorage.removeItem('gemini_api_key');
      }
    }
    set({ apiKey: key });
  },

  getApiKey: () => {
    return get().apiKey;
  },
}));

// Selectors for specific state slices
export const useUploadProgress = () => useAppStore((state) => state.uploadProgress);
export const useOutputFiles = () => useAppStore((state) => state.outputFiles);
export const useCurrentOutput = () => useAppStore((state) => state.currentOutput);
export const useIsDragging = () => useAppStore((state) => state.isDragging);
export const useSelectedFormat = () => useAppStore((state) => state.selectedFormat);

// Computed selectors
export const useIsProcessing = () => useAppStore((state) =>
  ['uploading', 'converting', 'processing'].includes(state.uploadProgress.status)
);

export const useHasOutput = () => useAppStore((state) =>
  state.outputFiles.length > 0
);

// Action selectors
export const useAppActions = () => useAppStore(
  useShallow((state) => ({
    setUploadProgress: state.setUploadProgress,
    resetUploadProgress: state.resetUploadProgress,
    setOutputFiles: state.setOutputFiles,
    addOutputFile: state.addOutputFile,
    setCurrentOutput: state.setCurrentOutput,
    setIsDragging: state.setIsDragging,
    setSelectedFormat: state.setSelectedFormat,
    setApiKey: state.setApiKey,
    getApiKey: state.getApiKey,
  }))
);

// API Key selectors
export const useApiKey = () => useAppStore((state) => state.apiKey);
export const useHasApiKey = () => useAppStore((state) => !!state.apiKey);