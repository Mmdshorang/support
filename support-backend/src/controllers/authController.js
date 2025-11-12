import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { query } from '../config/database.js';

// Generate JWT Token
const generateToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRE || '7d',
  });
};

// @desc    Register user
// @route   POST /api/auth/register
// @access  Public
export const register = async (req, res, next) => {
  try {
    const { name, email, password, role = 'user' } = req.body;

    // Check if user exists
    const existingUser = await query(
      'SELECT id FROM users WHERE email = $1',
      [email]
    );

    if (existingUser.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: 'کاربر با این ایمیل قبلاً ثبت‌نام کرده است',
      });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create user
    const result = await query(
      `INSERT INTO users (name, email, password, role)
       VALUES ($1, $2, $3, $4)
       RETURNING id, name, email, role, avatar, created_at`,
      [name, email, hashedPassword, role]
    );

    const user = result.rows[0];

    // Generate token
    const token = generateToken(user.id);

    res.status(201).json({
      success: true,
      message: 'ثبت‌نام با موفقیت انجام شد',
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
    const { email, password } = req.body;

    // Validate email & password
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: 'لطفاً ایمیل و رمز عبور را وارد کنید',
      });
    }

    // Check for user
    const result = await query(
      'SELECT * FROM users WHERE email = $1 AND is_active = true',
      [email]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است',
      });
    }

    const user = result.rows[0];

    // Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'ایمیل یا رمز عبور اشتباه است',
      });
    }

    // Generate token
    const token = generateToken(user.id);

    // Remove password from response
    delete user.password;

    res.status(200).json({
      success: true,
      message: 'ورود با موفقیت انجام شد',
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
      'SELECT id, name, email, role, avatar, phone, created_at FROM users WHERE id = $1',
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
    const { name, email, phone } = req.body;

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name) {
      fieldsToUpdate.push(`name = $${paramCount}`);
      values.push(name);
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

    values.push(req.user.id);

    const result = await query(
      `UPDATE users
       SET ${fieldsToUpdate.join(', ')}
       WHERE id = $${paramCount}
       RETURNING id, name, email, role, avatar, phone`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'اطلاعات با موفقیت به‌روزرسانی شد',
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
    const result = await query(
      'SELECT password FROM users WHERE id = $1',
      [req.user.id]
    );

    const user = result.rows[0];

    // Check current password
    const isMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: 'رمز عبور فعلی اشتباه است',
      });
    }

    // Hash new password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);

    // Update password
    await query(
      'UPDATE users SET password = $1 WHERE id = $2',
      [hashedPassword, req.user.id]
    );

    // Generate new token
    const token = generateToken(req.user.id);

    res.status(200).json({
      success: true,
      message: 'رمز عبور با موفقیت تغییر کرد',
      data: { token },
    });
  } catch (error) {
    next(error);
  }
};
