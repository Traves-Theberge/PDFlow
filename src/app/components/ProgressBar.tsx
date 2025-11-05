'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useUploadProgress, useAppActions } from '@/app/store/useAppStore';

interface ProgressBarProps {
  sessionId?: string;
  onProcessingComplete?: (sessionId: string) => void;
  onProcessingError?: (error: string) => void;
  darkMode?: boolean;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  sessionId: propSessionId,
  onProcessingComplete,
  onProcessingError,
  darkMode = false,
}) => {
  const uploadProgress = useUploadProgress();
  const { setUploadProgress } = useAppActions();
  const [pollingInterval, setPollingInterval] = useState<NodeJS.Timeout | null>(null);

  // Use the session ID from props or from the store
  const sessionId = propSessionId || uploadProgress.sessionId;

  // Poll for progress updates
  useEffect(() => {
    if (!sessionId || uploadProgress.status === 'completed' || uploadProgress.status === 'error') {
      if (pollingInterval) {
        clearInterval(pollingInterval);
        setPollingInterval(null);
      }
      return;
    }

    // Start polling
    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/process?sessionId=${sessionId}`);
        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || 'Failed to get progress');
        }

        // Calculate progress percentage
        const progress = result.totalPages > 0
          ? Math.round((result.processedPages / result.totalPages) * 100)
          : 0;

        // Only update state if values actually changed to prevent infinite loop
        const currentProgress = uploadProgress.progress;
        const currentProcessed = uploadProgress.processedPages;
        const currentStatus = uploadProgress.status;
        
        if (
          currentProgress !== progress ||
          currentProcessed !== result.processedPages ||
          currentStatus !== result.status
        ) {
          setUploadProgress({
            status: result.status,
            progress,
            processedPages: result.processedPages,
            totalPages: result.totalPages,
            message: result.message || `Processing page ${result.processedPages} of ${result.totalPages}...`,
            error: result.error || null,
          });
        }

        // Check if processing is complete
        if (result.status === 'completed') {
          onProcessingComplete?.(sessionId);
          clearInterval(interval);
          setPollingInterval(null);
        } else if (result.status === 'error') {
          onProcessingError?.(result.error || 'Processing failed');
          clearInterval(interval);
          setPollingInterval(null);
        }

      } catch (error) {
        console.error('Error polling progress:', error);
        // Don't update state on polling error to avoid flickering
      }
    }, 1000); // Poll every second

    setPollingInterval(interval);

    return () => {
      clearInterval(interval);
    };
  }, [sessionId, uploadProgress.status, setUploadProgress, onProcessingComplete, onProcessingError]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (pollingInterval) {
        clearInterval(pollingInterval);
      }
    };
  }, [pollingInterval]);

  // Don't render if there's no active processing
  if (!sessionId || uploadProgress.status === 'idle') {
    return null;
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'processing':
      case 'converting':
        return darkMode ? 'bg-white' : 'bg-black';
      case 'completed':
        return darkMode ? 'bg-white' : 'bg-black';
      case 'error':
        return 'bg-red-500';
      default:
        return darkMode ? 'bg-neutral-400' : 'bg-neutral-500';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'uploading':
        return 'Uploading PDF...';
      case 'converting':
        return 'Converting PDF to images...';
      case 'processing':
        return 'Extracting text with AI...';
      case 'completed':
        return 'Processing complete!';
      case 'error':
        return 'Processing failed';
      default:
        return 'Processing...';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className={`rounded-lg border p-6 transition-colors duration-200 ${
          darkMode
            ? 'bg-neutral-900 border-neutral-800'
            : 'bg-white border-neutral-200'
        }`}>
          <div className="flex items-center justify-between mb-4">
            <h3 className={`text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-neutral-900'
            }`}>
              Processing Progress
            </h3>

            <div className="flex items-center space-x-2">
              <div className={`w-2 h-2 rounded-full ${getStatusColor(uploadProgress.status)} animate-pulse`} />
              <span className={`text-xs ${
                darkMode ? 'text-neutral-400' : 'text-neutral-600'
              }`}>
                {getStatusText(uploadProgress.status)}
              </span>
            </div>
          </div>

          {/* Progress bar */}
          <div className="mb-4">
            <div className="flex items-center justify-between mb-2">
              <span className={`text-xs font-medium ${
                darkMode ? 'text-neutral-300' : 'text-neutral-700'
              }`}>
                {uploadProgress.message || getStatusText(uploadProgress.status)}
              </span>
              <span className={`text-xs ${
                darkMode ? 'text-neutral-500' : 'text-neutral-500'
              }`}>
                {uploadProgress.progress}%
              </span>
            </div>

            <div className={`w-full rounded-full h-2 overflow-hidden ${
              darkMode ? 'bg-neutral-800' : 'bg-neutral-200'
            }`}>
              <motion.div
                className={`h-full rounded-full transition-colors duration-300 ${getStatusColor(uploadProgress.status)}`}
                initial={{ width: 0 }}
                animate={{ width: `${uploadProgress.progress}%` }}
                transition={{ duration: 0.5, ease: 'easeOut' }}
              />
            </div>
          </div>

          {/* Page progress */}
          {uploadProgress.totalPages > 0 && (
            <div className={`rounded-lg p-4 ${
              darkMode ? 'bg-neutral-950 border border-neutral-800' : 'bg-neutral-50 border border-neutral-200'
            }`}>
              <div className="flex items-center justify-between text-xs">
                <span className={darkMode ? 'text-neutral-400' : 'text-neutral-600'}>
                  Pages processed:
                </span>
                <span className={`font-medium ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  {uploadProgress.processedPages} / {uploadProgress.totalPages}
                </span>
              </div>

              {/* Mini progress indicators for pages */}
              <div className="mt-3 flex flex-wrap gap-1">
                {Array.from({ length: uploadProgress.totalPages }, (_, i) => (
                  <div
                    key={i}
                    className={`w-1.5 h-1.5 rounded-full transition-colors duration-200 ${
                      i < uploadProgress.processedPages
                        ? (darkMode ? 'bg-white' : 'bg-black')
                        : (darkMode ? 'bg-neutral-700' : 'bg-neutral-300')
                    }`}
                  />
                ))}
              </div>
            </div>
          )}

          {/* Error display */}
          {uploadProgress.status === 'error' && uploadProgress.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className={`mt-4 border rounded-lg p-4 ${
                darkMode
                  ? 'bg-red-950/30 border-red-900/50'
                  : 'bg-red-50 border-red-200'
              }`}
            >
              <div className="flex items-start">
                <svg
                  className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${
                    darkMode ? 'text-red-400' : 'text-red-500'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                    clipRule="evenodd"
                  />
                </svg>
                <div>
                  <p className={`text-xs font-medium ${
                    darkMode ? 'text-red-400' : 'text-red-800'
                  }`}>
                    Processing Error
                  </p>
                  <p className={`text-xs mt-1 ${
                    darkMode ? 'text-red-300' : 'text-red-700'
                  }`}>
                    {uploadProgress.error}
                  </p>
                </div>
              </div>
            </motion.div>
          )}

          {/* Success display */}
          {uploadProgress.status === 'completed' && (
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              className={`mt-4 border rounded-lg p-4 ${
                darkMode
                  ? 'bg-neutral-900 border-neutral-700'
                  : 'bg-neutral-50 border-neutral-200'
              }`}
            >
              <div className="flex items-center">
                <svg
                  className={`h-4 w-4 mr-2 ${
                    darkMode ? 'text-white' : 'text-black'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className={`text-xs font-medium ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  All {uploadProgress.totalPages} pages processed successfully!
                </p>
              </div>
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};