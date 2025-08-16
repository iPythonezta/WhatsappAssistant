#!/bin/bash

# Setup script for WhatsApp AI Assistant npm package

echo "🚀 Setting up WhatsApp AI Assistant package..."

# Copy assets to templates
echo "📁 Copying assets to templates..."
cp -r ../assets templates/
cp -r ../stickers templates/

echo "📦 Installing dependencies..."
npm install

echo "🔗 Creating global link for testing..."
npm link

echo "✅ Package setup complete!"
echo ""
echo "To test the package locally:"
echo "  whatsapp-assistant init test-bot"
echo "  cd test-bot"
echo "  whatsapp-assistant config"
echo "  whatsapp-assistant start"
echo ""
echo "To publish to npm:"
echo "  npm login"
echo "  npm publish"
