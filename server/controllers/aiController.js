import { clerkClient } from "@clerk/express";
import openai from "../configs/ai.js";
import sql from "../configs/db.js";

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
            model: "gemini-3.5-flash",
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