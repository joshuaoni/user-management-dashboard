import { Request, Response } from "express";
import jwt, { SignOptions } from "jsonwebtoken";
import { z } from "zod";
import User, { IUser } from "../models/User";
import { AuthRequest } from "../middleware/auth";

const createToken = (id: string): string => {
  if (!process.env.JWT_SECRET) {
    throw new Error("JWT_SECRET is not defined");
  }
  const options: SignOptions = {
    expiresIn: "7d",
  };
  return jwt.sign({ id }, process.env.JWT_SECRET, options);
};

const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email format"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  role: z.enum(["admin", "user"]).optional(),
  status: z.enum(["active", "inactive"]).optional(),
  profilePhoto: z.string().optional(),
});

const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
  password: z.string(),
});

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = registerSchema.parse(req.body);

    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    const user = await User.create(validatedData);
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const validatedData = loginSchema.parse(req.body);

    const user = await User.findOne({ email: validatedData.email }).select(
      "+password"
    );
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const logout = (req: Request, res: Response) => {
  res.cookie("token", "none", {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: "success",
    message: "Logged out successfully",
  });
};

export const getUsers = async (req: AuthRequest, res: Response) => {
  try {
    const page = parseInt(req.query.page as string) || 1;
    const limit = parseInt(req.query.limit as string) || 10;
    const skip = (page - 1) * limit;
    const search = (req.query.search as string)?.trim() || "";
    const role = (req.query.role as string)?.trim() || "";

    const query: any = {};

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

    const users = await User.find(query)
      .skip(skip)
      .limit(limit)
      .select("-password");

    const total = await User.countDocuments(query);

    res.status(200).json({
      status: "success",
      results: users.length,
      total,
      totalPages: Math.ceil(total / limit),
      currentPage: page,
      data: { users },
    });
  } catch (error) {
    console.error("Error in getUsers:", error);
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const getUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findById(req.params.id).select("-password");

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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const updateUser = async (req: AuthRequest, res: Response) => {
  try {
    const updateSchema = z.object({
      name: z.string().min(2).optional(),
      email: z.string().email().optional(),
      role: z.enum(["admin", "user"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      profilePhoto: z.string().optional(),
    });

    let validatedData = updateSchema.parse(req.body);

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      validatedData.profilePhoto = `data:${mimeType};base64,${base64Image}`;
    }

    const user = await User.findByIdAndUpdate(req.params.id, validatedData, {
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const deleteUser = async (req: AuthRequest, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);

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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};

export const createUser = async (req: AuthRequest, res: Response) => {
  try {
    const createSchema = z.object({
      name: z.string().min(2, "Name must be at least 2 characters"),
      email: z.string().email("Invalid email format"),
      role: z.enum(["admin", "user"]).optional(),
      status: z.enum(["active", "inactive"]).optional(),
      profilePhoto: z.string().optional(),
    });

    let validatedData = createSchema.parse(req.body);

    if (req.file) {
      const base64Image = req.file.buffer.toString("base64");
      const mimeType = req.file.mimetype;
      validatedData.profilePhoto = `data:${mimeType};base64,${base64Image}`;
    }

    const userExists = await User.findOne({ email: validatedData.email });
    if (userExists) {
      return res.status(400).json({
        status: "error",
        message: "User already exists",
      });
    }

    const password = Math.random().toString(36).slice(-8);
    const user = await User.create({
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
  } catch (error) {
    if (error instanceof z.ZodError) {
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

export const getMe = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?._id;
    const user = await User.findById(userId).select("-password");

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
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Server error",
    });
  }
};
