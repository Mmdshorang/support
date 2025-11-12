# 🎫 سیستم پشتیبانی و مدیریت تیکت

یک سیستم کامل پشتیبانی و مدیریت تیکت با React + TypeScript (فرانت) و Node.js + PostgreSQL (بک‌اند)

## 📋 فهرست مطالب

- [ویژگی‌ها](#ویژگی‌ها)
- [تکنولوژی‌ها](#تکنولوژی‌ها)
- [نصب و راه‌اندازی](#نصب-و-راه‌اندازی)
- [کاربران پیش‌فرض](#کاربران-پیش‌فرض)
- [استفاده](#استفاده)
- [ساختار پروژه](#ساختار-پروژه)

## ✨ ویژگی‌ها

### پنل مدیریت (Admin/Support)
- ✅ داشبورد با آمار و نمودارها
- ✅ مدیریت کامل تیکت‌ها
- ✅ مدیریت مشتریان
- ✅ گزارش‌گیری پیشرفته
- ✅ دسته‌بندی مشکلات

### پنل کاربر (User)
- ✅ داشبورد شخصی
- ✅ ثبت تیکت جدید
- ✅ مشاهده و پاسخ به تیکت‌ها
- ✅ جستجو در تیکت‌ها
- ✅ پیگیری وضعیت

### عمومی
- ✅ احراز هویت با JWT
- ✅ طراحی Responsive
- ✅ پشتیبانی از Dark Mode
- ✅ RTL کامل
- ✅ API RESTful

## 🛠 تکنولوژی‌ها

### Frontend
- **React 19** - UI Framework
- **TypeScript** - Type Safety
- **TanStack Router** - Routing
- **Jotai** - State Management
- **Tailwind CSS 4** - Styling
- **Axios** - HTTP Client
- **React Toastify** - Notifications

### Backend
- **Node.js** - Runtime
- **Express.js** - Web Framework
- **PostgreSQL** - Database
- **JWT** - Authentication
- **Bcrypt** - Password Hashing

## 🚀 نصب و راه‌اندازی

### پیش‌نیازها

- Node.js 18+ نصب شده باشد
- PostgreSQL 14+ نصب شده باشد
- npm یا yarn

### مرحله 1: کلون کردن پروژه

```bash
cd c:\Users\mmdsk\Desktop\support
```

### مرحله 2: راه‌اندازی Backend

```bash
# رفتن به پوشه بک‌اند
cd support-backend

# نصب dependencies
npm install

# ایجاد دیتابیس در PostgreSQL
# ابتدا وارد PostgreSQL شوید و دستور زیر را اجرا کنید:
# CREATE DATABASE support_db;

# تنظیم فایل .env
# فایل .env در پوشه موجود است
# فقط رمز عبور PostgreSQL خود را ویرایش کنید:
# DB_PASSWORD=your_postgres_password

# اجرای Migration (ایجاد جداول و داده‌های اولیه)
npm run db:migrate

# راه‌اندازی سرور
npm run dev
```

سرور در آدرس `http://localhost:5000` اجرا می‌شود.

### مرحله 3: راه‌اندازی Frontend

```bash
# رفتن به پوشه فرانت (در ترمینال جدید)
cd c:\Users\mmdsk\Desktop\support\support-app

# نصب dependencies
npm install

# راه‌اندازی سرور توسعه
npm run dev
```

فرانت در آدرس `http://localhost:5173` اجرا می‌شود.

## 👥 کاربران پیش‌فرض

بعد از اجرای migration، می‌توانید با این کاربران وارد شوید:

### ادمین
- **ایمیل:** `admin@hesaban.com`
- **رمز عبور:** `password123`
- **دسترسی:** داشبورد مدیریتی، تمام صفحات

### کاربر عادی
- **ایمیل:** `ali@example.com`
- **رمز عبور:** `password123`
- **دسترسی:** داشبورد کاربری، ثبت و مشاهده تیکت‌های خود

### پشتیبان
- **ایمیل:** `mehdi@hesaban.com`
- **رمز عبور:** `password123`
- **دسترسی:** پاسخگویی به تیکت‌ها

## 📖 استفاده

### ورود به سیستم

1. به آدرس `http://localhost:5173/login` بروید
2. یکی از کاربران بالا را انتخاب کنید (یا روی دکمه‌های کاربران تست کلیک کنید)
3. وارد شوید

### پنل ادمین

بعد از ورود با ادمین:
- **داشبورد:** مشاهده آمار و گزارشات
- **تیکت‌ها:** مدیریت و پاسخ به تیکت‌ها
- **مشتریان:** ثبت و مدیریت مشتریان
- **گزارشات:** تحلیل و گزارش‌گیری

### پنل کاربر

بعد از ورود با کاربر عادی:
- **داشبورد من:** مشاهده تیکت‌های خود
- **ثبت تیکت جدید:** ثبت تیکت پشتیبانی
- **تیکت‌های من:** لیست و جزئیات تیکت‌ها
- **پاسخ به تیکت:** ارسال پیام در تیکت

## 📁 ساختار پروژه

```
support/
├── support-backend/          # Backend (Node.js + PostgreSQL)
│   ├── src/
│   │   ├── config/          # تنظیمات
│   │   ├── controllers/     # کنترلرها
│   │   ├── middleware/      # میدلورها
│   │   ├── routes/          # مسیرها
│   │   ├── database/        # Schema & Migration
│   │   └── server.js        # سرور اصلی
│   ├── .env                 # متغیرهای محیطی
│   └── package.json
│
└── support-app/             # Frontend (React + TypeScript)
    ├── src/
    │   ├── components/      # کامپوننت‌ها
    │   ├── routes/          # مسیرها و صفحات
    │   ├── services/        # API Services
    │   ├── stores/          # State Management
    │   └── main.tsx         # Entry Point
    ├── .env                 # متغیرهای محیطی
    └── package.json
```

## 🔌 API Endpoints

### Authentication
- `POST /api/auth/login` - ورود
- `POST /api/auth/register` - ثبت‌نام
- `GET /api/auth/me` - دریافت اطلاعات کاربر

### Tickets
- `GET /api/tickets` - لیست تیکت‌ها
- `GET /api/tickets/:id` - جزئیات تیکت
- `POST /api/tickets` - ایجاد تیکت
- `PUT /api/tickets/:id` - به‌روزرسانی تیکت
- `GET /api/tickets/stats/overview` - آمار تیکت‌ها

### Messages
- `GET /api/tickets/:ticketId/messages` - پیام‌های تیکت
- `POST /api/tickets/:ticketId/messages` - ارسال پیام

### Customers
- `GET /api/customers` - لیست مشتریان
- `POST /api/customers` - ایجاد مشتری
- `PUT /api/customers/:id` - به‌روزرسانی مشتری

### Categories
- `GET /api/categories` - لیست دسته‌بندی‌ها

## 🔑 متغیرهای محیطی

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=support_db
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
CORS_ORIGIN=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🧪 تست API با Postman

فایل Postman Collection در مسیر زیر موجود است:
```
support-backend/Support-API.postman_collection.json
```

این فایل را در Postman import کنید تا بتوانید API ها را تست کنید.

## 🐛 عیب‌یابی

### Backend اجرا نمی‌شود

1. مطمئن شوید PostgreSQL در حال اجرا است
2. رمز عبور و اطلاعات دیتابیس در `.env` صحیح باشد
3. دیتابیس `support_db` ایجاد شده باشد
4. Migration را اجرا کرده باشید: `npm run db:migrate`

### Frontend به Backend متصل نمی‌شود

1. مطمئن شوید Backend در حال اجرا است
2. آدرس API در `.env` فرانت صحیح باشد
3. مشکل CORS وجود نداشته باشد

### خطای Login

1. مطمئن شوید Backend در حال اجرا است
2. Migration اجرا شده باشد (کاربران پیش‌فرض ایجاد شوند)
3. ایمیل و رمز عبور صحیح باشد

## 📞 پشتیبانی

برای گزارش مشکل یا سوال، یک Issue ایجاد کنید.

## 📄 مجوز

MIT License

---

**ساخته شده با ❤️ برای سیستم پشتیبانی حسابان**
