import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import connectDB from './config/db';

dotenv.config();

const app = express();

import jobRoutes from './routes/jobRoutes';
import applicantRoutes from './routes/applicantRoutes';
import authRoutes from './routes/authRoutes';

// Middleware
app.use(cors({
    origin: ["http://localhost:3000", "https://umurava-ai-omega.vercel.app"]
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/jobs', jobRoutes);
app.use('/api/applicants', applicantRoutes);

app.get('/', (req, res) => {
    res.send('Umurava AI Hackathon API is running...');
});

// Port configuration
const PORT = process.env.PORT || 5000;

// Start Server
const startServer = async () => {
    try {
        await connectDB();
        app.listen(PORT, () => {
            console.log(`Server running on port ${PORT}`);
        });
    } catch (error) {
        console.error('Failed to start server:', error);
        process.exit(1);
    }
};

startServer();
