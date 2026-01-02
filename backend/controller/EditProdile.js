let User = require("../model/Auth");


exports.updateName = async (req, res) => {
    try {
        const userId = req.user.id;
        const { name } = req.body;

        if (!name) {
            return res.status(400).json({ message: "Name is required" });
        }

        const user = await User.findByIdAndUpdate(
            userId,
            { name },
            { new: true }
        ).select("-password");

        res.status(200).json({
            success: true,
            message: "Name updated successfully",
            user
        });

    } catch (error) {
        res.status(500).json({ message: "Server error", error });
    }
}