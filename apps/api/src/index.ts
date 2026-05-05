import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import authRoutes from './routes/auth.routes';
const app = express();

app.use(cors());
app.use(express.json());

app.get('/health', (_, res) => res.json({
    status: 'ok'
}));

app.use('/auth', authRoutes);
let port = 3001;

app.listen(port, () => {
    console.log("Server is running on: " + port);
})