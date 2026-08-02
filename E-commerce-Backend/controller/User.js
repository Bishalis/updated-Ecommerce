const mongoose = require("mongoose");
const { User } = require("../model/User");

const ALLOWED_UPDATE_FIELDS = ["username", "addresses", "profilePicture"];
const FORBIDDEN_UPDATE_FIELDS = [
    "role",
    "email",
    "password",
    "googleId",
    "createdAt",
    "resetPasswordToken",
    "_id",
    "id",
];

function sanitizeUser(user) {
    return {
        id: user._id,
        username: user.username,
        email: user.email,
        role: user.role,
        profilePicture: user.profilePicture,
        addresses: user.addresses,
    };
}

exports.fetchUserById = async (req,res)=>{
    const {id} = req.user;
    try{
        const user = await User.findById(id)
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        }
        res.status(200).json(sanitizeUser(user));
    }catch(err){
         res.status(400).json({ message: "Invalid request", error: err.message });
    }
};


exports.updateUser = async (req,res)=>{
        const authUserId = String(req.user.id);
        const requestUserId = req.params.id ? String(req.params.id) : authUserId;

        if (!mongoose.Types.ObjectId.isValid(requestUserId)) {
            return res.status(400).json({ message: "Invalid user id" });
        }

        if (requestUserId !== authUserId) {
            return res
                .status(403)
                .json({ message: "Forbidden: you can only update your own profile" });
        }

        const bodyKeys = Object.keys(req.body || {});
        const hasForbiddenField = bodyKeys.some((key) =>
            FORBIDDEN_UPDATE_FIELDS.includes(key)
        );

        if (hasForbiddenField) {
            return res.status(400).json({
                message: "Request contains restricted fields",
                allowedFields: ALLOWED_UPDATE_FIELDS,
            });
        }

        const updateData = {};
        for (const field of ALLOWED_UPDATE_FIELDS) {
            if (Object.prototype.hasOwnProperty.call(req.body || {}, field)) {
                updateData[field] = req.body[field];
            }
        }

        if (Object.keys(updateData).length === 0) {
            return res.status(400).json({
                message: "No valid fields to update",
                allowedFields: ALLOWED_UPDATE_FIELDS,
            });
        }

    try {
                const user = await User.findByIdAndUpdate(
                    authUserId,
                    { $set: updateData },
                    { new: true, runValidators: true }
                );

                if (!user) {
                    return res.status(404).json({ message: "User not found" });
                }

                res.status(200).json(sanitizeUser(user));
    } catch(err) {
                res.status(400).json({ message: "Update failed", error: err.message });
    }
}