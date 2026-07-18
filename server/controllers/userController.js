import sql from "../configs/db.js";

export const getUserCreations = async (req, res) => {
    try {

        const { id } = req.user;

        if(!id){
            return res.status(401).json({
                success: false,
                message: "Unauthorized"
            });
        }

        const creations = await sql`
            SELECT *
            FROM creations
            WHERE user_id = ${id}
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            message: "Creations fetched successfully",
            creations
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch creations"
        });
    }
}

export const getPublishedCreations = async (req, res) => {
    try {

        const creations = await sql`
            SELECT *
            FROM creations
            WHERE publish = true
            ORDER BY created_at DESC
        `;

        return res.status(200).json({
            success: true,
            message: "Creations fetched successfully",
            creations
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch creations"
        });
    }
}

export const toggleLikeCreation = async (req, res) => {
    try {
        const {id:userId} = req.user;
        const {id} = req.body;

        const [creation] = await sql`SELECT * FROM creations WHERE id = ${id}`;

        if (!creation || !creation.publish) {
            return res.status(404).json({
                success: false,
                message: "Creation not found"
            });
        }

        let currentLikes = creation.likes;
        let userIDStr = userId.toString();
        let updatedLikes;
        let message;

        if (currentLikes.includes(userIDStr)) {
            updatedLikes = currentLikes.filter((id) => id !== userIDStr);
            message = "Creation unliked successfully";
        }else{
            updatedLikes = [...currentLikes, userIDStr];
            message = "Creation liked successfully";
        }

        const formattedArray = `{${updatedLikes.join(",")}`

        await sql`UPDATE creations SET likes = ${formattedArray}::text[] WHERE id=${id}`;

        return res.status(200).json({
            success: true,
            message,
            likes: updatedLikes.length
        });

    } catch (error) {
        return res.status(500).json({
            success: false,
            message: error.message || "Failed to fetch creations"
        });
    }
}