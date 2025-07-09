// #!/bin/bash

// # Weather Bot Start Script
// echo "🌤️  Starting Weather Bot..."

// # Check if node_modules exists
// if [ ! -d "node_modules" ]; then
//     echo "📦 Installing dependencies..."
//     npm install
// fi

// # Check if public directory exists
// if [ ! -d "public" ]; then
//     echo "📁 Creating public directory..."
//     mkdir public
// fi

// # Check if index.html exists in public
// if [ ! -f "public/index.html" ]; then
//     echo "⚠️  Warning: index.html not found in public directory"
//     echo "Please make sure to move the admin panel HTML file to public/index.html"
// fi

// # Start the bot
// echo "🚀 Starting the bot..."
// if command -v pm2 &> /dev/null; then
//     # Use PM2 if available
//     pm2 start bot.js --name "weather-bot" --watch
//     echo "✅ Bot started with PM2"
//     echo "📊 Run 'pm2 status' to check status"
//     echo "📝 Run 'pm2 logs weather-bot' to see logs"
// else
//     # Use node directly
//     node bot.js
// fi