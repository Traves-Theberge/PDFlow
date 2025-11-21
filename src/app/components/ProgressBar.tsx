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
          if (response.status === 404) {
            // Session not found - stop polling
            clearInterval(interval);
            setPollingInterval(null);
            return;
          }
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

  // Determine current step index
  const getStepIndex = (status: string) => {
    switch (status) {
      case 'uploading': return 0;
      case 'converting': return 1;
      case 'processing': return 2;
      case 'completed': return 3;
      case 'error': return 2; // Show error at processing stage usually
      default: return 0;
    }
  };

  const steps = [
    { label: 'Upload', icon: 'M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12' },
    { label: 'Convert', icon: 'M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z' },
    { label: 'Extract', icon: 'M13 10V3L4 14h7v7l9-11h-7z' },
    { label: 'Done', icon: 'M5 13l4 4L19 7' },
  ];

  const currentStepIndex = getStepIndex(uploadProgress.status);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -20 }}
        transition={{ duration: 0.3 }}
        className="w-full max-w-2xl mx-auto"
      >
        <div className={`rounded-lg border p-6 transition-colors duration-200 ${darkMode
          ? 'bg-neutral-900 border-neutral-800'
          : 'bg-white border-neutral-200'
          }`}>

          {/* Stepper */}
          <div className="flex items-center justify-between mb-8 relative">
            {/* Connecting Line */}
            <div className={`absolute left-0 top-1/2 -translate-y-1/2 w-full h-0.5 -z-10 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
              }`} />

            {/* Active Line */}
            <motion.div
              className={`absolute left-0 top-1/2 -translate-y-1/2 h-0.5 -z-10 ${darkMode ? 'bg-white' : 'bg-black'
                }`}
              initial={{ width: '0%' }}
              animate={{ width: `${(currentStepIndex / (steps.length - 1)) * 100}%` }}
              transition={{ duration: 0.5 }}
            />

            {steps.map((step, index) => {
              const isActive = index <= currentStepIndex;
              const isCurrent = index === currentStepIndex;

              return (
                <div key={step.label} className="flex flex-col items-center relative">
                  <motion.div
                    initial={false}
                    animate={{
                      scale: isCurrent ? 1.1 : 1,
                      backgroundColor: isActive
                        ? (darkMode ? '#ffffff' : '#000000')
                        : (darkMode ? '#262626' : '#e5e5e5'),
                      borderColor: isActive
                        ? (darkMode ? '#ffffff' : '#000000')
                        : (darkMode ? '#404040' : '#d4d4d4')
                    }}
                    className={`w-8 h-8 rounded-full flex items-center justify-center border-2 transition-colors duration-300 z-10`}
                  >
                    <svg
                      className={`w-4 h-4 ${isActive
                        ? (darkMode ? 'text-black' : 'text-white')
                        : (darkMode ? 'text-neutral-500' : 'text-neutral-500')
                        }`}
                      fill="none"
                      stroke="currentColor"
                      viewBox="0 0 24 24"
                      strokeWidth={2}
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" d={step.icon} />
                    </svg>
                  </motion.div>
                  <span className={`text-xs mt-2 font-medium absolute -bottom-6 whitespace-nowrap transition-colors duration-300 ${isActive
                    ? (darkMode ? 'text-white' : 'text-black')
                    : (darkMode ? 'text-neutral-500' : 'text-neutral-400')
                    }`}>
                    {step.label}
                  </span>
                </div>
              );
            })}
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-4 mt-2">
            <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'
              }`}>
              {getStatusText(uploadProgress.status)}
            </h3>
            <span className={`text-xs font-mono ${darkMode ? 'text-neutral-400' : 'text-neutral-500'
              }`}>
              {uploadProgress.progress}%
            </span>
          </div>

          {/* Progress bar */}
          <div className={`w-full rounded-full h-1.5 overflow-hidden mb-4 ${darkMode ? 'bg-neutral-800' : 'bg-neutral-100'
            }`}>
            <motion.div
              className={`h-full rounded-full transition-colors duration-300 ${getStatusColor(uploadProgress.status)}`}
              initial={{ width: 0 }}
              animate={{ width: `${uploadProgress.progress}%` }}
              transition={{ duration: 0.5, ease: 'easeOut' }}
            />
          </div>



          {/* Error display */}
          {uploadProgress.status === 'error' && uploadProgress.error && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className={`mt-4 text-xs ${darkMode ? 'text-red-400' : 'text-red-600'
                }`}
            >
              Error: {uploadProgress.error}
            </motion.div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  );
};