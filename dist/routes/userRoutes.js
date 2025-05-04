"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const userController_1 = require("../controllers/userController");
const auth_1 = require("../middleware/auth");
const upload_1 = __importDefault(require("../middleware/upload"));
const router = express_1.default.Router();
// Auth routes
router.post("/register", userController_1.register);
router.post("/login", userController_1.login);
router.get("/logout", userController_1.logout);
// Protected routes
router.use(auth_1.protect);
router.get("/", userController_1.getUsers);
router.get("/me", userController_1.getMe);
router.get("/:id", userController_1.getUser);
// Admin only routes
router.use((0, auth_1.restrictTo)("admin"));
router.post("/", upload_1.default.single("profilePhoto"), userController_1.createUser);
router.patch("/:id", upload_1.default.single("profilePhoto"), userController_1.updateUser);
router.delete("/:id", userController_1.deleteUser);
exports.default = router;
