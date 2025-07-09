const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout
});

function askQuestion(question) {
    return new Promise((resolve) => {
        rl.question(question, (answer) => {
            resolve(answer);
        });
    });
}

async function setup() {
    console.log('🌤️  Weather Bot Setup');
    console.log('===================\n');

    // Create public directory if it doesn't exist
    const publicDir = path.join(__dirname, 'public');
    if (!fs.existsSync(publicDir)) {
        fs.mkdirSync(publicDir);
        console.log('✅ Created public directory');
    }

    // Create a simple index.html file if it doesn't exist
    const indexPath = path.join(publicDir, 'index.html');
    if (!fs.existsSync(indexPath)) {
        console.log('⚠️  Admin panel HTML file not found in public directory');
        console.log('Please make sure to move the index.html file to the public directory');
    }

    console.log('\n📋 Bot Configuration');
    console.log('You can set these values now or later through the admin panel:\n');

    const telegramToken = await askQuestion('Enter your Telegram Bot Token (or press Enter to skip): ');
    const weatherApiKey = await askQuestion('Enter your Weather API Key (or press Enter to skip): ');
    const adminPassword = await askQuestion('Enter admin password (or press Enter for default "admin123"): ');

    // Create environment variables file
    const envContent = `# Environment Variables (Optional)
PORT=3000
TELEGRAM_TOKEN=${telegramToken}
WEATHER_API_KEY=${weatherApiKey}
ADMIN_PASSWORD=${adminPassword || 'admin123'}
`;

    fs.writeFileSync('.env', envContent);
    console.log('✅ Created .env file');

    // Create .gitignore
    const gitignoreContent = `node_modules/
weather_bot.db
.env
npm-debug.log*
yarn-debug.log*
yarn-error.log*
.DS_Store
`;

    fs.writeFileSync('.gitignore', gitignoreContent);
    console.log('✅ Created .gitignore file');

    console.log('\n🚀 Setup Complete!');
    console.log('\nNext steps:');
    console.log('1. Run: npm install');
    console.log('2. Run: npm start');
    console.log('3. Open: http://localhost:3000');
    console.log('4. Configure your bot settings in the admin panel');
    console.log('\n📝 Remember to:');
    console.log('- Get your Telegram Bot Token from @BotFather');
    console.log('- Get your Weather API Key from OpenWeatherMap');
    console.log('- Move the HTML file to the public directory');

    rl.close();
}

setup().catch(console.error);