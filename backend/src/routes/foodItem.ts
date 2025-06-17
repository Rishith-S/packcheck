import express from 'express';
import redis from '../utils/redis';
import processQueue from '../utils/queueReader';
import { QueueObject } from '../utils/types';
import { addSSEConnection, removeSSEConnection } from '../utils/sse'
import prisma from '../utils/prismaClient';
import verifyAuth from '../middleware/verifyAuth';
import jwt from 'jsonwebtoken';

const foodItem = express.Router()


foodItem.post('/packcheck/:foodId/:userEmail', async (req, res) => {
  const { foodId, userEmail } = req.params
  const userAllergies = req.body.userAllergies;
  try {
    const foodDetails: QueueObject = { foodId, userEmail, userAllergies: JSON.parse(userAllergies), failureAttempts: 3, delayBeforeTrial: 2 }
    await redis.lpush("foodIds", foodDetails);
    processQueue()
    res.status(200).json({ 'message': 'result' });
    return;
  } catch (error) {
    console.log(error);
    res.status(501).json({ "message": error });
    return;
  }
})

foodItem.get('/api/job-events/:foodId/:userEmail', (req, res) => {
  const { foodId, userEmail } = req.params;
  // Set SSE headers
  res.writeHead(200, {
    'Content-Type': 'text/event-stream',
    'Connection': 'keep-alive',
    'Cache-Control': 'no-cache'
  });

  // Send initial connection message
  res.write('data: {"status": "connected"}\n\n');

  // Add this connection to our tracking
  addSSEConnection(foodId, userEmail, res);

  // Handle client disconnect
  req.on('close', () => {
    removeSSEConnection(foodId, userEmail, res);
    res.end();
  });
});

foodItem.get('/get-user-activity/:type/:pageNo', verifyAuth, async (req, res) => {
  try {
    const pageNo: number = req.params.pageNo as unknown as number;
    const type = req.params.type
    const token = req.cookies?.jwt;
    if (!token) {
      res.sendStatus(401);
      return
    }
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const { name, email } = decoded.user;
    const user = { name, email }
    if (type === 'homepage') {
      const userFoodScans = await prisma.foodItemsStatus.findMany({
        skip: 0,
        take: 5,
        where: {
          userEmail: user.email
        },
        orderBy: {
          updatedAt:'desc'
        }
      })
      res.status(200).json({ userFoodScans });
      return;
    }
    const userFoodScansTransaction = await prisma.$transaction([
      prisma.foodItemsStatus.count({
        where: {
          userEmail: user.email
        }
      }),
      prisma.foodItemsStatus.findMany({
        skip: pageNo*5,
        take: 5,
        where: {
          userEmail: user.email
        },
        orderBy: {
          updatedAt: 'desc'
        }
      })
    ])
    res.status(200).json({ count: userFoodScansTransaction[0], userFoodScans: userFoodScansTransaction[1] });
    return;
  } catch (error) {
    // console.log(error);
    res.status(501).json({ "message": error });
    return;
  }
})

export default foodItem;