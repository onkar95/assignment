const cron = require('node-cron');
const { getBot } = require('../bot/bot');
const { getDatabase } = require('../database/database');
const { getWeatherData, formatWeatherMessage } = require('./weather');

// Send daily weather updates
const sendDailyWeatherUpdates = async () => {
    try {
        const bot = getBot();
        const db = getDatabase();
        
        if (!bot) {
            console.log('Bot not initialized, skipping daily updates');
            return;
        }

        db.all('SELECT * FROM users WHERE subscribed = 1 AND blocked = 0 AND location IS NOT NULL', async (err, users) => {
            if (err) {
                console.error('Error getting subscribed users:', err);
                return;
            }

            console.log(`Sending daily weather updates to ${users.length} users`);

            for (const user of users) {
                try {
                    const weatherData = await getWeatherData(user.location);
                    if (weatherData) {
                        const message = `🌅 Good morning!\n\n${formatWeatherMessage(weatherData)}`;
                        await bot.sendMessage(user.telegram_id, message);
                        console.log(`Sent weather update to user ${user.telegram_id}`);
                    } else {
                        console.log(`Failed to get weather data for user ${user.telegram_id} in ${user.location}`);
                    }
                } catch (error) {
                    console.error(`Error sending message to ${user.telegram_id}:`, error);
                }
                
                // Add delay to avoid rate limiting
                await new Promise(resolve => setTimeout(resolve, 1000));
            }
        });
    } catch (error) {
        console.error('Error sending daily updates:', error);
    }
};

// Setup cron jobs
const setupCronJobs = () => {
    // Schedule daily weather updates (8 AM every day)
    cron.schedule('0 8 * * *', () => {
        console.log('Running daily weather update job');
        sendDailyWeatherUpdates();
    });

    console.log('Cron jobs scheduled:');
    console.log('- Daily weather updates: 8:00 AM every day');
};

module.exports = {
    setupCronJobs,
    sendDailyWeatherUpdates
};