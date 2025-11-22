import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

export const protect = async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
  }

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "دسترسی غیرمجاز - توکن یافت نشد",
    });
  }

  try {
    // Verify token
    const jwtSecret =
      process.env.JWT_SECRET || "support_system_super_secret_jwt_key_2024";
    const decoded = jwt.verify(token, jwtSecret);

    // Get user from database
    const result = await query(
      `SELECT
        u.id,
        u.name,
        u.username,
        u.email,
        u.role,
        u.avatar,
        u.phone,
        u.customer_id,
        u.is_active,
        c.contract_end_date
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.id = $1 AND u.is_active = true`,
      [decoded.id]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "کاربر یافت نشد",
      });
    }

    const authUser = result.rows[0];

    if (
      authUser.role === "user" &&
      authUser.contract_end_date &&
      new Date(authUser.contract_end_date) < new Date()
    ) {
      return res.status(403).json({
        success: false,
        message:
          "قرارداد شما منقضی شده است. برای تمدید با پشتیبانی تماس بگیرید.",
      });
    }

    req.user = authUser;
    next();
  } catch (error) {
    return res.status(401).json({
      success: false,
      message: "دسترسی غیرمجاز - توکن نامعتبر است",
    });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: `نقش ${req.user.role} مجوز دسترسی به این منبع را ندارد`,
      });
    }
    next();
  };
};
