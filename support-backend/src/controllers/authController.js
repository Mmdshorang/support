import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { query } from "../config/database.js";

// Generate JWT Token
const generateToken = (id) => {
  const jwtSecret =
    process.env.JWT_SECRET || "support_system_super_secret_jwt_key_2024";
  const jwtExpire = process.env.JWT_EXPIRE || "7d";
  return jwt.sign({ id }, jwtSecret, {
    expiresIn: jwtExpire,
  });
};

const isContractExpired = (contractEndDate) => {
  if (!contractEndDate) return false;
  const endDate = new Date(contractEndDate);
  const today = new Date();
  return endDate < today;
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, username, password, email } = req.body;

    // Always set role to "user" for new registrations (admin can change it later)
    const role = "user";

    // Check if user exists with this username
    const existingUser = await query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "کاربر با این نام کاربری قبلاً ثبت‌نام کرده است",
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user with default role "user"
    const result = await query(
      `INSERT INTO users (name, username, email, password, role)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, name, username, email, role, avatar, created_at`,
      [name, username, email || null, hashedPassword, role]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: "ثبت‌نام با موفقیت انجام شد",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Login user
// @route   POST /api/auth/login
// @access  Public
export const login = async (req, res, next) => {
  try {
    const { username, password } = req.body;

    // Validate username & password
    if (!username || !password) {
      return res.status(400).json({
        success: false,
        message: "لطفاً نام کاربری و رمز عبور را وارد کنید",
      });
    }

    // Check for user by username
    const result = await query(
      `SELECT u.*, c.contract_end_date
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.username = $1 AND u.is_active = true`,
      [username]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "نام کاربری یا رمز عبور اشتباه است",
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "نام کاربری یا رمز عبور اشتباه است",
      });
    }

    if (user.role === "user" && isContractExpired(user.contract_end_date)) {
      return res.status(403).json({
        success: false,
        message:
          "قرارداد شما منقضی شده است. برای تمدید با پشتیبانی تماس بگیرید.",
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: "ورود با موفقیت انجام شد",
      data: {
        token,
        user,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get current logged in user
// @route   GET /api/auth/me
// @access  Private
export const getMe = async (req, res, next) => {
  try {
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
        c.contract_start_date,
        c.contract_end_date,
        c.contract_tier,
        u.created_at
       FROM users u
       LEFT JOIN customers c ON u.customer_id = c.id
       WHERE u.id = $1`,
      [req.user.id]
    );

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user details
// @route   PUT /api/auth/updatedetails
// @access  Private
export const updateDetails = async (req, res, next) => {
  try {
    const { name, username, email, phone } = req.body;

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      fieldsToUpdate.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (username) {
      // Check if username is already taken by another user
      const existingUser = await query(
        "SELECT id FROM users WHERE username = $1 AND id != $2",
        [username, req.user.id]
      );

      if (existingUser.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "نام کاربری قبلاً استفاده شده است",
        });
      }

      fieldsToUpdate.push(`username = $${paramCount}`);
      values.push(username);
      paramCount++;
    }

    if (email) {
      fieldsToUpdate.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (phone) {
      fieldsToUpdate.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است",
      });
    }

    values.push(req.user.id);

    const result = await query(
      `UPDATE users
       SET ${fieldsToUpdate.join(", ")}
       WHERE id = $${paramCount}
       RETURNING id, name, username, email, role, avatar, phone, customer_id`,
      values
    );

    res.status(200).json({
      success: true,
      message: "اطلاعات با موفقیت به‌روزرسانی شد",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update password
// @route   PUT /api/auth/updatepassword
// @access  Private
export const updatePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Get user with password
    const result = await query("SELECT password FROM users WHERE id = $1", [
      req.user.id,
    ]);

    const user = result.rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "رمز عبور فعلی اشتباه است",
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query("UPDATE users SET password = $1 WHERE id = $2", [
      hashedPassword,
      req.user.id,
    ]);

    // Generate new token
    const token = generateToken(req.user.id);

    res.status(200).json({
      success: true,
      message: "رمز عبور با موفقیت تغییر کرد",
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};
