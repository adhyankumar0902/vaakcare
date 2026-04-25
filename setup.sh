#!/bin/bash
# VaakCare Quick Setup Script
echo "🩺 VaakCare Setup Starting..."

# Install server deps
echo "📦 Installing server dependencies..."
cd server && npm install
cp .env.example .env
echo "✅ Server ready. Add your OPENAI_API_KEY to server/.env"

# Install client deps
echo "📦 Installing client dependencies..."
cd ../client && npm install
echo "✅ Client ready."

echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🚀 To start VaakCare:"
echo ""
echo "  Terminal 1 (Backend):"
echo "    cd server && npm start"
echo ""
echo "  Terminal 2 (Frontend):"
echo "    cd client && npm run dev"
echo ""
echo "  Then open: http://localhost:5173"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
