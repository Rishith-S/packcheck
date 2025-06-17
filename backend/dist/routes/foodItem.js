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
const redis_1 = __importDefault(require("../utils/redis"));
const queueReader_1 = __importDefault(require("../utils/queueReader"));
const sse_1 = require("../utils/sse");
const prismaClient_1 = __importDefault(require("../utils/prismaClient"));
const verifyAuth_1 = __importDefault(require("../middleware/verifyAuth"));
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const foodItem = express_1.default.Router();
foodItem.post('/packcheck/:foodId/:userId', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { foodId, userId } = req.params;
    const userAllergies = req.body.userAllergies;
    try {
        const foodDetails = { foodId, userId, userAllergies: JSON.parse(userAllergies), failureAttempts: 3, delayBeforeTrial: 2 };
        yield redis_1.default.lpush("foodIds", foodDetails);
        (0, queueReader_1.default)();
        res.status(200).json({ 'message': 'result' });
        return;
    }
    catch (error) {
        console.log(error);
        res.status(501).json({ "message": error });
        return;
    }
}));
foodItem.get('/api/job-events/:foodId/:userId', (req, res) => {
    const { foodId, userId } = req.params;
    // Set SSE headers
    res.writeHead(200, {
        'Content-Type': 'text/event-stream',
        'Connection': 'keep-alive',
        'Cache-Control': 'no-cache'
    });
    // Send initial connection message
    res.write('data: {"status": "connected"}\n\n');
    // Add this connection to our tracking
    (0, sse_1.addSSEConnection)(foodId, userId, res);
    // Handle client disconnect
    req.on('close', () => {
        (0, sse_1.removeSSEConnection)(foodId, userId, res);
        res.end();
    });
});
foodItem.get('/get-user-activity/:type/:pageNo', verifyAuth_1.default, (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _a;
    try {
        const pageNo = req.params.pageNo;
        const type = req.params.type;
        const token = (_a = req.cookies) === null || _a === void 0 ? void 0 : _a.jwt;
        if (!token) {
            res.sendStatus(401);
            return;
        }
        const decoded = jsonwebtoken_1.default.decode(token);
        const { name, email } = decoded.user;
        const user = { name, email };
        if (type === 'homepage') {
            const userFoodScans = yield prismaClient_1.default.foodItemsStatus.findMany({
                skip: 0,
                take: 5,
                where: {
                    userEmail: user.email
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            });
            res.status(200).json({ userFoodScans });
            return;
        }
        const userFoodScansTransaction = yield prismaClient_1.default.$transaction([
            prismaClient_1.default.foodItemsStatus.count({
                where: {
                    userEmail: user.email
                }
            }),
            prismaClient_1.default.foodItemsStatus.findMany({
                skip: pageNo * 5,
                take: 5,
                where: {
                    userEmail: user.email
                },
                orderBy: {
                    updatedAt: 'desc'
                }
            })
        ]);
        res.status(200).json({ count: userFoodScansTransaction[0], userFoodScans: userFoodScansTransaction[1] });
        return;
    }
    catch (error) {
        // console.log(error);
        res.status(501).json({ "message": error });
        return;
    }
}));
exports.default = foodItem;
