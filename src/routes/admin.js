const express = require('express');
const path = require('path');
const router = express.Router();

// Admin panel main page
router.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, '../../public', 'admin.html'));
});

module.exports = router;