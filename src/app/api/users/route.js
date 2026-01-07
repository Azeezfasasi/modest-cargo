import { authenticate, isAdmin } from "@/app/server/middleware/auth.js";
import { getAllUsers, createUserByAdmin } from "@/app/server/controllers/authController.js";
import { connectDB } from "@/utils/db.js";
import User from "@/app/server/models/User.js";
import { NextResponse } from "next/server";

// GET /api/users
export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const rolesParam = searchParams.get('roles');
  
  // If specific roles are requested (for assignment), allow public access
  if (rolesParam) {
    try {
      await connectDB();
      const roles = rolesParam.split(',').map(r => r.trim());
      const users = await User.find({ role: { $in: roles } }).select('_id firstName lastName email role').lean();
      
      // Format users to include full name
      const formattedUsers = users.map(user => ({
        _id: user._id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        role: user.role
      }));
      
      return NextResponse.json({
        success: true,
        users: formattedUsers,
      }, { status: 200 });
    } catch (error) {
      console.error('Error fetching users:', error);
      return NextResponse.json({
        success: false,
        message: error.message,
      }, { status: 500 });
    }
  }
  
  // Otherwise, require admin authentication to list all users
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return getAllUsers(req);
    });
  });
}

// POST /api/users
export async function POST(req) {
  // Create user with role assignment (admin only)
  return authenticate(req, async () => {
    return isAdmin(req, async () => {
      return createUserByAdmin(req);
    });
  });
}

