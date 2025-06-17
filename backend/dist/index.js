"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv_1 = __importDefault(require("dotenv"));
const foodItem_1 = __importDefault(require("./routes/foodItem"));
const cors_1 = __importDefault(require("cors"));
const auth_1 = __importDefault(require("./routes/auth"));
const allergies_1 = __importDefault(require("./routes/allergies"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
dotenv_1.default.config();
const app = (0, express_1.default)();
app.use((0, cookie_parser_1.default)());
app.use((0, cors_1.default)({
    origin: process.env.CLIENT_URL,
    credentials: true
}));
app.use(express_1.default.json());
app.use('/auth', auth_1.default);
app.use('/foodItem', foodItem_1.default);
app.use('/allergies', allergies_1.default);
app.get('/', (req, res) => {
    res.send('Hello World');
});
app.listen(process.env.PORT, () => {
    console.log(`server running on port ${process.env.PORT}`);
});
