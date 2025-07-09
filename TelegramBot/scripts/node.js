const TelegramBot = require('node-telegram-bot-api');
const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const axios = require('axios');
const cron = require('node-cron');
const path = require('path');

// Initialize Express app
const app = express();
app.use(express.json());
app.use(express.static('public'));

// Database setup
const db = new sqlite3.Database('./weather_bot.db');

// Create tables
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY,
        telegram_id TEXT UNIQUE,
        username TEXT,
        first_name TEXT,
        last_name TEXT,
        subscribed BOOLEAN DEFAULT 0,
        location TEXT,
        blocked BOOLEAN DEFAULT 0,
        created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )`);

    db.run(`CREATE TABLE IF NOT EXISTS settings (
        id INTEGER PRIMARY KEY,
        key TEXT UNIQUE,
        value TEXT
    )`);

    // Insert default settings
    db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('telegram_token', '7822009202:AAEXOvZZ1NTPwSfjhz-2p8ltXl1IcqlcfZ4')`);
    db.run(`INSERT OR REPLACE  INTO settings (key, value) VALUES ('weather_api_key', '9db3c7974ec0468c904fedca1d938a7e')`);
    db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123')`);
});

// Get settings from database
const getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM settings', (err, rows) => {
            if (err) reject(err);
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
            resolve(settings);
        });
    });
};

// Initialize bot (will be set after getting token from DB)
let bot;

// Initialize bot function
const initializeBot = async () => {
    try {
        const settings = await getSettings();
        const token = settings.telegram_token;
        console.log("token", token)
        if (!token || token === 'YOUR_TELEGRAM_BOT_TOKEN') {
            console.log('Please set your Telegram bot token in the admin panel');
            return;
        }

        bot = new TelegramBot(token, { polling: true });

        // Bot message handlers
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

        console.log('Bot initialized successfully');
    } catch (error) {
        console.error('Error initializing bot:', error);
    }
};

// Get weather data from API
const getWeatherData = async (location) => {
    try {
        const settings = await getSettings();
        const apiKey = settings.weather_api_key;

        if (!apiKey || apiKey === 'YOUR_WEATHER_API_KEY') {
            console.error('Weather API key not set');
            return null;
        }

        const response = await axios.get(`https://api.openweathermap.org/data/2.5/weather?q=${location}&appid=${apiKey}&units=metric`);
        return response.data;
    } catch (error) {
        console.error('Error fetching weather data:', error);
        return null;
    }
};

// Format weather message
const formatWeatherMessage = (data) => {
    const temp = Math.round(data.main.temp);
    const feelsLike = Math.round(data.main.feels_like);
    const description = data.weather[0].description;
    const humidity = data.main.humidity;
    const city = data.name;
    const country = data.sys.country;

    return `
🌤️ Weather in ${city}, ${country}

🌡️ Temperature: ${temp}°C (feels like ${feelsLike}°C)
☁️ Condition: ${description}
💧 Humidity: ${humidity}%
    `;
};

// Send daily weather updates
const sendDailyWeatherUpdates = async () => {
    try {
        if (!bot) return;

        db.all('SELECT * FROM users WHERE subscribed = 1 AND blocked = 0 AND location IS NOT NULL', async (err, users) => {
            if (err) {
                console.error('Error getting subscribed users:', err);
                return;
            }

            for (const user of users) {
                const weatherData = await getWeatherData(user.location);
                if (weatherData) {
                    const message = `🌅 Good morning!\n\n${formatWeatherMessage(weatherData)}`;
                    try {
                        await bot.sendMessage(user.telegram_id, message);
                    } catch (error) {
                        console.error(`Error sending message to ${user.telegram_id}:`, error);
                    }
                }
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        });
    } catch (error) {
        console.error('Error sending daily updates:', error);
    }
};

// Schedule daily weather updates (8 AM every day)
cron.schedule('0 8 * * *', sendDailyWeatherUpdates);

// Admin Panel Routes
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const settings = await getSettings();

    if (password === settings.admin_password) {
        res.json({ success: true });
    } else {
        res.json({ success: false, message: 'Invalid password' });
    }
});

app.get('/api/users', (req, res) => {
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

app.post('/api/users/:id/block', (req, res) => {
    const userId = req.params.id;
    db.run('UPDATE users SET blocked = 1 WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.post('/api/users/:id/unblock', (req, res) => {
    const userId = req.params.id;
    db.run('UPDATE users SET blocked = 0 WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.delete('/api/users/:id', (req, res) => {
    const userId = req.params.id;
    db.run('DELETE FROM users WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

app.get('/api/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

app.post('/api/settings', (req, res) => {
    const { key, value } = req.body;

    db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value], async (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });

            // Reinitialize bot if telegram token was updated
            if (key === 'telegram_token') {
                await initializeBot();
            }
        }
    });
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, async () => {
    console.log(`Admin panel running on port ${PORT}`);
    await initializeBot();
});