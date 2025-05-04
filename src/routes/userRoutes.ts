import express, {
  RequestHandler,
  Request,
  Response,
  NextFunction,
} from "express";
import {
  register,
  login,
  logout,
  getUsers,
  getUser,
  updateUser,
  deleteUser,
  createUser,
  getMe,
} from "../controllers/userController";
import { protect, restrictTo } from "../middleware/auth";
import upload from "../middleware/upload";
import { IUser } from "../models/User";

interface AuthRequest extends Request {
  user?: IUser;
}

const router = express.Router();

// Auth routes
router.post("/register", register as RequestHandler);
router.post("/login", login as RequestHandler);
router.get("/logout", logout as RequestHandler);

// Protected routes
router.use(
  protect as (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => Promise<void>
);
router.get("/", getUsers as RequestHandler);
router.get("/me", getMe as RequestHandler);
router.get("/:id", getUser as RequestHandler);

// Admin only routes
router.use(
  restrictTo("admin") as (
    req: AuthRequest,
    res: Response,
    next: NextFunction
  ) => void
);
router.post("/", upload.single("profilePhoto"), createUser as RequestHandler);
router.patch(
  "/:id",
  upload.single("profilePhoto"),
  updateUser as RequestHandler
);
router.delete("/:id", deleteUser as RequestHandler);

export default router;
