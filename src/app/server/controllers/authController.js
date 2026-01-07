import { NextResponse } from "next/server";
import jwt from "jsonwebtoken";
import crypto from "crypto";
import User from "../models/User.js";
import { connectDB } from "../db/connect.js";
import nodemailer from "nodemailer";

// JWT Secret
const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRE = process.env.JWT_EXPIRE || "7d";

// Email configuration
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: process.env.SMTP_SECURE === "true",
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

// Generate JWT Token
const generateToken = (userId) => {
  return jwt.sign({ id: userId }, JWT_SECRET, { expiresIn: JWT_EXPIRE });
};

// 1. REGISTER - Create new user account
export const register = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword } = body;

    // Validation
    if (!firstName || !lastName || !email || !password) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      isEmailVerified: false,
    });

    await user.save();

    // Generate email verification token
    const verificationToken = user.getEmailVerificationToken();
    await user.save({ validateBeforeSave: false });

    // Send verification email
    const verificationLink = `${process.env.FRONTEND_URL}/verify-email?token=${verificationToken}`;

    try {
      await transporter.sendMail({
        to: email,
        subject: "Email Verification - Modest Cargo",
        html: `<h2>Welcome to Modest Cargo</h2>
               <p>Please click the link below to verify your email:</p>
               <a href="${verificationLink}">Verify Email</a>
               <p>This link expires in 24 hours.</p>`,
      });
    } catch (mailError) {
      console.log("Email sending failed, but user created:", mailError.message);
    }

    // Generate token
    const token = generateToken(user._id);

    return NextResponse.json(
      {
        success: true,
        message: "Registration successful. Please check your email to verify.",
        token,
        user: user.getPublicProfile(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Register error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Registration failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 2. LOGIN - Authenticate user
export const login = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { email, password } = body;

    // Validation
    if (!email || !password) {
      return NextResponse.json(
        { success: false, message: "Email and password are required" },
        { status: 400 }
      );
    }

    // Find user and include password
    const user = await User.findByEmail(email).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Check if account is locked
    if (user.isAccountLocked()) {
      return NextResponse.json(
        {
          success: false,
          message: "Account locked. Try again later.",
        },
        { status: 423 }
      );
    }

    // Check if account is active
    if (!user.isActive || user.accountStatus !== "active") {
      return NextResponse.json(
        {
          success: false,
          message: "Account is disabled or suspended",
        },
        { status: 403 }
      );
    }

    // Check password
    const isPasswordMatch = await user.matchPassword(password);

    if (!isPasswordMatch) {
      await user.incLoginAttempts();
      return NextResponse.json(
        { success: false, message: "Invalid credentials" },
        { status: 401 }
      );
    }

    // Reset login attempts on successful login
    if (user.loginAttempts > 0) {
      await user.resetLoginAttempts();
    }

    // Update last login
    user.lastLogin = Date.now();
    await user.save();

    // Generate token
    const token = generateToken(user._id);

    return NextResponse.json(
      {
        success: true,
        message: "Login successful",
        token,
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Login failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// ADMIN: CREATE USER WITH ROLE ASSIGNMENT
export const createUserByAdmin = async (req) => {
  try {
    await connectDB();

    // Only allow admins/super-admins
    if (!req.user || !["admin", "super-admin"].includes(req.user.role)) {
      return NextResponse.json(
        { success: false, message: "Forbidden: Admins only" },
        { status: 403 }
      );
    }

    const body = await req.json();
    const { firstName, lastName, email, password, confirmPassword, role } = body;

    // Validation
    if (!firstName || !lastName || !email || !password || !role) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }
    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }
    if (!["client", "admin", "staff-member", "super-admin"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role" },
        { status: 400 }
      );
    }

    // Check if user exists
    const existingUser = await User.findByEmail(email);
    if (existingUser) {
      return NextResponse.json(
        { success: false, message: "Email already registered" },
        { status: 409 }
      );
    }

    // Create user with role
    const user = new User({
      firstName,
      lastName,
      email,
      password,
      role,
      isEmailVerified: true, // Admin-created users are auto-verified
      createdBy: req.user.id,
    });
    await user.save();

    // Generate token for user (optional, not returned to admin)
    // const token = generateToken(user._id);

    return NextResponse.json(
      {
        success: true,
        message: "User created successfully",
        user: user.getPublicProfile(),
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("Admin create user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to create user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 3. VERIFY EMAIL - Confirm email address
export const verifyEmail = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { token } = body;

    if (!token) {
      return NextResponse.json(
        { success: false, message: "Verification token is required" },
        { status: 400 }
      );
    }

    // Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with token
    const user = await User.findOne({
      emailVerificationToken: hashedToken,
      emailVerificationExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired verification token" },
        { status: 400 }
      );
    }

    // Mark email as verified
    user.isEmailVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Email verified successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Email verification error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Email verification failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 4. FORGOT PASSWORD - Send password reset email
export const forgotPassword = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json(
        { success: false, message: "Email is required" },
        { status: 400 }
      );
    }

    const user = await User.findByEmail(email);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Generate reset token
    const resetToken = user.getPasswordResetToken();
    await user.save({ validateBeforeSave: false });

    // Send reset email
    const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${resetToken}`;

    try {
      await transporter.sendMail({
        to: email,
        subject: "Password Reset - Modest Cargo",
        html: `<h2>Password Reset Request</h2>
               <p>Click the link below to reset your password:</p>
               <a href="${resetLink}">Reset Password</a>
               <p>This link expires in 30 minutes.</p>`,
      });
    } catch (mailError) {
      console.log("Email sending failed:", mailError.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "Password reset email sent. Check your inbox.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Forgot password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to send reset email",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 5. RESET PASSWORD - Update password with reset token
export const resetPassword = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { token, password, confirmPassword } = body;

    if (!token || !password || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (password !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "Passwords do not match" },
        { status: 400 }
      );
    }

    // Hash the token
    const hashedToken = crypto
      .createHash("sha256")
      .update(token)
      .digest("hex");

    // Find user with token
    const user = await User.findOne({
      passwordResetToken: hashedToken,
      passwordResetExpires: { $gt: Date.now() },
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "Invalid or expired reset token" },
        { status: 400 }
      );
    }

    // Update password
    user.password = password;
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    // Generate new token
    const newToken = generateToken(user._id);

    return NextResponse.json(
      {
        success: true,
        message: "Password reset successful",
        token: newToken,
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Password reset failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 6. UPDATE PASSWORD - Change password (authenticated user)
export const updatePassword = async (req) => {
  try {
    await connectDB();

    const body = await req.json();
    const { currentPassword, newPassword, confirmPassword } = body;
    const userId = req.user?.id;

    if (!currentPassword || !newPassword || !confirmPassword) {
      return NextResponse.json(
        { success: false, message: "All fields are required" },
        { status: 400 }
      );
    }

    if (newPassword !== confirmPassword) {
      return NextResponse.json(
        { success: false, message: "New passwords do not match" },
        { status: 400 }
      );
    }

    // Find user with password
    const user = await User.findById(userId).select("+password");

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Verify current password
    const isPasswordMatch = await user.matchPassword(currentPassword);

    if (!isPasswordMatch) {
      return NextResponse.json(
        {
          success: false,
          message: "Current password is incorrect",
        },
        { status: 401 }
      );
    }

    // Update password
    user.password = newPassword;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Password updated successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update password",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 7. GET USER PROFILE - Fetch authenticated user data
export const getUserProfile = async (req) => {
  try {
    await connectDB();

    const userId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 8. UPDATE USER PROFILE - Update own user details
export const updateUserProfile = async (req) => {
  try {
    await connectDB();

    const userId = req.user?.id;
    const body = await req.json();
    const { firstName, lastName, phone, company, department, position, avatar } =
      body;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Update fields
    if (firstName) user.firstName = firstName;
    if (lastName) user.lastName = lastName;
    if (phone) user.phone = phone;
    if (company) user.company = company;
    if (department) user.department = department;
    if (position) user.position = position;
    if (avatar) user.avatar = avatar;

    user.updatedAt = Date.now();
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "Profile updated successfully",
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update profile error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update profile",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 9. ADMIN: GET ALL USERS - List all users
export const getAllUsers = async (req) => {
  try {
    await connectDB();

    const { searchParams } = new URL(req.url);
    const role = searchParams.get("role");
    const isActive = searchParams.get("isActive");
    const page = parseInt(searchParams.get("page")) || 1;
    const limit = parseInt(searchParams.get("limit")) || 10;

    let filter = { accountStatus: { $ne: "deleted" } }; // Exclude deleted users
    if (role) filter.role = role;
    if (isActive !== null) filter.isActive = isActive === "true";

    const skip = (page - 1) * limit;

    const users = await User.find(filter)
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await User.countDocuments(filter);

    return NextResponse.json(
      {
        success: true,
        total,
        page,
        pages: Math.ceil(total / limit),
        users: users.map((u) => u.getPublicProfile()),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get all users error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch users",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 10. ADMIN: GET USER BY ID - Get specific user details
export const getUserById = async (req, userId) => {
  try {
    await connectDB();

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: true,
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Get user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to fetch user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 11. ADMIN: UPDATE USER BY ID - Admin edit user details
export const updateUserById = async (req, userId) => {
  try {
    await connectDB();

    const adminId = req.user?.id;
    const body = await req.json();
    const updates = { ...body };

    // Prevent updating sensitive fields through this endpoint
    delete updates.password;
    delete updates.email;

    let user = await User.findByIdAndUpdate(userId, updates, {
      new: true,
      runValidators: true,
    });

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.updatedBy = adminId;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "User updated successfully",
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Update user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to update user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 12. ADMIN: CHANGE USER ROLE - Update user role and permissions
export const changeUserRole = async (req, userId) => {
  try {
    await connectDB();

    const adminId = req.user?.id;
    const body = await req.json();
    const { role, permissions } = body;

    if (!role || !["client", "admin", "staff-member"].includes(role)) {
      return NextResponse.json(
        { success: false, message: "Invalid role. Must be one of: client, admin, staff-member" },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.role = role;
    if (permissions && Array.isArray(permissions)) {
      user.permissions = permissions;
    }
    user.updatedBy = adminId;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "User role updated successfully",
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Change role error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to change role",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 13. ADMIN: DISABLE/ENABLE USER - Toggle user active status
export const toggleUserStatus = async (req, userId) => {
  try {
    await connectDB();

    const adminId = req.user?.id;
    let isActive;

    // Try to parse body for explicit isActive, otherwise toggle
    try {
      const body = await req.json();
      isActive = body.isActive;
    } catch {
      isActive = undefined;
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // If isActive is provided and is boolean, use it; otherwise toggle
    if (typeof isActive === "boolean") {
      user.isActive = isActive;
    } else {
      user.isActive = !user.isActive;
    }

    user.accountStatus = user.isActive ? "active" : "suspended";
    user.updatedBy = adminId;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: `User ${user.isActive ? "enabled" : "disabled"} successfully`,
        user: user.getPublicProfile(),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Toggle status error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to toggle user status",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 14. ADMIN: RESET USER PASSWORD - Admin reset password for user
export const adminResetPassword = async (req, userId) => {
  try {
    await connectDB();

    const adminId = req.user?.id;
    const body = await req.json();
    const { newPassword } = body;

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        {
          success: false,
          message: "Password must be at least 6 characters",
        },
        { status: 400 }
      );
    }

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    user.password = newPassword;
    user.updatedBy = adminId;
    user.notes = user.notes ? user.notes + "\n" : "";
    user.notes += `Password reset by admin on ${new Date().toISOString()}`;
    await user.save();

    // Send notification email
    try {
      await transporter.sendMail({
        to: user.email,
        subject: "Your Password Has Been Reset",
        html: `<h2>Password Reset by Administrator</h2>
               <p>Your password has been reset to: <strong>${newPassword}</strong></p>
               <p>Please change this password immediately after logging in.</p>`,
      });
    } catch (mailError) {
      console.log("Email notification failed:", mailError.message);
    }

    return NextResponse.json(
      {
        success: true,
        message: "User password reset successfully",
        temporaryPassword: newPassword,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Admin reset password error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to reset password",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 15. DELETE USER - Admin delete user account
export const deleteUser = async (req, userId) => {
  try {
    await connectDB();

    const adminId = req.user?.id;

    const user = await User.findById(userId);

    if (!user) {
      return NextResponse.json(
        { success: false, message: "User not found" },
        { status: 404 }
      );
    }

    // Soft delete - mark as deleted
    user.accountStatus = "deleted";
    user.isActive = false;
    user.updatedBy = adminId;
    await user.save();

    return NextResponse.json(
      {
        success: true,
        message: "User deleted successfully",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Delete user error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Failed to delete user",
        error: error.message,
      },
      { status: 500 }
    );
  }
};

// 16. LOGOUT - Clear session/logout
export const logout = async (req) => {
  try {
    return NextResponse.json(
      {
        success: true,
        message: "Logout successful",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Logout error:", error);
    return NextResponse.json(
      {
        success: false,
        message: "Logout failed",
        error: error.message,
      },
      { status: 500 }
    );
  }
};
