import { query } from "../config/database.js";
import bcrypt from "bcryptjs";

const CONTRACT_TIERS = ["basic", "standard", "premium"];

const toISODate = (value, label) => {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    const error = new Error(`تاریخ ${label} معتبر نیست`);
    error.statusCode = 400;
    throw error;
  }
  return date.toISOString().slice(0, 10);
};

const normalizeTier = (tier) => {
  if (!tier) return "standard";
  const normalized = tier.toLowerCase();
  if (!CONTRACT_TIERS.includes(normalized)) {
    const error = new Error("پلن قرارداد معتبر نیست");
    error.statusCode = 400;
    throw error;
  }
  return normalized;
};

const sanitizePhone = (phone) => {
  if (!phone) return null;
  const digits = phone.toString().replace(/[^0-9+]/g, "");
  return digits || null;
};

// @desc    Get all customers
// @route   GET /api/customers
// @access  Private (Admin/Support)
export const getCustomers = async (req, res, next) => {
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
    const allowedSortFields = ["created_at", "name", "contract_end_date"];
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
        `(c.name ILIKE $${paramCount} OR c.email ILIKE $${paramCount} OR c.company ILIKE $${paramCount})`
      );
      values.push(`%${search}%`);
      paramCount++;
    }

    const whereClause =
      conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

    const countResult = await query(
      `SELECT COUNT(*) FROM customers c ${whereClause}`,
      values
    );
    const totalCount = parseInt(countResult.rows[0].count, 10);

    values.push(limitNumber, offset);
    const result = await query(
      `SELECT
        c.*,
        u.name as created_by_name,
        cu.id as user_id,
        cu.role as user_role,
        cu.username as user_username,
        (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id) as ticket_count,
        CASE
          WHEN c.contract_unlimited THEN 'active'
          WHEN c.contract_end_date IS NULL THEN 'unknown'
          WHEN c.contract_end_date < CURRENT_DATE THEN 'expired'
          WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
          ELSE 'active'
        END as contract_status,
        CASE
          WHEN c.contract_unlimited THEN NULL
          WHEN c.contract_end_date IS NULL THEN NULL
          ELSE DATE_PART('day', c.contract_end_date::timestamp - CURRENT_TIMESTAMP)::int
        END as contract_days_remaining
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       LEFT JOIN users cu ON cu.customer_id = c.id
       ${whereClause}
       ORDER BY c."${sortField}" ${sortDirection}
       LIMIT $${paramCount} OFFSET $${paramCount + 1}`,
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
        (SELECT COUNT(*) FROM tickets WHERE customer_id = c.id AND status != 'بسته شده') as open_ticket_count,
          CASE
            WHEN c.contract_unlimited THEN 'active'
            WHEN c.contract_end_date IS NULL THEN 'unknown'
            WHEN c.contract_end_date < CURRENT_DATE THEN 'expired'
            WHEN c.contract_end_date <= CURRENT_DATE + INTERVAL '30 days' THEN 'warning'
            ELSE 'active'
          END as contract_status,
          CASE
            WHEN c.contract_unlimited THEN NULL
            WHEN c.contract_end_date IS NULL THEN NULL
            ELSE DATE_PART('day', c.contract_end_date::timestamp - CURRENT_TIMESTAMP)::int
          END as contract_days_remaining
       FROM customers c
       LEFT JOIN users u ON c.created_by = u.id
       WHERE c.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "مشتری یافت نشد",
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
    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      country,
      notes,
      contract_start_date,
      contract_end_date,
      contract_unlimited,
      contract_tier,
    } = req.body;

    const trimmedName = name.trim();
    const normalizedPhone = sanitizePhone(phone);

    // Check if customer with email exists
    if (email) {
      const existingCustomer = await query(
        "SELECT id FROM customers WHERE email = $1",
        [email]
      );

      if (existingCustomer.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "مشتری با این ایمیل قبلاً ثبت شده است",
        });
      }
    }

    if (normalizedPhone) {
      const existingByPhone = await query(
        "SELECT id FROM customers WHERE phone = $1",
        [normalizedPhone]
      );

      if (existingByPhone.rows.length > 0) {
        return res.status(400).json({
          success: false,
          message: "مشتری با این شماره تماس قبلاً ثبت شده است",
        });
      }
    }

    const existingByName = await query(
      "SELECT id FROM customers WHERE LOWER(name) = LOWER($1)",
      [trimmedName]
    );

    if (existingByName.rows.length > 0) {
      return res.status(400).json({
        success: false,
        message: "مشتری با این نام قبلاً ثبت شده است",
      });
    }

    const contractStartISO = toISODate(contract_start_date, "شروع");
    let contractEndISO = toISODate(contract_end_date, "پایان");
    const isUnlimited = !!contract_unlimited;
    if (isUnlimited) contractEndISO = null;

    if (contractStartISO && contractEndISO) {
      const start = new Date(contractStartISO);
      const end = new Date(contractEndISO);
      if (end < start) {
        const error = new Error(
          "تاریخ پایان قرارداد باید بعد از تاریخ شروع باشد"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    const tier = normalizeTier(contract_tier);

    const result = await query(
      `INSERT INTO customers (name, email, phone, company, address, city, country, notes, contract_start_date, contract_end_date, contract_unlimited, contract_tier, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
       RETURNING *`,
      [
        trimmedName,
        email || null,
        normalizedPhone,
        company || null,
        address || null,
        city || null,
        country || null,
        notes || null,
        contractStartISO,
        contractEndISO,
        isUnlimited,
        tier,
        req.user.id,
      ]
    );

    const customer = result.rows[0];

    // Use phone number as both username and password
    if (!normalizedPhone) {
      return res.status(400).json({
        success: false,
        message: "شماره تماس برای ایجاد حساب کاربری الزامی است",
      });
    }

    const username = normalizedPhone;
    const password = normalizedPhone; // Password is same as phone number

    // Check if username already exists
    const existingUser = await query(
      "SELECT id FROM users WHERE username = $1",
      [username]
    );

    let userCredentials = null;

    if (existingUser.rows.length === 0) {
      // Hash password
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);

      // Create user account for the customer
      await query(
        `INSERT INTO users (name, username, email, password, role, phone, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6, $7)`,
        [
          trimmedName,
          username,
          email || null,
          hashedPassword,
          "user",
          normalizedPhone,
          customer.id,
        ]
      );

      userCredentials = { username, password };
    } else {
      // If user exists, link the customer to existing user
      await query(`UPDATE users SET customer_id = $1 WHERE username = $2`, [
        customer.id,
        username,
      ]);
    }

    res.status(201).json({
      success: true,
      message: "مشتری با موفقیت ایجاد شد",
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
    const {
      name,
      email,
      phone,
      company,
      address,
      city,
      country,
      notes,
      contract_start_date,
      contract_end_date,
      contract_tier,
    } = req.body;

    const customerCheck = await query(
      "SELECT id, contract_start_date, contract_end_date FROM customers WHERE id = $1",
      [id]
    );

    if (customerCheck.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "مشتری یافت نشد",
      });
    }

    const existingCustomer = customerCheck.rows[0];

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
      values.push(sanitizePhone(phone));
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

    let nextContractStart = existingCustomer.contract_start_date;
    let nextContractEnd = existingCustomer.contract_end_date;

    if (contract_start_date !== undefined) {
      const startValue =
        contract_start_date && contract_start_date !== ""
          ? toISODate(contract_start_date, "شروع")
          : null;
      fieldsToUpdate.push(`contract_start_date = $${paramCount}`);
      values.push(startValue);
      paramCount++;
      nextContractStart = startValue;
    }

    if (contract_end_date !== undefined) {
      const endValue =
        contract_end_date && contract_end_date !== ""
          ? toISODate(contract_end_date, "پایان")
          : null;
      fieldsToUpdate.push(`contract_end_date = $${paramCount}`);
      values.push(endValue);
      paramCount++;
      nextContractEnd = endValue;
    }

    if (contract_unlimited !== undefined) {
      const val = !!contract_unlimited;
      fieldsToUpdate.push(`contract_unlimited = $${paramCount}`);
      values.push(val);
      paramCount++;
      if (val) {
        nextContractEnd = null;
      }
    }

    if (contract_tier !== undefined) {
      fieldsToUpdate.push(`contract_tier = $${paramCount}`);
      values.push(contract_tier ? normalizeTier(contract_tier) : null);
      paramCount++;
    }

    if (nextContractStart && nextContractEnd) {
      const startDate = new Date(nextContractStart);
      const endDate = new Date(nextContractEnd);
      if (endDate < startDate) {
        const error = new Error(
          "تاریخ پایان قرارداد باید بعد از تاریخ شروع باشد"
        );
        error.statusCode = 400;
        throw error;
      }
    }

    if (fieldsToUpdate.length === 0) {
      return res.status(400).json({
        success: false,
        message: "هیچ فیلدی برای به‌روزرسانی ارسال نشده است",
      });
    }

    values.push(id);

    const result = await query(
      `UPDATE customers
       SET ${fieldsToUpdate.join(", ")}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    res.status(200).json({
      success: true,
      message: "مشتری با موفقیت به‌روزرسانی شد",
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update customer user role (admin only)
// @route   PUT /api/customers/:id/user-role
// @access  Private (Admin)
export const updateCustomerUserRole = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!role || !["user", "admin", "support"].includes(role)) {
      return res.status(400).json({
        success: false,
        message: "نقش نامعتبر است",
      });
    }

    // Get user associated with this customer
    const userResult = await query(
      "SELECT id FROM users WHERE customer_id = $1",
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "کاربر مرتبط با این مشتری یافت نشد",
      });
    }

    const userId = userResult.rows[0].id;

    // Prevent admin from changing their own role
    if (userId === req.user.id) {
      return res.status(400).json({
        success: false,
        message: "نمی‌توانید نقش خود را تغییر دهید",
      });
    }

    // Update user role
    const result = await query(
      `UPDATE users
       SET role = $1
       WHERE id = $2
       RETURNING id, name, username, email, role, phone, is_active`,
      [role, userId]
    );

    res.status(200).json({
      success: true,
      message: "نقش کاربر با موفقیت تغییر کرد",
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
      "DELETE FROM customers WHERE id = $1 RETURNING id",
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "مشتری یافت نشد",
      });
    }

    res.status(200).json({
      success: true,
      message: "مشتری با موفقیت حذف شد",
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
