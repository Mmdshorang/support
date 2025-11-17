-- Seed data for Support System

-- Insert default users (password: 'password123' - hashed with bcrypt)
INSERT INTO users (id, name, username, email, password, role) VALUES
    ('550e8400-e29b-41d4-a716-446655440001', 'مدیر سیستم', 'admin', 'admin@hesaban.com', '$2a$10$qoo3lSiVEVFgrYgqdoGw7OhaTG/dsKPLDSEn4FvIJLKJAj3WTAhsK', 'admin'),
    ('550e8400-e29b-41d4-a716-446655440002', 'مهدی صادقی', 'support', 'mehdi@hesaban.com', '$2a$10$qoo3lSiVEVFgrYgqdoGw7OhaTG/dsKPLDSEn4FvIJLKJAj3WTAhsK', 'support'),
    ('550e8400-e29b-41d4-a716-446655440003', 'علی احمدی', 'ali', 'ali@example.com', '$2a$10$qoo3lSiVEVFgrYgqdoGw7OhaTG/dsKPLDSEn4FvIJLKJAj3WTAhsK', 'user'),
    ('550e8400-e29b-41d4-a716-446655440004', 'زهرا محمدی', 'zahra', 'zahra@example.com', '$2a$10$qoo3lSiVEVFgrYgqdoGw7OhaTG/dsKPLDSEn4FvIJLKJAj3WTAhsK', 'user')
ON CONFLICT (email) DO NOTHING;

-- Insert ticket categories
INSERT INTO ticket_categories (id, name, description, color) VALUES
    ('650e8400-e29b-41d4-a716-446655440001', 'فنی', 'مشکلات فنی و تکنیکال', '#3b82f6'),
    ('650e8400-e29b-41d4-a716-446655440002', 'مالی', 'مسائل مالی و پرداخت', '#10b981'),
    ('650e8400-e29b-41d4-a716-446655440003', 'پشتیبانی', 'پشتیبانی عمومی', '#8b5cf6'),
    ('650e8400-e29b-41d4-a716-446655440004', 'فروش', 'سوالات فروش و خرید', '#f59e0b'),
    ('650e8400-e29b-41d4-a716-446655440005', 'درخواست ویژگی', 'درخواست قابلیت جدید', '#06b6d4'),
    ('650e8400-e29b-41d4-a716-446655440006', 'سایر', 'موارد دیگر', '#64748b')
ON CONFLICT (name) DO NOTHING;

-- Insert customers
INSERT INTO customers (id, name, email, phone, company, city, country, contract_start_date, contract_end_date, contract_tier, created_by) VALUES
    ('750e8400-e29b-41d4-a716-446655440001', 'شرکت فناوری سپهر', 'info@sepehr.com', '02112345678', 'شرکت فناوری سپهر', 'تهران', 'ایران', '2024-01-01', '2025-01-01', 'premium', '550e8400-e29b-41d4-a716-446655440001'),
    ('750e8400-e29b-41d4-a716-446655440002', 'بانک توسعه شرق', 'support@toseeshargh.com', '05187654321', 'بانک توسعه شرق', 'مشهد', 'ایران', '2023-06-01', '2024-06-01', 'standard', '550e8400-e29b-41d4-a716-446655440001'),
    ('750e8400-e29b-41d4-a716-446655440003', 'گروه صنعتی کیان', 'contact@kian.com', '03111223344', 'گروه صنعتی کیان', 'اصفهان', 'ایران', '2023-10-15', '2024-10-15', 'basic', '550e8400-e29b-41d4-a716-446655440001')
ON CONFLICT (email) DO NOTHING;

-- Map sample users to customers
UPDATE users SET customer_id = '750e8400-e29b-41d4-a716-446655440001' WHERE username = 'ali';
UPDATE users SET customer_id = '750e8400-e29b-41d4-a716-446655440002' WHERE username = 'zahra';

-- Insert problem types
INSERT INTO problem_types (id, name, description) VALUES
    ('850e8400-e29b-41d4-a716-446655440001', 'مشکلات ورود', 'مشکلات مربوط به ورود به سیستم'),
    ('850e8400-e29b-41d4-a716-446655440002', 'خطاهای نرم‌افزاری', 'باگ‌ها و خطاهای برنامه'),
    ('850e8400-e29b-41d4-a716-446655440003', 'مشکلات پرداخت', 'مشکلات درگاه و پرداخت'),
    ('850e8400-e29b-41d4-a716-446655440004', 'درخواست آموزش', 'نیاز به آموزش و راهنمایی'),
    ('850e8400-e29b-41d4-a716-446655440005', 'مشکلات گزارش‌گیری', 'مشکل در تهیه گزارش')
ON CONFLICT DO NOTHING;

-- Insert sample tickets
INSERT INTO tickets (subject, description, category_id, status, user_id, customer_id, support_type, solution) VALUES
    ('مشکل در ورود به سیستم', 'از دیروز نمی‌توانم وارد حساب کاربری خود شوم', '650e8400-e29b-41d4-a716-446655440001', 'در حال پیگیری', '550e8400-e29b-41d4-a716-446655440003', '750e8400-e29b-41d4-a716-446655440001', 'remote', NULL),
    ('درخواست فاکتور ماهانه', 'لطفا فاکتور ماه گذشته را برای من ارسال کنید', '650e8400-e29b-41d4-a716-446655440002', 'پاسخ داده شده', '550e8400-e29b-41d4-a716-446655440004', '750e8400-e29b-41d4-a716-446655440002', 'remote', 'فاکتور ارسال شد'),
    ('سوال در مورد قابلیت جدید', 'آیا امکان اضافه شدن قابلیت X وجود دارد؟', '650e8400-e29b-41d4-a716-446655440005', 'بسته شده', '550e8400-e29b-41d4-a716-446655440003', NULL, 'inPerson', 'پس از توضیح حضوری، درخواست بسته شد');

-- Insert sample messages
INSERT INTO ticket_messages (ticket_id, sender_id, message) VALUES
    (1, '550e8400-e29b-41d4-a716-446655440003', 'سلام، از دیروز نمی‌توانم وارد حساب کاربری خود شوم. هر بار که رمز عبور را وارد می‌کنم، پیام خطا دریافت می‌کنم.'),
    (1, '550e8400-e29b-41d4-a716-446655440002', 'سلام و وقت بخیر. ممنون که با ما در تماس هستید. لطفاً پیام خطای دقیق را برای ما ارسال کنید.'),
    (1, '550e8400-e29b-41d4-a716-446655440003', 'پیام خطا این است: "نام کاربری یا رمز عبور اشتباه است". ولی من مطمئنم که رمز عبور درست است.'),
    (2, '550e8400-e29b-41d4-a716-446655440004', 'سلام، لطفا فاکتور ماه گذشته را برای من ارسال کنید.'),
    (2, '550e8400-e29b-41d4-a716-446655440001', 'باسلام. فاکتور برای شما ایمیل شد.');
