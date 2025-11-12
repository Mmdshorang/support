# Support System Backend API

Backend API برای سیستم پشتیبانی و مدیریت تیکت ساخته شده با Node.js، Express و PostgreSQL.

## 📋 پیش‌نیازها

- Node.js (نسخه 18 یا بالاتر)
- PostgreSQL (نسخه 14 یا بالاتر)
- npm یا yarn

## 🚀 نصب و راه‌اندازی

### 1. نصب Dependencies

```bash
npm install
```

### 2. پیکربندی محیط

فایل `.env.example` را کپی کرده و به نام `.env` ذخیره کنید:

```bash
cp .env.example .env
```

سپس اطلاعات دیتابیس خود را در فایل `.env` وارد کنید:

```env
PORT=5000
NODE_ENV=development

DB_HOST=localhost
DB_PORT=5432
DB_NAME=support_db
DB_USER=postgres
DB_PASSWORD=your_password

JWT_SECRET=your_super_secret_jwt_key
JWT_EXPIRE=7d

CORS_ORIGIN=http://localhost:5173
```

### 3. ایجاد دیتابیس

ابتدا یک دیتابیس جدید در PostgreSQL ایجاد کنید:

```sql
CREATE DATABASE support_db;
```

### 4. اجرای Migration و Seed

```bash
npm run db:migrate
```

این دستور schema و داده‌های اولیه را در دیتابیس ایجاد می‌کند.

### 5. اجرای سرور

**Development mode:**
```bash
npm run dev
```

**Production mode:**
```bash
npm start
```

سرور در آدرس `http://localhost:5000` در دسترس خواهد بود.

## 📡 API Endpoints

### Authentication

| Method | Endpoint | توضیحات | دسترسی |
|--------|----------|---------|--------|
| POST | `/api/auth/register` | ثبت‌نام کاربر جدید | عمومی |
| POST | `/api/auth/login` | ورود کاربر | عمومی |
| GET | `/api/auth/me` | دریافت اطلاعات کاربر | خصوصی |
| PUT | `/api/auth/updatedetails` | به‌روزرسانی اطلاعات کاربر | خصوصی |
| PUT | `/api/auth/updatepassword` | تغییر رمز عبور | خصوصی |

### Tickets

| Method | Endpoint | توضیحات | دسترسی |
|--------|----------|---------|--------|
| GET | `/api/tickets` | لیست تیکت‌ها | خصوصی |
| GET | `/api/tickets/:id` | جزئیات تیکت | خصوصی |
| POST | `/api/tickets` | ایجاد تیکت جدید | خصوصی |
| PUT | `/api/tickets/:id` | به‌روزرسانی تیکت | خصوصی |
| DELETE | `/api/tickets/:id` | حذف تیکت | ادمین |
| GET | `/api/tickets/stats/overview` | آمار تیکت‌ها | خصوصی |

### Messages

| Method | Endpoint | توضیحات | دسترسی |
|--------|----------|---------|--------|
| GET | `/api/tickets/:ticketId/messages` | پیام‌های تیکت | خصوصی |
| POST | `/api/tickets/:ticketId/messages` | ارسال پیام | خصوصی |
| DELETE | `/api/tickets/:ticketId/messages/:messageId` | حذف پیام | ادمین |

### Customers

| Method | Endpoint | توضیحات | دسترسی |
|--------|----------|---------|--------|
| GET | `/api/customers` | لیست مشتریان | ادمین/پشتیبان |
| GET | `/api/customers/:id` | جزئیات مشتری | ادمین/پشتیبان |
| POST | `/api/customers` | ایجاد مشتری | ادمین/پشتیبان |
| PUT | `/api/customers/:id` | به‌روزرسانی مشتری | ادمین/پشتیبان |
| DELETE | `/api/customers/:id` | حذف مشتری | ادمین |
| GET | `/api/customers/:id/tickets` | تیکت‌های مشتری | ادمین/پشتیبان |

### Categories

| Method | Endpoint | توضیحات | دسترسی |
|--------|----------|---------|--------|
| GET | `/api/categories` | لیست دسته‌بندی‌ها | خصوصی |
| POST | `/api/categories` | ایجاد دسته‌بندی | ادمین |
| PUT | `/api/categories/:id` | به‌روزرسانی دسته‌بندی | ادمین |
| DELETE | `/api/categories/:id` | حذف دسته‌بندی | ادمین |

## 🔐 Authentication

برای دسترسی به endpoint های خصوصی، باید توکن JWT را در header ارسال کنید:

```
Authorization: Bearer YOUR_JWT_TOKEN
```

## 👥 کاربران پیش‌فرض

بعد از اجرای migration، کاربران زیر در دیتابیس ایجاد می‌شوند:

| Email | Password | Role |
|-------|----------|------|
| admin@hesaban.com | password123 | admin |
| mehdi@hesaban.com | password123 | support |
| ali@example.com | password123 | user |
| zahra@example.com | password123 | user |

## 📊 ساختار دیتابیس

دیتابیس شامل جداول زیر است:

- **users** - کاربران سیستم
- **customers** - مشتریان
- **tickets** - تیکت‌های پشتیبانی
- **ticket_messages** - پیام‌های تیکت
- **ticket_attachments** - فایل‌های پیوست
- **ticket_categories** - دسته‌بندی تیکت‌ها
- **problem_types** - انواع مشکلات
- **activity_logs** - لاگ فعالیت‌ها

## 🛠 ابزارهای استفاده شده

- **Express.js** - Web framework
- **PostgreSQL** - Database
- **pg** - PostgreSQL client
- **bcryptjs** - Password hashing
- **jsonwebtoken** - JWT authentication
- **cors** - Cross-Origin Resource Sharing
- **morgan** - HTTP request logger
- **dotenv** - Environment variables
- **express-validator** - Input validation

## 📝 مثال استفاده

### ثبت‌نام

```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "name": "علی احمدی",
    "email": "ali@test.com",
    "password": "password123"
  }'
```

### ورود

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "ali@test.com",
    "password": "password123"
  }'
```

### ایجاد تیکت

```bash
curl -X POST http://localhost:5000/api/tickets \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer YOUR_TOKEN" \
  -d '{
    "subject": "مشکل در سیستم",
    "description": "توضیحات کامل مشکل",
    "priority": "زیاد"
  }'
```

## 🔧 توسعه

### اضافه کردن endpoint جدید

1. Controller را در `src/controllers/` ایجاد کنید
2. Routes را در `src/routes/` اضافه کنید
3. Route را در `src/server.js` mount کنید

### اضافه کردن جدول جدید

1. Schema را در `src/database/schema.sql` اضافه کنید
2. Seed data را در `src/database/seed.sql` اضافه کنید
3. Migration را دوباره اجرا کنید

## 📞 پشتیبانی

برای گزارش باگ یا درخواست feature جدید، یک issue ایجاد کنید.

## 📄 مجوز

MIT License
