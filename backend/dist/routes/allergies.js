"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const verifyAuth_1 = __importDefault(require("../middleware/verifyAuth"));
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const allergiesRouter = express_1.default.Router();
allergiesRouter.post('/add-or-update-allergies', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
        if (!token) {
            res.sendStatus(401);
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        const { name, email } = decoded.user;
        const user = { name, email };
        const allergies = req.body.allergies;
        yield prismaClient_1.default.user.update({
            where: {
                email: user.email
            },
            data: {
                allergies: allergies
            }
        });
        res.status(200).json({ message: "allergies updated" });
    }
    catch (error) {
        // console.error('Error: ', error)
        res.status(500).json({ message: 'Server error' });
    }
}));
exports.default = allergiesRouter;
