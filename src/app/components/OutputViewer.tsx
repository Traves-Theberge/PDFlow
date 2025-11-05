'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCurrentOutput, useOutputFiles, useAppActions } from '@/app/store/useAppStore';

interface OutputViewerProps {
  sessionId?: string;
  onAggregate?: (format: 'markdown' | 'json' | 'xml' | 'html') => void;
}

export const OutputViewer: React.FC<OutputViewerProps> = ({
  sessionId: propSessionId,
  onAggregate,
}) => {
  const currentOutput = useCurrentOutput();
  const outputFiles = useOutputFiles();
  const { setCurrentOutput } = useAppActions();
  const [selectedFormat, setSelectedFormat] = useState<'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx'>('markdown');
  const [viewMode, setViewMode] = useState<'raw' | 'formatted'>('formatted');
  const [isLoading, setIsLoading] = useState(false);

  // Load output content when session ID changes
  useEffect(() => {
    if (propSessionId && !currentOutput) {
      loadOutputContent(propSessionId, selectedFormat);
    }
  }, [propSessionId, selectedFormat]);

  const loadOutputContent = async (sessionId: string, format: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx') => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/process`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          format,
          aggregate: true,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || 'Failed to load output');
      }

      if (result.aggregate && !result.aggregate.error) {
        const output = {
          sessionId,
          format,
          content: result.aggregate.content,
          createdAt: result.aggregate.metadata.createdAt,
          totalPages: result.aggregate.totalPages,
        };

        setCurrentOutput(output);
      } else {
        throw new Error(result.aggregate?.error || 'No content available');
      }
    } catch (error) {
      console.error('Error loading output:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleFormatChange = (format: 'markdown' | 'json' | 'xml' | 'html' | 'yaml' | 'mdx') => {
    setSelectedFormat(format);
    if (propSessionId) {
      loadOutputContent(propSessionId, format);
    }
  };

  const handleDownload = () => {
    if (!currentOutput) return;

    const blob = new Blob([currentOutput.content], { 
      type: getContentType(currentOutput.format) 
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `extracted-content.${currentOutput.format}`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const getContentType = (format: string): string => {
    switch (format) {
      case 'json':
        return 'application/json';
      case 'xml':
        return 'application/xml';
      case 'html':
        return 'text/html';
      case 'yaml':
        return 'text/yaml';
      case 'mdx':
        return 'text/mdx';
      case 'markdown':
      default:
        return 'text/markdown';
    }
  };

  const renderContent = () => {
    if (!currentOutput) return null;

    switch (viewMode) {
      case 'formatted':
        return renderFormattedContent(currentOutput.content, currentOutput.format);
      case 'raw':
        return (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{currentOutput.content}</code>
          </pre>
        );
      default:
        return currentOutput.content;
    }
  };

  const renderFormattedContent = (content: string, format: string) => {
    switch (format) {
      case 'json':
        try {
          const parsed = JSON.parse(content);
          return (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{JSON.stringify(parsed, null, 2)}</code>
            </pre>
          );
        } catch {
          return (
            <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
              <code>{content}</code>
            </pre>
          );
        }
      case 'html':
        return (
          <div 
            className="prose prose-gray max-w-none"
            dangerouslySetInnerHTML={{ __html: content }}
          />
        );
      case 'xml':
        return (
          <pre className="bg-gray-50 p-4 rounded-lg overflow-x-auto text-sm">
            <code>{content}</code>
          </pre>
        );
      case 'markdown':
      default:
        return (
          <div className="prose prose-gray max-w-none">
            <pre className="whitespace-pre-wrap bg-gray-50 p-4 rounded-lg text-sm">
              {content}
            </pre>
          </div>
        );
    }
  };

  if (!currentOutput && !isLoading) {
    return null;
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="w-full max-w-4xl mx-auto"
    >
      <div className="bg-white rounded-lg shadow-lg border border-gray-200">
        {/* Header */}
        <div className="border-b border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-2xl font-bold text-gray-900">
              Extracted Content
            </h2>
            
            <div className="flex items-center space-x-4">
              {/* Format selector */}
              <select
                value={selectedFormat}
                onChange={(e) => handleFormatChange(e.target.value as any)}
                className="px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-gray-500"
              >
                <option value="markdown">Markdown</option>
                <option value="json">JSON</option>
                <option value="xml">XML</option>
                <option value="html">HTML</option>
              </select>

              {/* View mode toggle */}
              <div className="flex items-center bg-gray-100 rounded-lg p-1">
                <button
                  onClick={() => setViewMode('formatted')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'formatted'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Formatted
                </button>
                <button
                  onClick={() => setViewMode('raw')}
                  className={`px-3 py-1 rounded text-sm font-medium transition-colors ${
                    viewMode === 'raw'
                      ? 'bg-white text-gray-900 shadow-sm'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  Raw
                </button>
              </div>

              {/* Download button */}
              <button
                onClick={handleDownload}
                disabled={!currentOutput || isLoading}
                className="px-4 py-2 bg-gray-900 text-white rounded-lg text-sm font-medium hover:bg-gray-800 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
              >
                Download
              </button>
            </div>
          </div>

          {/* Metadata */}
          {currentOutput && (
            <div className="flex items-center space-x-6 text-sm text-gray-500">
              <span>
                Format: <span className="font-medium text-gray-700">{currentOutput.format.toUpperCase()}</span>
              </span>
              <span>
                Pages: <span className="font-medium text-gray-700">{currentOutput.totalPages}</span>
              </span>
              <span>
                Created: <span className="font-medium text-gray-700">
                  {new Date(currentOutput.createdAt).toLocaleString()}
                </span>
              </span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-6">
          <AnimatePresence mode="wait">
            {isLoading ? (
              <motion.div
                key="loading"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="flex items-center justify-center py-12"
              >
                <div className="text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900 mx-auto mb-4"></div>
                  <p className="text-gray-600">Loading content...</p>
                </div>
              </motion.div>
            ) : currentOutput ? (
              <motion.div
                key="content"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.2 }}
              >
                {renderContent()}
              </motion.div>
            ) : (
              <motion.div
                key="empty"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center py-12"
              >
                <p className="text-gray-500">No content available</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};