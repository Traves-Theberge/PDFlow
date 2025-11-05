/**
 * Home Page Component - Main PDFlow Application
 *
 * The primary application page that orchestrates the complete PDF extraction workflow.
 * Manages state for upload, processing, output viewing, and user preferences.
 *
 * Features:
 * - PDF file upload with drag-and-drop interface
 * - Real-time processing progress tracking
 * - Multi-format output (Markdown, MDX, JSON, XML, YAML, HTML, CSV)
 * - Dark mode with localStorage persistence
 * - API key management via settings modal
 * - Individual page and aggregated results viewing
 * - Session management with reset capability
 *
 * Workflow:
 * 1. User uploads PDF → UploadForm component
 * 2. Upload completes → startProcessing() triggers extraction
 * 3. Processing runs → ProgressBar shows real-time updates
 * 4. Pages complete → EnhancedOutputViewer displays results
 * 5. User can reset to start new upload
 *
 * @page
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { UploadForm } from '@/app/components/UploadForm';
import { ProgressBar } from '@/app/components/ProgressBar';
import { OutputViewer } from '@/app/components/OutputViewer';
import { EnhancedOutputViewer } from '@/app/components/EnhancedOutputViewer';
import { Settings } from '@/app/components/Settings';
import { useUploadProgress, useAppActions } from '@/app/store/useAppStore';

/**
 * Supported output formats for PDF extraction
 * Determines file extension and Handlebars template used
 */
type OutputFormat = 'markdown' | 'mdx' | 'json' | 'xml' | 'yaml' | 'html' | 'csv';

export default function Home() {
  // Session Management State
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);  // Active PDF processing session ID
  const [showOutput, setShowOutput] = useState(false);                             // Whether to display output viewer

  // UI State
  const [showSettings, setShowSettings] = useState(false);                         // Settings modal visibility
  const [hasApiKey, setHasApiKey] = useState(false);                               // Whether Gemini API key is configured
  const [selectedFormat, setSelectedFormat] = useState<OutputFormat>('markdown');  // User-selected output format
  const [darkMode, setDarkMode] = useState(false);                                 // Dark mode preference

  // Global State from Zustand Store
  const uploadProgress = useUploadProgress();                                      // Upload/conversion progress tracking
  const { resetUploadProgress } = useAppActions();                                 // Action to reset upload state

  /**
   * Initialization Effect: Load user preferences from browser storage
   *
   * Runs on component mount and when settings modal closes to:
   * 1. Check if Gemini API key is configured in sessionStorage
   * 2. Load dark mode preference from localStorage
   *
   * Dependencies:
   * - showSettings: Re-run when settings close to detect newly saved API key
   */
  useEffect(() => {
    // Check for API key in sessionStorage (only on client side)
    const apiKey = typeof window !== 'undefined' ? sessionStorage.getItem('gemini_api_key') : null;
    setHasApiKey(!!apiKey);

    // Check for dark mode preference in localStorage (only on client side)
    const savedDarkMode = typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false;
    setDarkMode(savedDarkMode);
  }, [showSettings]);

  /**
   * Toggle dark mode preference
   *
   * Switches between light and dark themes and persists preference to localStorage.
   * All child components receive darkMode prop and update their styling accordingly.
   */
  const toggleDarkMode = () => {
    const newDarkMode = !darkMode;
    setDarkMode(newDarkMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newDarkMode));
    }
  };

  /**
   * Handle successful PDF upload
   *
   * Called by UploadForm when PDF is uploaded and converted to WebP images.
   * Stores session ID and immediately starts AI extraction processing.
   *
   * @param {string} sessionId - Unique session identifier for this PDF
   * @param {number} pageCount - Number of pages in the PDF (not used but provided)
   */
  const handleUploadComplete = (sessionId: string, pageCount: number) => {
    setCurrentSessionId(sessionId);
    startProcessing(sessionId);
  };

  /**
   * Start AI extraction processing for uploaded PDF
   *
   * Triggers the /api/process endpoint to begin Gemini AI extraction.
   * Processing runs asynchronously - this just initiates it.
   * Progress is tracked via ProgressBar component polling.
   *
   * Workflow:
   * 1. POST to /api/process with session ID and format
   * 2. Server spawns background extraction for each page
   * 3. Each page is sent to Gemini AI for content extraction
   * 4. Results are saved to uploads/{sessionId}/outputs/
   * 5. Client polls for completed pages via EnhancedOutputViewer
   *
   * @param {string} sessionId - Session identifier from upload
   */
  const startProcessing = async (sessionId: string) => {
    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          format: selectedFormat,      // User-selected output format
          aggregate: false,             // Don't combine pages (individual extraction)
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Processing failed to start');
      }

      console.log('Processing started:', result);
    } catch (error) {
      console.error('Error starting processing:', error);
    }
  };

  /**
   * Handle completion of all page processing
   *
   * Called by ProgressBar when all pages have been extracted.
   * Shows the EnhancedOutputViewer to display results.
   *
   * @param {string} sessionId - Session that completed (for logging)
   */
  const handleProcessingComplete = (sessionId: string) => {
    console.log('Processing completed for session:', sessionId);
    setShowOutput(true);  // Display output viewer
  };

  /**
   * Handle processing errors
   *
   * Called by ProgressBar if extraction fails.
   * Currently just logs error; could show error UI in future.
   *
   * @param {string} error - Error message from processing
   */
  const handleProcessingError = (error: string) => {
    console.error('Processing error:', error);
  };

  /**
   * Handle upload errors
   *
   * Called by UploadForm if PDF upload or conversion fails.
   * Currently just logs error; UploadForm handles error display.
   *
   * @param {string} error - Error message from upload
   */
  const handleUploadError = (error: string) => {
    console.error('Upload error:', error);
  };

  /**
   * Reset application to initial state
   *
   * Clears current session and returns to upload screen.
   * Called when user clicks logo or "New" button.
   * Allows starting a new PDF upload without page refresh.
   */
  const handleReset = () => {
    setCurrentSessionId(null);  // Clear session
    setShowOutput(false);        // Hide output viewer
    resetUploadProgress();       // Reset Zustand upload state
  };

  /**
   * Aggregate all pages into a single combined output file
   *
   * Combines all extracted pages into one document using the aggregator service.
   * Used by OutputViewer component (legacy) for "Download All" functionality.
   * EnhancedOutputViewer has its own client-side aggregation logic.
   *
   * Workflow:
   * 1. POST to /api/process with aggregate: true
   * 2. Server reads all individual page outputs
   * 3. Aggregator combines them based on format (e.g., JSON array, concatenated markdown)
   * 4. Combined file saved to uploads/{sessionId}/outputs/aggregated.{ext}
   *
   * @param {string} format - Output format for aggregation (markdown, json, xml, html)
   */
  const handleAggregate = async (format: 'markdown' | 'json' | 'xml' | 'html') => {
    if (!currentSessionId) return;

    try {
      const response = await fetch('/api/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: currentSessionId,
          format,
          aggregate: true,  // Trigger aggregation instead of extraction
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Aggregation failed');
      }

      console.log('Aggregation completed:', result);
    } catch (error) {
      console.error('Error during aggregation:', error);
    }
  };

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-neutral-950' : 'bg-white'}`}>
      {/*
        Fixed Header: Contains logo, API key status, dark mode toggle, GitHub link, settings, and reset button.
        Remains visible during scrolling for easy navigation.
      */}
      <header className={`fixed top-0 left-0 right-0 border-b z-40 transition-colors duration-200 ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-white border-neutral-200'}`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-14">
            {/* Logo - Click to reset and return to upload screen */}
            <motion.button
              onClick={handleReset}
              className="flex items-center"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              title="Go to home"
            >
              <img
                src="/PDFlow_Logo.png"
                alt="PDFlow Logo"
                className={`h-7 w-auto transition-all ${darkMode ? '' : 'invert'}`}
              />
            </motion.button>

            {/* Right Side Actions: API status, dark mode, GitHub, settings, reset */}
            <div className="flex items-center space-x-2">
              {/* API Key Status Indicator - Shows if Gemini API key is configured */}
              <div className={`hidden sm:flex items-center space-x-1.5 px-2.5 py-1 rounded-md border ${darkMode ? 'border-neutral-800' : 'border-neutral-200'}`}>
                <div className={`w-1.5 h-1.5 rounded-full ${hasApiKey ? (darkMode ? 'bg-white' : 'bg-black') : (darkMode ? 'bg-neutral-700' : 'bg-neutral-300')}`}></div>
                <span className={`text-xs font-medium ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>
                  {hasApiKey ? 'Connected' : 'No Key'}
                </span>
              </div>

              {/* Dark Mode Toggle - Sun/Moon icons to switch themes */}
              <button
                onClick={toggleDarkMode}
                className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'}`}
                title="Toggle Dark Mode"
              >
                {darkMode ? (
                  <svg className="w-4 h-4 text-neutral-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
                  </svg>
                ) : (
                  <svg className="w-4 h-4 text-neutral-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
                  </svg>
                )}
              </button>

              {/* GitHub Link - Opens repository in new tab */}
              <a
                href="https://github.com/traves-theberge/pdflow"
                target="_blank"
                rel="noopener noreferrer"
                className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'}`}
                title="View on GitHub"
              >
                <svg className={`w-4 h-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 24 24">
                  <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                </svg>
              </a>

              {/* Settings Button - Opens API key management modal */}
              <button
                onClick={() => setShowSettings(true)}
                className={`p-1.5 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-900' : 'hover:bg-neutral-100'}`}
                title="Settings"
              >
                <svg className={`w-4 h-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
              </button>

              {/* Reset Button - Only shown when actively processing a PDF */}
              {currentSessionId && (
                <motion.button
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={handleReset}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${darkMode ? 'bg-white text-black hover:bg-neutral-200' : 'bg-black text-white hover:bg-neutral-800'}`}
                >
                  New
                </motion.button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/*
        Main Content: Two states managed by AnimatePresence
        1. Upload State (!currentSessionId): Shows hero, format selector, upload form, and features
        2. Processing State (currentSessionId): Shows progress bar and output viewer
      */}
      <main className="pt-20 pb-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-5xl mx-auto">
          <AnimatePresence mode="wait">
            {!currentSessionId ? (
              <motion.div
                key="upload"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-10"
              >
                {/* Hero Section: Logo, tagline, description */}
                <div className="text-center max-w-2xl mx-auto space-y-6">
                  {/* Logo with Text */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0 }}
                    className="flex justify-center"
                  >
                    <img
                      src="/PDFlow_Logo_W_Text.png"
                      alt="PDFlow"
                      className={`h-20 w-auto transition-all ${darkMode ? '' : 'invert'}`}
                    />
                  </motion.div>

                  <motion.h2
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.05 }}
                    className={`text-3xl sm:text-4xl font-semibold tracking-tight leading-tight ${darkMode ? 'text-white' : 'text-neutral-900'}`}
                  >
                    Transform PDFs into structured data
                  </motion.h2>
                  <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className={`text-sm max-w-md mx-auto leading-relaxed ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}
                  >
                    AI-powered extraction that converts your documents into markdown, JSON, XML, and more
                  </motion.p>

                  {/* Format Selector - Buttons to choose output format before upload */}
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.15 }}
                    className="flex flex-wrap items-center justify-center gap-1.5 pt-2"
                  >
                    {(['markdown', 'mdx', 'json', 'xml', 'yaml', 'html', 'csv'] as OutputFormat[]).map((format) => (
                      <button
                        key={format}
                        onClick={() => setSelectedFormat(format)}
                        className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                          selectedFormat === format
                            ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                            : (darkMode ? 'bg-neutral-900 text-neutral-400 hover:bg-neutral-800 border border-neutral-800' : 'bg-white text-neutral-600 hover:bg-neutral-50 border border-neutral-200')
                        }`}
                      >
                        {format.toUpperCase()}
                      </button>
                    ))}
                  </motion.div>
                </div>

                {/* Upload Form - Drag-and-drop file upload component */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2 }}
                >
                  <UploadForm
                    onUploadComplete={handleUploadComplete}
                    onUploadError={handleUploadError}
                  />
                </motion.div>

                {/* Features Grid - Three feature cards explaining the workflow */}
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.25 }}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 max-w-4xl mx-auto"
                >
                  {[
                    {
                      icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                      ),
                      title: 'Upload',
                      description: 'Drag & drop PDFs'
                    },
                    {
                      icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                      ),
                      title: 'Extract',
                      description: 'AI-powered processing'
                    },
                    {
                      icon: (
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                      ),
                      title: 'Export',
                      description: 'In your selected format'
                    }
                  ].map((feature, index) => (
                    <motion.div
                      key={feature.title}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.3 + index * 0.05 }}
                      className={`rounded-lg p-4 border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'}`}
                    >
                      <div className={`w-8 h-8 rounded-md flex items-center justify-center mb-3 ${darkMode ? 'bg-white' : 'bg-black'}`}>
                        <svg className={`w-4 h-4 ${darkMode ? 'text-black' : 'text-white'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          {feature.icon}
                        </svg>
                      </div>
                      <h3 className={`text-sm font-semibold mb-1 ${darkMode ? 'text-white' : 'text-neutral-900'}`}>{feature.title}</h3>
                      <p className={`text-xs ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`}>{feature.description}</p>
                    </motion.div>
                  ))}
                </motion.div>
              </motion.div>
            ) : (
              <motion.div
                key="processing"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Progress Section - Shows real-time extraction progress */}
                <div className="max-w-3xl mx-auto">
                  <ProgressBar
                    sessionId={currentSessionId}
                    onProcessingComplete={handleProcessingComplete}
                    onProcessingError={handleProcessingError}
                    darkMode={darkMode}
                  />
                </div>

                {/* Output Section - Shows extracted pages as they complete */}
                {showOutput && (
                  <motion.div
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: 0.1 }}
                    className="w-full"
                  >
                    <EnhancedOutputViewer
                      sessionId={currentSessionId}
                      totalPages={uploadProgress.totalPages}
                      format={selectedFormat}
                      darkMode={darkMode}
                    />
                  </motion.div>
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      {/* Settings Modal - API key management, rendered as overlay when showSettings is true */}
      <AnimatePresence>
        {showSettings && (
          <Settings onClose={() => setShowSettings(false)} darkMode={darkMode} />
        )}
      </AnimatePresence>
    </div>
  );
}
