import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

// Routes
import authRoutes from './routes/authRoutes.js';
import timelineRoutes from './routes/timelineRoutes.js';
import projectRoutes from './routes/projectRoutes.js';

// Middleware
import { errorHandler } from './middleware/errorMiddleware.js';

dotenv.config();

// Create __dirname equivalent in ES module
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, '../uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

const app = express();
const PORT = process.env.PORT || 5000;

// CORS configuration - Apply before any routes
const allowedOrigins = [
    'https://portfolio-nakhle.vercel.app',
    'http://localhost:3000',
    'http://localhost:5173', // Vite's default development port
    'http://localhost:8080'
];

app.use(cors({
    origin: function (origin, callback) {
        // Allow requests with no origin (like mobile apps, curl requests)
        if (!origin) return callback(null, true);

        // Allow exact matches
        if (allowedOrigins.indexOf(origin) !== -1) {
            return callback(null, true);
        }

        // Allow all Vercel preview deployments
        if (origin.endsWith('.vercel.app')) {
            return callback(null, true);
        }

        console.log('CORS blocked origin:', origin);
        if (process.env.NODE_ENV !== 'production') {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Origin", "X-Requested-With", "Content-Type", "Accept", "Authorization"]
}));

// Other middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set CORS headers again for all responses
app.use((req, res, next) => {
    const origin = req.headers.origin;
    if (allowedOrigins.includes(origin)) {
        res.header('Access-Control-Allow-Origin', origin);
    }
    res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
    res.header('Access-Control-Allow-Credentials', 'true');
    next();
});

// Serve uploaded files
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/timeline', timelineRoutes);
app.use('/api/projects', projectRoutes);

// Add a health check endpoint
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok', message: 'API server is running' });
});

// Add explicit OPTIONS handling for CORS preflight
app.options('*', cors());

// Error Handler
app.use(errorHandler);

// Connect to MongoDB
const mongoUri = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://localhost:27017/portfolio';
mongoose
    .connect(mongoUri)
    .then(() => {
        // Extract just the host from the connection string for security in logs
        const connectionDetails = mongoUri.includes('@')
            ? `...${mongoUri.substring(mongoUri.indexOf('@'))}`
            : mongoUri.includes('localhost') ? mongoUri : '(hidden)';
        console.log(`MongoDB Connected to ${connectionDetails}`);
        app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
    })
    .catch((err) => {
        console.error(`Error connecting to MongoDB: ${err.message}`);
        process.exit(1);
    }); 