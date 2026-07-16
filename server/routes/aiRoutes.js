import { Router } from "express";
import { auth } from "../middlewares/auth.js";
import { generateArticle, generateImage, generateBlogTitle } from "../controllers/aiController.js";

const aiRouter = Router();

aiRouter.post('/generate-article', auth, generateArticle);
aiRouter.post('/generate-blog-title', auth, generateBlogTitle);
aiRouter.post('/generate-image', auth, generateImage);

export default aiRouter;