import express from "express";
import dotenv from "dotenv";
import cors from "cors";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send(`<h1>AI SaaS Server Running</h1><p>Server is running on port ${PORT}</p>`);
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});

export default app;