# راهنمای استقرار روی لیارا

این فایل راهنمای کامل تنظیمات برای استقرار پروژه روی لیارا است.

## 📋 اطلاعات اپلیکیشن‌ها

- **فرانت‌اند**: `support-front` → https://support-front.liara.run | **https://adinaticket.ir** (دامنه اختصاصی)
- **بک‌اند**: `tender-mendel-6y7weckrv` → https://tender-mendel-6y7weckrv.liara.run

## 🔧 تنظیمات متغیرهای محیطی در لیارا

### 1️⃣ تنظیمات بک‌اند (Backend)

در پنل لیارا برای اپلیکیشن بک‌اند (`tender-mendel-6y7weckrv`)، متغیرهای زیر را اضافه کنید:

#### متغیرهای دیتابیس

```
DB_HOST=adina
DB_PORT=5432
DB_NAME=postgres
DB_USER=root
DB_PASSWORD=81lW3Mnd1PHTwdZPH7HWUaVT
```

**نکته**: این اطلاعات از پنل دیتابیس لیارا گرفته شده است.

#### متغیرهای امنیتی

```
JWT_SECRET=<یک رشته تصادفی و امن برای JWT>
JWT_EXPIRE=7d
NODE_ENV=production
```

#### متغیرهای دیگر

```
PORT=3000
CORS_ORIGIN=https://support-front.liara.run,https://adinaticket.ir
```

**نکته**:

- متغیر `PORT` معمولاً توسط لیارا خودکار تنظیم می‌شود، اما می‌توانید آن را به صورت دستی هم تنظیم کنید.
- `CORS_ORIGIN` برای تنظیم دامنه‌های مجاز برای CORS است. دامنه `adinaticket.ir` برای فرانت‌اند تنظیم شده است.

---

### 2️⃣ تنظیمات فرانت‌اند (Frontend)

در پنل لیارا برای اپلیکیشن فرانت‌اند (`support-front`)، متغیر زیر را اضافه کنید:

```
VITE_API_URL=https://tender-mendel-6y7weckrv.liara.run/api
```

**نکته مهم**:

- این متغیر باید قبل از build تنظیم شود. اگر بعد از build اضافه کنید، باید دوباره deploy کنید.
- دامنه `adinaticket.ir` برای فرانت‌اند تنظیم شده است (DNS زده شده)، پس فرانت از این دامنه در دسترس است اما API به بک‌اند لیارا متصل می‌شود.

---

## 🗄️ تنظیمات دیتابیس

### ایجاد دیتابیس در لیارا

1. در پنل لیارا، به بخش **Databases** بروید
2. یک دیتابیس PostgreSQL جدید ایجاد کنید
3. اطلاعات اتصال را کپی کنید:
   - Host
   - Port
   - Database Name
   - Username
   - Password

### اجرای Migration

بعد از تنظیم متغیرهای محیطی دیتابیس، باید migration را اجرا کنید:

1. به پنل لیارا بروید
2. اپلیکیشن بک‌اند را باز کنید
3. به بخش **Logs** بروید
4. یا از **Terminal** استفاده کنید و دستور زیر را اجرا کنید:

```bash
npm run db:migrate
```

یا می‌توانید از **Console** در پنل لیارا استفاده کنید.

---

## 🚀 مراحل استقرار

### مرحله 1: تنظیم متغیرهای محیطی بک‌اند

1. وارد پنل لیارا شوید
2. اپلیکیشن بک‌اند (`tender-mendel-6y7weckrv`) را باز کنید
3. به بخش **Environment Variables** بروید
4. متغیرهای زیر را اضافه کنید:

**متغیرهای دیتابیس:**

- `DB_HOST=adina`
- `DB_PORT=5432`
- `DB_NAME=postgres`
- `DB_USER=root`
- `DB_PASSWORD=81lW3Mnd1PHTwdZPH7HWUaVT`

**متغیرهای امنیتی:**

- `JWT_SECRET` (یک رشته تصادفی امن - از `openssl rand -base64 32` استفاده کنید)
- `JWT_EXPIRE=7d`
- `NODE_ENV=production`

**متغیرهای CORS:**

- `CORS_ORIGIN=https://support-front.liara.run,https://adinaticket.ir`

### مرحله 2: تنظیم متغیرهای محیطی فرانت‌اند

1. وارد پنل لیارا شوید
2. اپلیکیشن فرانت‌اند (`support-front`) را باز کنید
3. به بخش **Environment Variables** بروید
4. متغیر زیر را اضافه کنید:
   - `VITE_API_URL=https://tender-mendel-6y7weckrv.liara.run/api`

### مرحله 3: Deploy مجدد

بعد از تنظیم متغیرهای محیطی، باید هر دو اپلیکیشن را دوباره deploy کنید:

```bash
# در پوشه support-backend
cd support-backend
liara deploy

# در پوشه support-app
cd support-app
liara deploy
```

### مرحله 4: اجرای Migration

بعد از deploy موفق بک‌اند، migration را اجرا کنید (از طریق Console یا Terminal در پنل لیارا).

---

## ✅ بررسی صحت تنظیمات

### بررسی بک‌اند

باز کنید در مرورگر:

```
https://tender-mendel-6y7weckrv.liara.run/health
```

باید پاسخ زیر را ببینید:

```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "..."
}
```

### بررسی فرانت‌اند

باز کنید در مرورگر:

```
https://adinaticket.ir
```

یا:

```
https://support-front.liara.run
```

باید صفحه لاگین نمایش داده شود.

### بررسی اتصال فرانت به بک

1. صفحه لاگین را باز کنید
2. Developer Tools (F12) را باز کنید
3. به تب **Network** بروید
4. سعی کنید لاگین کنید
5. باید درخواست‌های API به `https://tender-mendel-6y7weckrv.liara.run/api` یا `https://adinaticket.ir/api` ارسال شوند

---

## 🔍 عیب‌یابی

### مشکل: فرانت به بک وصل نمی‌شود

**راه‌حل**:

1. بررسی کنید که `VITE_API_URL` در فرانت‌اند درست تنظیم شده باشد
2. بررسی کنید که بک‌اند در حال اجرا است (از طریق `/health`)
3. بررسی کنید که CORS در بک‌اند فعال است (در حال حاضر `origin: '*'` است)

### مشکل: خطای اتصال به دیتابیس

**راه‌حل**:

1. بررسی کنید که تمام متغیرهای دیتابیس درست تنظیم شده باشند
2. بررسی کنید که دیتابیس در لیارا در حال اجرا است
3. بررسی کنید که IP اپلیکیشن در whitelist دیتابیس قرار دارد (در لیارا معمولاً خودکار است)

### مشکل: خطای JWT

**راه‌حل**:

1. بررسی کنید که `JWT_SECRET` تنظیم شده باشد
2. بررسی کنید که `JWT_SECRET` یک رشته امن و تصادفی است

---

## 📝 نکات مهم

1. **متغیرهای محیطی**: همیشه قبل از deploy، متغیرهای محیطی را تنظیم کنید
2. **Migration**: بعد از اولین deploy بک‌اند، حتماً migration را اجرا کنید
3. **JWT_SECRET**: یک رشته امن و تصادفی انتخاب کنید (مثلاً از `openssl rand -base64 32` استفاده کنید)
4. **CORS**: در حال حاضر CORS برای همه دامنه‌ها باز است (`origin: '*'`). برای امنیت بیشتر می‌توانید فقط دامنه فرانت‌اند را مجاز کنید.

---

## 🔐 امنیت

برای امنیت بیشتر، CORS به صورت خودکار محدود شده است. در `support-backend/src/server.js` تنظیمات CORS به صورت زیر است:

```javascript
const corsOptions = {
  origin: process.env.CORS_ORIGIN
    ? process.env.CORS_ORIGIN.split(",")
    : [
        "https://support-front.liara.run",
        "https://adinaticket.ir",
        "http://localhost:5173",
      ],
  credentials: true,
  optionsSuccessStatus: 200,
};
```

و در متغیرهای محیطی بک‌اند می‌توانید دامنه‌های مجاز را مشخص کنید:

```
CORS_ORIGIN=https://support-front.liara.run,https://adinaticket.ir
```
