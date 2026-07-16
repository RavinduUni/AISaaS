import { clerkClient } from "@clerk/express";
import openai from "../configs/ai.js";
import sql from "../configs/db.js";
import axios from "axios";
import { v2 as cloudinary } from "cloudinary";

export const generateArticle = async (req, res) => {
    try {

        const { id, emailAddresses } = req.user;
        const { prompt, length } = req.body;

        console.log(prompt, length);
        const plan = req.plan;
        const freeUsage = req.free_usage;

        if (plan !== 'premium' && freeUsage >= 10) {
            return res.status(403).json({
                success: false,
                message: "You have reached the maximum free usage limit"
            })
        }

        const response = await openai.chat.completions.create({
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_completion_tokens: length
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
            model: "gemini-2.5-flash",
            messages: [
                { role: "user", content: prompt }
            ],
            temperature: 0.7,
            max_completion_tokens: 100
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
        const { prompt, publish } = req.body;

        console.log(prompt);
        const plan = req.plan;

        if (plan !== 'premium') {
            return res.status(403).json({
                success: false,
                message: "You need premium plan to generate images"
            })
        }

        const response = await openai.images.generate({
            model: "gemini-2.5-flash-image",
            prompt: prompt,
            n: 1,
            size: "1024x1024",
            response_format: "b64_json",
        });

        const b64Image = response.data[0].b64_json;
        const dataUri = `data:image/png;base64,${b64Image}`;

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
            message: error.message || "Failed to generate article"
        })
    }
}