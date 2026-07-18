import { clerkClient } from "@clerk/express";
import openai from "../configs/ai.js";
import sql from "../configs/db.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import { createRequire } from "module";
const require = createRequire(import.meta.url);
const pdf = require("pdf-parse");
import { Buffer } from "buffer";

export const generateArticle = async (req, res) => {
    try {

        const { id } = req.user;
        const { prompt } = req.body;

        console.log(prompt);
        const plan = req.plan;
        const freeUsage = req.free_usage;

        if (plan !== 'premium' && freeUsage >= 10) {
            return res.status(403).json({
                success: false,
                message: "You have reached the maximum free usage limit"
            })
        }

        const response = await openai.chat.completions.create({
            model: "gemini-3.5-flash",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_completion_tokens: 5000
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, ${prompt}, ${content}, 'article')
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(id, {
                privateMetadata: {
                    free_usage: freeUsage + 1
                }
            })
        }

        return res.status(200).json({
            success: true,
            message: "Article generated successfully",
            content
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate article"
        })
    }
}

export const generateBlogTitle = async (req, res) => {
    try {

        const { id } = req.user;
        const { prompt } = req.body;

        console.log(prompt);
        const plan = req.plan;
        const freeUsage = req.free_usage;

        if (plan !== 'premium' && freeUsage >= 10) {
            return res.status(403).json({
                success: false,
                message: "You have reached the maximum free usage limit"
            })
        }

        const response = await openai.chat.completions.create({
            model: "gemini-3.5-flash",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_completion_tokens: 2000
        });

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, ${prompt}, ${content}, 'blog-title')
        `;

        if (plan !== 'premium') {
            await clerkClient.users.updateUserMetadata(id, {
                privateMetadata: {
                    free_usage: freeUsage + 1
                }
            })
        }

        return res.status(200).json({
            success: true,
            message: "Blog title generated successfully",
            content
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate article"
        })
    }
}

export const generateImage = async (req, res) => {
    try {
        const { id } = req.user;
        const { prompt } = req.body;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "You need premium plan to generate images"
            });
        }

        const encodedPrompt = encodeURIComponent(prompt);
        const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodedPrompt}?width=1024&height=1024&nologo=true`;

        const imageResponse = await axios.get(pollinationsUrl, {
            responseType: "arraybuffer"
        });

        const base64Image = Buffer.from(imageResponse.data).toString('base64');
        const dataUri = `data:image/png;base64,${base64Image}`;

        const result = await cloudinary.uploader.upload(dataUri, {
            folder: "ai-saas-images",
            resource_type: "image"
        });
        const imageUrl = result.secure_url;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, ${prompt}, ${imageUrl}, 'image')
        `;

        return res.status(200).json({
            success: true,
            message: "Image generated successfully",
            imageUrl
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate image"
        });
    }
};

export const removeImageBackground = async (req, res) => {
    try {
        const { id } = req.user;
        const { image } = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "You need premium plan to remove image background"
            });
        }

        const result = await cloudinary.uploader.upload(image.path, {
            transformation: [
                { effect: "background_removal",background_removal: 'remove_the_background' }
            ],
            folder: "ai-saas-remove-background",
            resource_type: "image"
        });
        const imageUrl = result.secure_url;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, 'Remove Image Background', ${imageUrl}, 'image')
        `;

        return res.status(200).json({
            success: true,
            message: "Image generated successfully",
            imageUrl
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate image"
        });
    }
};


export const removeImageObject = async (req, res) => {
    try {
        const { id } = req.user;
        const { object } = req.body;
        const { image } = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "You need premium plan to remove image background"
            });
        }

        const {public_id} = await cloudinary.uploader.upload(image.path);
       
        const imageUrl = cloudinary.url(public_id, {
            transformation: [{ effect: `gen_remove:${object}` }],
            resource_type: 'image'
        })

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, ${`Removed ${object} from image`}, ${imageUrl}, 'image')
        `;

        return res.status(200).json({
            success: true,
            message: "Image generated successfully",
            imageUrl
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate image"
        });
    }
};

export const resumeReview = async (req, res) => {
    try {
        const { id } = req.user;
        const resume  = req.file;
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "This feature is only available for premium users"
            });
        }

        if (resume.size > 5 * 1024 * 1024) {
            return res.status(400).json({
                success: false,
                message: "Resume size should be less than 5MB"
            });
        }

        const databuffer = fs.readFileSync(resume.path);
        const pdfData = await pdf(databuffer);

        const prompt = `Review the following resume and provide constructive feedback on its strengths, weaknesses, and areas for improvement. Resume Content:\n\n${pdfData.text}`;

        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_completion_tokens: 1000
        })

        const content = response.choices[0].message.content;

        await sql`
            INSERT INTO creations (user_id, prompt, content, type)
            VALUES (${id}, ${`Resume Review`}, ${content}, 'resume_review')
        `;

        return res.status(200).json({
            success: true,
            message: "Resume reviewed successfully",
            content
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to generate image"
        });
    }
};