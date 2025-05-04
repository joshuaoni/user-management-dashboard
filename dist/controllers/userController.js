"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getMe = exports.createUser = exports.deleteUser = exports.updateUser = exports.getUser = exports.getUsers = exports.logout = exports.login = exports.register = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const zod_1 = require("zod");
const User_1 = __importDefault(require("../models/User"));
const createToken = (id) => {
    if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is not defined");
    }
    const options = {
        expiresIn: "7d",
    };
    return jsonwebtoken_1.default.sign({ id }, process.env.JWT_SECRET, options);
};
const registerSchema = zod_1.z.object({
    name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string().min(8, "Password must be at least 8 characters"),
    role: zod_1.z.enum(["admin", "user"]).optional(),
    status: zod_1.z.enum(["active", "inactive"]).optional(),
    profilePhoto: zod_1.z.string().optional(),
});
const loginSchema = zod_1.z.object({
    email: zod_1.z.string().email("Invalid email format"),
    password: zod_1.z.string(),
});
const register = async (req, res) => {
    try {
        const validatedData = registerSchema.parse(req.body);
        const userExists = await User_1.default.findOne({ email: validatedData.email });
        if (userExists) {
            return res.status(400).json({
                status: "error",
                message: "User already exists",
            });
        }
        const user = await User_1.default.create(validatedData);
        const token = createToken(user._id.toString());
        res.status(201).json({
            status: "success",
            token,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    profilePhoto: user.profilePhoto,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.errors[0].message,
            });
        }
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.register = register;
const login = async (req, res) => {
    try {
        const validatedData = loginSchema.parse(req.body);
        const user = await User_1.default.findOne({ email: validatedData.email }).select("+password");
        if (!user || !(await user.comparePassword(validatedData.password))) {
            return res.status(401).json({
                status: "error",
                message: "Invalid email or password",
            });
        }
        const token = createToken(user._id.toString());
        res.cookie("token", token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === "production",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });
        res.status(200).json({
            status: "success",
            token,
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    profilePhoto: user.profilePhoto,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.errors[0].message,
            });
        }
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.login = login;
const logout = (req, res) => {
    res.cookie("token", "none", {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true,
    });
    res.status(200).json({
        status: "success",
        message: "Logged out successfully",
    });
};
exports.logout = logout;
const getUsers = async (req, res) => {
    var _a, _b;
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;
        const search = ((_a = req.query.search) === null || _a === void 0 ? void 0 : _a.trim()) || "";
        const role = ((_b = req.query.role) === null || _b === void 0 ? void 0 : _b.trim()) || "";
        const query = {};
        if (search) {
            const escapedSearch = search.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
            const searchRegex = new RegExp(escapedSearch, "i");
            query.$or = [
                { name: { $regex: searchRegex } },
                { email: { $regex: searchRegex } },
            ];
        }
        if (role) {
            query.role = role;
        }
        const users = await User_1.default.find(query)
            .skip(skip)
            .limit(limit)
            .select("-password");
        const total = await User_1.default.countDocuments(query);
        res.status(200).json({
            status: "success",
            results: users.length,
            total,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            data: { users },
        });
    }
    catch (error) {
        console.error("Error in getUsers:", error);
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.getUsers = getUsers;
const getUser = async (req, res) => {
    try {
        const user = await User_1.default.findById(req.params.id).select("-password");
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.getUser = getUser;
const updateUser = async (req, res) => {
    try {
        const updateSchema = zod_1.z.object({
            name: zod_1.z.string().min(2).optional(),
            email: zod_1.z.string().email().optional(),
            role: zod_1.z.enum(["admin", "user"]).optional(),
            status: zod_1.z.enum(["active", "inactive"]).optional(),
            profilePhoto: zod_1.z.string().optional(),
        });
        let validatedData = updateSchema.parse(req.body);
        if (req.file) {
            const base64Image = req.file.buffer.toString("base64");
            const mimeType = req.file.mimetype;
            validatedData.profilePhoto = `data:${mimeType};base64,${base64Image}`;
        }
        const user = await User_1.default.findByIdAndUpdate(req.params.id, validatedData, {
            new: true,
            runValidators: true,
        }).select("-password");
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.errors[0].message,
            });
        }
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.updateUser = updateUser;
const deleteUser = async (req, res) => {
    try {
        const user = await User_1.default.findByIdAndDelete(req.params.id);
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        res.status(204).json({
            status: "success",
            data: null,
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.deleteUser = deleteUser;
const createUser = async (req, res) => {
    try {
        const createSchema = zod_1.z.object({
            name: zod_1.z.string().min(2, "Name must be at least 2 characters"),
            email: zod_1.z.string().email("Invalid email format"),
            role: zod_1.z.enum(["admin", "user"]).optional(),
            status: zod_1.z.enum(["active", "inactive"]).optional(),
            profilePhoto: zod_1.z.string().optional(),
        });
        let validatedData = createSchema.parse(req.body);
        if (req.file) {
            const base64Image = req.file.buffer.toString("base64");
            const mimeType = req.file.mimetype;
            validatedData.profilePhoto = `data:${mimeType};base64,${base64Image}`;
        }
        const userExists = await User_1.default.findOne({ email: validatedData.email });
        if (userExists) {
            return res.status(400).json({
                status: "error",
                message: "User already exists",
            });
        }
        const password = Math.random().toString(36).slice(-8);
        const user = await User_1.default.create({
            ...validatedData,
            password,
        });
        res.status(201).json({
            status: "success",
            data: {
                user: {
                    _id: user._id,
                    name: user.name,
                    email: user.email,
                    role: user.role,
                    status: user.status,
                    profilePhoto: user.profilePhoto,
                },
            },
        });
    }
    catch (error) {
        if (error instanceof zod_1.z.ZodError) {
            return res.status(400).json({
                status: "error",
                message: error.errors[0].message,
            });
        }
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.createUser = createUser;
const getMe = async (req, res) => {
    var _a;
    try {
        const userId = (_a = req.user) === null || _a === void 0 ? void 0 : _a._id;
        const user = await User_1.default.findById(userId).select("-password");
        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found",
            });
        }
        res.status(200).json({
            status: "success",
            data: { user },
        });
    }
    catch (error) {
        res.status(500).json({
            status: "error",
            message: "Server error",
        });
    }
};
exports.getMe = getMe;
