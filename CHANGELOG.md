# Changelog

All notable changes to this project will be documented in this file.

## [5.2.0] - 2025-11-21

### Added
- **Markdown Rendering:** Integrated `react-markdown` to properly render Markdown content in the preview pane (bold, headers, lists, etc.).
- **CSV Support:** Added `csv` to the list of supported output formats in the API validation.
- **Visual Progress Tracker:** Implemented a 4-step visual stepper (Upload -> Convert -> Extract -> Done) in the progress bar for better status visibility.
- **Light Mode Improvements:** Darkened text colors in the preview pane for better contrast and readability in light mode.

### Changed
- **UI Polish:** Simplified the `ProgressBar` component, removing redundant text and "page dots" for a cleaner look.
- **Preview Pane:** Refactored `EnhancedOutputViewer` with a cleaner header and improved button styling.
- **Error Handling:** Improved error propagation for "silent failures" during processing.
- **Polling Logic:** Updated `ProgressBar` to stop polling immediately if a "Session not found" (404) error occurs, preventing console spam.

### Fixed
- **API Key Handling:** Fixed issue where API key was not correctly passed from frontend to backend.
- **Console Errors:** Resolved "Invalid request" (due to missing CSV support) and "Session not found" errors.
- **Hydration Mismatch:** Fixed hydration warnings in `layout.tsx`.
- **Nested Buttons:** Fixed invalid HTML nesting in `EnhancedOutputViewer`.

## [5.1.0] - Previous Version
- Initial release of enhanced UI features.
