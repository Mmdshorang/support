import { query } from '../config/database.js';

// @desc    Get all categories
// @route   GET /api/categories
// @access  Private
export const getCategories = async (req, res, next) => {
  try {
    const result = await query(
      `SELECT
        c.*,
        COUNT(t.id) as ticket_count
       FROM ticket_categories c
       LEFT JOIN tickets t ON c.id = t.category_id
       WHERE c.is_active = true
       GROUP BY c.id
       ORDER BY c.name ASC`
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

// @desc    Create category
// @route   POST /api/categories
// @access  Private (Admin only)
export const createCategory = async (req, res, next) => {
  try {
    const { name, description, color, icon } = req.body;

    const result = await query(
      `INSERT INTO ticket_categories (name, description, color, icon)
       VALUES ($1, $2, $3, $4)
       RETURNING *`,
      [name, description || null, color || '#64748b', icon || null]
    );

    res.status(201).json({
      success: true,
      message: 'دسته‌بندی با موفقیت ایجاد شد',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update category
// @route   PUT /api/categories/:id
// @access  Private (Admin only)
export const updateCategory = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, color, icon, is_active } = req.body;

    const fieldsToUpdate = [];
    const values = [];
    let paramCount = 1;

    if (name !== undefined) {
      fieldsToUpdate.push(`name = $${paramCount}`);
      values.push(name);
      paramCount++;
    }

    if (description !== undefined) {
      fieldsToUpdate.push(`description = $${paramCount}`);
      values.push(description);
      paramCount++;
    }

    if (color !== undefined) {
      fieldsToUpdate.push(`color = $${paramCount}`);
      values.push(color);
      paramCount++;
    }

    if (icon !== undefined) {
      fieldsToUpdate.push(`icon = $${paramCount}`);
      values.push(icon);
      paramCount++;
    }

    if (is_active !== undefined) {
      fieldsToUpdate.push(`is_active = $${paramCount}`);
      values.push(is_active);
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
      `UPDATE ticket_categories
       SET ${fieldsToUpdate.join(', ')}
       WHERE id = $${paramCount}
       RETURNING *`,
      values
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی یافت نشد',
      });
    }

    res.status(200).json({
      success: true,
      message: 'دسته‌بندی با موفقیت به‌روزرسانی شد',
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete category
// @route   DELETE /api/categories/:id
// @access  Private (Admin only)
export const deleteCategory = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await query(
      'DELETE FROM ticket_categories WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: 'دسته‌بندی یافت نشد',
      });
    }

    res.status(200).json({
      success: true,
      message: 'دسته‌بندی با موفقیت حذف شد',
      data: {},
    });
  } catch (error) {
    next(error);
  }
};
