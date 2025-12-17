# تنظیمات متغیرهای محیطی لیارا - خلاصه سریع

این فایل شامل تمام متغیرهای محیطی است که باید در پنل لیارا تنظیم شوند.

## 🔧 تنظیمات بک‌اند (tender-mendel-6y7weckrv)

در پنل لیارا → اپلیکیشن بک‌اند → Environment Variables → اضافه کنید:

### متغیرهای دیتابیس
```
DB_HOST=adina
DB_PORT=5432
DB_NAME=postgres
DB_USER=root
DB_PASSWORD=81lW3Mnd1PHTwdZPH7HWUaVT
```

### متغیرهای امنیتی
```
JWT_SECRET=<یک رشته تصادفی امن - مثلاً از openssl rand -base64 32 استفاده کنید>
JWT_EXPIRE=7d
NODE_ENV=production
```

### متغیرهای CORS
```
CORS_ORIGIN=https://support-front.liara.run,https://adinaticket.ir
```

### متغیرهای دیگر
```
PORT=3000
```

---

## 🎨 تنظیمات فرانت‌اند (support-front)

در پنل لیارا → اپلیکیشن فرانت‌اند → Environment Variables → اضافه کنید:

```
VITE_API_URL=https://tender-mendel-6y7weckrv.liara.run/api
```

---

## 📝 نکات مهم

1. **JWT_SECRET**: یک رشته تصادفی و امن انتخاب کنید. می‌توانید از دستور زیر استفاده کنید:
   ```bash
   openssl rand -base64 32
   ```

2. **دامنه adinaticket.ir**: این دامنه برای فرانت‌اند تنظیم شده است (DNS زده شده). کاربران می‌توانند از این آدرس به سایت دسترسی داشته باشند.

3. **بعد از تنظیم متغیرها**: حتماً هر دو اپلیکیشن را دوباره deploy کنید:
   ```bash
   cd support-backend && liara deploy
   cd support-app && liara deploy
   ```

4. **Migration**: بعد از deploy موفق بک‌اند، از Console لیارا migration را اجرا کنید:
   ```bash
   npm run db:migrate
   ```

---

## ✅ بررسی نهایی

بعد از deploy:

1. **بک‌اند**: https://tender-mendel-6y7weckrv.liara.run/health
2. **فرانت**: https://adinaticket.ir یا https://support-front.liara.run
3. **اتصال**: Developer Tools → Network → بررسی کنید که درخواست‌ها به بک‌اند ارسال می‌شوند

