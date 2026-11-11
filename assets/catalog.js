/* ==========================================================================
   Catalog of Built Elementor / WoodMart Sections & Templates
   Each new section built in this project is registered here for 1-click download.
   ========================================================================== */

window.STUDIO_DEFAULT_WORKER_URL =
  window.STUDIO_DEFAULT_WORKER_URL ||
  "https://dr-farzane-ghasemi-site.pages.dev";

window.STUDIO_CATEGORIES = [
  { id: "all", label: "همه بخش‌ها" },
  { id: "layout", label: "سربرگ و فهرست‌ها" },
  { id: "home", label: "صفحه اصلی" },
  { id: "shop", label: "فروشگاه و آرشیو محصولات" },
  { id: "data", label: "محصولات دمو و درون‌ریزی" },
  { id: "pages", label: "صفحات داخلی" },
];

/* Helper to render authentic Darunik supplement product cards inside previews */
function renderDarunikSampleCard(p) {
  const jarThemes = {
    white: {
      body: "#ffffff",
      stroke: "#dce5ec",
      cap: "#e9eff4",
      accent: "#47b881",
      labelColor: "#14212e",
      subColor: "#64798e",
    },
    black: {
      body: "#18222c",
      stroke: "#0f171e",
      cap: "#0d141b",
      accent: "#16b38b",
      labelColor: "#ffffff",
      subColor: "#89e2cb",
    },
    silver: {
      body: "#cfd8e0",
      stroke: "#b5c2cd",
      cap: "#a8b5c2",
      accent: "#298a8c",
      labelColor: "#14212e",
      subColor: "#35485c",
    },
  };
  const t = jarThemes[p.jar] || jarThemes.white;

  return `
    <div class="prv-dk-card ${p.hovered ? "is-hovered" : ""}">
      <div class="prv-dk-card__imgbox">
        <div class="prv-dk-badges">
          ${p.off ? `<span class="prv-dk-badge-sale num">${p.off}٪</span>` : ""}
          ${p.best ? `<span class="prv-dk-badge-best">پرفروش</span>` : ""}
        </div>

        <div class="prv-dk-qactions">
          <span class="prv-dk-qbtn" title="افزودن به علاقه‌مندی">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
          </span>
          <span class="prv-dk-qbtn" title="مقایسه محصول">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="16 3 21 3 21 8"/><line x1="4" y1="20" x2="21" y2="3"/><polyline points="21 16 21 21 16 21"/><line x1="15" y1="15" x2="21" y2="21"/></svg>
          </span>
        </div>

        <svg width="96" height="112" viewBox="0 0 96 112" fill="none" aria-hidden="true">
          <ellipse cx="48" cy="103" rx="30" ry="5" fill="rgba(20,33,46,0.10)"/>
          <rect x="26" y="10" width="44" height="12" rx="4" fill="${t.cap}" stroke="${t.stroke}" stroke-width="1.2"/>
          <rect x="18" y="22" width="60" height="78" rx="12" fill="${t.body}" stroke="${t.stroke}" stroke-width="1.4"/>
          <rect x="18" y="38" width="60" height="44" fill="${t.body}"/>
          <rect x="18" y="37" width="60" height="2.5" fill="${t.accent}"/>
          <rect x="18" y="80" width="60" height="2.5" fill="${t.accent}"/>
          <text x="48" y="56" text-anchor="middle" font-family="system-ui,sans-serif" font-size="10" font-weight="800" fill="${t.labelColor}">${p.enTitle}</text>
          <text x="48" y="68" text-anchor="middle" font-family="system-ui,sans-serif" font-size="6.8" font-weight="700" fill="${t.subColor}">${p.enSub}</text>
        </svg>
      </div>

      <div class="prv-dk-brand">${p.brand}</div>
      <div class="prv-dk-title">${p.title}</div>
      <div class="prv-dk-rating">
        <span class="prv-dk-stars">★★★★★</span>
        <span class="prv-dk-score num">${p.rating}</span>
        <span class="prv-dk-reviews num">(${p.reviews})</span>
      </div>

      <div class="prv-dk-foot">
        <span class="prv-dk-plus" aria-hidden="true">+</span>
        <div class="prv-dk-price">
          ${p.oldPrice ? `<span class="prv-dk-old num">${p.oldPrice}</span>` : ""}
          <span>
            <span class="prv-dk-cur num">${p.price}</span>
            <span class="prv-dk-toman">تومان</span>
          </span>
        </div>
      </div>
    </div>
  `;
}

const SAMPLE_SPORTS_PRODUCTS = [
  {
    hovered: true,
    off: "۱۹",
    best: true,
    jar: "white",
    enTitle: "CREATINE",
    enSub: "MONOHYDRATE",
    brand: "نوتری‌لایف",
    title: "کراتین مونوهیدرات نوتری‌لایف ۳۰۰ گرم",
    rating: "۴.۹",
    reviews: "۵۰۸",
    oldPrice: "۱,۴۵۰,۰۰۰",
    price: "۱,۱۸۰,۰۰۰",
  },
  {
    hovered: false,
    off: "۱۹",
    best: true,
    jar: "black",
    enTitle: "WHEY",
    enSub: "PROTEIN 2KG",
    brand: "نوتری‌لایف",
    title: "پروتئین وی نوتری‌لایف ۲ کیلوگرم",
    rating: "۴.۸",
    reviews: "۴۱۲",
    oldPrice: "۴,۲۹۰,۰۰۰",
    price: "۳,۴۸۰,۰۰۰",
  },
  {
    hovered: false,
    off: "۱۱",
    best: false,
    jar: "black",
    enTitle: "ISOLATE",
    enSub: "PUREFIT 1.8KG",
    brand: "پیورفیت",
    title: "پروتئین ایزوله پیورفیت ۱.۸ کیلوگرم",
    rating: "۴.۷",
    reviews: "۲۲۶",
    oldPrice: "۵,۲۰۰,۰۰۰",
    price: "۴,۶۵۰,۰۰۰",
  },
  {
    hovered: false,
    off: "۱۶",
    best: true,
    jar: "silver",
    enTitle: "BCAA",
    enSub: "AMINO ACIDS",
    brand: "پیورفیت",
    title: "بی‌سی‌ای‌ای ۲:۱:۱ پیورفیت ۴۵۰ گرم",
    rating: "۴.۶",
    reviews: "۱۸۷",
    oldPrice: "۲,۳۵۰,۰۰۰",
    price: "۱,۹۸۰,۰۰۰",
  },
  {
    hovered: false,
    off: "۱۴",
    best: false,
    jar: "black",
    enTitle: "GAINER",
    enSub: "MASS 3KG",
    brand: "پیورفیت",
    title: "گینر افزایش وزن پیورفیت ۳ کیلوگرم",
    rating: "۴.۳",
    reviews: "۱۳۲",
    oldPrice: "۴,۶۰۰,۰۰۰",
    price: "۳,۹۵۰,۰۰۰",
  },
];

window.STUDIO_CATALOG = [
  {
    id: "01-header-megamenu",
    step: "بخش ۰۱",
    category: "layout",
    categoryLabel: "سربرگ و مگامنو",
    title: "هدر چسبان و مگامنوی چندستونه دارونیک (نسخه نهایی ریسپانسیو · بدون کد)",
    description:
      "نسخه یکپارچه، نهایی و ۱۰۰٪ ریسپانسیو هدر و مگامنوی داروخانه دقیقاً منطبق با تصویر مرجع دارونیک — بدون نیاز به هیچ فایل فهرست جداگانه یا یک خط کد! شامل نوار پشتیبانی تیره بالا، لوگوی داینامیک، باکس جستجوی کپسولی با دکمه سبز «جستجو»، دکمه «ورود | ثبت‌نام»، علاقه‌مندی و سبد خرید مربعی سبز، ردیف منوی افقی دقیق همراه با «تخفیف‌ها و پیشنهاد ویژه» قرمز، مگامنوی ۴ ستونه دسته‌بندی محصولات + برندهای پرطرفدار + کارت سبز هفته سلامت در دسکتاپ، و چیدمان اختصاصی تک‌خطی در تبلت و ۲ خطی همراه با منوی آکاردئونی در موبایل.",
    fileName: "01-header-megamenu-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/01-header-megamenu-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۱۵۹ کیلوبایت",
    noCode: true,
    target: "المنتور پرو ← پوسته‌ساز (Theme Builder) ← سربرگ (Header)",
    widgets: [
      "Elementor Pro Mega Menu (دسکتاپ + موبایل)",
      "۴ ستون دسته‌بندی + برندهای پرطرفدار",
      "کارت کمپین هفته سلامت",
      "Site Logo & Search Form",
      "سبد خرید مربعی ووکامرس",
    ],
    screenshots: [
      {
        label: "برد کامل همه ابعاد (PNG)",
        path: "./demo-media/screenshots/00-header-megamenu-responsive-showcase.png",
        file: "00-header-megamenu-responsive-showcase.png",
      },
      {
        label: "دسکتاپ عادی ۱۴۴۰px",
        path: "./demo-media/screenshots/01-header-desktop-1440.png",
        file: "01-header-desktop-1440.png",
      },
      {
        label: "دسکتاپ مگامنوی باز",
        path: "./demo-media/screenshots/02-header-megamenu-open-1440.png",
        file: "02-header-megamenu-open-1440.png",
      },
      {
        label: "تبلت ۷۶۸px",
        path: "./demo-media/screenshots/03-header-tablet-768.png",
        file: "03-header-tablet-768.png",
      },
      {
        label: "موبایل ۳۹۰px (بسته + باز)",
        path: "./demo-media/screenshots/04-header-mobile-390.png",
        file: "04-header-mobile-390.png",
      },
    ],
    guideSteps: [
      {
        title: "بررسی فعال بودن Menu و Nested Elements",
        desc: "در پیشخوان وردپرس به «المنتور ← تنظیمات ← ویژگی‌ها (Features)» بروید و مطمئن شوید گزینه‌های Flexbox Container، Nested Elements و Menu در وضعیت فعال (Active) قرار دارند.",
      },
      {
        title: "درون‌ریزی یک‌کلیکی فایل هدر نهایی",
        desc: "از مسیر «قالب‌ها ← پوسته‌ساز (Theme Builder) ← سربرگ (Header)» روی درون‌ریزی قالب‌ها بزنید و فایل 01-header-megamenu-dr-farzane-ghasemi.json را آپلود کنید. تمام منوهای دسکتاپ، مگامنو و منوی آکاردئونی موبایل از پیش داخل همین فایل چیده شده‌اند و نیازی به ساخت فهرست جداگانه نیست.",
      },
      {
        title: "ویرایش چشمی لینک‌ها، لوگو و شماره تماس",
        desc: "لوگوی سایت از «سفارشی‌سازی ← هویت سایت» به شکل خودکار خوانده می‌شود. برای تغییر هر لینک یا زیرشاخه مگامنو، کافی است روی ویجت «دسته‌بندی محصولات» کلیک کنید تا پنل ۴ ستونه باز شود و هر عنوان یا آدرس را مستقیم تغییر دهید.",
      },
      {
        title: "انتشار روی کل سایت (Entire Site)",
        desc: "روی دکمه «انتشار (Publish)» کلیک کرده و شرط نمایش (Add Condition) را روی «کل سایت (Entire Site)» قرار دهید تا هدر چسبان در دسکتاپ، تبلت و موبایل جایگزین هدر پیش‌فرض وودمارت شود.",
      },
    ],
    guideTip:
      "تمام ۵ اسکرین‌شات ریسپانسیو رندرشده (دسکتاپ عادی، مگامنوی باز، تبلت ۷۶۸px و موبایل ۳۹۰px) هم روی همین کارت برای بررسی و دانلود مستقیم قرار داده شده‌اند.",
    renderPreview: function () {
      return `
        <div class="prv-hdr2">
          <!-- Row 1: Dark Navy Top Strip (Desktop) -->
          <div class="prv-hdr2__top">
            <div class="prv-hdr2__top-grp">
              <span style="color:#fff;font-weight:800;display:inline-flex;align-items:center;gap:5px">
                <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor"><path d="M6.6 10.8a15.2 15.2 0 006.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1C10.6 21 3 13.4 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.2.2 2.4.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>
                <span class="num">پشتیبانی: ۰۲۱-۰۰۰۰۰۰۰۰</span>
              </span>
              <span>شرایط ارسال</span>
              <span>سؤالات متداول</span>
            </div>
            <div class="prv-hdr2__top-grp">
              <span>پیگیری سفارش</span>
              <span>مجله سلامت</span>
              <span>درباره داروخانه</span>
            </div>
          </div>

          <!-- Row 2: Sticky Middle Row -->
          <div class="prv-hdr2__mid">
            <div class="prv-hdr2__brand">
              <span class="prv-hdr2__burger" title="منوی موبایل و تبلت">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round"><line x1="4" y1="7" x2="20" y2="7"/><line x1="4" y1="12" x2="20" y2="12"/><line x1="8" y1="17" x2="20" y2="17"/></svg>
              </span>
              <div class="prv-hdr2__logo">
                <span class="prv-hdr2__logo-fa"><span class="prv-hdr2__logo-dot"></span>دارونیک</span>
                <span class="prv-hdr2__logo-en">DARUNIK</span>
              </div>
            </div>

            <div class="prv-hdr2__search">
              <span class="prv-hdr2__search-ph">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="#9AABBB" stroke-width="2" stroke-linecap="round"><circle cx="11" cy="11" r="7.5"/><line x1="20" y1="20" x2="16.4" y2="16.4"/></svg>
                <span>نام محصول، برند یا بیماری موردنظر را جستجو کنید...</span>
              </span>
              <span class="prv-hdr2__search-btn">جستجو</span>
            </div>

            <div class="prv-hdr2__acts">
              <span class="prv-hdr2__login">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                <span>ورود | ثبت‌نام</span>
              </span>
              <span class="prv-hdr2__user-mob" title="حساب کاربری">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
              </span>
              <span class="prv-hdr2__wish" title="علاقه‌مندی‌ها">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
              </span>
              <span class="prv-hdr2__cart" title="سبد خرید">
                <svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="9" cy="20" r="1.3"/><circle cx="18" cy="20" r="1.3"/><path d="M2 3h3l2.4 11.5a1.8 1.8 0 0 0 1.8 1.5h8.6a1.8 1.8 0 0 0 1.8-1.4L21 7H6"/></svg>
              </span>
            </div>
          </div>

          <!-- Row 3: Exact Darunik Desktop Nav Bar -->
          <div class="prv-hdr2__nav">
            <div class="prv-hdr2__nav-r">
              <span class="prv-hdr2__cat-trig">
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.1" stroke-linecap="round"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="7" y1="18" x2="21" y2="18"/></svg>
                <span>دسته‌بندی محصولات</span>
              </span>
              <span>پرفروش‌ترین‌ها</span>
              <span style="color:#e5322d;font-weight:800">تخفیف‌ها و پیشنهاد ویژه</span>
              <span>جدیدترین‌ها</span>
              <span>برندها</span>
              <span>تجهیزات پزشکی</span>
              <span>مجله سلامت</span>
            </div>
            <span style="color:#64798e;font-weight:600">تماس با ما</span>
          </div>

          <!-- Desktop Mega-Menu Open Panel -->
          <div class="prv-hdr2__mega">
            <div style="display:flex;flex-direction:column;justify-content:space-between;gap:12px">
              <div class="prv-hdr2__mega-cols">
                <div>
                  <div style="font-size:12px;font-weight:800;color:#066a50;border-bottom:1px solid #eef2f6;padding-bottom:6px;margin-bottom:7px">مکمل‌های ورزشی</div>
                  <div style="font-size:11px;color:#35485c;line-height:2">پروتئین و وی<br>کراتین مونوهیدرات<br>آمینو اسید و BCAA<br>گینر و افزایش وزن<br>پیش از تمرین</div>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#066a50;border-bottom:1px solid #eef2f6;padding-bottom:6px;margin-bottom:7px">ویتامین و مکمل</div>
                  <div style="font-size:11px;color:#35485c;line-height:2">مولتی‌ویتامین روزانه<br>ویتامین D و کلسیم<br>ویتامین C و ایمنی<br>امگا ۳ و روغن ماهی<br>کلاژن و مکمل بانوان</div>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#066a50;border-bottom:1px solid #eef2f6;padding-bottom:6px;margin-bottom:7px">مراقبت پوست و مو</div>
                  <div style="font-size:11px;color:#35485c;line-height:2">ضدآفتاب تخصصی<br>سرم ویتامین C و نیاسینامید<br>مرطوب‌کننده و آبرسان<br>شامپو و ضدریزش مو<br>بهداشت دهان و دندان</div>
                </div>
                <div>
                  <div style="font-size:12px;font-weight:800;color:#066a50;border-bottom:1px solid #eef2f6;padding-bottom:6px;margin-bottom:7px">تجهیزات پزشکی و کودک</div>
                  <div style="font-size:11px;color:#35485c;line-height:2">فشارسنج بازویی و مچی<br>تست قند خون و نوار<br>تب‌سنج و پالس اکسیمتر<br>مراقبت پوست کودک<br>شیشه شیر و تغذیه نوزاد</div>
                </div>
              </div>

              <div style="border-top:1px solid #eef2f6;padding-top:10px;display:flex;align-items:center;flex-wrap:wrap;gap:6px">
                <span style="font-size:11px;font-weight:700;color:#64798e">برندهای پرطرفدار:</span>
                <span class="prv-dk-chip">نوتری‌لایف</span>
                <span class="prv-dk-chip">ویتاپلاس</span>
                <span class="prv-dk-chip">درماکر</span>
                <span class="prv-dk-chip">بیوتی‌لب</span>
                <span class="prv-dk-chip">مدیکو هلث</span>
                <span class="prv-dk-chip">کیدزکر</span>
                <span class="prv-dk-chip">اوراکلین</span>
              </div>
            </div>

            <div style="background:linear-gradient(145deg,#068462,#085340);color:#fff;border-radius:14px;padding:16px;display:flex;flex-direction:column;justify-content:space-between">
              <div>
                <div style="font-size:13px;font-weight:800">هفته سلامت داروخانه</div>
                <div style="font-size:10.5px;opacity:0.86;line-height:1.85;margin-top:5px">تا ۴۰٪ تخفیف روی مکمل‌ها، مراقبت پوست و تجهیزات پزشکی</div>
              </div>
              <span style="background:#fff;color:#066a50;font-size:10.5px;font-weight:800;padding:5px 11px;border-radius:8px;align-self:flex-start;margin-top:12px">مشاهده پیشنهادها</span>
            </div>
          </div>

          <!-- Mobile Accordion Dropdown Preview (shown automatically when Mobile tab is clicked!) -->
          <div class="prv-hdr2__mob-acc">
            <div style="background:#eafaf4;border:1px solid #99e6cd;color:#066a50;border-radius:10px;padding:9px 12px;font-size:12px;font-weight:800;display:flex;justify-content:space-between">
              <span>دسته‌بندی محصولات</span><span>▴</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;padding:7px 6px">
              <span style="background:#f4f7f9;border-radius:8px;padding:7px 10px;font-size:11px;color:#35485c">مکمل‌های ورزشی (پروتئین، کراتین، BCAA)</span>
              <span style="background:#f4f7f9;border-radius:8px;padding:7px 10px;font-size:11px;color:#35485c">ویتامین و مکمل روزانه (مولتی‌ویتامین، امگا ۳)</span>
              <span style="background:#f4f7f9;border-radius:8px;padding:7px 10px;font-size:11px;color:#35485c">مراقبت پوست و مو</span>
              <span style="background:#f4f7f9;border-radius:8px;padding:7px 10px;font-size:11px;color:#35485c">تجهیزات پزشکی و مادر و کودک</span>
            </div>
            <div style="display:flex;flex-direction:column;gap:5px;margin-top:4px">
              <span style="border:1px solid #eef2f6;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:800;color:#e5322d">تخفیف‌ها و پیشنهاد ویژه</span>
              <span style="border:1px solid #eef2f6;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;color:#14212e">پرفروش‌ترین‌ها</span>
              <span style="border:1px solid #eef2f6;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;color:#14212e">جدیدترین محصولات</span>
              <span style="border:1px solid #eef2f6;border-radius:10px;padding:8px 12px;font-size:12px;font-weight:700;color:#14212e">مجله سلامت · تماس با ما</span>
            </div>
          </div>
        </div>
      `;
    },
  },

  /* ========================================================================
     02 — MASTER PRODUCT CARD (Loop Item — source: product)
     ======================================================================== */
  {
    id: "02-product-card",
    step: "بخش ۰۲",
    category: "shop",
    categoryLabel: "فروشگاه و آرشیو محصولات",
    title: "کارت محصول سراسری داروخانه (قالب Loop Item محصولات)",
    description:
      "قالب مادر کارت محصولات ووکامرس در المنتور پرو (Loop Item با منبع Product) — دقیقاً مطابق گرافیک دارونیک بدون حتی یک خط کد! با ایمپورت این یک فایل، تمام کارت‌های محصول در صفحه فروشگاه، دسته‌بندی‌ها، نتایج جستجو و کاروسل‌های صفحه اصلی همین ظاهر را می‌گیرند: قاب خاکستری ملایم تصویر (#F4F7F9)، نشان تخفیف قرمز خودکار، نشان پرفروش، دکمه‌های گرد علاقه‌مندی و مقایسه، دسته‌بندی/برند، عنوان دوخطی، امتیاز ستاره‌ای طلایی، قیمت پله‌ای و دکمه سبز + افزودن سریع به سبد خرید همراه با حاشیه سبز و سایه نرم هنگام هاور.",
    fileName: "02-product-card-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/02-product-card-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۲۶ کیلوبایت",
    noCode: true,
    target: "المنتور پرو ← پوسته‌ساز (Theme Builder) ← Loop Item (محصولات)",
    widgets: [
      "Product Image (Dynamic)",
      "نشان حراج خودکار + برچسب پرفروش",
      "Product Rating طلایی",
      "Product Price پله‌ای",
      "دکمه سبز + Add to Cart پویا",
    ],
    guideSteps: [
      {
        title: "ابتدا این فایل را ایمپورت کنید (گام اول پیش از آرشیوها)",
        desc: "در پیشخوان وردپرس به «قالب‌ها (Templates) ← پوسته‌ساز (Theme Builder)» یا «قالب‌ها ← قالب‌های ذخیره‌شده» بروید، روی «درون‌ریزی قالب‌ها (Import Templates)» کلیک کنید و فایل 02-product-card-dr-farzane-ghasemi.json را آپلود کنید.",
      },
      {
        title: "ذخیره یک‌باره در ویرایشگر المنتور",
        desc: "روی «ویرایش با المنتور» کنار «۰۲ — کارت محصول اختصاصی داروخانه دکتر فرزانه قاسمی» بزنید و یک‌بار دکمه «به‌روزرسانی / انتشار (Save & Close)» را بزنید تا متادیتای محصول (Source: Product) در دیتابیس وردپرس شما ثبت شود.",
      },
      {
        title: "نحوه نمایش خودکار نشان «پرفروش» روی کارت‌ها",
        desc: "نشان قرمز تخفیف به صورت ۱۰۰٪ خودکار فقط برای کالاهای دارای قیمت فروش ویژه نمایش داده می‌شود. اگر خواستید نشان کرم‌رنگ «پرفروش» هم زیر آن بیاید، کافی است در ویرایش محصول ووکامرس در کادر «برچسب‌های محصول» عبارت «پرفروش» را وارد کنید!",
      },
      {
        title: "اعمال روی تمام آرشیوها و کاروسل‌ها با ۱ کلیک",
        desc: "حالا در قالب‌های ۰۳، ۰۴ و ۰۵ (سکشن ریلی، آرشیو دسته‌بندی و صفحه فروشگاه)، روی ویجت Loop Grid یا Loop Carousel کلیک کنید و در کادر «انتخاب قالب (Choose a template)» نام «۰۲ — کارت محصول اختصاصی» را انتخاب نمایید.",
      },
    ],
    guideTip:
      "چرا با Loop Item ساختیم؟ چون بدون هیچ کدنویسی، اگر روزی بخواهید رنگ دکمه + یا اندازه فونت قیمت را تغییر دهید، فقط همین یک فایل را ویرایش می‌کنید و در ثانیه روی ۱۰۰٪ صفحات سایت اعمال می‌شود!",
    renderPreview: function () {
      return `
        <div class="prv-dk-surface">
          <div class="prv-dk-rail">
            ${SAMPLE_SPORTS_PRODUCTS.slice(0, 4).map(renderDarunikSampleCard).join("")}
          </div>
        </div>
      `;
    },
  },

  /* ========================================================================
     03 — CATEGORY SHOWCASE RAIL SECTION (Screenshot 1 & 2: مکمل‌های ورزشی)
     ======================================================================== */
  {
    id: "03-category-showcase-rail",
    step: "بخش ۰۳",
    category: "home",
    categoryLabel: "صفحه اصلی",
    title: "سکشن ویترین ریلی دسته‌بندی محصولات (مشابه مکمل‌های ورزشی)",
    description:
      "دقیقاً همان سکشن عکس ارسالی شما برای صفحه اصلی و صفحات لندینگ: شامل تیتر با خط عمودی سبز برند (#0FA47A)، زیرعنوان توضیحی، لینک «مشاهده همه <» در سمت چپ، باکس سفید لبه‌گرد با سایه لطیف، ردیف دکمه‌های قرصی آیکون‌دار زیردسته‌ها (پروتئین و وی، کراتین، آمینواسید و BCAA، گینر و افزایش وزن، پیش از تمرین) و کاروسل ریلی ۶ ستونه محصولات (Loop Carousel المنتور پرو).",
    fileName: "03-category-showcase-rail-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/03-category-showcase-rail-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۲۶ کیلوبایت",
    noCode: true,
    target: "المنتور ← درج در برگه (صفحه اصلی / لندینگ)",
    widgets: [
      "هدر بخش با خط سبز برند",
      "۵× چیپ آیکون‌دار زیردسته",
      "Loop Carousel محصولات (۶ ستونه)",
      "قابل تکرار برای تمام دسته‌ها",
    ],
    guideSteps: [
      {
        title: "درون‌ریزی در کتابخانه قالب‌های المنتور",
        desc: "در پیشخوان وردپرس به «قالب‌ها ← قالب‌های ذخیره‌شده ← درون‌ریزی قالب‌ها» بروید و فایل 03-category-showcase-rail-dr-farzane-ghasemi.json را آپلود کنید.",
      },
      {
        title: "افزودن به صفحه اصلی با ۱ کلیک",
        desc: "برگه صفحه اصلی را با المنتور باز کنید، روی آیکون پوشه خاکستری (افزودن قالب) کلیک کنید، به تب «قالب‌های من (My Templates)» بروید و «۰۳ — سکشن ویترین ریلی دسته‌بندی» را درج (Insert) کنید.",
      },
      {
        title: "اتصال کارت محصول ۰۲ و انتخاب دسته‌بندی دلخواه",
        desc: "روی ویجت کاروسل محصولات کلیک کنید: ۱) در بخش Layout ← Choose a template، قالب «۰۲ — کارت محصول اختصاصی» را انتخاب کنید. ۲) در بخش Query ← Include By ← Term، دسته دلخواه (مثلاً مکمل‌های ورزشی یا مراقبت پوست) را انتخاب کنید.",
      },
      {
        title: "استفاده مجدد برای سایر دسته‌های صفحه اصلی",
        desc: "کافی است از همین سکشن در صفحه اصلی Duplicate بگیرید و عنوان و زیردسته‌ها را برای «محصولات مراقبت پوست»، «آرایشی و مراقبت مو» و «تجهیزات پزشکی خانگی» جایگزین کنید!",
      },
    ],
    guideTip:
      "در حالت موبایل و تبلت، این کاروسل به‌صورت خودکار ۲ کارت (موبایل) و ۳ کارت (تبلت) با اسکرول لمسی نرم نمایش می‌دهد.",
    renderPreview: function () {
      return `
        <div class="prv-dk-surface">
          <div class="prv-dk-sec-head">
            <div class="prv-dk-sec-head__right">
              <span class="prv-dk-sec-bar"></span>
              <div>
                <div class="prv-dk-sec-title">مکمل‌های ورزشی</div>
                <div class="prv-dk-sec-sub">پروتئین، کراتین، آمینواسید و مکمل‌های پیش از تمرین</div>
              </div>
            </div>
            <span class="prv-dk-viewall">مشاهده همه ‹</span>
          </div>

          <div class="prv-dk-box">
            <div class="prv-dk-chips">
              <span class="prv-dk-chip">پروتئین و وی</span>
              <span class="prv-dk-chip">⚡ کراتین</span>
              <span class="prv-dk-chip">آمینو اسید و BCAA</span>
              <span class="prv-dk-chip">📈 گینر و افزایش وزن</span>
              <span class="prv-dk-chip">🔥 پیش از تمرین</span>
            </div>
            <div class="prv-dk-rail prv-dk-rail--six">
              ${SAMPLE_SPORTS_PRODUCTS.map(renderDarunikSampleCard).join("")}
            </div>
          </div>
        </div>
      `;
    },
  },

  /* ========================================================================
     04 — CATEGORY PRODUCT ARCHIVE (/category/sports-supplements)
     ======================================================================== */
  {
    id: "04-category-archive",
    step: "بخش ۰۴",
    category: "shop",
    categoryLabel: "فروشگاه و آرشیو محصولات",
    title: "قالب کامل آرشیو دسته‌بندی محصولات (مشابه صفحه مکمل‌های ورزشی)",
    description:
      "قالب کامل Products Archive در المنتور پرو دقیقاً مطابق لینک /category/sports-supplements دارونیک: شامل مسیر راهنما (Breadcrumbs)، بنر گرادیانی بالای دسته‌بندی با عنوان پویا و پیام تضمین اصالت داروخانه، تیتر H1 و توضیحات پویای هر دسته، نوار افقی قرص‌های زیردسته، سایدبار چسبان ۲۶۰ پیکسلی فیلترهای آنی (Taxonomy Filter دسته‌بندی و برند/برچسب + وضعیت کالا)، نوار سفید مرتب‌سازی و شبکه ۴ ستونه محصولات (Current Query) با صفحه‌بندی شماره‌دار.",
    fileName: "04-category-archive-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/04-category-archive-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۵۶ کیلوبایت",
    noCode: true,
    target: "المنتور پرو ← پوسته‌ساز ← بایگانی محصولات (Products Archive)",
    widgets: [
      "WooCommerce Breadcrumbs",
      "بنر پویای دسته‌بندی + H1",
      "۳× Taxonomy Filter متصل",
      "سایدبار چسبان ۲۶۰px + نوار مرتب‌سازی",
      "Loop Grid چهارستونه (Current Query)",
    ],
    guideSteps: [
      {
        title: "گام اول (مخصوص وودمارت): خاموش کردن طرح‌بندی پیش‌فرض آرشیو وودمارت",
        desc: "در پیشخوان وردپرس به منوی «وودمارت (WoodMart) ← طرح‌بندی‌ها (Layouts) ← تب آرشیو محصولات (Products archive)» بروید. اگر طرح‌بندی آماده‌ای از دموهای قبلی وودمارت آنجا روشن است، وضعیتش را خاموش (Draft / غیرفعال) کنید تا پوسته‌ساز المنتور پرو اولویت کامل داشته باشد.",
      },
      {
        title: "درون‌ریزی قالب آرشیو دسته‌بندی در پوسته‌ساز المنتور پرو",
        desc: "وارد «قالب‌ها ← پوسته‌ساز (Theme Builder) ← بایگانی محصولات (Products Archive)» شوید، دکمه «درون‌ریزی قالب‌ها» را بزنید و فایل 04-category-archive-dr-farzane-ghasemi.json را وارد کنید.",
      },
      {
        title: "اتصال کارت محصول ۰۲ به شبکه محصولات (Loop Grid)",
        desc: "در ویرایشگر المنتور روی شبکه محصولات (Loop Grid در ستون چپ) کلیک کنید و در قسمت «Choose a template»، قالب «۰۲ — کارت محصول اختصاصی داروخانه» را که در مرحله قبل ایمپورت کردید انتخاب نمایید. (ویجت‌های فیلتر سایدبار از قبل با ID دقیق به همین شبکه متصل شده‌اند!).",
      },
      {
        title: "تنظیم شرط نمایش پیش‌فرض برای تمام دسته‌ها، برندها و نتایج جستجو",
        desc: "روی دکمه «انتشار (Publish)» کلیک کنید ← روی «Add Condition» بزنید و شروط زیر را اضافه کنید: ۱) Product Categories → All (تمام دسته‌بندی‌های محصول)، ۲) Product Tags → All (تمام برچسب‌ها)، ۳) Search Results (نتایج جستجوی محصولات). سپس Save & Close را بزنید!",
      },
    ],
    guideTip:
      "چون عنوان بنر، تیتر H1، توضیحات و کوئری شبکه محصولات همگی Dynamic (Current Query) هستند، با همین یک قالب تمام ۴۰+ دسته‌بندی و زیردسته سایت شما خودکار با نام، توضیحات و محصولات اختصاصی خودشان نمایش داده می‌شوند!",
    renderPreview: function () {
      return `
        <div class="prv-dk-surface">
          <div class="prv-dk-crumbs">خانه ‹ دسته‌بندی‌ها ‹ <strong style="color:#35485c">مکمل‌های ورزشی</strong></div>

          <div class="prv-dk-banner">
            <div class="prv-dk-banner__t">مکمل‌های ورزشی در داروخانه دکتر فرزانه قاسمی</div>
            <div class="prv-dk-banner__d">تضمین اصالت کالا، ارسال سریع سراسری و امکان مشاوره رایگان با داروساز پیش از خرید</div>
          </div>

          <div class="prv-dk-chips" style="margin-bottom:12px">
            <span class="prv-dk-chip is-active">همه محصولات این بخش</span>
            <span class="prv-dk-chip">پروتئین و وی</span>
            <span class="prv-dk-chip">کراتین</span>
            <span class="prv-dk-chip">آمینو اسید و BCAA</span>
            <span class="prv-dk-chip">گینر و افزایش وزن</span>
          </div>

          <div class="prv-dk-arch-layout">
            <aside class="prv-dk-sidebar">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:12.5px;font-weight:800">فیلترهای تخصصی</span>
                <span style="font-size:10.5px;color:#e5322d;font-weight:700">حذف همه</span>
              </div>
              <div class="prv-dk-side-group">
                <div class="prv-dk-side-label">دسته‌بندی محصولات</div>
                <div class="prv-dk-check"><span>☑ پروتئین و وی</span><span class="num" style="color:#9aabbb">۱۲</span></div>
                <div class="prv-dk-check"><span>☐ کراتین</span><span class="num" style="color:#9aabbb">۸</span></div>
                <div class="prv-dk-check"><span>☐ آمینواسید و BCAA</span><span class="num" style="color:#9aabbb">۹</span></div>
              </div>
              <div class="prv-dk-side-group">
                <div class="prv-dk-side-label">برند و ویژگی‌ها</div>
                <div class="prv-dk-check"><span>☑ نوتری‌لایف</span><span class="num" style="color:#9aabbb">۱۴</span></div>
                <div class="prv-dk-check"><span>☐ پیورفیت</span><span class="num" style="color:#9aabbb">۱۱</span></div>
              </div>
              <div class="prv-dk-side-group">
                <div class="prv-dk-side-label">وضعیت کالا</div>
                <div class="prv-dk-chip" style="width:100%;justify-content:center;margin-bottom:5px">فقط کالاهای موجود</div>
                <div class="prv-dk-chip" style="width:100%;justify-content:center">فقط کالاهای تخفیف‌دار</div>
              </div>
            </aside>

            <div>
              <div class="prv-dk-sortbar">
                <span style="font-size:11px;font-weight:700;color:#64798e">مرتب‌سازی:</span>
                <span class="prv-dk-chip is-active">پرفروش‌ترین</span>
                <span class="prv-dk-chip">جدیدترین</span>
                <span class="prv-dk-chip">ارزان‌ترین</span>
                <span class="prv-dk-chip">گران‌ترین</span>
                <span class="prv-dk-chip">بیشترین امتیاز</span>
              </div>

              <div class="prv-dk-rail" style="grid-template-columns:repeat(3,minmax(0,1fr))">
                ${SAMPLE_SPORTS_PRODUCTS.slice(0, 3).map(renderDarunikSampleCard).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    },
  },

  /* ========================================================================
     05 — SHOP MAIN PAGE (/shop — All Products)
     ======================================================================== */
  {
    id: "05-shop-page",
    step: "بخش ۰۵",
    category: "shop",
    categoryLabel: "فروشگاه و آرشیو محصولات",
    title: "قالب اختصاصی صفحه اصلی فروشگاه (/shop — همه محصولات)",
    description:
      "قالب کامل صفحه اصلی فروشگاه (/shop) در المنتور پرو — طراحی‌شده ۱۰۰٪ خالص با المنتور بدون یک خط کد: شامل مسیر راهنما، باکس سفید معرفی فروشگاه داروخانه دکتر فرزانه قاسمی، نوار دسترسی سریع به ۷ دپارتمان تخصصی داروخانه (مکمل ورزشی، ویتامین، پوست، مو، دهان و دندان، تجهیزات پزشکی، مادر و کودک)، سایدبار چسبان فیلترها، نوار مرتب‌سازی، شبکه ۲۴تایی محصولات با صفحه‌بندی و ردیف ۴تایی ضمانت‌های داروخانه در پایین صفحه.",
    fileName: "05-shop-page-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/05-shop-page-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۸۴ کیلوبایت",
    noCode: true,
    target: "المنتور پرو ← پوسته‌ساز ← بایگانی محصولات (شرط: Shop Page)",
    widgets: [
      "سربرگ اختصاصی فروشگاه",
      "۷× دپارتمان اصلی داروخانه با آیکون",
      "سایدبار چسبان فیلترهای آنی",
      "شبکه ۴ ستونه محصولات + صفحه‌بندی",
      "۴× کارت ضمانت و اعتماد داروخانه",
    ],
    guideSteps: [
      {
        title: "تنظیم برگه فروشگاه در ووکامرس",
        desc: "در پیشخوان وردپرس مطمئن شوید در «ووکامرس ← پیکربندی ← تب محصولات (Products)»، گزینه «برگه فروشگاه (Shop page)» روی برگه «فروشگاه» تنظیم شده باشد (نیازی نیست خود برگه فروشگاه را مستقیم با المنتور ویرایش کنید؛ پوسته‌ساز المنتور پرو خودکار رویش سوار می‌شود).",
      },
      {
        title: "درون‌ریزی قالب صفحه فروشگاه در پوسته‌ساز",
        desc: "وارد «قالب‌ها ← پوسته‌ساز (Theme Builder) ← بایگانی محصولات (Products Archive)» شوید، دکمه «درون‌ریزی قالب‌ها» را بزنید و فایل 05-shop-page-dr-farzane-ghasemi.json را آپلود کنید.",
      },
      {
        title: "انتخاب کارت محصول ۰۲ در شبکه محصولات",
        desc: "روی ویجت شبکه محصولات (Loop Grid) کلیک کنید و در بخش «Choose a template»، قالب «۰۲ — کارت محصول اختصاصی داروخانه» را انتخاب نمایید.",
      },
      {
        title: "اعمال پیش‌فرض فقط روی صفحه اصلی فروشگاه (Shop Page)",
        desc: "روی دکمه «انتشار (Publish)» کلیک کنید ← روی «Add Condition» بزنید ← از لیست ووکامرس گزینه «Shop Page (برگه فروشگاه)» را انتخاب کنید و Save & Close را بزنید. به این ترتیب برگه اصلی /shop این قالب اختصاصی را می‌گیرد و بقیه دسته‌بندی‌ها قالب شماره ۰۴ را نمایش می‌دهند!",
      },
    ],
    guideTip:
      "اگر ترجیح دادید کل آرشیوهای سایت (هم /shop و هم دسته‌بندی‌ها) یک قالب واحد داشته باشند، می‌توانید شرط هرکدام از قالب‌های ۰۴ یا ۰۵ را روی «All Product Archives (همه بایگانی‌های محصول)» قرار دهید.",
    renderPreview: function () {
      return `
        <div class="prv-dk-surface">
          <div class="prv-dk-crumbs">خانه ‹ <strong style="color:#35485c">فروشگاه</strong></div>

          <div class="prv-dk-box" style="margin-bottom:10px;padding:14px 18px">
            <div class="prv-dk-sec-title" style="font-size:16.5px">فروشگاه داروخانه آنلاین دکتر فرزانه قاسمی</div>
            <div class="prv-dk-sec-sub" style="margin-top:4px">همه محصولات سلامت در هفت دپارتمان تخصصی با فیلتر سریع بر اساس دسته‌بندی، برند، موجودی و تخفیف</div>
          </div>

          <div class="prv-dk-chips" style="margin-bottom:12px">
            <span class="prv-dk-chip">🏋️ مکمل‌های ورزشی</span>
            <span class="prv-dk-chip">💊 ویتامین و مواد معدنی</span>
            <span class="prv-dk-chip">✨ مراقبت پوست</span>
            <span class="prv-dk-chip">🧴 مراقبت مو</span>
            <span class="prv-dk-chip">🦷 بهداشت دهان و دندان</span>
            <span class="prv-dk-chip">🩺 تجهیزات پزشکی</span>
            <span class="prv-dk-chip">👶 مادر و کودک</span>
          </div>

          <div class="prv-dk-arch-layout">
            <aside class="prv-dk-sidebar">
              <div style="display:flex;justify-content:space-between;align-items:center">
                <span style="font-size:12.5px;font-weight:800">فیلترهای فروشگاه</span>
                <span style="font-size:10.5px;color:#e5322d;font-weight:700">حذف همه</span>
              </div>
              <div class="prv-dk-side-group">
                <div class="prv-dk-side-label">همه دسته‌بندی‌ها</div>
                <div class="prv-dk-check"><span>☑ همه دسته‌ها</span><span class="num" style="color:#9aabbb">۵۹</span></div>
                <div class="prv-dk-check"><span>☐ مکمل‌های ورزشی</span><span class="num" style="color:#9aabbb">۱۰</span></div>
                <div class="prv-dk-check"><span>☐ مراقبت پوست</span><span class="num" style="color:#9aabbb">۱۲</span></div>
              </div>
              <div class="prv-dk-side-group">
                <div class="prv-dk-side-label">پیشنهاد و موجودی</div>
                <div class="prv-dk-chip" style="width:100%;justify-content:center;margin-bottom:5px">فقط کالاهای موجود</div>
                <div class="prv-dk-chip" style="width:100%;justify-content:center">فقط کالاهای تخفیف‌دار</div>
              </div>
            </aside>

            <div>
              <div class="prv-dk-sortbar">
                <span style="font-size:11px;font-weight:700;color:#64798e">مرتب‌سازی:</span>
                <span class="prv-dk-chip is-active">پرفروش‌ترین</span>
                <span class="prv-dk-chip">جدیدترین</span>
                <span class="prv-dk-chip">ارزان‌ترین</span>
                <span class="prv-dk-chip">گران‌ترین</span>
                <span class="prv-dk-chip">بیشترین امتیاز</span>
              </div>

              <div class="prv-dk-rail" style="grid-template-columns:repeat(3,minmax(0,1fr))">
                ${SAMPLE_SPORTS_PRODUCTS.slice(0, 3).map(renderDarunikSampleCard).join("")}
              </div>
            </div>
          </div>
        </div>
      `;
    },
  },
  {
    id: "06-home-hero-trust",
    step: "بخش ۰۶",
    category: "home",
    categoryLabel: "صفحه اصلی (Section)",
    title: "مین هیرو صفحه اصلی + ۲ بنر کناری + ۴ کارت اعتماد",
    description:
      "طراحی ۱۰۰٪ خالص المنتوری دقیقاً مطابق تصویر صفحه اول دارونیک: اسلایدر ۳ اسلایده اصلی در سمت راست (مراقبت پوست، مکمل ورزشی، ویتامین خانواده با ویجت Nested Carousel المنتور پرو)، ۲ بنر کناری در ستون چپ (تجهیزات پزشکی خانگی و دنیای مادر و کودک) و ردیف ۴تایی کارت‌های تضمین و خدمات در پایین — بدون حتی یک خط کد یا CSS دستی.",
    fileName: "06-home-hero-trust-dr-farzane-ghasemi.json",
    filePath: "./elementor-templates/06-home-hero-trust-dr-farzane-ghasemi.json",
    format: "JSON",
    fileSize: "۸۹ کیلوبایت",
    noCode: true,
    target: "قالب‌ها ← قالب‌های ذخیره‌شده ← درج در بالای صفحه اصلی (Home)",
    widgets: [
      "Nested Carousel (اسلایدر ۳تایی)",
      "Flexbox Containers",
      "Heading & Badges",
      "CTA Buttons",
      "Stacked Icons (۴ کارت اعتماد)",
    ],
    guideSteps: [
      {
        title: "درون‌ریزی قالب مین هیرو در المنتور",
        desc: "فایل 06-home-hero-trust-dr-farzane-ghasemi.json را از طریق «قالب‌ها ← قالب‌های ذخیره‌شده ← درون‌ریزی قالب‌ها» وارد وردپرس کنید.",
      },
      {
        title: "افزودن به بالای برگه صفحه اصلی (Home)",
        desc: "برگه صفحه اصلی سایت را با المنتور باز کنید، روی آیکون پوشه خاکستری (افزودن قالب) ← قالب‌های من کلیک کرده و «۰۶ — مین هیرو صفحه اصلی + ۲ بنر کناری + ۴ کارت اعتماد» را درج کنید.",
      },
      {
        title: "ویرایش متن، لینک یا عکس هر اسلاید (اختیاری)",
        desc: "روی اسلایدر کلیک کنید تا ۳ تب اسلاید ۱، ۲ و ۳ باز شود؛ تمام تیترها، نشان‌های تخفیف، دکمه‌ها و تصویر پس‌زمینه هر اسلاید مستقیماً از پنل المنتور قابل تغییر یا حذف هستند.",
      },
    ],
    guideTip:
      "در زیر همین سکشن می‌توانید قالب ۰۳ (ویترین افقی دسته‌بندی‌ها) را به هر تعداد دسته که بخواهید اضافه کنید تا صفحه اول کامل شود.",
    renderPreview: function () {
      return `
        <div class="prv-dk-stage">
          <div class="prv-dk-hero-grid">
            <div class="prv-dk-hero-slide">
              <span class="prv-dk-hero-arrow prv-dk-hero-arrow--r">‹</span>
              <span class="prv-dk-hero-arrow prv-dk-hero-arrow--l">›</span>
              <div class="prv-dk-hero-content">
                <span class="prv-dk-hero-badge">روتین پوستی · تا ۲۵٪ تخفیف</span>
                <h4 class="prv-dk-hero-h2">پوست شما لایق مراقبت روزانه است</h4>
                <p class="prv-dk-hero-p">ضدآفتاب، سرم ویتامین C و مرطوب‌کننده‌های تخصصی برای همه انواع پوست، با تضمین اصالت کالا.</p>
                <span class="prv-dk-hero-cta">مشاهده مراقبت پوست</span>
              </div>
              <div class="prv-dk-hero-dots">
                <span class="prv-dk-hero-dot is-active"></span>
                <span class="prv-dk-hero-dot"></span>
                <span class="prv-dk-hero-dot"></span>
              </div>
            </div>

            <div class="prv-dk-side-stack">
              <div class="prv-dk-side-card prv-dk-side-card--navy">
                <div>
                  <div style="font-size:13.5px;font-weight:800">تجهیزات پزشکی خانگی</div>
                  <div style="font-size:10.5px;opacity:0.8;margin-top:3px">فشارسنج، گلوکومتر و نبولایزر</div>
                </div>
                <span style="background:rgba(255,255,255,0.18);color:#fff;padding:4px 10px;border-radius:7px;font-size:10.5px;font-weight:700">خرید با گارانتی</span>
              </div>

              <div class="prv-dk-side-card prv-dk-side-card--peach">
                <div>
                  <div style="font-size:13.5px;font-weight:800;color:#14212e">دنیای مادر و کودک</div>
                  <div style="font-size:10.5px;color:#35485c;margin-top:3px">محصولات ملایم مخصوص پوست نوزاد</div>
                </div>
                <span style="background:#ffffff;color:#066a50;padding:4px 10px;border-radius:7px;font-size:10.5px;font-weight:800">مشاهده محصولات</span>
              </div>
            </div>
          </div>

          <div class="prv-dk-trust-row">
            <div class="prv-dk-trust-card">
              <span class="prv-dk-trust-ico">🚚</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:#14212e">ارسال سریع</div>
                <div style="font-size:10.5px;color:#64798e">تحویل درون‌شهری زیر ۴ ساعت</div>
              </div>
            </div>
            <div class="prv-dk-trust-card">
              <span class="prv-dk-trust-ico">🛡️</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:#14212e">تضمین اصالت</div>
                <div style="font-size:10.5px;color:#64798e">تأمین از مسیر رسمی</div>
              </div>
            </div>
            <div class="prv-dk-trust-card">
              <span class="prv-dk-trust-ico">🩺</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:#14212e">مشاوره داروساز</div>
                <div style="font-size:10.5px;color:#64798e">پاسخ‌گویی ۷ روز هفته</div>
              </div>
            </div>
            <div class="prv-dk-trust-card">
              <span class="prv-dk-trust-ico">↩️</span>
              <div>
                <div style="font-size:12px;font-weight:800;color:#14212e">بازگشت کالا</div>
                <div style="font-size:10.5px;color:#64798e">تا ۷ روز برای کالای پلمب</div>
              </div>
            </div>
          </div>
        </div>
      `;
    },
  },
  {
    id: "07-woocommerce-demo-products",
    step: "بخش ۰۷",
    category: "data",
    categoryLabel: "درون‌ریزی محصولات (CSV)",
    title: "پکیج ۲۰ محصول متنوع داروخانه همراه با عکس و ویژگی‌ها (CSV ووکامرس)",
    description:
      "فایل استاندارد درون‌ریز بومی ووکامرس (UTF-8 BOM) شامل ۲۰ محصول متنوع در هر ۷ دسته اصلی و ۱۹ زیردسته (۱۷ محصول ساده + ۳ محصول متغیر با ۸ متغیر طعم/رنگ/سایز = ۲۸ ردیف)، تصاویر واقعی JPG، قیمت عادی و حراج، برچسب «پرفروش» و «جدید»، موجودی انبار و ۳ ویژگی سراسری برای هر کالا.",
    fileName: "07-woocommerce-demo-products-20.csv",
    filePath: "./downloads/07-woocommerce-demo-products-20.csv",
    format: "CSV",
    fileSize: "۳۸ کیلوبایت",
    noCode: true,
    target: "محصولات ← همه محصولات ← درون‌ریزی (Import) در ووکامرس",
    widgets: [
      "۲۰ محصول در ۷ دپارتمان",
      "ساده + متغیر (طعم/رنگ/سایز)",
      "تصاویر خودکار JPG",
      "ویژگی‌های سراسری برند و حجم",
      "برچسب پرفروش و جدید",
    ],
    guideSteps: [
      {
        title: "ورود به درون‌ریز رسمی محصولات ووکامرس",
        desc: "در پیشخوان وردپرس به «محصولات ← همه محصولات» بروید و در بالای صفحه روی دکمه «درون‌ریزی (Import)» کلیک کنید.",
      },
      {
        title: "انتخاب فایل CSV و تطبیق خودکار ستون‌ها",
        desc: "فایل 07-woocommerce-demo-products-20.csv را انتخاب کرده و روی ادامه کلیک کنید؛ تمام ستون‌ها (نام، قیمت فروش ویژه، دسته‌ها، ویژگی‌ها و تصاویر) به‌صورت ۱۰۰٪ خودکار توسط ووکامرس شناسایی می‌شوند.",
      },
      {
        title: "اجرای درون‌ریزی و دانلود خودکار عکس‌ها",
        desc: "روی «اجرای درون‌ریز» کلیک کنید؛ طی حدود ۳۰ تا ۶۰ ثانیه هر ۲۰ محصول، متغیرها، دسته‌بندی‌های مادر/فرزند و تصاویر محصول در کتابخانه رسانه وردپرس شما ساخته می‌شوند.",
      },
    ],
    guideTip:
      "پس از درون‌ریزی این فایل، اسلاگ تمام دسته‌بندی‌ها و زیردسته‌ها دقیقاً با لینک‌های مگامنوی هدر ۰۱ منطبق خواهد بود.",
    renderPreview: function () {
      const sampleItems = [
        { img: "demo-media/products/whey-protein.jpg", cat: "مکمل ورزشی · متغیر (۳ طعم)", name: "پروتئین وی نوتری‌لایف ۲ کیلوگرم", price: "۳,۴۸۰,۰۰۰", old: "۴,۲۹۰,۰۰۰" },
        { img: "demo-media/products/sunscreen.jpg", cat: "مراقبت پوست · متغیر (۳ رنگ)", name: "ضدآفتاب فلوئید SPF50 درماکر", price: "۷۸۰,۰۰۰", old: "۹۸۰,۰۰۰" },
        { img: "demo-media/products/omega3.jpg", cat: "ویتامین و مکمل · ساده", name: "امگا ۳ روغن ماهی خالص ویتاپلاس", price: "۸۹۰,۰۰۰", old: "۱,۰۹۰,۰۰۰" },
        { img: "demo-media/products/bp-monitor.jpg", cat: "تجهیزات پزشکی · ساده", name: "فشارسنج بازویی دیجیتال مدیکو هلث", price: "۲,۴۸۰,۰۰۰", old: "۲,۹۵۰,۰۰۰" },
        { img: "demo-media/products/baby-cream.jpg", cat: "مادر و کودک · متغیر (۲ سایز)", name: "کرم محافظ پوست نوزاد کیدزکر", price: "۲۹۰,۰۰۰", old: "۳۵۰,۰۰۰" },
      ];
      return `
        <div class="prv-dk-stage">
          <div class="prv-dk-box" style="margin-bottom:10px;padding:12px 16px;display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:8px">
            <div>
              <div style="font-size:13.5px;font-weight:800;color:#14212e">پیش‌نمایش ۲۰ محصول دمو داخل فایل CSV ووکامرس</div>
              <div style="font-size:11px;color:#64798e;margin-top:2px">پوشش کامل ۷ دسته اصلی · ۱۷ محصول ساده + ۳ محصول متغیر (۸ متغیر) · دانلود خودکار تصاویر JPG</div>
            </div>
            <span class="prv-dk-badge-best" style="padding:5px 10px;font-size:11px">آماده Import با ۱ کلیک</span>
          </div>
          <div class="prv-dk-csv-grid">
            ${sampleItems
              .map(
                (it) => `
              <div class="prv-dk-csv-card">
                <div class="prv-dk-csv-thumb">
                  <img src="${it.img}" alt="${it.name}" loading="lazy" />
                </div>
                <div style="font-size:9.5px;font-weight:700;color:#068462">${it.cat}</div>
                <div style="font-size:11px;font-weight:800;color:#14212e;line-height:1.5">${it.name}</div>
                <div style="margin-top:auto;padding-top:4px;display:flex;justify-content:space-between;align-items:baseline">
                  <span class="num" style="font-size:9.5px;color:#9aabbb;text-decoration:line-through">${it.old}</span>
                  <span class="num" style="font-size:11.5px;font-weight:900;color:#14212e">${it.price} <small style="font-weight:500;color:#64798e">تومان</small></span>
                </div>
              </div>`
              )
              .join("")}
          </div>
        </div>
      `;
    },
  },
];
