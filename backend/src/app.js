const express = require('express');
const cors = require('cors');

const authRoutes = require('./routes/authRoutes');
const reasoningRoutes = require('./routes/reasoningRoutes');
const codingRoutes = require('./routes/codingRoutes');
const analyticsRoutes = require('./routes/analyticsRoutes');
const chatRoutes = require('./routes/chatRoutes');
const userRoutes = require('./routes/userRoutes');
const gamingRoutes = require('./routes/gamingRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();

app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

app.use('/api/auth', authRoutes);
app.use('/api/reasoning', reasoningRoutes);
app.use('/api/coding', codingRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/chat', chatRoutes);
app.use('/api/users', userRoutes);
app.use('/api/gaming', gamingRoutes);
app.use('/api/admin', adminRoutes);

app.get('/', (req, res) => {
  res.send('AI Test Platform API');
});

module.exports = app;
