# دستورالعمل نصب و اجرای سیستم پشتیبانی با Docker

## پیش‌نیازها
- Docker و Docker Compose نصب شده باشند
- پورت‌های 2400 (Backend)، 3000 (Frontend)، و 5432 (PostgreSQL) آزاد باشند

## مراحل نصب و راه‌اندازی

### 1. کلون کردن یا کپی پروژه
```bash
cd /path/to/support
```

### 2. تنظیمات امنیتی (مهم!)
قبل از اجرا در production، حتماً این تنظیمات را انجام دهید:

**ویرایش فایل `docker-compose.yml`:**
```yaml
# در بخش postgres:
environment:
  POSTGRES_PASSWORD: رمز-عبور-قوی-خود  # تغییر دهید!

# در بخش support-backend:
environment:
  - DB_PASSWORD=همان-رمز-عبور-بالا  # تغییر دهید!
  - JWT_SECRET=کلید-مخفی-قوی-و-تصادفی  # تغییر دهید!
```

### 3. ساخت و اجرای کانتینرها
```bash
# ساخت و اجرای همه سرویس‌ها
docker-compose up --build -d

# مشاهده لاگ‌ها
docker-compose logs -f

# مشاهده لاگ سرویس خاص
docker-compose logs -f support-backend
```

### 4. بررسی وضعیت سرویس‌ها
```bash
# لیست کانتینرها
docker-compose ps

# بررسی سلامت سرویس‌ها
docker ps
```

### 5. دسترسی به برنامه
- **Frontend**: http://localhost:7500
- **Backend API**: http://localhost:2400/api
- **PostgreSQL**: localhost:5432

### 6. اطلاعات ورود پیش‌فرض
- **نام کاربری**: admin
- **رمز عبور**: password123

## دستورات مفید Docker

### توقف و حذف کانتینرها
```bash
# توقف همه سرویس‌ها
docker-compose down

# توقف و حذف volumeها (حذف دیتابیس!)
docker-compose down -v
```

### Restart کردن سرویس‌ها
```bash
# Restart همه
docker-compose restart

# Restart سرویس خاص
docker-compose restart support-backend
```

### مشاهده لاگ‌ها
```bash
# همه لاگ‌ها
docker-compose logs -f

# لاگ سرویس خاص
docker-compose logs -f postgres
```

### اجرای دستور در کانتینر
```bash
# ورود به shell کانتینر
docker exec -it support-backend sh

# اجرای migration دستی
docker exec -it support-backend npm run db:migrate
```

## پشتیبان‌گیری از دیتابیس

### ایجاد پشتیبان
```bash
docker exec support-postgres pg_dump -U postgres support_db > backup.sql
```

### بازیابی پشتیبان
```bash
cat backup.sql | docker exec -i support-postgres psql -U postgres support_db
```

## به‌روزرسانی برنامه

### روش 1: با حفظ دیتابیس
```bash
# Pull آخرین تغییرات
git pull

# Build و restart
docker-compose up --build -d
```

### روش 2: بدون حفظ دیتابیس (نصب جدید)
```bash
# حذف همه
docker-compose down -v

# ساخت و اجرای جدید
docker-compose up --build -d
```

## عیب‌یابی

### مشکل در اتصال به دیتابیس
```bash
# بررسی لاگ PostgreSQL
docker-compose logs postgres

# بررسی لاگ Backend
docker-compose logs support-backend
```

### مشکل در build کردن
```bash
# پاک کردن cache و build مجدد
docker-compose build --no-cache
docker-compose up -d
```

### مشکل در فضای دیسک
```bash
# پاک کردن imageهای استفاده نشده
docker system prune -a

# پاک کردن volumeهای استفاده نشده
docker volume prune
```

## نکات امنیتی

1. ✅ حتماً رمزهای پیش‌فرض را تغییر دهید
2. ✅ از JWT_SECRET قوی استفاده کنید
3. ✅ در production از HTTPS استفاده کنید
4. ✅ به‌طور منظم از دیتابیس backup بگیرید
5. ✅ لاگ‌ها را مانیتور کنید

## استفاده در Production با Nginx Reverse Proxy

اگر می‌خواهید از Nginx به عنوان reverse proxy استفاده کنید:

```nginx
server {
    listen 80;
    server_name your-domain.com;

    # Frontend
    location / {
        proxy_pass http://localhost:7500;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    # Backend API
    location /api {
        proxy_pass http://localhost:2400;
        proxy_http_version 1.1;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header Host $host;
    }
}
```

## استفاده در Production با Domain اصلی

اگر می‌خواهید روی دامنه اصلی استفاده کنید، docker-compose.yml را ویرایش کنید:

```yaml
support-app:
  build:
    context: ./support-app
    args:
      - VITE_API_URL=https://your-domain.com/api  # تغییر دهید
```

## مانیتورینگ

### مشاهده استفاده از منابع
```bash
docker stats
```

### بررسی Health Check
```bash
# Backend health
curl http://localhost:2400/api/health

# Database health
docker exec support-postgres pg_isready -U postgres
```

## سوالات متداول

**Q: چگونه رمز عبور admin را تغییر دهم؟**
A: پس از ورود به سیستم، از بخش تنظیمات پروفایل رمز عبور را تغییر دهید.

**Q: چگونه کاربر جدید اضافه کنم؟**
A: از پنل admin بخش مدیریت کاربران استفاده کنید.

**Q: آیا می‌توانم پورت‌ها را تغییر دهم؟**
A: بله، در فایل `docker-compose.yml` بخش `ports` را ویرایش کنید.

## پشتیبانی

برای گزارش مشکلات یا سوالات، لطفاً یک Issue در GitHub ایجاد کنید.
