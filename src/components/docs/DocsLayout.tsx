'use client';

import Link from 'next/link';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { ReactNode, useEffect, useState } from 'react';

interface DocSection {
  title: string;
  items: {
    title: string;
    href: string;
  }[];
}

const navigation: DocSection[] = [
  {
    title: 'Getting Started',
    items: [
      { title: 'Introduction', href: '/docs' },
      { title: 'Quick Start', href: '/docs/quickstart' },
      { title: 'Installation', href: '/docs/installation' },
    ],
  },
  {
    title: 'Core Features',
    items: [
      { title: 'Web Interface', href: '/docs/web-interface' },
      { title: 'CLI Usage', href: '/docs/cli' },
      { title: 'API Reference', href: '/docs/api' },
    ],
  },
  {
    title: 'Deployment',
    items: [
      { title: 'Docker', href: '/docs/docker' },
    ],
  },
  {
    title: 'AI Integration',
    items: [
      { title: 'MCP Server', href: '/docs/mcp' },
      { title: 'MCP Integration', href: '/docs/ai-tools' },
      { title: 'Custom Integrations', href: '/docs/integrations' },
    ],
  },
  {
    title: 'Advanced',
    items: [
      { title: 'Security', href: '/docs/security' },
      { title: 'Performance', href: '/docs/performance' },
      { title: 'Logging & Monitoring', href: '/docs/logging' },
      { title: 'Troubleshooting', href: '/docs/troubleshooting' },
    ],
  },
];

export default function DocsLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [darkMode, setDarkMode] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    setMounted(true);
    const isDark = typeof window !== 'undefined' ? localStorage.getItem('darkMode') === 'true' : false;
    setDarkMode(isDark);
  }, []);

  // Close mobile menu when navigating
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [pathname]);

  const toggleDarkMode = () => {
    const newMode = !darkMode;
    setDarkMode(newMode);
    if (typeof window !== 'undefined') {
      localStorage.setItem('darkMode', String(newMode));
    }
  };

  // Prevent hydration mismatch
  if (!mounted) {
    return null;
  }

  return (
    <div className={`min-h-screen transition-colors duration-200 ${darkMode ? 'bg-black' : 'bg-white'}`}>
      {/* Header */}
      <header className={`sticky top-0 z-50 border-b backdrop-blur-sm ${darkMode ? 'border-neutral-800 bg-black/80' : 'border-neutral-200 bg-white/80'}`}>
        <div className="max-w-7xl mx-auto px-6 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Link href="/" className="flex items-center">
                <img
                  src="/PDFlow_Logo.png"
                  alt="PDFlow Logo"
                  className={`h-7 w-auto transition-all ${darkMode ? '' : 'invert'}`}
                />
              </Link>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                className={`lg:hidden p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                aria-label="Toggle menu"
              >
                <svg className={`w-5 h-5 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {mobileMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>

            {/* Right Side Actions: Grouped navigation */}
            <div className="flex items-center space-x-2">
              {/* Docs & GitHub Group */}
              <div className="flex items-center space-x-1">
                <a
                  href="/"
                  className={`px-3 py-1.5 text-xs font-medium rounded-md transition-colors ${darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800' : 'text-neutral-600 hover:text-black hover:bg-neutral-100'}`}
                  title="Back to App"
                >
                  App
                </a>
                <a
                  href="https://github.com/traves-theberge/pdflow"
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                  title="View on GitHub"
                >
                  <svg className={`w-4 h-4 ${darkMode ? 'text-neutral-400' : 'text-neutral-600'}`} fill="currentColor" viewBox="0 0 24 24">
                    <path fillRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" clipRule="evenodd" />
                  </svg>
                </a>
              </div>

              {/* Divider */}
              <div className={`h-6 w-px ${darkMode ? 'bg-neutral-800' : 'bg-neutral-200'}`}></div>

              {/* Dark Mode Toggle */}
              <button
                onClick={toggleDarkMode}
                className={`p-2 rounded-md transition-colors ${darkMode ? 'hover:bg-neutral-800' : 'hover:bg-neutral-100'}`}
                title={darkMode ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
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
            </div>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      {mobileMenuOpen && (
        <div
          className="lg:hidden fixed inset-0 z-40 bg-black/50"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}

      {/* Mobile Menu Sidebar */}
      <aside className={`lg:hidden fixed inset-y-0 left-0 z-50 w-72 transform transition-transform duration-300 ease-in-out ${
        mobileMenuOpen ? 'translate-x-0' : '-translate-x-full'
      } ${darkMode ? 'bg-black border-r border-neutral-800' : 'bg-white border-r border-neutral-200'}`}>
        <nav className="h-full overflow-y-auto p-6 pt-24 space-y-8">
          {navigation.map((section) => (
            <div key={section.title}>
              <h5 className={`font-semibold text-[10px] mb-3 uppercase tracking-[0.1em] ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                {section.title}
              </h5>
              <ul className="space-y-1.5">
                {section.items.map((item) => (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      className={`block text-sm px-3 py-2 rounded-md transition-all ${
                        pathname === item.href
                          ? (darkMode ? 'bg-neutral-800 text-white font-medium' : 'bg-neutral-900 text-white font-medium')
                          : (darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50')
                      }`}
                    >
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </nav>
      </aside>

      <div className="max-w-7xl mx-auto px-6 py-12">
        <div className="flex gap-12">
          {/* Desktop Sidebar */}
          <aside className="hidden lg:block w-64 flex-shrink-0">
            <nav className="sticky top-28 space-y-8 max-h-[calc(100vh-8rem)] overflow-y-auto pr-4">
              {navigation.map((section) => (
                <div key={section.title}>
                  <h5 className={`font-semibold text-[10px] mb-3 uppercase tracking-[0.1em] ${darkMode ? 'text-white' : 'text-neutral-900'}`}>
                    {section.title}
                  </h5>
                  <ul className="space-y-1.5">
                    {section.items.map((item) => (
                      <li key={item.href}>
                        <Link
                          href={item.href}
                          className={`block text-sm px-3 py-2 rounded-md transition-all ${
                            pathname === item.href
                              ? (darkMode ? 'bg-neutral-800 text-white font-medium' : 'bg-neutral-900 text-white font-medium')
                              : (darkMode ? 'text-neutral-400 hover:text-white hover:bg-neutral-800/50' : 'text-neutral-600 hover:text-neutral-900 hover:bg-neutral-50')
                          }`}
                        >
                          {item.title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </aside>

          {/* Main Content */}
          <main className="flex-1 min-w-0 max-w-4xl">
            <article className={darkMode ? 'docs-content-dark' : 'docs-content-light'}>
              {children}
            </article>
          </main>
        </div>
      </div>
    </div>
  );
}
