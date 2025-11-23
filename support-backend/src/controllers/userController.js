import { query } from "../config/database.js";

// @desc    Get all users (admin only)
// @route   GET /api/users
// @access  Private (Admin)
export const getUsers = async (req, res, next) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const pageNumber = Number(page) > 0 ? Number(page) : 1;
    const limitNumber = Number(limit) > 0 ? Number(limit) : 10;
    const offset = (pageNumber - 1) * limitNumber;
    const allowedSortFields = ["created_at", "name", "username", "role"];
    const sortField = allowedSortFields.includes(sortBy)
      ? sortBy
      : "created_at";
    const sortDirection =
      typeof sortOrder === "string" && sortOrder.toUpperCase() === "ASC"
        ? "ASC"
        : "DESC";

    const conditions = [];
    const values = [];
    let paramCount = 1;

    if (search) {
      conditions.push(
        `(u.name ILIKE $${paramCount} OR u.username ILIKE $${paramCount} OR u.email ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(
      `SELECT COUNT(*) FROM users u ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    values.push(limitNumber, offset);
    
    // Build safe ORDER BY clause
    const orderByClause = `ORDER BY u."${sortField}" ${sortDirection}`;
    
    const result = await query(
      `
      SELECT 
        u.id,
        u.name,
        u.username,
        u.email,
        u.role,
        u.phone,
        u.is_active,
        u.created_at,
        c.name as customer_name
      FROM users u
      LEFT JOIN customers c ON u.customer_id = c.id
      ${whereClause}
      ${orderByClause}
      LIMIT $${paramCount} OFFSET $${paramCount + 1}
    `,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: pageNumber,
        limit: limitNumber,
        total: totalCount,
        totalPages: Math.ceil(totalCount / limitNumber),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update user role (admin only)
// @route   PUT /api/users/:id/role
// @access  Private (Admin)
export const updateUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin", "support"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "نقش نامعتبر است",
      });
    }

    // Prevent admin from changing their own role
    if (id === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "نمی‌توانید نقش خود را تغییر دهید",
      });
    }

    const result = await query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, name, username, email, role, phone, is_active`,
      [role, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "کاربر یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      message: "نقش کاربر با موفقیت تغییر کرد",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

