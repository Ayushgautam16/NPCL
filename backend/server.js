const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Database Connection
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/smart-photo-platform')
    .then(() => console.log('✅ MongoDB Connected'))
    .catch(err => console.error('❌ MongoDB Connection Error:', err));

// Routes Placeholder
app.get('/', (req, res) => {
    res.send('Smart Photography Platform API is Running');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const photoRoutes = require('./routes/photoRoutes');

app.use('/api/auth', authRoutes);
app.use('/api/photos', photoRoutes);

app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
});
