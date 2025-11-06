/**
 * UploadForm Component
 *
 * Drag-and-drop PDF upload interface with visual feedback and progress tracking.
 * Handles file validation, upload to server, and displays conversion progress.
 *
 * Features:
 * - Drag-and-drop file upload
 * - Click-to-browse file selection
 * - PDF type validation
 * - File size display
 * - Upload progress tracking
 * - Error handling with retry
 *
 * @component
 */

'use client';

import React, { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useAppStore, useAppActions, useIsDragging, useUploadProgress } from '@/app/store/useAppStore';

/**
 * Props for the UploadForm component
 */
interface UploadFormProps {
  onUploadComplete?: (sessionId: string, pageCount: number) => void;  // Called when upload succeeds
  onUploadError?: (error: string) => void;                             // Called when upload fails
}

export const UploadForm: React.FC<UploadFormProps> = ({
  onUploadComplete,
  onUploadError,
}) => {
  // Local state: Currently selected file (null if none selected)
  const [file, setFile] = useState<File | null>(null);

  // Global state: Drag-and-drop status from Zustand store
  const isDragging = useIsDragging();

  // Global state: Upload/conversion progress from Zustand store
  const uploadProgress = useUploadProgress();

  // Global actions: State setters from Zustand store
  const { setIsDragging, setUploadProgress } = useAppActions();

  /**
   * Handle drag over event
   * Sets dragging state to show visual feedback
   */
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();  // Prevent default to allow drop
    setIsDragging(true);
  }, [setIsDragging]);

  /**
   * Handle drag leave event
   * Resets dragging state when file leaves drop zone
   */
  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  }, [setIsDragging]);

  /**
   * Handle file drop event
   * Validates dropped file is a PDF and sets it as selected file
   */
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);

    // Extract files from drop event
    const droppedFiles = Array.from(e.dataTransfer.files);

    // Find the first PDF file (ignore other file types)
    const pdfFile = droppedFiles.find(file => file.type === 'application/pdf');

    if (pdfFile) {
      setFile(pdfFile);
    } else {
      onUploadError?.('Please drop a PDF file');
    }
  }, [setIsDragging, onUploadError]);

  /**
   * Handle file selection from file input
   * Validates selected file is a PDF
   */
  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];

    if (selectedFile && selectedFile.type === 'application/pdf') {
      setFile(selectedFile);
    } else if (selectedFile) {
      // File was selected but it's not a PDF
      onUploadError?.('Please select a PDF file');
    }
  }, [onUploadError]);

  /**
   * Handle file upload to server
   *
   * Workflow:
   * 1. Create FormData with PDF file
   * 2. POST to /api/upload endpoint
   * 3. Server converts PDF to WebP images
   * 4. Update progress state and notify parent component
   *
   * On success: Calls onUploadComplete with sessionId and pageCount
   * On error: Calls onUploadError with error message
   */
  const handleUpload = useCallback(async () => {
    if (!file) return;

    // Initialize upload progress
    setUploadProgress({
      status: 'uploading',
      progress: 0,
      message: 'Uploading PDF...',
      error: null,
      sessionId: null,
      totalPages: 0,
      processedPages: 0,
    });

    // Prepare file for upload
    const formData = new FormData();
    formData.append('file', file);

    try {
      // Upload to server (handles PDF to WebP conversion)
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Upload failed');
      }

      // Update progress: conversion complete
      setUploadProgress({
        status: 'converting',
        progress: 50,
        message: 'Converting PDF to images...',
        sessionId: result.sessionId,
        totalPages: result.pageCount,
        processedPages: 0,
      });

      // Notify parent component that upload is complete
      onUploadComplete?.(result.sessionId, result.pageCount);

    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Upload failed';

      // Update state with error
      setUploadProgress({
        status: 'error',
        error: errorMessage,
        message: null,
      });

      // Notify parent component of error
      onUploadError?.(errorMessage);
    }
  }, [file, setUploadProgress, onUploadComplete, onUploadError]);

  /**
   * Reset form to initial state
   * Clears selected file and resets all progress state
   */
  const handleReset = useCallback(() => {
    setFile(null);
    setUploadProgress({
      status: 'idle',
      progress: 0,
      message: null,
      error: null,
      sessionId: null,
      totalPages: 0,
      processedPages: 0,
    });
  }, [setUploadProgress]);

  /**
   * Format file size in human-readable format
   *
   * Converts bytes to appropriate unit (Bytes, KB, MB, GB)
   *
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size (e.g., "2.5 MB")
   */
  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <div className="w-full max-w-xl mx-auto">
      <div className="bg-white dark:bg-neutral-800 rounded-lg border border-neutral-200 dark:border-neutral-700 p-6">
        <AnimatePresence mode="wait">
          {!file && uploadProgress.status === 'idle' && (
            <div key="drop-zone">
              <div
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                className={`
                  relative border-2 border-dashed rounded-lg p-16 text-center transition-all duration-200
                  ${isDragging
                    ? 'border-black dark:border-white bg-neutral-50 dark:bg-neutral-700'
                    : 'border-neutral-300 dark:border-neutral-600 hover:border-neutral-400 dark:hover:border-neutral-500'
                  }
                `}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={uploadProgress.status !== 'idle'}
                />

                <div className="pointer-events-none">
                  <svg
                    className="mx-auto h-10 w-10 text-neutral-400 dark:text-neutral-500 mb-4"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 24 24"
                    strokeWidth={1.5}
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                  </svg>

                  <p className="text-sm font-medium text-neutral-900 dark:text-white mb-1">
                    {isDragging ? 'Drop file here' : 'Drop PDF or click to upload'}
                  </p>
                  <p className="text-xs text-neutral-500 dark:text-neutral-400">
                    PDF files only
                  </p>
                </div>
              </div>
            </div>
          )}

          {file && (
            <div key="file-selected">
              <div className="bg-neutral-50 dark:bg-neutral-700 rounded-lg p-4 mb-4 border border-neutral-200 dark:border-neutral-600">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="flex-shrink-0">
                      <svg
                        className="h-7 w-7 text-neutral-900 dark:text-white"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path
                          fillRule="evenodd"
                          d="M4 4a2 2 0 012-2h4.586A2 2 0 0112 2.586L15.414 6A2 2 0 0116 7.414V16a2 2 0 01-2 2H6a2 2 0 01-2-2V4z"
                          clipRule="evenodd"
                        />
                      </svg>
                    </div>
                    <div>
                      <p className="text-xs font-medium text-neutral-900 dark:text-white">
                        {file.name}
                      </p>
                      <p className="text-xs text-neutral-500 dark:text-neutral-400">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={handleReset}
                    className="text-neutral-400 dark:text-neutral-500 hover:text-neutral-600 dark:hover:text-neutral-300 transition-colors"
                    disabled={uploadProgress.status !== 'idle'}
                  >
                    <svg
                      className="h-4 w-4"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={handleUpload}
                  disabled={uploadProgress.status !== 'idle'}
                  className="flex-1 bg-black dark:bg-white text-white dark:text-black py-2 px-4 rounded-md text-sm font-medium
                    hover:bg-neutral-800 dark:hover:bg-neutral-200 disabled:bg-neutral-300 dark:disabled:bg-neutral-600 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  {uploadProgress.status === 'uploading' ? 'Uploading...' : 'Upload'}
                </button>

                <button
                  onClick={handleReset}
                  disabled={uploadProgress.status !== 'idle'}
                  className="px-4 py-2 border border-neutral-300 dark:border-neutral-600 rounded-md text-sm font-medium
                    text-neutral-700 dark:text-neutral-300 hover:bg-neutral-50 dark:hover:bg-neutral-700 disabled:bg-neutral-100 dark:disabled:bg-neutral-800 disabled:cursor-not-allowed
                    transition-colors duration-200"
                >
                  Cancel
                </button>
              </div>
            </div>
          )}

          {uploadProgress.status !== 'idle' && uploadProgress.status !== 'error' && (
            <div key="progress" className="mt-6">
              <div className="bg-gray-50 dark:bg-neutral-700 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-gray-900 dark:text-white">
                    {uploadProgress.message || 'Processing...'}
                  </span>
                  <span className="text-sm text-gray-500 dark:text-neutral-400">
                    {uploadProgress.progress}%
                  </span>
                </div>

                <div className="w-full bg-gray-200 dark:bg-neutral-600 rounded-full h-2">
                  <motion.div
                    className="bg-gray-900 dark:bg-white h-2 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: `${uploadProgress.progress}%` }}
                    transition={{ duration: 0.3 }}
                  />
                </div>

                {uploadProgress.totalPages > 0 && (
                  <p className="text-xs text-gray-500 dark:text-neutral-400 mt-2">
                    Processing {uploadProgress.processedPages} of {uploadProgress.totalPages} pages
                  </p>
                )}
              </div>
            </div>
          )}

          {uploadProgress.status === 'error' && (
            <div key="error" className="mt-6">
              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center">
                  <svg
                    className="h-5 w-5 text-red-400 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm text-red-800">
                    {uploadProgress.error || 'An error occurred'}
                  </p>
                </div>
                
                <button
                  onClick={handleReset}
                  className="mt-3 text-sm text-red-600 hover:text-red-800 font-medium"
                >
                  Try again
                </button>
              </div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
};