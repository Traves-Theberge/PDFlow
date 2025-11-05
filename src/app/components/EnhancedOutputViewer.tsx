/**
 * EnhancedOutputViewer Component
 *
 * Real-time PDF extraction results viewer with threaded output display.
 * Shows extraction progress and allows downloading individual pages or all pages combined.
 *
 * Features:
 * - Real-time polling for completed pages (2-second intervals)
 * - Grid and list view modes
 * - Individual page preview and download
 * - Bulk download of all pages
 * - Auto-scroll to first completed page
 * - Dark mode support
 *
 * @component
 */

'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Represents the result of processing a single PDF page
 */
interface PageResult {
  page: number;                                          // Page number (1-indexed)
  content: string;                                       // Extracted content
  format: string;                                        // Output format (markdown, json, etc.)
  timestamp: number;                                     // When the page was completed
  status: 'processing' | 'completed' | 'error';         // Current status
  error?: string;                                        // Error message if status is 'error'
}

/**
 * Props for the EnhancedOutputViewer component
 */
interface EnhancedOutputViewerProps {
  sessionId: string;           // Unique session identifier from upload
  totalPages: number;          // Total number of pages in the PDF
  format: string;              // Output format (markdown, mdx, json, xml, yaml, html, csv)
  darkMode?: boolean;          // Whether dark mode is enabled
}

export const EnhancedOutputViewer: React.FC<EnhancedOutputViewerProps> = ({
  sessionId,
  totalPages,
  format,
  darkMode = false,
}) => {
  // State: Map of page numbers to their results (using Map for efficient lookups)
  const [pageResults, setPageResults] = useState<Map<number, PageResult>>(new Map());

  // State: Currently selected page for preview (null = no selection)
  const [selectedPage, setSelectedPage] = useState<number | null>(null);

  // State: View mode for page list (grid or list layout)
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // State: Whether to auto-select first completed page
  const [autoScroll, setAutoScroll] = useState(true);

  /**
   * Polling Effect: Continuously checks for newly completed pages
   *
   * This effect runs every 2 seconds and attempts to fetch each page's output file.
   * When a page is found, it's added to the pageResults Map and optionally auto-selected.
   *
   * Dependencies:
   * - sessionId: The session to poll
   * - totalPages: How many pages to check
   * - format: What file extension to look for
   * - pageResults: Current results (to avoid re-fetching)
   * - selectedPage: For auto-scroll logic
   * - autoScroll: Whether to auto-select first page
   */
  useEffect(() => {
    const fileExt = getFileExtension(format);

    const interval = setInterval(async () => {
      try {
        // Check for new completed pages by iterating through all page numbers
        for (let i = 1; i <= totalPages; i++) {
          // Skip pages we've already loaded to avoid redundant fetches
          if (pageResults.has(i)) continue;

          // Attempt to fetch the output file for this page
          // The file will exist once the AI has finished processing this page
          const response = await fetch(`/api/outputs/${sessionId}/page-${i}.${fileExt}`);

          if (response.ok) {
            // Page is ready! Add it to our results
            const content = await response.text();
            setPageResults(prev => {
              const updated = new Map(prev);
              updated.set(i, {
                page: i,
                content,
                format,
                timestamp: Date.now(),
                status: 'completed',
              });
              return updated;
            });

            // Auto-select the first completed page for immediate preview
            if (autoScroll && !selectedPage) {
              setSelectedPage(i);
            }
          }
          // If response is not ok (404), page is still processing - we'll check again next interval
        }
      } catch (error) {
        console.error('Error polling for results:', error);
      }
    }, 2000); // Poll every 2 seconds

    // Cleanup: Stop polling when component unmounts
    return () => clearInterval(interval);
  }, [sessionId, totalPages, format, pageResults, selectedPage, autoScroll]);

  /**
   * Get file extension for a given format
   *
   * @param {string} fmt - Format name (markdown, json, etc.)
   * @returns {string} File extension (md, json, etc.)
   */
  const getFileExtension = (fmt: string): string => {
    const extensions: Record<string, string> = {
      markdown: 'md',
      mdx: 'mdx',
      json: 'json',
      xml: 'xml',
      yaml: 'yaml',
      html: 'html',
      csv: 'csv',
    };
    return extensions[fmt] || 'txt';
  };

  /**
   * Download a single page's content as a file
   *
   * Creates a downloadable blob and triggers browser download.
   * Cleans up the object URL after download to prevent memory leaks.
   *
   * @param {number} pageNum - Page number to download
   */
  const downloadPage = (pageNum: number) => {
    const result = pageResults.get(pageNum);
    if (!result) return;

    // Create a blob from the page content
    const blob = new Blob([result.content], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);

    // Create a temporary anchor element to trigger download
    const a = document.createElement('a');
    a.href = url;
    a.download = `page-${pageNum}.${getFileExtension(format)}`;
    document.body.appendChild(a);
    a.click();

    // Cleanup: Remove the anchor and revoke the object URL
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  /**
   * Download all completed pages as a single combined file
   *
   * Combines all pages with separator ("---") and downloads as one file.
   * Pages are sorted by page number before combining.
   */
  const downloadAll = () => {
    // Sort pages by page number and combine their content
    const allContent = Array.from(pageResults.entries())
      .sort(([a], [b]) => a - b)                          // Sort by page number
      .map(([_, result]) => result.content)                // Extract content
      .join('\n\n---\n\n');                                 // Join with separator

    // Create downloadable blob and trigger download
    const blob = new Blob([allContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `document-full.${getFileExtension(format)}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  // Calculate completion metrics for progress bar
  const completedCount = pageResults.size;
  const progressPercent = Math.round((completedCount / totalPages) * 100);

  return (
    <div className="w-full max-w-7xl mx-auto space-y-6">
      {/* Header with controls */}
      <div className={`rounded-lg border p-6 transition-colors duration-200 ${
        darkMode
          ? 'bg-neutral-900 border-neutral-800'
          : 'bg-white border-neutral-200'
      }`}>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className={`text-sm font-semibold ${
              darkMode ? 'text-white' : 'text-neutral-900'
            }`}>Extraction Results</h2>
            <p className={`text-xs mt-1 ${
              darkMode ? 'text-neutral-400' : 'text-neutral-600'
            }`}>
              {completedCount} of {totalPages} pages completed ({progressPercent}%)
            </p>
          </div>

          <div className="flex items-center space-x-2">
            {/* View mode toggle */}
            <div className={`flex items-center space-x-1 rounded-md p-1 ${
              darkMode ? 'bg-neutral-950' : 'bg-neutral-100'
            }`}>
              <button
                onClick={() => setViewMode('grid')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'grid'
                    ? (darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900')
                    : (darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 6v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  viewMode === 'list'
                    ? (darkMode ? 'bg-neutral-800 text-white' : 'bg-white text-neutral-900')
                    : (darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900')
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>

            {/* Download all button */}
            {completedCount > 0 && (
              <button
                onClick={downloadAll}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-1.5 ${
                  darkMode
                    ? 'bg-white text-black hover:bg-neutral-200'
                    : 'bg-black text-white hover:bg-neutral-800'
                }`}
              >
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
                <span>Download All</span>
              </button>
            )}
          </div>
        </div>

        {/* Progress bar */}
        <div className={`w-full rounded-full h-2 ${
          darkMode ? 'bg-neutral-800' : 'bg-neutral-200'
        }`}>
          <motion.div
            className={darkMode ? 'h-full bg-white rounded-full' : 'h-full bg-black rounded-full'}
            initial={{ width: 0 }}
            animate={{ width: `${progressPercent}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>
      </div>

      {/* Grid/List View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page list/grid */}
        <div className={`${selectedPage ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <div className={`rounded-lg border p-4 transition-colors duration-200 ${
            darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
          } ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3' : 'space-y-2'}`}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const result = pageResults.get(pageNum);
              const isCompleted = !!result;
              const isSelected = selectedPage === pageNum;

              return (
                <motion.button
                  key={pageNum}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: pageNum * 0.05 }}
                  onClick={() => isCompleted && setSelectedPage(pageNum)}
                  className={`relative p-3 rounded-md border transition-all ${
                    isSelected
                      ? (darkMode ? 'border-white bg-neutral-950' : 'border-black bg-neutral-50')
                      : isCompleted
                      ? (darkMode ? 'border-neutral-700 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-400 bg-white')
                      : (darkMode ? 'border-neutral-800 bg-neutral-950 cursor-not-allowed' : 'border-neutral-100 bg-neutral-50 cursor-not-allowed')
                  }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 ${
                      isCompleted
                        ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                        : (darkMode ? 'bg-neutral-800 text-neutral-600' : 'bg-neutral-100 text-neutral-400')
                    }`}>
                      {isCompleted ? (
                        <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                      ) : (
                        <svg className="w-6 h-6 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>
                    <span className={`text-xs font-medium ${
                      darkMode ? 'text-white' : 'text-neutral-900'
                    }`}>Page {pageNum}</span>
                    {isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPage(pageNum);
                        }}
                        className={`mt-2 text-xs ${
                          darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-600 hover:text-neutral-900'
                        }`}
                      >
                        Download
                      </button>
                    )}
                  </div>

                  {/* Completion badge */}
                  {isCompleted && (
                    <motion.div
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      className={`absolute top-1.5 right-1.5 w-4 h-4 rounded-full flex items-center justify-center ${
                        darkMode ? 'bg-white' : 'bg-black'
                      }`}
                    >
                      <svg className={`w-2.5 h-2.5 ${darkMode ? 'text-black' : 'text-white'}`} fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                    </motion.div>
                  )}
                </motion.button>
              );
            })}
          </div>
        </div>

        {/* Content preview */}
        {selectedPage && pageResults.has(selectedPage) && (
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="lg:col-span-2"
          >
            <div className={`rounded-lg border overflow-hidden transition-colors duration-200 ${
              darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
            }`}>
              <div className={`border-b px-4 py-3 flex items-center justify-between ${
                darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
              }`}>
                <h3 className={`text-sm font-semibold ${
                  darkMode ? 'text-white' : 'text-neutral-900'
                }`}>
                  Page {selectedPage} Preview
                </h3>
                <button
                  onClick={() => setSelectedPage(null)}
                  className={`p-1 rounded-md transition-colors ${
                    darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-900' : 'text-neutral-500 hover:text-neutral-900 hover:bg-neutral-100'
                  }`}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                </button>
              </div>
              <div className="p-4 max-h-[600px] overflow-y-auto">
                <pre className={`whitespace-pre-wrap text-xs font-mono ${
                  darkMode ? 'text-neutral-300' : 'text-neutral-700'
                }`}>
                  {pageResults.get(selectedPage)?.content}
                </pre>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
