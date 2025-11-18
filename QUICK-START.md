# راهنمای سریع - نصب با Docker

## دستورات سریع نصب

### 1. تنظیمات امنیتی (اجباری!)
قبل از اجرا حتماً این کارها را انجام دهید:

**ویرایش `docker-compose.yml`:**
```yaml
# خط 11: رمز عبور دیتابیس را تغییر دهید
POSTGRES_PASSWORD: رمز-قوی-خود

# خط 40: همان رمز عبور را وارد کنید
- DB_PASSWORD=همان-رمز-بالا

# خط 41: کلید مخفی JWT را تغییر دهید
- JWT_SECRET=کلید-مخفی-تصادفی-و-قوی
```

### 2. اجرا در سرور
```bash
# رفتن به پوشه پروژه
cd /path/to/support

# ساخت و اجرای کانتینرها
docker-compose up --build -d

# مشاهده وضعیت
docker-compose ps

# مشاهده لاگ‌ها
docker-compose logs -f
```

### 3. دسترسی به سیستم
- **آدرس فرانت**: http://SERVER_IP:3000
- **آدرس API**: http://SERVER_IP:2400/api

### 4. ورود اولیه
- **نام کاربری**: admin
- **رمز عبور**: password123

---

## دستورات مفید

```bash
# توقف سرویس‌ها
docker-compose down

# Restart همه
docker-compose restart

# مشاهده لاگ سرویس خاص
docker-compose logs -f support-backend

# پشتیبان‌گیری از دیتابیس
docker exec support-postgres pg_dump -U postgres support_db > backup.sql

# بازیابی پشتیبان
cat backup.sql | docker exec -i support-postgres psql -U postgres support_db
```

---

## نکات مهم

✅ **Restart خودکار**: همه سرویس‌ها با `restart: always` پیکربندی شده‌اند
✅ **داده‌های پایدار**: دیتابیس در volume ذخیره می‌شود و با restart از بین نمی‌رود
✅ **Health Check**: سیستم سلامت سرویس‌ها را چک می‌کند
✅ **Migration خودکار**: هر بار که backend start می‌شود، migration اجرا می‌شود

---

## عیب‌یابی سریع

اگر سیستم کار نکرد:

```bash
# 1. بررسی لاگ‌ها
docker-compose logs

# 2. Restart کردن
docker-compose restart

# 3. Build مجدد
docker-compose down
docker-compose up --build -d

# 4. بررسی فضای دیسک
docker system df
docker system prune -a  # حذف imageهای قدیمی
```

---

## تغییر پورت‌ها

اگر پورت‌های پیش‌فرض در دسترس نیستند، در `docker-compose.yml` تغییر دهید:

```yaml
ports:
  - "پورت-جدید:پورت-داخلی"

# مثال:
  - "8080:80"      # frontend
  - "5001:2400"    # backend
  - "5433:5432"    # postgres
```

---

برای اطلاعات بیشتر `DEPLOYMENT.md` را مطالعه کنید.
