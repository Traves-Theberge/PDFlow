#!/bin/bash

# PDF to WebP conversion script
# Usage: ./scripts/convert-to-webp.sh <input.pdf> <session_id>

set -e  # Exit on any error

INPUT_PDF=$1
SESSION_ID=$2

# Validate inputs
if [ -z "$INPUT_PDF" ] || [ -z "$SESSION_ID" ]; then
    echo "Error: Missing arguments"
    echo "Usage: $0 <input.pdf> <session_id>"
    exit 1
fi

# Check if input file exists
if [ ! -f "$INPUT_PDF" ]; then
    echo "Error: Input file '$INPUT_PDF' not found"
    exit 1
fi

# Create output directory
OUTPUT_DIR="./uploads/$SESSION_ID/pages"
mkdir -p "$OUTPUT_DIR"

echo "Converting PDF to WebP images for session $SESSION_ID..."
echo "Input: $INPUT_PDF"
echo "Output directory: $OUTPUT_DIR"

# Check if pdftocairo is available
if ! command -v pdftocairo &> /dev/null; then
    echo "Error: pdftocairo is not installed. Please install poppler-utils."
    echo "On Ubuntu/Debian: sudo apt-get install poppler-utils"
    echo "On macOS: brew install poppler"
    exit 1
fi

# Convert PDF pages to PNG first, then to WebP
# pdftocairo doesn't support WebP directly
WEBP_SUCCESS=false

echo "Converting PDF to PNG..."
pdftocairo -png -r 150 "$INPUT_PDF" "$OUTPUT_DIR/page"

if [ $? -ne 0 ]; then
    echo "✗ Error: PDF to PNG conversion failed"
    exit 1
fi

echo "✓ PDF to PNG conversion successful"

# Convert PNG files to WebP using ImageMagick
echo "Converting PNG files to WebP..."
PNG_COUNT=0
WEBP_COUNT=0

for png_file in "$OUTPUT_DIR"/page-*.png; do
    if [ -f "$png_file" ]; then
        PNG_COUNT=$((PNG_COUNT + 1))
        # Get the base filename without extension
        base_name=$(basename "$png_file" .png)

        # Convert PNG to WebP with quality 90
        if magick "$png_file" -quality 90 "$OUTPUT_DIR/${base_name}.webp" 2>/dev/null; then
            WEBP_COUNT=$((WEBP_COUNT + 1))
            # Remove the PNG file after successful conversion
            rm "$png_file"
        else
            echo "⚠ Warning: Failed to convert $png_file to WebP"
        fi
    fi
done

# Check if PNG to WebP conversion was successful
if [ $WEBP_COUNT -gt 0 ] && [ $WEBP_COUNT -eq $PNG_COUNT ]; then
    WEBP_SUCCESS=true
    echo "✓ Successfully converted $WEBP_COUNT PNG files to WebP"
elif [ $WEBP_COUNT -gt 0 ]; then
    WEBP_SUCCESS=true
    echo "⚠ Partially successful: Converted $WEBP_COUNT out of $PNG_COUNT files"
else
    echo "✗ Error: PNG to WebP conversion failed completely"
    exit 1
fi

# Only proceed if we have successful WebP conversion
if [ "$WEBP_SUCCESS" = true ]; then
    # Count the number of generated files
    PAGE_COUNT=$(ls -1 "$OUTPUT_DIR"/page-*.webp 2>/dev/null | wc -l)
    
    if [ $PAGE_COUNT -gt 0 ]; then
        echo "✓ Successfully converted PDF to $PAGE_COUNT WebP images"
        echo "✓ Files saved in: $OUTPUT_DIR"
        echo "✓ Session ID: $SESSION_ID"
        
        # List generated files
        echo "Generated files:"
        ls -la "$OUTPUT_DIR"/page-*.webp 2>/dev/null || echo "No WebP files found"
    else
        echo "✗ Error: No WebP files were generated"
        exit 1
    fi
else
    echo "✗ Error: WebP conversion failed"
    exit 1
fi