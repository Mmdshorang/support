import { query } from '../config/database.js';
import bcrypt from 'bcryptjs';

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin/Support)
export const getCustomers = async (req, res, next) => {
  try {
    const {
      search,
      page = 1,
      limit = 10,
      sortBy = 'created_at',
      sortOrder = 'DESC',
    } = req.query;

    const offset = (page - 1) * limit;
    const conditions = [];
    const values = [];
    let paramCount = 1;

    // Search in name, email, company
    if (search) {
      conditions.push(
        `(name ILIKE $${paramCount} OR email ILIKE $${paramCount} OR company ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(' AND ')}` : '';

    // Get total count
    const countResult = await query(
      `SELECT COUNT(*) FROM customers ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count);

    // Get customers
    values.push(limit, offset);
    const result = await query(
      `SELECT
        c.*,
        u.name as created_by_name,
        (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id) as ticket_count
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       ${whereClause}
       ORDER BY c.${sortBy} ${sortOrder}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
      values
    );

    res.status(200).json({
      success: true,
      count: result.rows.length,
      total: totalCount,
      pages: Math.ceil(totalCount / limit),
      currentPage: parseInt(page),
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get single customer
// @route   GET /api/customers/:id
// @access  Private (Admin/Support)
export const getCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        c.*,
        u.name as created_by_name,
        (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id) as ticket_count,
        (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id AND status != 'بسته شده') as open_ticket_count
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'مشتری یافت نشد',
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

// @desc    Create new customer
// @route   POST /api/customers
// @access  Private (Admin/Support)
export const createCustomer = async (req, res, next) => {
  try {
    const { name, email, phone, company, address, city, country, notes } =
      req.body;

    // Check if customer with email exists
    if (email) {
      const existingCustomer = await query(
        'SELECT id FROM customers WHERE email = $1',
        [email]
      );

      if (existingCustomer.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: 'مشتری با این ایمیل قبلاً ثبت شده است',
        });
      }
    }

    // Create customer
    const result = await query(
      `INSERT INTO customers (name, email, phone, company, address, city, country, notes, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
       RETURNING *`,
      [
        name,
        email || null,
        phone || null,
        company || null,
        address || null,
        city || null,
        country || null,
        notes || null,
        req.user.id,
      ]
    );

    const customer = result.rows[0];

    // Generate username from customer name (remove spaces and convert to lowercase)
    const username = name.replace(/\s+/g, '').toLowerCase();
    const password = username; // Password is same as username

    // Check if username already exists
    const existingUser = await query(
      'SELECT id FROM users WHERE username = $1',
      [username]
    );

    let userCredentials = null;

    if (existingUser.rows.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user account for the customer
      await query(
        `INSERT INTO users (name, username, email, password, role, phone)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [name, username, email || null, hashedPassword, 'user', phone || null]
      );

      userCredentials = { username, password };
    }

    res.status(201).json({
      success: true,
      message: 'مشتری با موفقیت ایجاد شد',
      data: {
        customer: customer,
        userCredentials: userCredentials,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer
// @route   PUT /api/customers/:id
// @access  Private (Admin/Support)
export const updateCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, email, phone, company, address, city, country, notes } =
      req.body;

    // Check if customer exists
    const customerCheck = await query('SELECT id FROM customers WHERE id = $1', [
      id,
    ]);

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'مشتری یافت نشد',
      });
    }

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fieldsToUpdate.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (email !== undefined) {
      fieldsToUpdate.push(`email = $${paramCount}`);
      values.push(email);
      paramCount++;
    }

    if (phone !== undefined) {
      fieldsToUpdate.push(`phone = $${paramCount}`);
      values.push(phone);
      paramCount++;
    }

    if (company !== undefined) {
      fieldsToUpdate.push(`company = $${paramCount}`);
      values.push(company);
      paramCount++;
    }

    if (address !== undefined) {
      fieldsToUpdate.push(`address = $${paramCount}`);
      values.push(address);
      paramCount++;
    }

    if (city !== undefined) {
      fieldsToUpdate.push(`city = $${paramCount}`);
      values.push(city);
      paramCount++;
    }

    if (country !== undefined) {
      fieldsToUpdate.push(`country = $${paramCount}`);
      values.push(country);
      paramCount++;
    }

    if (notes !== undefined) {
      fieldsToUpdate.push(`notes = $${paramCount}`);
      values.push(notes);
      paramCount++;
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'هیچ فیلدی برای به‌روزرسانی ارسال نشده است',
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE customers
       SET ${fieldsToUpdate.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: 'مشتری با موفقیت به‌روزرسانی شد',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete customer
// @route   DELETE /api/customers/:id
// @access  Private (Admin only)
export const deleteCustomer = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM customers WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'مشتری یافت نشد',
      });
    }

    res.status(200).json({
      success: true,
      message: 'مشتری با موفقیت حذف شد',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get customer tickets
// @route   GET /api/customers/:id/tickets
// @access  Private (Admin/Support)
export const getCustomerTickets = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      `SELECT
        t.*,
        u.name as user_name,
        cat.name as category_name
       FROM tickets t
       LEFT JOIN users u ON t.user_id = u.id
       LEFT JOIN ticket_categories cat ON t.category_id = cat.id
       WHERE t.customer_id = $1
       ORDER BY t.created_at DESC`,
      [id]
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
