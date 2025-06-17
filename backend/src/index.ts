import express from 'express';
import dotenv from "dotenv";
import foodItemRouter from './routes/foodItem';
import cors from 'cors'
import authRouter from './routes/auth';
import allergiesRouter from './routes/allergies';
import cookieParser from 'cookie-parser';

dotenv.config();
const app = express();

app.use(cookieParser());
app.use(cors({
  origin: process.env.CLIENT_URL!,
  credentials: true
}))
app.use(express.json());
app.use('/auth',authRouter);
app.use('/foodItem',foodItemRouter);
app.use('/allergies',allergiesRouter);

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(process.env.PORT,()=>{
  console.log(`server running on port ${process.env.PORT}`);
})