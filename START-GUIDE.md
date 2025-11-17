# راهنمای اجرای پروژه

## روش ۱: اجرای Development (توصیه شده برای توسعه)

### اولین بار:
```bash
# نصب تمام وابستگی‌ها (فرانت، بک و روت)
npm run install:all
```

### اجرای همزمان فرانت و بک:
```bash
# اجرای هر دو با یک دستور
npm run dev
```

این دستور هم فرانت‌اند (روی پورت 5173) و هم بک‌اند (روی پورت 5000) رو همزمان اجرا می‌کنه.

### دستورات جداگانه:
```bash
# فقط فرانت‌اند
npm run dev:frontend

# فقط بک‌اند
npm run dev:backend
```

---

## روش ۲: اجرای با Docker (برای Production)

### اجرای کامل:
```bash
# ساخت و اجرای کانتینرها
npm run docker:up
# یا
docker-compose up -d
```

### مشاهده لاگ‌ها:
```bash
npm run docker:logs
```

### متوقف کردن:
```bash
npm run docker:down
```

---

## پورت‌های پیش‌فرض:

### Development Mode:
- **فرانت‌اند:** http://localhost:5173
- **بک‌اند:** http://localhost:5000

### Docker Mode:
- **فرانت‌اند:** http://localhost:3000
- **بک‌اند:** http://localhost:5000

---

## نکات مهم:

1. برای development از `npm run dev` استفاده کنید (سریع‌تر و راحت‌تر)
2. برای production از Docker استفاده کنید
3. مطمئن شوید که PostgreSQL در حال اجراست (برای Docker خودکار است)
4. برای اولین بار حتماً `npm run install:all` را اجرا کنید
