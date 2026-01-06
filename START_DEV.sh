#!/bin/bash

# Core DNA v2 Development Server Startup

echo "🚀 Starting Core DNA v2 Development Server..."
echo ""

cd "$(dirname "$0")"

# Kill any existing processes
if [ -f ~/coredna-dev.pid ]; then
    kill $(cat ~/coredna-dev.pid) 2>/dev/null
    rm ~/coredna-dev.pid
fi

# Start dev server
npm run dev > ~/coredna-dev.log 2>&1 &
echo $! > ~/coredna-dev.pid

# Wait for server to start
sleep 5

# Display info
echo ""
echo "✅ Core DNA v2 is running!"
echo ""
echo "📍 Frontend:  http://localhost:3000"
echo "   or:       http://127.0.0.1:3000"
echo ""
echo "🎯 Quick Actions:"
echo "   - Extract DNA:    Click 🧬 in sidebar"
echo "   - Battle Mode:    Click ⚔️ in sidebar"
echo "   - Lead Hunter:    Click 🧬 → Lead Hunter tab"
echo "   - Settings:       Click ⚙️ in sidebar"
echo ""
echo "📊 Logs:"
echo "   tail -f ~/coredna-dev.log"
echo ""
echo "🛑 Stop Server:"
echo "   kill \$(cat ~/coredna-dev.pid)"
echo ""
echo "ℹ️  See LOCALHOST_SETUP.md for full documentation"
echo ""
