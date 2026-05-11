import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import authRoutes from './routes/auth.routes';
import merchantRoutes from './routes/merchant.routes';
import onboardingRoutes from './routes/onboarding.routes';
import menuRoutes from './routes/menu.routes';
import tableRoutes from './routes/table.routes';
import publicRoutes from './routes/public.routes';
import payRoutes from './routes/pay.routes';
const app = express();

app.use(cors({ origin: [process.env.FRONTEND_URL || 'http://localhost:3000', 'https://jaaduwalapay-web.vercel.app'], credentials: true }));
app.use(express.json());

app.get('/health', (_, res) => res.json({
    status: 'ok'
}));

app.use('/auth', authRoutes);
app.use('/merchant', merchantRoutes);
app.use('/merchant/onboarding', onboardingRoutes);
app.use('/merchant/menu', menuRoutes);
app.use('/merchant/tables', tableRoutes);
app.use('/public', publicRoutes);
app.use('/pay', payRoutes);

let port = 3001;

app.listen(port, () => {
    console.log("Server is running on: " + port);
})