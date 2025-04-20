import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Routes
import authRoutes from './routes/authRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/projects', projectRoutes);

// Serve static assets in production
if (process.env.NODE_ENV === 'production') {
    // Set static folder
    const __filename = fileURLToPath(import.meta.url);
    const __dirname = path.dirname(__filename);
    app.use(express.static(path.join(__dirname, '../../dist')));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, '../../dist', 'index.html'));
    });
}

// Error Handler
app.use(errorHandler);

// Connect to MongoDB
mongoose
    .connect(process.env.MONGO_URI)
    .then(() => {
        console.log('MongoDB Connected');
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }); 