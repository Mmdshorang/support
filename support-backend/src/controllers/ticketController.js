import { query } from "../config/database.js";

const normalizeSupportType = (value) =>
  value === "inPerson" ? "inPerson" : "remote";

// @desc    Get all tickets
// @route   GET /api/tickets
// @access  Private
export const getTickets = async (req, res, next) => {
  try {
    const {
      status,
      category,
      search,
      page = 1,
      limit = 10,
      sortBy = "created_at",
      sortOrder = "DESC",
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Filter by user role
    if (req.user.role === "user") {
      conditions.push(`t.user_id = $${paramCount}`);
      values.push(req.user.id);
      paramCount++;
    }

    // Filter by status
    if (status) {
      conditions.push(`t.status = $${paramCount}`);
      values.push(status);
      paramCount++;
    }

    // Filter by category
    if (category) {
      conditions.push(`t.category_id = $${paramCount}`);
      values.push(category);
      paramCount++;
    }

    // Search in subject and description
    if (search) {
      conditions.push(
        `(t.subject ILIKE $${paramCount} OR t.description ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM tickets t ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get tickets
    values.push(limit, offset);
    const result = await query(
      `SELECT
        t.*,
        u.name as user_name,
        u.name as owner,
        u.email as user_email,
        u.phone as user_phone,
        c.name as customer_name,
        c.name as customer,
        c.phone as customer_phone,
        cat.name as category_name,
        a.name as assigned_to_name,
        (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) as message_count,
        (SELECT COUNT(*) FROM ticket_messages
         WHERE ticket_id = t.id
         AND sender_id != t.user_id
         AND created_at > COALESCE(t.last_user_read_at, '1970-01-01')) as user_unread_count,
        (SELECT COUNT(*) FROM ticket_messages
         WHERE ticket_id = t.id
         AND sender_id = t.user_id
         AND created_at > COALESCE(t.last_admin_read_at, '1970-01-01')) as admin_unread_count
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN customers c ON t.customer_id = c.id
       LEFT JOIN ticket_categories cat ON t.category_id = cat.id
       LEFT JOIN users a ON t.assigned_to = a.id
       ${whereClause}
       ORDER BY t.${sortBy} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    res.status(200).json({
      success: true,
      data: result.rows,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total: totalCount,
        totalPages: Math.ceil(totalCount / limit),
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single ticket
// @route   GET /api/tickets/:id
// @access  Private
export const getTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    let queryText = `
      SELECT
        t.*,
        u.name as user_name,
        u.name as owner,
        u.email as user_email,
        u.phone as user_phone,
        c.name as customer_name,
        c.name as customer,
        c.phone as customer_phone,
        cat.name as category_name,
        cat.color as category_color,
        a.name as assigned_to_name
      FROM tickets t
      LEFT JOIN users u ON t.user_id = u.id
      LEFT JOIN customers c ON t.customer_id = c.id
      LEFT JOIN ticket_categories cat ON t.category_id = cat.id
      LEFT JOIN users a ON t.assigned_to = a.id
      WHERE t.id = $1
    `;

    const values = [id];

    // If user role is 'user', check ownership
    if (req.user.role === "user") {
      queryText += " AND t.user_id = $2";
      values.push(req.user.id);
    }

    const result = await query(queryText, values);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "تیکت یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create new ticket
// @route   POST /api/tickets
// @access  Private
export const createTicket = async (req, res, next) => {
  try {
    const { subject, description, category_id, customer_id, support_type } =
      req.body;

    const result = await query(
      `INSERT INTO tickets (subject, description, category_id, user_id, customer_id, support_type)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        subject,
        description,
        category_id || null,
        req.user.id,
        customer_id || null,
        normalizeSupportType(support_type),
      ]
    );

    // Create initial message
    await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message)
       VALUES ($1, $2, $3)`,
      [result.rows[0].id, req.user.id, description]
    );

    res.status(201).json({
      success: true,
      message: "تیکت با موفقیت ایجاد شد",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update ticket
// @route   PUT /api/tickets/:id
// @access  Private
export const updateTicket = async (req, res, next) => {
  try {
    const { id } = req.params;
    const {
      subject,
      description,
      category_id,
      status,
      assigned_to,
      solution,
      support_type,
    } = req.body;

    // Check if ticket exists and user has permission
    let checkQuery = "SELECT * FROM tickets WHERE id = $1";
    const checkValues = [id];

    if (req.user.role === "user") {
      checkQuery += " AND user_id = $2";
      checkValues.push(req.user.id);
    }

    const ticketCheck = await query(checkQuery, checkValues);

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "تیکت یافت نشد یا شما مجوز ویرایش آن را ندارید",
      });
    }

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (subject) {
      fieldsToUpdate.push(`subject = $${paramCount}`);
      values.push(subject);
      paramCount++;
    }

    if (description) {
      fieldsToUpdate.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (category_id) {
      fieldsToUpdate.push(`category_id = $${paramCount}`);
      values.push(category_id);
      paramCount++;
    }

    if (solution !== undefined) {
      fieldsToUpdate.push(`solution = $${paramCount}`);
      values.push(solution);
      paramCount++;
    }

    if (
      (req.user.role === "admin" || req.user.role === "support") &&
      support_type
    ) {
      fieldsToUpdate.push(`support_type = $${paramCount}`);
      values.push(normalizeSupportType(support_type));
      paramCount++;
    }

    // Only admin and support can change status and assignment
    if ((req.user.role === "admin" || req.user.role === "support") && status) {
      fieldsToUpdate.push(`status = $${paramCount}`);
      values.push(status);
      paramCount++;

      if (status === "بسته شده") {
        fieldsToUpdate.push(`closed_at = CURRENT_TIMESTAMP`);
      }
    }

    if (
      (req.user.role === "admin" || req.user.role === "support") &&
      assigned_to
    ) {
      fieldsToUpdate.push(`assigned_to = $${paramCount}`);
      values.push(assigned_to);
      paramCount++;
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است",
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE tickets
       SET ${fieldsToUpdate.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: "تیکت با موفقیت به‌روزرسانی شد",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete ticket
// @route   DELETE /api/tickets/:id
// @access  Private (Admin only)
export const deleteTicket = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      "DELETE FROM tickets WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "تیکت یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      message: "تیکت با موفقیت حذف شد",
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get ticket statistics
// @route   GET /api/tickets/stats/overview
// @access  Private
export const getTicketStats = async (req, res, next) => {
  try {
    let userFilter = "";
    const values = [];

    if (req.user.role === "user") {
      userFilter = "WHERE user_id = $1";
      values.push(req.user.id);
    }

    const result = await query(
      `SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'در انتظار') as pending,
        COUNT(*) FILTER (WHERE status = 'در حال پیگیری') as in_progress,
        COUNT(*) FILTER (WHERE status = 'پاسخ داده شده') as answered,
        COUNT(*) FILTER (WHERE status = 'بسته شده') as closed
       FROM tickets ${userFilter}`,
      values
    );

    const stats = result.rows[0];

    res.status(200).json({
      success: true,
      data: {
        total: parseInt(stats.total),
        by_status: {
          pending: parseInt(stats.pending),
          in_progress: parseInt(stats.in_progress),
          answered: parseInt(stats.answered),
          closed: parseInt(stats.closed),
        },
      },
    });
  } catch (error) {
    next(error);
  }
};
