"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.addSSEConnection = addSSEConnection;
exports.removeSSEConnection = removeSSEConnection;
exports.notifySSEClients = notifySSEClients;
const sseConnections = new Map();
function addSSEConnection(foodId, userId, res) {
    const key = `${foodId}-${userId}`;
    if (!sseConnections.has(key)) {
        sseConnections.set(key, {});
    }
    sseConnections.set(key, res);
}
function removeSSEConnection(foodId, userId, res) {
    const key = `${foodId}-${userId}`;
    if (sseConnections.has(key)) {
        sseConnections.delete(key);
    }
}
function notifySSEClients(foodId, userId, result) {
    const key = `${foodId}-${userId}`;
    if (sseConnections.has(key)) {
        const res = sseConnections.get(key);
        res.write(`data: ${JSON.stringify(result)}\n\n`);
        sseConnections.delete(key);
    }
}
