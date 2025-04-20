import express from 'express';
import verifyAuth from '../middleware/verifyAuth';
import prisma from '../utils/prismaClient';
import jwt from 'jsonwebtoken';

const allergiesRouter = express.Router()

allergiesRouter.post('/add-or-update-allergies',verifyAuth,async (req,res)=>{
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      res.sendStatus(401);
      return
    }
    const decoded = jwt.decode(token) as jwt.JwtPayload;
    const { name, email } = decoded.user;
    const user = { name, email }
    const allergies = req.body.allergies;
    await prisma.user.update({
      where: {
        email: user.email
      },
      data: {
        allergies : allergies
      }
    })
    res.status(200).json({message:"allergies updated"});
  } catch (error) {
    // console.error('Error: ', error)
    res.status(500).json({ message: 'Server error' })
  }
})

export default allergiesRouter;