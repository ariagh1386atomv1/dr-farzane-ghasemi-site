/* ==========================================================================
   Catalog of Built Elementor / WoodMart Sections & Templates
   Each new section built in this project is registered here for 1-click download.
   ========================================================================== */

window.STUDIO_DEFAULT_WORKER_URL =
  window.STUDIO_DEFAULT_WORKER_URL ||
  "https://dr-farzane-ghasemi-site.pages.dev";

window.STUDIO_CATEGORIES = [
  { id: "all", label: "همه بخش‌ها" },
  { id: "layout", label: "سربرگ و پابرگ" },
  { id: "home", label: "صفحه اصلی" },
  { id: "shop", label: "فروشگاه و آرشیو محصولات" },
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
];
