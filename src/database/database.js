const sqlite3 = require('sqlite3').verbose();
const path = require('path');

// Database instance
let db;

// Initialize database
const initializeDatabase = () => {
    return new Promise((resolve, reject) => {
        const dbPath = path.join(__dirname, '../../weather_bot.db');
        db = new sqlite3.Database(dbPath, (err) => {
            if (err) {
                console.error('Error opening database:', err);
                reject(err);
                return;
            }
            console.log('Connected to SQLite database');
        });

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

            // Insert default settings (fix the token format)
            db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('telegram_token', '7822009202:AAEXOvZZ1NTPwSfjhz-2p8ltXl1IcqlcfZ4')`);
            db.run(`INSERT OR REPLACE INTO settings (key, value) VALUES ('weather_api_key', '9db3c7974ec0468c904fedca1d938a7e')`);
            db.run(`INSERT OR IGNORE INTO settings (key, value) VALUES ('admin_password', 'admin123')`);

            resolve();
        });
    });
};

// Get settings from database
const getSettings = () => {
    return new Promise((resolve, reject) => {
        db.all('SELECT * FROM settings', (err, rows) => {
            if (err) {
                reject(err);
                return;
            }
            const settings = {};
            rows.forEach(row => {
                settings[row.key] = row.value;
            });
            resolve(settings);
        });
    });
};

// Get database instance
const getDatabase = () => {
    return db;
};

module.exports = {
    initializeDatabase,
    getSettings,
    getDatabase
};