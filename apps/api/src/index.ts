import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
const app = express();

app.use(cors({ origin: process.env.FRONTEND_URL || 'http://localhost:3000', credentials: true }));
app.use(express.json());

app.get('/health', (_, res) => res.json({
    status: 'ok'
}));

app.use('/auth', authRoutes);
let port = 3001;

app.listen(port, () => {
    console.log("Server is running on: " + port);
})