# 🌤️ Telegram Weather Bot with Admin Panel

A feature-rich Telegram bot that provides daily weather updates with a comprehensive admin panel for managing users and bot settings.

## ✨ Features

### Bot Features
- **Weather Updates**: Get current weather information for any city
- **Daily Subscriptions**: Subscribe to daily weather updates at 8 AM
- **Location Management**: Set and update your location
- **User-Friendly Commands**: Easy-to-use commands with help system

### Admin Panel Features
- **User Management**: View, block, unblock, and delete users
- **Settings Management**: Update bot token, weather API key, and admin password
- **Real-time Statistics**: View total users, subscribed users, and blocked users
- **Responsive Design**: Works on desktop and mobile devices

## 🚀 Setup Instructions

### Prerequisites
1. Node.js (v14 or higher)
2. Telegram Bot Token (get from [@BotFather](https://t.me/BotFather))
3. OpenWeatherMap API Key (get from [OpenWeatherMap](https://openweathermap.org/api))

### Installation

1. **Clone the repository:**
```bash
git clone <your-repo-url>
cd telegram-weather-bot
```

2. **Install dependencies:**
```bash
npm install
```

3. **Create the public directory:**
```bash
mkdir public
```

4. **Move the HTML file:**
Move the `index.html` file to the `public` directory.

5. **Start the application:**
```bash
npm start
```

The application will start on port 3000 (or the port specified in the PORT environment variable).

### Configuration

1. **Access the Admin Panel:**
   Open your browser and go to `http://localhost:3000`

2. **Login:**
   - Default password: `admin123`
   - You can change this in the admin panel after logging in

3. **Configure Bot Settings:**
   - **Telegram Bot Token**: Get from [@BotFather](https://t.me/BotFather)
   - **Weather API Key**: Get from [OpenWeatherMap](https://openweathermap.org/api)
   - **Admin Password**: Change the default password

### Creating a Telegram Bot

1. **Message [@BotFather](https://t.me/BotFather)**
2. **Send `/newbot`**
3. **Choose a name and username for your bot**
4. **Copy the bot token and paste it in the admin panel**

### Getting Weather API Key

1. **Go to [OpenWeatherMap](https://openweathermap.org/api)**
2. **Sign up for a free account**
3. **Go to API Keys section**
4. **Copy your API key and paste it in the admin panel**

## 📱 Bot Commands

- `/start` - Start the bot and see welcome message
- `/subscribe` - Subscribe to daily weather updates
- `/unsubscribe` - Unsubscribe from daily weather updates
- `/weather` - Get current weather for your location
- `/setlocation <city>` - Set your location (e.g., `/setlocation London`)
- `/help` - Show help message with all commands

## 🔧 Admin Panel Features

### Dashboard
- Real-time statistics of total users, subscribed users, and blocked users
- Modern, responsive design with glassmorphism effects

### Settings Management
- **Telegram Bot Token**: Update bot token and automatically restart bot
- **Weather API Key**: Update OpenWeatherMap API key
- **Admin Password**: Change admin panel password

### User Management
- View all users with their details
- Block/unblock users from using the bot
- Delete users from the database
- Real-time user status updates

## 🚀 Deployment

### Local Development
```bash
npm run dev  # Uses nodemon for auto-restart
```

### Production Deployment

#### Option 1: Railway
1. Push code to GitHub
2. Connect Railway to your GitHub repository
3. Set environment variables if needed
4. Deploy automatically

#### Option 2: Heroku
1. Create a Heroku app
2. Add the following buildpack: `heroku/nodejs`
3. Deploy using Git or GitHub integration

#### Option 3: VPS/Cloud Server
1. Clone repository on your server
2. Install Node.js and npm
3. Run `npm install`
4. Use PM2 for process management:
```bash
npm install -g pm2
pm2 start bot.js --name "weather-bot"
pm2 startup
pm2 save
```

## 📁 Project Structure

```
telegram-weather-bot/
├── bot.js              # Main bot application
├── package.json        # Dependencies and scripts
├── weather_bot.db      # SQLite database (auto-created)
├── public/
│   └── index.html      # Admin panel interface
└── README.md          # Documentation
```

## 🔐 Security Features

- Password-protected admin panel
- User blocking functionality
- SQLite database for secure local storage
- Input validation and error handling

## 🌟 Daily Weather Updates

The bot automatically sends daily weather updates to subscribed users at 8:00 AM. The schedule can be modified in the code by changing the cron expression.

## 📊 Database Schema

### Users Table
- `telegram_id` - Unique Telegram user ID
- `username` - Telegram username
- `first_name` - User's first name
- `last_name` - User's last name
- `subscribed` - Subscription status (boolean)
- `location` - User's set location
- `blocked` - Block status (boolean)
- `created_at` - Registration timestamp

### Settings Table
- `key` - Setting key (telegram_token, weather_api_key, admin_password)
- `value` - Setting value

## 🛠️ Troubleshooting

### Common Issues

1. **Bot not responding:**
   - Check if the Telegram bot token is correctly set
   - Ensure the bot is running (`npm start`)

2. **Weather data not loading:**
   - Verify the OpenWeatherMap API key is valid
   - Check if the location is spelled correctly

3. **Admin panel not loading:**
   - Ensure the server is running on the correct port
   - Check browser console for JavaScript errors

4. **Database errors:**
   - The SQLite database is created automatically
   - If issues persist, delete `weather_bot.db` and restart

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License.

## 🔗 Links

- [Telegram Bot API](https://core.telegram.org/bots/api)
- [OpenWeatherMap API](https://openweathermap.org/api)
- [Node.js Documentation](https://nodejs.org/docs/)

## 📞 Support

If you encounter any issues or have questions, please create an issue in the GitHub repository.


<!-- 
 Complete Weather Bot Solution
Core Features:

Telegram Bot:

Weather updates for any city
Daily subscription system (8 AM updates)
User location management
Help system with all commands


Admin Panel:

Modern, responsive web interface
User management (block/unblock/delete)
Settings management (API keys, passwords)
Real-time statistics dashboard



Files Created:

bot.js - Main application with bot logic and admin API
package.json - Dependencies and scripts
index.html - Beautiful admin panel interface
README.md - Complete setup and deployment guide
setup.js - Automated setup script
start.sh - Production start script

Quick Setup:

Install dependencies:

bashnpm install

Create public directory and move HTML:

bashmkdir public
# Move the index.html file to public/index.html

Start the bot:

bashnpm start

Configure in admin panel:

Go to http://localhost:3000
Login with password: admin123
Set your Telegram bot token (get from @BotFather)
Set your Weather API key (get from OpenWeatherMap)



Bot Commands:

/start - Welcome message
/subscribe - Subscribe to daily updates
/unsubscribe - Unsubscribe from updates
/weather - Get current weather
/setlocation <city> - Set location
/help - Show help

Deployment Ready:
The bot is ready for deployment on platforms like:

Railway
Heroku
VPS servers
Cloud platforms

Security Features:

Password-protected admin panel
User blocking system
SQLite database for data storage
Input validation and error handling

Next Steps:

Get your Telegram Bot Token from @BotFather
Get your Weather API key from OpenWeatherMap
Deploy to your preferred hosting platform
Share your bot with users!

The bot includes automatic daily weather updates, a beautiful admin interface, and comprehensive user management. Once deployed, you can share your bot's handle with users, and they can start subscribing to weather updates immediately!
Would you like me to help you with any specific part of the setup or deployment process? -->