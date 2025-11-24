#!/bin/bash

# Upload all audio files from data/upload to R2 bucket
# Usage: ./upload-to-r2.sh

BUCKET_NAME="dictionary-r2"
SOURCE_DIR="data/upload"

echo "Starting upload of audio files to R2 bucket: $BUCKET_NAME"
echo "Source directory: $SOURCE_DIR"
echo ""

# Counter for progress
total_files=$(find "$SOURCE_DIR" -type f | wc -l)
current=0

# Upload each file
for file in "$SOURCE_DIR"/*; do
  if [ -f "$file" ]; then
    filename=$(basename "$file")
    current=$((current + 1))
    
    echo "[$current/$total_files] Uploading: $filename"
    
    # Upload to R2 with the audio/ prefix (using --remote for production bucket)
    wrangler r2 object put "$BUCKET_NAME/audio/$filename" --file="$file" --remote
    
    if [ $? -eq 0 ]; then
      echo "  ✓ Success"
    else
      echo "  ✗ Failed"
    fi
  fi
done

echo ""
echo "Upload complete! Uploaded $total_files files."
echo ""
echo "To list uploaded files, run:"
echo "  wrangler r2 object list $BUCKET_NAME --prefix audio/"
