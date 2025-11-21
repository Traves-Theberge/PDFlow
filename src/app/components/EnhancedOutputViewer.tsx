'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import ReactMarkdown from 'react-markdown';

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
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <h2 className={`text-lg font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'
            }`}>
            Results
          </h2>

          {/* View mode toggle */}
          <div className={`flex items-center space-x-1 rounded-md p-1 border ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
            }`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'grid'
                ? (darkMode ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-900')
                : (darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')
                }`}
              title="Grid View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 6v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
              </svg>
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-sm transition-colors ${viewMode === 'list'
                ? (darkMode ? 'bg-neutral-800 text-white' : 'bg-neutral-100 text-neutral-900')
                : (darkMode ? 'text-neutral-500 hover:text-neutral-300' : 'text-neutral-400 hover:text-neutral-600')
                }`}
              title="List View"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Download all button */}
        {completedCount > 0 && (
          <button
            onClick={downloadAll}
            className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors flex items-center space-x-2 ${darkMode
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Page list/grid */}
        <div className={`${selectedPage ? 'lg:col-span-1' : 'lg:col-span-3'}`}>
          <div className={`rounded-lg border p-4 transition-colors duration-200 ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
            } ${viewMode === 'grid' ? 'grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-3 gap-3' : 'space-y-2'}`}>
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((pageNum) => {
              const result = pageResults.get(pageNum);
              const isCompleted = !!result;
              const isSelected = selectedPage === pageNum;

              return (
                <motion.div
                  key={pageNum}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: pageNum * 0.05 }}
                  onClick={() => isCompleted && setSelectedPage(pageNum)}
                  className={`relative p-3 rounded-md border transition-all cursor-pointer group ${isSelected
                    ? (darkMode ? 'border-white bg-neutral-950' : 'border-black bg-neutral-50')
                    : isCompleted
                      ? (darkMode ? 'border-neutral-800 hover:border-neutral-600 bg-neutral-900' : 'border-neutral-200 hover:border-neutral-400 bg-white')
                      : (darkMode ? 'border-neutral-800 bg-neutral-950 cursor-not-allowed' : 'border-neutral-100 bg-neutral-50 cursor-not-allowed')
                    }`}
                >
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-2 transition-colors ${isCompleted
                      ? (darkMode ? 'bg-white text-black' : 'bg-black text-white')
                      : (darkMode ? 'bg-neutral-800 text-neutral-600' : 'bg-neutral-100 text-neutral-400')
                      }`}>
                      {isCompleted ? (
                        <span className="text-xs font-bold">{pageNum}</span>
                      ) : (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      )}
                    </div>

                    {isCompleted && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          downloadPage(pageNum);
                        }}
                        className={`mt-1 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase tracking-wider font-medium ${darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-500 hover:text-black'
                          }`}
                      >
                        Download
                      </button>
                    )}
                  </div>
                </motion.div>
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
            <div className={`rounded-lg border overflow-hidden transition-colors duration-200 flex flex-col h-[600px] ${darkMode ? 'bg-neutral-900 border-neutral-800' : 'bg-white border-neutral-200'
              }`}>
              <div className={`border-b px-4 py-3 flex items-center justify-between flex-shrink-0 ${darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
                }`}>
                <h3 className={`text-sm font-semibold ${darkMode ? 'text-white' : 'text-neutral-900'
                  }`}>
                  Page {selectedPage}
                </h3>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => downloadPage(selectedPage!)}
                    className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                      }`}
                    title="Download Page"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                    </svg>
                  </button>
                  <button
                    onClick={() => setSelectedPage(null)}
                    className={`p-1.5 rounded-md transition-colors ${darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-500 hover:text-black hover:bg-neutral-200'
                      }`}
                    title="Close Preview"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6">
                <div className={`prose prose-sm max-w-none ${darkMode ? 'prose-invert' : ''
                  }`}>
                  {format === 'markdown' || format === 'mdx' ? (
                    <ReactMarkdown>{pageResults.get(selectedPage)?.content || ''}</ReactMarkdown>
                  ) : (
                    <pre className={`whitespace-pre-wrap font-mono text-xs ${darkMode ? 'text-neutral-300' : 'text-neutral-900'
                      }`}>
                      {pageResults.get(selectedPage)?.content}
                    </pre>
                  )}
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </div>
    </div>
  );
};
