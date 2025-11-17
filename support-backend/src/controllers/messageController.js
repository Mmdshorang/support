import { query } from '../config/database.js';

// @desc    Get messages for a ticket
// @route   GET /api/tickets/:ticketId/messages
// @access  Private
export const getMessages = async (req, res, next) => {
  try {
    const { ticketId } = req.params;

    // Check if user has access to this ticket
    let ticketCheckQuery = 'SELECT id, user_id FROM tickets WHERE id = $1';
    const ticketCheckValues = [ticketId];

    if (req.user.role === 'user') {
      ticketCheckQuery += ' AND user_id = $2';
      ticketCheckValues.push(req.user.id);
    }

    const ticketCheck = await query(ticketCheckQuery, ticketCheckValues);

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'تیکت یافت نشد یا شما مجوز دسترسی به آن را ندارید',
      });
    }

    const readColumn =
      req.user.role === "user"
        ? "last_user_read_at"
        : req.user.role === "admin" || req.user.role === "support"
        ? "last_admin_read_at"
        : null;

    if (readColumn) {
      await query(
        `UPDATE tickets SET ${readColumn} = CURRENT_TIMESTAMP WHERE id = $1`,
        [ticketId]
      );
    }

    // Get messages
    const result = await query(
      `SELECT
        tm.*,
        u.name as sender_name,
        u.email as sender_email,
        u.role as sender_role,
        u.avatar as sender_avatar
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.sender_id = u.id
       WHERE tm.ticket_id = $1
       ORDER BY tm.created_at ASC`,
      [ticketId]
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Create a new message
// @route   POST /api/tickets/:ticketId/messages
// @access  Private
export const createMessage = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { message, is_internal = false } = req.body;

    if (!message || message.trim() === '') {
      return res.status(400).json({
        success: false,
        message: 'متن پیام نمی‌تواند خالی باشد',
      });
    }

    // Check if user has access to this ticket
    let ticketCheckQuery = 'SELECT id, user_id, status FROM tickets WHERE id = $1';
    const ticketCheckValues = [ticketId];

    if (req.user.role === 'user') {
      ticketCheckQuery += ' AND user_id = $2';
      ticketCheckValues.push(req.user.id);
    }

    const ticketCheck = await query(ticketCheckQuery, ticketCheckValues);

    if (ticketCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'تیکت یافت نشد یا شما مجوز دسترسی به آن را ندارید',
      });
    }

    const ticket = ticketCheck.rows[0];

    // Check if ticket is closed
    if (ticket.status === 'بسته شده' && req.user.role === 'user') {
      return res.status(400).json({
        success: false,
        message: 'این تیکت بسته شده و امکان ارسال پیام جدید وجود ندارد',
      });
    }

    // Only admins and support can send internal messages
    const isInternalMessage =
      (req.user.role === 'admin' || req.user.role === 'support') && is_internal;

    // Create message
    const result = await query(
      `INSERT INTO ticket_messages (ticket_id, sender_id, message, is_internal)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [ticketId, req.user.id, message, isInternalMessage]
    );

    // Update ticket status if needed
    if (req.user.role === 'admin' || req.user.role === 'support') {
      await query(
        `UPDATE tickets
         SET status = 'پاسخ داده شده', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1`,
        [ticketId]
      );
    } else {
      await query(
        `UPDATE tickets
         SET status = 'در حال پیگیری', updated_at = CURRENT_TIMESTAMP
         WHERE id = $1 AND status != 'بسته شده'`,
        [ticketId]
      );
    }

    // Get the complete message with user info
    const messageResult = await query(
      `SELECT
        tm.*,
        u.name as sender_name,
        u.email as sender_email,
        u.role as sender_role,
        u.avatar as sender_avatar
       FROM ticket_messages tm
       LEFT JOIN users u ON tm.sender_id = u.id
       WHERE tm.id = $1`,
      [result.rows[0].id]
    );

    res.status(201).json({
      success: true,
      message: 'پیام با موفقیت ارسال شد',
      data: messageResult.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete a message
// @route   DELETE /api/tickets/:ticketId/messages/:messageId
// @access  Private (Admin only)
export const deleteMessage = async (req, res, next) => {
  try {
    const { ticketId, messageId } = req.params;

    const result = await query(
      'DELETE FROM ticket_messages WHERE id = $1 AND ticket_id = $2 RETURNING id',
      [messageId, ticketId]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'پیام یافت نشد',
      });
    }

    res.status(200).json({
      success: true,
      message: 'پیام با موفقیت حذف شد',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
