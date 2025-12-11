<p align="center">
  <img src="https://img.shields.io/badge/WordPress-Plugin-0073aa?logo=wordpress&logoColor=white" alt="WordPress Plugin">
  <img src="https://img.shields.io/badge/PHP-%3E%3D%207.4-777bb3?logo=php&logoColor=white" alt="PHP >= 7.4">
  <img src="https://img.shields.io/badge/Version-1.0.3-green" alt="Version 1.0.3">
  <img src="https://img.shields.io/badge/Language-fa--IR-orange" alt="Language fa-IR">
  <a href="https://github.com/USERNAME/landing-ads/blob/main/LICENSE">
    <img src="https://img.shields.io/badge/License-GPLv2%2B-blue" alt="License GPLv2+">
  </a>
  <a href="https://github.com/USERNAME/landing-ads/stargazers">
    <img src="https://img.shields.io/github/stars/USERNAME/landing-ads?style=social" alt="GitHub Stars">
  </a>
</p>

<h1 align="center">افزونه «تبلیغ لندینگ» (Landing Ads)</h1>

<p align="center">
  شورت‌کد سبک برای معرفی برگه‌ها و نوشته‌های داخلی در لندینگ‌پیج‌ها با کارت‌های مینیمال و اسلایدر موبایل.
</p>


# افزونه «تبلیغ لندینگ» (Landing Ads)

افزونه وردپرس برای معرفی برگه‌ها و نوشته‌های داخلی با شورت‌کد و دکمه اختصاصی در ادیتور کلاسیک.

- شرکت برنامه‌نویسی آرتیاش: https://artiash.com
- توسعه‌دهنده: حسین سلیم پور (Hossein Salim Pour)

## نصب
- پوشه‌ی افزونه را در `wp-content/plugins/landing-ads` قرار دهید.
- در پیشخوان وردپرس، افزونه را فعال کنید.

## استفاده سریع
- شورت‌کد پایه:  
  `[landing_ads]`
- با انتخاب ID برگه/نوشته:  
  `[landing_ads pages="12,34,56"]`
- گزینه‌ها:
  - `pages`: لیست ID برگه/نوشته جداشده با کاما (ترتیب حفظ می‌شود).
  - `count`: تعداد آیتم وقتی `pages` خالی است (پیش‌فرض از تنظیمات).
  - `title_color`: رنگ عنوان (مثلاً `#111111`).
  - `title_size`: اندازه عنوان (مثلاً `18px`).
  - `target`: `_self` یا `_blank`.

## دکمه ادیتور
- در ادیتور کلاسیک دکمه «افزودن کد کوتاه لندینگ» وجود دارد.
- دو کادر جستجو: «جستجو برگه‌ها» و «جستجو نوشته‌ها»؛ موارد انتخابی لینک شده و IDها در شورت‌کد درج می‌شوند.

## تنظیمات
- مسیر: تنظیمات → «تبلیغ لندینگ».
- قابل تنظیم: رنگ عنوان، اندازه عنوان، تارگت لینک، تعداد پیش‌فرض.

## فرانت‌اند
- کارت مینیمال با تصویر شاخص (بدون کراپ، `object-fit: contain`).
- موبایل: اسلایدر با دکمه قبلی/بعدی وقتی بیش از یک کارت وجود داشته باشد.

## تغییرات نسخه
- 1.0.3: پشتیبانی نمایش همزمان برگه و نوشته هنگام استفاده از `pages`، افزایش نسخه دارایی‌ها.
- 1.0.2: جستجوی مجزا برگه/نوشته، لینک نتایج، اسلایدر موبایل، نمایش کامل‌تر تصویر.
- 1.0.1: ثبت نویسنده/لینک آرتیاش، افزایش نسخه.
- 1.0.0: انتشار اولیه با شورت‌کد، تنظیمات و دکمه ادیتور.

## نکات
- برای نمایش تصویر، برای برگه/نوشته تصویر شاخص تنظیم کنید.
- اگر از گوتنبرگ استفاده می‌کنید، بلوک «کد کوتاه» را اضافه کرده و شورت‌کد را وارد کنید (دکمه اختصاصی برای ادیتور کلاسیک است).
