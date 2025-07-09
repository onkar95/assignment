const express = require('express');
const path = require('path');
const { initializeBot } = require('./src/bot/bot');
const { initializeDatabase } = require('./src/database/database');
const { setupCronJobs } = require('./src/services/scheduler');
const adminRoutes = require('./src/routes/admin');
const apiRoutes = require('./src/routes/api');

// Initialize Express app
const app = express();

// Middleware
app.use(express.json());
app.use(express.static('public'));

// Routes
app.use('/admin', adminRoutes);
app.use('/api', apiRoutes);

// Root route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Start server
const PORT = process.env.PORT || 3000;

const startServer = async () => {
    try {
        // Initialize database
        await initializeDatabase();
        console.log('Database initialized successfully');

        // Initialize bot
        await initializeBot();
        console.log('Bot initialization attempted');

        // Setup cron jobs
        setupCronJobs();
        console.log('Cron jobs initialized');

        // Start server
        app.listen(PORT, () => {
            console.log(`Admin panel running on port ${PORT}`);
            console.log(`Visit http://localhost:${PORT} to access the admin panel`);
        });
    } catch (error) {
        console.error('Error starting server:', error);
        process.exit(1);
    }
};

startServer();