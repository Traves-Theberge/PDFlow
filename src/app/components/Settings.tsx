'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface SettingsProps {
  onClose: () => void;
  darkMode?: boolean;
}

export const Settings: React.FC<SettingsProps> = ({ onClose, darkMode = false }) => {
  const [apiKey, setApiKey] = useState('');
  const [showApiKey, setShowApiKey] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [isValidating, setIsValidating] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [hasApiKey, setHasApiKey] = useState(false);

  useEffect(() => {
    checkApiKeyStatus();
  }, []);

  const checkApiKeyStatus = async () => {
    const storedKey = typeof window !== 'undefined' ? sessionStorage.getItem('gemini_api_key') : null;
    if (storedKey) {
      setHasApiKey(true);
      setMessage({ type: 'info', text: 'API key is configured' });
    }
  };

  const handleValidateKey = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setIsValidating(true);
    setMessage(null);

    try {
      const response = await fetch('/api/settings/validate-key', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ apiKey: apiKey.trim() }),
      });

      const result = await response.json();

      if (response.ok && result.valid) {
        setMessage({ type: 'success', text: 'API key is valid!' });
      } else {
        setMessage({ type: 'error', text: result.error || 'Invalid API key' });
      }
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to validate API key' });
    } finally {
      setIsValidating(false);
    }
  };

  const handleSave = async () => {
    if (!apiKey.trim()) {
      setMessage({ type: 'error', text: 'Please enter an API key' });
      return;
    }

    setIsSaving(true);
    setMessage(null);

    try {
      // Store in sessionStorage
      if (typeof window !== 'undefined') {
        sessionStorage.setItem('gemini_api_key', apiKey.trim());
      }

      setMessage({ type: 'success', text: 'API key saved successfully!' });
      setHasApiKey(true);
      setTimeout(() => {
        onClose();
        window.location.reload(); // Reload to apply API key
      }, 1500);
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to save API key' });
    } finally {
      setIsSaving(false);
    }
  };

  const handleClear = async () => {
    try {
      if (typeof window !== 'undefined') {
        sessionStorage.removeItem('gemini_api_key');
      }
      setApiKey('');
      setHasApiKey(false);
      setMessage({ type: 'info', text: 'API key cleared' });
    } catch (error) {
      setMessage({ type: 'error', text: 'Failed to clear API key' });
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.95, opacity: 0 }}
        className={`rounded-lg max-w-2xl w-full p-6 transition-colors duration-200 ${
          darkMode
            ? 'bg-neutral-900 border border-neutral-800'
            : 'bg-white'
        }`}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className={`text-lg font-semibold ${
            darkMode ? 'text-white' : 'text-neutral-900'
          }`}>Settings</h2>
          <button
            onClick={onClose}
            className={`p-1 rounded-md transition-colors ${
              darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-400 hover:text-neutral-600 hover:bg-neutral-100'
            }`}
          >
            <svg
              className="h-5 w-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              strokeWidth={2}
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* API Key Section */}
          <div>
            <label className={`block text-xs font-medium mb-2 ${
              darkMode ? 'text-neutral-300' : 'text-neutral-700'
            }`}>
              Google Gemini API Key
            </label>
            <p className={`text-xs mb-4 ${
              darkMode ? 'text-neutral-400' : 'text-neutral-500'
            }`}>
              Enter your Google Gemini API key to enable AI-powered PDF extraction.{' '}
              <a
                href="https://makersuite.google.com/app/apikey"
                target="_blank"
                rel="noopener noreferrer"
                className={`underline ${
                  darkMode ? 'text-white hover:text-neutral-300' : 'text-black hover:text-neutral-700'
                }`}
              >
                Get your API key here
              </a>
            </p>

            <div className="relative">
              <input
                type={showApiKey ? 'text' : 'password'}
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                placeholder={hasApiKey ? '••••••••••••••••••••' : 'Enter your API key'}
                className={`w-full px-3 py-2 text-xs border rounded-md pr-10 transition-colors ${
                  darkMode
                    ? 'bg-neutral-950 border-neutral-700 text-white placeholder-neutral-500 focus:ring-1 focus:ring-white focus:border-white'
                    : 'bg-white border-neutral-300 text-neutral-900 placeholder-neutral-400 focus:ring-1 focus:ring-black focus:border-black'
                }`}
              />
              <button
                type="button"
                onClick={() => setShowApiKey(!showApiKey)}
                className={`absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded transition-colors ${
                  darkMode ? 'text-neutral-400 hover:text-white' : 'text-neutral-400 hover:text-neutral-600'
                }`}
              >
                {showApiKey ? (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                    />
                  </svg>
                ) : (
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
                    />
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
                    />
                  </svg>
                )}
              </button>
            </div>

            {/* Security Notice */}
            <div className={`mt-3 border rounded-md p-3 ${
              darkMode ? 'bg-neutral-950 border-neutral-800' : 'bg-neutral-50 border-neutral-200'
            }`}>
              <div className="flex items-start">
                <svg
                  className={`h-4 w-4 mr-2 mt-0.5 flex-shrink-0 ${
                    darkMode ? 'text-neutral-400' : 'text-neutral-400'
                  }`}
                  fill="currentColor"
                  viewBox="0 0 20 20"
                >
                  <path
                    fillRule="evenodd"
                    d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                    clipRule="evenodd"
                  />
                </svg>
                <p className={`text-xs ${
                  darkMode ? 'text-neutral-400' : 'text-neutral-600'
                }`}>
                  Your API key is stored in your browser's session storage and is never sent to our servers.
                  It's only used for direct communication with Google's Gemini API.
                </p>
              </div>
            </div>
          </div>

          {/* Message */}
          <AnimatePresence>
            {message && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`rounded-md p-3 border ${
                  message.type === 'success'
                    ? (darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-200')
                    : message.type === 'error'
                    ? (darkMode ? 'bg-red-950/30 border-red-900/50' : 'bg-red-50 border-red-200')
                    : (darkMode ? 'bg-neutral-900 border-neutral-700' : 'bg-neutral-50 border-neutral-200')
                }`}
              >
                <div className="flex items-center">
                  {message.type === 'success' ? (
                    <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-white' : 'text-black'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : message.type === 'error' ? (
                    <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-red-400' : 'text-red-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                        clipRule="evenodd"
                      />
                    </svg>
                  ) : (
                    <svg className={`h-4 w-4 mr-2 ${darkMode ? 'text-neutral-400' : 'text-neutral-500'}`} fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
                        clipRule="evenodd"
                      />
                    </svg>
                  )}
                  <p
                    className={`text-xs ${
                      message.type === 'success'
                        ? (darkMode ? 'text-white' : 'text-neutral-900')
                        : message.type === 'error'
                        ? (darkMode ? 'text-red-300' : 'text-red-800')
                        : (darkMode ? 'text-neutral-400' : 'text-neutral-600')
                    }`}
                  >
                    {message.text}
                  </p>
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Actions */}
          <div className="flex gap-2">
            <button
              onClick={handleValidateKey}
              disabled={isValidating || !apiKey.trim()}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md border transition-colors ${
                darkMode
                  ? 'border-neutral-700 text-neutral-300 hover:bg-neutral-800 disabled:bg-neutral-900 disabled:text-neutral-600 disabled:cursor-not-allowed'
                  : 'border-neutral-300 text-neutral-700 hover:bg-neutral-50 disabled:bg-neutral-100 disabled:text-neutral-400 disabled:cursor-not-allowed'
              }`}
            >
              {isValidating ? 'Validating...' : 'Validate Key'}
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !apiKey.trim()}
              className={`flex-1 px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                darkMode
                  ? 'bg-white text-black hover:bg-neutral-200 disabled:bg-neutral-700 disabled:text-neutral-500 disabled:cursor-not-allowed'
                  : 'bg-black text-white hover:bg-neutral-800 disabled:bg-neutral-400 disabled:cursor-not-allowed'
              }`}
            >
              {isSaving ? 'Saving...' : 'Save API Key'}
            </button>
          </div>

          {hasApiKey && (
            <button
              onClick={handleClear}
              className={`w-full px-3 py-2 text-xs transition-colors ${
                darkMode ? 'text-red-400 hover:text-red-300' : 'text-red-600 hover:text-red-800'
              }`}
            >
              Clear API Key
            </button>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
