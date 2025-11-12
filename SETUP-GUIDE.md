# 🚀 راهنمای سریع راه‌اندازی

این راهنما به شما کمک می‌کند در کمتر از 5 دقیقه سیستم را راه‌اندازی کنید!

## ✅ پیش‌نیازها

قبل از شروع، مطمئن شوید این موارد نصب شده باشند:

1. **Node.js** نسخه 18 یا بالاتر
   - چک کنید: `node --version`
   - اگر نصب نیست: [دانلود Node.js](https://nodejs.org/)

2. **PostgreSQL** نسخه 14 یا بالاتر
   - چک کنید: `psql --version`
   - اگر نصب نیست: [دانلود PostgreSQL](https://www.postgresql.org/download/)
   - **مهم:** رمز عبور PostgreSQL را یادداشت کنید!

## 📝 مرحله 1: آماده‌سازی Backend

### 1.1 رفتن به پوشه Backend
```bash
cd c:\Users\mmdsk\Desktop\support\support-backend
```

### 1.2 نصب Packages
```bash
npm install
```

این کار 1-2 دقیقه طول می‌کشد...

### 1.3 تنظیم رمز عبور دیتابیس
فایل `.env` را باز کنید و رمز عبور PostgreSQL خود را وارد کنید:

```env
DB_PASSWORD=your_postgres_password_here
```

**نکته:** اگر در نصب PostgreSQL رمز عبور تنظیم نکردید، معمولاً `postgres` است.

### 1.4 ایجاد و راه‌اندازی دیتابیس (یک دستور!)
```bash
npm run db:setup
```

این دستور:
- ✅ دیتابیس `support_db` را ایجاد می‌کند
- ✅ جداول را می‌سازد
- ✅ داده‌های اولیه را وارد می‌کند
- ✅ کاربران تست را ایجاد می‌کند

### 1.5 راه‌اندازی سرور Backend
```bash
npm run dev
```

اگر این پیام را دیدید، موفق بودید! ✅
```
✅ Connected to PostgreSQL database
🚀 Server running in development mode
🔗 Server URL: http://localhost:5000
```

**Backend آماده است!** این ترمینال را باز نگه دارید.

---

## 🎨 مرحله 2: آماده‌سازی Frontend

### 2.1 باز کردن ترمینال جدید
یک ترمینال جدید باز کنید (ترمینال قبلی را نبندید!)

### 2.2 رفتن به پوشه Frontend
```bash
cd c:\Users\mmdsk\Desktop\support\support-app
```

### 2.3 نصب Packages
```bash
npm install
```

### 2.4 راه‌اندازی Frontend
```bash
npm run dev
```

اگر این پیام را دیدید، موفق بودید! ✅
```
  VITE v7.x.x  ready in xxx ms

  ➜  Local:   http://localhost:5173/
```

---

## 🎉 مرحله 3: تست سیستم

### 3.1 باز کردن مرورگر
مرورگر خود را باز کنید و به این آدرس بروید:
```
http://localhost:5173/login
```

### 3.2 ورود با کاربر تست

دو کاربر آماده است:

#### 🔐 ادمین (مدیر سیستم)
- **ایمیل:** `admin@hesaban.com`
- **رمز عبور:** `password123`
- **دسترسی:** داشبورد مدیریتی کامل

#### 👤 کاربر عادی
- **ایمیل:** `ali@example.com`
- **رمز عبور:** `password123`
- **دسترسی:** پنل کاربری (ثبت و مشاهده تیکت)

**نکته:** در صفحه لاگین، روی دکمه‌های آبی رنگ کلیک کنید تا اطلاعات خودکار پر شود!

---

## 🐛 عیب‌یابی

### مشکل: دیتابیس متصل نمی‌شود

**راه حل 1:** مطمئن شوید PostgreSQL در حال اجرا است
- Windows: سرویس PostgreSQL را از Services چک کنید
- Mac/Linux: `sudo service postgresql status`

**راه حل 2:** رمز عبور را چک کنید
- فایل `.env` در پوشه `support-backend` را باز کنید
- مطمئن شوید `DB_PASSWORD` صحیح است

**راه حل 3:** دوباره دیتابیس را ایجاد کنید
```bash
cd support-backend
npm run db:create
npm run db:migrate
```

### مشکل: Backend Error می‌دهد

```bash
# پاک کردن و نصب مجدد
cd support-backend
rm -rf node_modules
npm install
npm run db:setup
npm run dev
```

### مشکل: Frontend به Backend متصل نمی‌شود

1. مطمئن شوید Backend در حال اجرا است (ترمینال اول)
2. آدرس را چک کنید: `http://localhost:5000`
3. فایل `.env` در `support-app` را چک کنید:
   ```env
   VITE_API_URL=http://localhost:5000/api
   ```

### مشکل: Port 5000 یا 5173 استفاده شده

**Backend (Port 5000):**
```bash
# فایل .env را ویرایش کنید
PORT=5001
```

**Frontend (Port 5173):**
```bash
# Vite به صورت خودکار port دیگری پیدا می‌کند
```

---

## 📚 مستندات کامل

برای اطلاعات بیشتر، فایل `README.md` را مطالعه کنید.

---

## 🎯 خلاصه دستورات

### Backend
```bash
cd support-backend
npm install
npm run db:setup    # فقط بار اول
npm run dev
```

### Frontend
```bash
cd support-app
npm install
npm run dev
```

### کاربران تست
- ادمین: `admin@hesaban.com` / `password123`
- کاربر: `ali@example.com` / `password123`

---

## ✅ چک لیست راه‌اندازی

- [ ] Node.js نصب شده
- [ ] PostgreSQL نصب شده
- [ ] Backend packages نصب شد
- [ ] رمز دیتابیس در `.env` تنظیم شد
- [ ] دیتابیس ایجاد شد (`npm run db:setup`)
- [ ] Backend اجرا شد (`npm run dev`)
- [ ] Frontend packages نصب شد
- [ ] Frontend اجرا شد (`npm run dev`)
- [ ] لاگین تست شد ✅

---

**🎉 موفق باشید!**

اگر مشکلی پیش آمد، از بخش عیب‌یابی استفاده کنید یا Issue ایجاد کنید.
