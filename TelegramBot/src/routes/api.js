const express = require('express');
const { getSettings, getDatabase } = require('../database/database');
const { initializeBot } = require('../bot/bot');
const router = express.Router();

// Login endpoint
router.post('/login', async (req, res) => {
    try {
        const { password } = req.body;
        const settings = await getSettings();

        if (password === settings.admin_password) {
            res.json({ success: true });
        } else {
            res.json({ success: false, message: 'Invalid password' });
        }
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Get all users
router.get('/users', (req, res) => {
    const db = getDatabase();
    db.all('SELECT * FROM users ORDER BY created_at DESC', (err, rows) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json(rows);
        }
    });
});

// Block user
router.post('/users/:id/block', (req, res) => {
    const db = getDatabase();
    const userId = req.params.id;
    
    db.run('UPDATE users SET blocked = 1 WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Unblock user
router.post('/users/:id/unblock', (req, res) => {
    const db = getDatabase();
    const userId = req.params.id;
    
    db.run('UPDATE users SET blocked = 0 WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Delete user
router.delete('/users/:id', (req, res) => {
    const db = getDatabase();
    const userId = req.params.id;
    
    db.run('DELETE FROM users WHERE telegram_id = ?', [userId], (err) => {
        if (err) {
            res.status(500).json({ error: err.message });
        } else {
            res.json({ success: true });
        }
    });
});

// Get settings
router.get('/settings', async (req, res) => {
    try {
        const settings = await getSettings();
        res.json(settings);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

// Update settings
router.post('/settings', async (req, res) => {
    try {
        const db = getDatabase();
        const { key, value } = req.body;

        db.run('INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)', [key, value], async (err) => {
            if (err) {
                res.status(500).json({ error: err.message });
            } else {
                res.json({ success: true });

                // Reinitialize bot if telegram token was updated
                if (key === 'telegram_token') {
                    console.log('Telegram token updated, reinitializing bot...');
                    await initializeBot();
                }
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

module.exports = router;