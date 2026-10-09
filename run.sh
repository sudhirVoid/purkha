#!/bin/bash

# Navigate to the project directory
cd "$(dirname "$0")"

echo "Starting Purkha Family Tree Developer Server..."

# Install dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
  echo "Installing dependencies..."
  npm install
fi

# Start the development server
echo "Starting dev server..."
npm run dev
