const TelegramBot = require('node-telegram-bot-api');
const { getSettings, getDatabase } = require('../database/database');
const { getWeatherData, formatWeatherMessage } = require('../services/weather');

// Bot instance
let bot;

// Initialize bot function
const initializeBot = async () => {
    try {
        const settings = await getSettings();
        const token = settings.telegram_token?.trim();
        
        console.log("Initializing bot with token:", token ? token.substring(0, 10) + '...' : 'No token');
        
        if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
            console.log('Please set your Telegram bot token in the admin panel');
            return;
        }

        bot = new TelegramBot(token, { polling: true });

        // Add error handler for polling errors
        bot.on('polling_error', (error) => {
            console.error('Polling error:', error);
            console.error('Error code:', error.code);
            console.error('Error message:', error.message);
        });

        // Test the bot token
        bot.getMe().then((botInfo) => {
            console.log('Bot info:', botInfo);
            console.log('Bot initialized successfully');
        }).catch((error) => {
            console.error('Failed to get bot info:', error);
        });

        setupBotHandlers();

    } catch (error) {
        console.error('Error initializing bot:', error);
    }
};

// Setup bot message handlers
const setupBotHandlers = () => {
    const db = getDatabase();

    // Start command
    bot.onText(/\/start/, (msg) => {
        const chatId = msg.chat.id;
        const user = msg.from;

        // Add user to database
        db.run(`INSERT OR REPLACE INTO users (telegram_id, username, first_name, last_name) 
                VALUES (?, ?, ?, ?)`,
            [user.id, user.username, user.first_name, user.last_name],
            (err) => {
                if (err) {
                    console.error('Error adding user:', err);
                }
            });

        const welcomeMessage = `
🌤️ Welcome to Weather Bot! 

Available commands:
/subscribe - Subscribe to daily weather updates
/unsubscribe - Unsubscribe from weather updates
/weather - Get current weather
/setlocation - Set your location
/help - Show this help message

To get started, use /setlocation to set your city!
        `;

        bot.sendMessage(chatId, welcomeMessage);
    });

    // Subscribe command
    bot.onText(/\/subscribe/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Check if user is blocked
        db.get('SELECT blocked FROM users WHERE telegram_id = ?', [userId], (err, row) => {
            if (err) {
                console.error('Error checking user:', err);
                return;
            }

            if (row && row.blocked) {
                bot.sendMessage(chatId, '❌ You are blocked from using this bot.');
                return;
            }

            // Subscribe user
            db.run('UPDATE users SET subscribed = 1 WHERE telegram_id = ?', [userId], (err) => {
                if (err) {
                    console.error('Error subscribing user:', err);
                    bot.sendMessage(chatId, '❌ Error subscribing. Please try again.');
                } else {
                    bot.sendMessage(chatId, '✅ Successfully subscribed to daily weather updates!\n\nMake sure to set your location using /setlocation if you haven\'t already.');
                }
            });
        });
    });

    // Unsubscribe command
    bot.onText(/\/unsubscribe/, (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        db.run('UPDATE users SET subscribed = 0 WHERE telegram_id = ?', [userId], (err) => {
            if (err) {
                console.error('Error unsubscribing user:', err);
                bot.sendMessage(chatId, '❌ Error unsubscribing. Please try again.');
            } else {
                bot.sendMessage(chatId, '✅ Successfully unsubscribed from daily weather updates.');
            }
        });
    });

    // Set location command
    bot.onText(/\/setlocation (.+)/, (msg, match) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;
        const location = match[1];

        db.run('UPDATE users SET location = ? WHERE telegram_id = ?', [location, userId], (err) => {
            if (err) {
                console.error('Error setting location:', err);
                bot.sendMessage(chatId, '❌ Error setting location. Please try again.');
            } else {
                bot.sendMessage(chatId, `✅ Location set to: ${location}`);
            }
        });
    });

    // Weather command
    bot.onText(/\/weather/, async (msg) => {
        const chatId = msg.chat.id;
        const userId = msg.from.id;

        // Get user's location
        db.get('SELECT location FROM users WHERE telegram_id = ?', [userId], async (err, row) => {
            if (err) {
                console.error('Error getting user location:', err);
                return;
            }

            if (!row || !row.location) {
                bot.sendMessage(chatId, '❌ Please set your location first using /setlocation <city>');
                return;
            }

            const weatherData = await getWeatherData(row.location);
            if (weatherData) {
                bot.sendMessage(chatId, formatWeatherMessage(weatherData));
            } else {
                bot.sendMessage(chatId, '❌ Could not fetch weather data. Please try again later.');
            }
        });
    });

    // Help command
    bot.onText(/\/help/, (msg) => {
        const chatId = msg.chat.id;
        const helpMessage = `
🌤️ Weather Bot Commands:

/start - Start the bot
/subscribe - Subscribe to daily weather updates
/unsubscribe - Unsubscribe from weather updates
/weather - Get current weather
/setlocation <city> - Set your location (e.g., /setlocation London)
/help - Show this help message

Example: /setlocation New York
        `;

        bot.sendMessage(chatId, helpMessage);
    });
};

// Get bot instance
const getBot = () => {
    return bot;
};

module.exports = {
    initializeBot,
    getBot
};