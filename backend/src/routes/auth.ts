import { Request, Response, Router } from 'express';
import jwt from 'jsonwebtoken';
import queryString from 'query-string';
import prisma from '../utils/prismaClient';
import verifyAuth from '../middleware/verifyAuth';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';

dotenv.config()

const authRouter = Router()
authRouter.get('/url/:type', (req, res) => {
  const type = req.params.type
  res.json({
    url: `${process.env.AuthUrl}?${queryString.stringify({
      client_id: process.env.GOOGLE_CLIENT_ID,
      redirect_uri: type === "login" ? process.env.REDIRECT_URL_LOGIN : process.env.REDIRECT_URL_SIGNUP,
      response_type: 'code',
      scope: 'openid profile email',
      access_type: 'offline',
      state: 'standard_oauth',
      prompt: 'consent',
    })}`,
  })
})

authRouter.get('/refresh', verifyAuth, async (req, res) => {
  try {
    const token = req.cookies?.jwt;
    if (!token) {
      res.sendStatus(401);
      return
    }
    const { email, name } = jwt.decode(token) as jwt.JwtPayload;
    const user = { name, email }
    // Sign a new token
    const userInDB = await prisma.user.findUnique({
      where: {
        email: user.email
      }
    })
    if (!userInDB) {
      res.status(401).send({ message: `No user found with email ${email}` });
      return;
    }
    const accessToken = jwt.sign(
      {
        user
      },
      process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
    )
    res.send({ name: user.name, email: user.email, accessToken });
  } catch (error) {
    res.status(400).send({ message: "no user found" });
    console.log(error);
  }
})

authRouter.get('/token', async (req: Request, res: Response) => {
  const { code, type } = req.query
  if (!code) res.status(400).json({ message: 'Authorization code must be provided' })
  else {
    try {
      const data = {
        client_id: process.env.GOOGLE_CLIENT_ID,
        client_secret: process.env.GOOGLE_CLIENT_SECRET,
        code,
        grant_type: 'authorization_code',
        redirect_uri: type === "login" ? process.env.REDIRECT_URL_LOGIN : process.env.REDIRECT_URL_SIGNUP,
      }
      const response = await fetch('https://oauth2.googleapis.com/token', {
        method: "POST",
        body: JSON.stringify(data),
        headers: {
          "Content-Type": "application/json", // Ensure JSON format is recognized
        },
      });
      const access_token_data = await response.json();
      const id_token = access_token_data.id_token
      if (!id_token) {
        res.status(400).json({ message: 'Auth error' });
        return
      }
      const { email, name, picture } = jwt.decode(id_token) as jwt.JwtPayload;
      const user = { name, email, picture }
      let message = '';
      let statusCode = 200;
      if (type === 'login') {
        const userRecord = await prisma.user.findUnique({
          where: {
            email: user.email
          }
        })
        if (!userRecord) {
          res.status(404).json({
            "message": "account not found please signup"
          })
          return
        }
        else {
          statusCode = 200;
          message = "account login successful";
        }
      } else {
        try {
          await prisma.user.create({
            data: {
              name: user.name,
              email: user.email,
              accountType: 'oauth',
              allergies: []
            }
          })
          statusCode = 200;
          message = "account created successfully";
        } catch (error) {
          res.status(422).json({
            "message": "problem in account creation"
          })
          return
        }
      }
      // Sign a new token
      const accessToken = jwt.sign(
        {
          user
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
      )
      const refreshToken = jwt.sign(
        {
          user
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '3d' })
      )

      const userDetails = await prisma.user.findFirst({
        where: {
          email: user.email
        }
      })

      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'none',
        secure: true,
        // secure: false,
        maxAge: 3 * 24 * 60 * 60 * 1000
      });
      res.status(statusCode).send({ name: user.name, email: user.email, accessToken, message, picture, allergies: userDetails?.allergies });
    } catch (err) {
      console.error('Error: ', err)
      res.status(500).json({ message: 'Server error' })
    }
  }
})

authRouter.post('/login/email-and-password', async (req, res) => {
  try {
    const { email, password } = req.body;
    const userExistsorNot = await prisma.user.findFirst({
      where: {
        email: email,
      }
    })
    if (userExistsorNot) {
      bcrypt.compare(password, userExistsorNot.password!, (err, result) => {
        if (err) {
          console.error('Error comparing passwords:', err);
          return;
        }
        if (result) {
          const accessToken = jwt.sign(
            {
              user: {
                name: userExistsorNot.name,
                email: userExistsorNot.email,
              }
            },
            process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
          )
          const refreshToken = jwt.sign(
            {
              user:{
                name: userExistsorNot.name,
                email: userExistsorNot.email,
              }
            },
            process.env.TOKEN_SECRET!, ({ expiresIn: '3d' })
          )
          res.cookie('jwt', refreshToken, {
            httpOnly: true,
            sameSite: 'lax',
            secure: false,
            maxAge: 3 * 24 * 60 * 60 * 1000
          });
          res.status(200).send({
            status: 'success',
            name: userExistsorNot.name,
            email: userExistsorNot.email,
            accessToken,
            message: "Login Successful",
            allergies: userExistsorNot.allergies
          });
          return;
        } else {
          res.status(200).json({ status : 'error', message: `Email or Password doesn't match.` })
          return;
        }
      });
    } else {
      res.status(200).json({ status : 'error', message: `Email or Password doesn't match.` })
      return;
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({status: 'error', message: 'Server error' })
  }
})

authRouter.post('/signup/email-and-password', async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const userExistsorNot = await prisma.user.findFirst({
      where: {
        email: email,
      }
    })
    if (userExistsorNot) {
      console.log(userExistsorNot)
      res.status(200).json({ status : 'error' ,message: 'Email already exists'})
      return;
    } else {
      await prisma.user.create({
        data: {
          name: name,
          email: email,
          password: await bcrypt.hash(password, 2),
          accountType: 'email-and-password'
        }
      })
      const accessToken = jwt.sign(
        {
          user: {
            name: name,
            email: email,
          }
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '1d' })
      )
      const refreshToken = jwt.sign(
        {
          user: {
            name: name,
            email: email,
          }
        },
        process.env.TOKEN_SECRET!, ({ expiresIn: '3d' })
      )
      res.cookie('jwt', refreshToken, {
        httpOnly: true,
        sameSite: 'lax',
        secure: false,
        maxAge: 3 * 24 * 60 * 60 * 1000
      });
      res.status(200).send({
        status: 'success',
        name: name,
        email: email,
        accessToken,
        message: "Signup Successful",
        allergies: []
      });
      return;
    }
  } catch (error) {
    console.log(error)
    res.status(500).json({status: 'error', message: 'Server error' })
  }
})

authRouter.post('/logout', (_, res) => {
  // clear cookie
  res.clearCookie('jwt').json({ message: 'Logged out' })
})

export default authRouter;