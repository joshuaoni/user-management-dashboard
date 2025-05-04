"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.restrictTo = exports.protect = void 0;
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const User_1 = __importDefault(require("../models/User"));
const protect = async (req, res, next) => {
    var _a, _b;
    try {
        let token;
        if ((_a = req.headers.authorization) === null || _a === void 0 ? void 0 : _a.startsWith("Bearer")) {
            token = req.headers.authorization.split(" ")[1];
        }
        else if ((_b = req.cookies) === null || _b === void 0 ? void 0 : _b.token) {
            token = req.cookies.token;
        }
        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Not authorized to access this route",
            });
        }
        try {
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const user = await User_1.default.findById(decoded.id);
            if (!user) {
                return res.status(401).json({
                    status: "error",
                    message: "User no longer exists",
                });
            }
            req.user = user;
            next();
        }
        catch (error) {
            console.error("Token verification error:", error);
            return res.status(401).json({
                status: "error",
                message: "Not authorized to access this route",
            });
        }
    }
    catch (error) {
        console.error("Middleware error:", error);
        next(error);
    }
};
exports.protect = protect;
const restrictTo = (...roles) => {
    return (req, res, next) => {
        if (!req.user || !roles.includes(req.user.role)) {
            return res.status(403).json({
                status: "error",
                message: "You do not have permission to perform this action",
            });
        }
        next();
    };
};
exports.restrictTo = restrictTo;
