"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const dotenv_1 = __importDefault(require("dotenv"));
const auth_1 = __importDefault(require("./routes/auth"));
const categories_1 = __importDefault(require("./routes/categories"));
const subcategories_1 = __importDefault(require("./routes/subcategories"));
const expenses_1 = __importDefault(require("./routes/expenses"));
const budgets_1 = __importDefault(require("./routes/budgets"));
const analytics_1 = __importDefault(require("./routes/analytics"));
const households_1 = __importDefault(require("./routes/households"));
const invitations_1 = __importDefault(require("./routes/invitations"));
dotenv_1.default.config();
const app = (0, express_1.default)();
const PORT = process.env.PORT || 3000;
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Routes
app.use('/api/auth', auth_1.default);
app.use('/api/categories', categories_1.default);
app.use('/api/subcategories', subcategories_1.default);
app.use('/api/expenses', expenses_1.default);
app.use('/api/budgets', budgets_1.default);
app.use('/api/analytics', analytics_1.default);
app.use('/api/households', households_1.default);
app.use('/api/invitations', invitations_1.default);
// Health check
app.get('/health', (req, res) => {
    res.status(200).json({ status: 'ok' });
});
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
