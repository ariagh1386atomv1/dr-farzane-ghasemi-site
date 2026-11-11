/* ==========================================================================
   Catalog of Built Elementor / WoodMart Sections & Templates
   Each new section built in this project is registered here for 1-click download.
   ========================================================================== */

window.STUDIO_DEFAULT_WORKER_URL =
  window.STUDIO_DEFAULT_WORKER_URL ||
  "https://raspy-butterfly-bd83.warm-orchard-3899.workers.dev";

window.STUDIO_CATEGORIES = [
  { id: "all", label: "همه بخش‌ها" },
  { id: "layout", label: "سربرگ و پابرگ" },
  { id: "home", label: "صفحه اصلی" },
  { id: "shop", label: "فروشگاه و ووکامرس" },
  { id: "pages", label: "صفحات داخلی" },
  { id: "code", label: "کد و افزونه مکمل" },
];

window.STUDIO_CATALOG = [
  {
    id: "01-header",
    step: "بخش ۰۱",
    category: "layout",
    categoryLabel: "سربرگ و پابرگ",
    title: "هدر اختصاصی داروخانه آنلاین دکتر فرزانه قاسمی",
    description:
      "هدر سه‌لایه و چسبان (Sticky) طراحی‌شده ۱۰۰٪ با کانتینرها و ویجت‌های بومی المنتور و المنتور پرو — بدون حتی یک خط کد یا Custom CSS. شامل نوار پشتیبانی بالا، لوگوی داینامیک، فرم جستجو، دکمه حساب کاربری و علاقه‌مندی، سبد خرید کشویی ووکامرس و ۴ جایگاه فهرست وردپرس (نوار بالا، دسته‌بندی‌ها، منوی اصلی و منوی همبرگری موبایل).",
    fileName: "01-header-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/01-header-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۴۳ کیلوبایت",
    noCode: true,
    target: "المنتور پرو ← پوسته‌ساز (Theme Builder) ← سربرگ (Header)",
    widgets: [
      "Site Logo",
      "۴× فهرست وردپرس (Nav Menu)",
      "فرم جستجو",
      "سبد خرید کشویی (Menu Cart)",
      "Flexbox Container ریسپانسیو",
    ],
    guideSteps: [
      {
        title: "فعال بودن کانتینر در المنتور",
        desc: "از پیشخوان وردپرس به «المنتور ← تنظیمات ← ویژگی‌ها (Features)» بروید و مطمئن شوید گزینه Flexbox Container فعال (Active) باشد.",
      },
      {
        title: "درون‌ریزی فایل JSON در پوسته‌ساز",
        desc: "وارد «قالب‌ها (Templates) ← پوسته‌ساز (Theme Builder) ← سربرگ (Header)» شوید، روی دکمه «درون‌ریزی قالب‌ها (Import Templates)» در بالای صفحه کلیک کنید و فایل 01-header-dr-farzane-ghasemi.json را آپلود کنید.",
      },
      {
        title: "انتخاب فهرست‌های سایت خودتان",
        desc: "در ویرایشگر المنتور، پنل «ساختار (Structure)» را باز کنید. تمام لایه‌ها نام فارسی دارند؛ روی ۴ ویجت فهرست (نوار بالا، دسته‌بندی محصولات، منوی اصلی و منوی موبایل) کلیک کنید و فهرست دلخواهتان را از لیست کشویی انتخاب کنید.",
      },
      {
        title: "انتشار روی کل سایت (سازگاری با وودمارت)",
        desc: "روی دکمه «انتشار (Publish)» کلیک کنید، شرط نمایش (Add Condition) را روی «کل سایت (Entire Site)» بگذارید و ذخیره کنید تا جایگزین هدر پیش‌فرض وودمارت شود.",
      },
    ],
    guideTip:
      "نکته مخصوص قالب وودمارت: برای فعال‌سازی نوار پایین موبایل (خانه، فروشگاه، تخفیف‌ها، علاقه‌مندی، حساب من) بدون هیچ کدی به «تنظیمات قالب وودمارت ← عمومی ← نوار پایین موبایل (Mobile bottom navbar)» بروید و آن را روشن کنید.",
    renderPreview: function () {
      return `
        <div class="prv-header-wrap">
          <div class="prv-topstrip">
            <div class="prv-topstrip__group">
              <span class="prv-topstrip__item">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="#5FD4B0" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72c.127.96.361 1.903.7 2.81a2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
                <span class="num">پشتیبانی و مشاوره دارویی: ۰۲۱-۰۰۰۰۰۰۰۰</span>
              </span>
              <span class="prv-topstrip__item" style="color:#94a3b8">شرایط ارسال سریع کشوری</span>
              <span class="prv-topstrip__item" style="color:#94a3b8">سؤالات متداول</span>
            </div>
            <div class="prv-topstrip__group" style="color:#cbd5e1">
              <span>پیگیری سفارش</span>
              <span>مجله سلامت</span>
              <span>درباره داروخانه</span>
            </div>
          </div>

          <div class="prv-mainbar">
            <span class="prv-burger" aria-hidden="true">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="4" y1="17" x2="20" y2="17"/></svg>
            </span>

            <div class="prv-logo">
              <span class="prv-logo__fa">داروخانه <em>دکتر قاسمی</em><span class="prv-logo__dot"></span></span>
              <span class="prv-logo__en">DR. FARZANE GHASEMI</span>
            </div>

            <div class="prv-search">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#9AABBB" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-inline-start:8px;flex-shrink:0"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              <span class="prv-search__text">نام محصول، برند، مکمل یا کاربرد موردنظر را جستجو کنید...</span>
              <span class="prv-search__btn">جستجو</span>
            </div>

            <div class="prv-actions">
              <span class="prv-btn-outline">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                ورود | ثبت‌نام
              </span>
              <span class="prv-btn-icon">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              <span class="prv-btn-cart">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/></svg>
                <span class="prv-cart-price num">۱,۴۸۰,۰۰۰ تومان</span>
                <span class="prv-cart-badge">۲</span>
              </span>
            </div>
          </div>

          <div class="prv-navbar">
            <span class="prv-cat-pill">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/></svg>
              دسته‌بندی محصولات
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><polyline points="6 9 12 15 18 9"/></svg>
            </span>
            <div class="prv-navlinks">
              <span>پرفروش‌ترین‌ها</span>
              <span>جدیدترین‌ها</span>
              <span>برندها</span>
              <span>تجهیزات پزشکی</span>
              <span>مجله سلامت</span>
            </div>
            <div style="display:flex;align-items:center;gap:10px">
              <span class="prv-sale-pill">
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.5-2-1-3-1.072-2.143-.224-4.054 2-6 .5 2.5 2 4.9 4 6.5 2 1.6 3 3.5 3 5.5a7 7 0 1 1-14 0c0-1.153.433-2.294 1-3a2.5 2.5 0 0 0 2.5 2.5z"/></svg>
                تخفیف‌ها و پیشنهاد ویژه
              </span>
              <span style="color:#64798e;font-size:12px">تماس با ما</span>
            </div>
          </div>

          <div class="prv-page-hint">
            <div class="prv-skeleton-hero">محل قرارگیری سکشن‌های بدنه صفحه (زیر هدر چسبان)</div>
            <div class="prv-skeleton-side"></div>
          </div>
        </div>
      `;
    },
  },
];
