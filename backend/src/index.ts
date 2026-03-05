import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth';
import categoriesRoutes from './routes/categories';
import subcategoriesRoutes from './routes/subcategories';
import expensesRoutes from './routes/expenses';
import budgetsRoutes from './routes/budgets';
import analyticsRoutes from './routes/analytics';
import householdsRoutes from './routes/households';
import invitationsRoutes from './routes/invitations';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/categories', categoriesRoutes);
app.use('/api/subcategories', subcategoriesRoutes);
app.use('/api/expenses', expensesRoutes);
app.use('/api/budgets', budgetsRoutes);
app.use('/api/analytics', analyticsRoutes);
app.use('/api/households', householdsRoutes);
app.use('/api/invitations', invitationsRoutes);

// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
