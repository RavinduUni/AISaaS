import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import { clerkMiddleware } from '@clerk/express'
import aiRouter from "./routes/aiRoutes.js";
import connectCloudinary from "./configs/cloudinary.js";
import userRouter from "./routes/userRoutes.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

await connectCloudinary();

app.use(cors());
app.use(express.json());
app.use(clerkMiddleware());

app.use('/api/ai', aiRouter);
app.use('/api/user', userRouter);

app.get("/", (req, res) => {
    res.send(`<h1>AI SaaS Server Running</h1><p>Server is running on port ${PORT}</p>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;