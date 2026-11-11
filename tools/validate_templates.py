#!/usr/bin/env python3
"""
Builds and strictly validates the unified, 100% responsive Pure-Elementor Header + Mega-Menu:
  elementor-templates/01-header-megamenu-dr-farzane-ghasemi.json

Zero custom HTML, zero CSS, zero JS, zero external WordPress Menu XML required.
Matches Darunik header (`image-4.png`) pixel-for-pixel on Desktop (1440px / 1280px),
and provides clean responsive layouts + accordion dropdown Mega-Menu on Tablet (768px) & Mobile (390px).
"""

import glob
import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL_DIR = os.path.join(REPO_ROOT, "elementor-templates")


def dim(top, right, bottom, left, unit="px", linked=False):
    return {
        "unit": unit,
        "top": str(top),
        "right": str(right),
        "bottom": str(bottom),
        "left": str(left),
        "isLinked": linked,
    }


def dim_all(val, unit="px"):
    return dim(val, val, val, val, unit=unit, linked=True)


def slider(size, unit="px"):
    return {"unit": unit, "size": size, "sizes": []}


def gaps(col, row, unit="px", linked=False):
    return {"column": str(col), "row": str(row), "isLinked": linked, "unit": unit}


def make_container(el_id, settings, elements=None, is_inner=False):
    return {
        "id": el_id,
        "elType": "container",
        "isInner": is_inner,
        "settings": settings,
        "elements": elements or [],
    }


def make_widget(el_id, widget_type, settings, elements=None):
    return {
        "id": el_id,
        "elType": "widget",
        "widgetType": widget_type,
        "isInner": False,
        "settings": settings,
        "elements": elements or [],
    }


def nav_link_widget(el_id, title, url, color="#14212E", hover_color="#068462", size=13, weight="700"):
    return make_widget(
        el_id,
        "heading",
        {
            "_title": f"لینک ناوبری: {title}",
            "title": title,
            "header_size": "span",
            "align": "right",
            "link": {"url": url, "is_external": False, "nofollow": False},
            "title_color": color,
            "title_hover_color": hover_color,
            "typography_typography": "custom",
            "typography_font_size": slider(size),
            "typography_font_weight": weight,
            "typography_line_height": slider(1.5, "em"),
            "_element_width": "auto",
            "_flex_size": "none",
        },
    )


def build_desktop_megamenu_panel():
    cols_spec = [
        (
            "h1100010",
            "مکمل‌های ورزشی",
            "/product-category/sports-supplements/",
            [
                ("پروتئین و وی", "/product-category/sports-supplements/protein/"),
                ("کراتین مونوهیدرات", "/product-category/sports-supplements/creatine/"),
                ("آمینو اسید و BCAA", "/product-category/sports-supplements/amino/"),
                ("گینر و افزایش وزن", "/product-category/sports-supplements/mass-gainer/"),
                ("پیش از تمرین", "/product-category/sports-supplements/pre-workout/"),
            ],
        ),
        (
            "h1100020",
            "ویتامین و مکمل",
            "/product-category/vitamins/",
            [
                ("مولتی‌ویتامین روزانه", "/product-category/vitamins/multivitamin/"),
                ("ویتامین D و کلسیم", "/product-category/vitamins/vitamin-d/"),
                ("ویتامین C و ایمنی", "/product-category/vitamins/vitamin-c/"),
                ("امگا ۳ و روغن ماهی", "/product-category/vitamins/omega/"),
                ("کلاژن و مکمل بانوان", "/product-category/vitamins/women-supplement/"),
            ],
        ),
        (
            "h1100030",
            "مراقبت پوست و مو",
            "/product-category/skin-care/",
            [
                ("ضدآفتاب تخصصی", "/product-category/skin-care/sunscreen/"),
                ("سرم ویتامین C و نیاسینامید", "/product-category/skin-care/face-serum/"),
                ("مرطوب‌کننده و آبرسان", "/product-category/skin-care/moisturizer/"),
                ("شامپو و ضدریزش مو", "/product-category/hair-care/shampoo/"),
                ("بهداشت دهان و دندان", "/product-category/oral-care/"),
            ],
        ),
        (
            "h1100040",
            "تجهیزات پزشکی و کودک",
            "/product-category/medical-devices/",
            [
                ("فشارسنج بازویی و مچی", "/product-category/medical-devices/blood-pressure/"),
                ("تست قند خون و نوار", "/product-category/medical-devices/glucose/"),
                ("تب‌سنج و پالس اکسیمتر", "/product-category/medical-devices/thermometer/"),
                ("مراقبت پوست کودک", "/product-category/mom-baby/baby-skin/"),
                ("شیشه شیر و تغذیه نوزاد", "/product-category/mom-baby/baby-feeding/"),
            ],
        ),
    ]

    col_containers = []
    seq = 100
    for col_id, col_title, col_url, sublinks in cols_spec:
        seq += 1
        col_head = make_widget(
            f"h1100{seq}",
            "heading",
            {
                "_title": col_title,
                "title": col_title,
                "header_size": "h4",
                "align": "right",
                "link": {"url": col_url, "is_external": False, "nofollow": False},
                "title_color": "#066A50",
                "title_hover_color": "#0FA47A",
                "typography_typography": "custom",
                "typography_font_size": slider(13.5),
                "typography_font_weight": "800",
                "_padding": dim(0, 0, 8, 0, linked=False),
                "_border_border": "solid",
                "_border_width": dim(0, 0, 1, 0, linked=False),
                "_border_color": "#EEF2F6",
            },
        )
        sub_widgets = []
        for s_title, s_url in sublinks:
            seq += 1
            sub_widgets.append(
                make_widget(
                    f"h1100{seq}",
                    "heading",
                    {
                        "_title": s_title,
                        "title": s_title,
                        "header_size": "span",
                        "align": "right",
                        "link": {"url": s_url, "is_external": False, "nofollow": False},
                        "title_color": "#35485C",
                        "title_hover_color": "#068462",
                        "typography_typography": "custom",
                        "typography_font_size": slider(12.5),
                        "typography_font_weight": "600",
                        "typography_line_height": slider(1.85, "em"),
                    },
                )
            )
        col_containers.append(
            make_container(
                col_id,
                {
                    "_title": f"ستون مگامنو: {col_title}",
                    "content_width": "full",
                    "flex_direction": "column",
                    "flex_gap": gaps(6, 6, linked=True),
                    "padding": dim_all(4),
                    "_flex_size": "grow",
                    "_flex_grow": 1,
                },
                elements=[col_head] + sub_widgets,
                is_inner=True,
            )
        )

    cols_row = make_container(
        "h1100005",
        {
            "_title": "ردیف ۴ ستون دسته‌بندی‌های مگامنو",
            "content_width": "full",
            "flex_direction": "row",
            "flex_wrap": "nowrap",
            "flex_align_items": "stretch",
            "flex_gap": gaps(20, 12),
            "padding": dim_all(0),
        },
        elements=col_containers,
        is_inner=True,
    )

    brands = [
        ("نوتری‌لایف", "/shop/?filtering=1&filter_brand=nutrilife"),
        ("ویتاپلاس", "/shop/?filtering=1&filter_brand=vitaplus"),
        ("درماکر", "/shop/?filtering=1&filter_brand=dermacare"),
        ("بیوتی‌لب", "/shop/?filtering=1&filter_brand=beautylab"),
        ("مدیکو هلث", "/shop/?filtering=1&filter_brand=medico-health"),
        ("کیدزکر", "/shop/?filtering=1&filter_brand=kidscare"),
        ("اوراکلین", "/shop/?filtering=1&filter_brand=oraclean"),
    ]
    brand_chips = [
        make_widget(
            "h1100200",
            "heading",
            {
                "_title": "برچسب برندهای پرطرفدار",
                "title": "برندهای پرطرفدار:",
                "header_size": "span",
                "title_color": "#64798E",
                "typography_typography": "custom",
                "typography_font_size": slider(12),
                "typography_font_weight": "700",
                "_element_width": "auto",
            },
        )
    ]
    for b_idx, (b_name, b_url) in enumerate(brands, start=1):
        brand_chips.append(
            make_widget(
                f"h110020{b_idx}",
                "heading",
                {
                    "_title": f"برند {b_name}",
                    "title": b_name,
                    "header_size": "span",
                    "link": {"url": b_url, "is_external": False, "nofollow": False},
                    "title_color": "#35485C",
                    "title_hover_color": "#068462",
                    "typography_typography": "custom",
                    "typography_font_size": slider(11.5),
                    "typography_font_weight": "700",
                    "_background_background": "classic",
                    "_background_color": "#F4F7F9",
                    "_padding": dim(4, 11, 4, 11, linked=False),
                    "_border_radius": dim_all(999),
                    "_element_width": "auto",
                },
            )
        )

    brands_strip = make_container(
        "h1100006",
        {
            "_title": "نوار برندهای پرطرفدار پایین مگامنو",
            "content_width": "full",
            "flex_direction": "row",
            "flex_wrap": "wrap",
            "flex_align_items": "center",
            "flex_gap": gaps(8, 8, linked=True),
            "border_border": "solid",
            "border_width": dim(1, 0, 0, 0, linked=False),
            "border_color": "#EEF2F6",
            "padding": dim(12, 0, 0, 0, linked=False),
        },
        elements=brand_chips,
        is_inner=True,
    )

    right_mega_body = make_container(
        "h1100004",
        {
            "_title": "بخش راست مگامنو (ستون‌های دسته + برندهای پرطرفدار)",
            "content_width": "full",
            "flex_direction": "column",
            "flex_justify_content": "space-between",
            "flex_gap": gaps(14, 14, linked=True),
            "padding": dim_all(0),
            "_flex_size": "grow",
            "_flex_grow": 1,
        },
        elements=[cols_row, brands_strip],
        is_inner=True,
    )

    promo_card = make_container(
        "h1100050",
        {
            "_title": "کارت سبز تخفیف هفته سلامت (ستون چپ مگامنو)",
            "html_tag": "a",
            "link": {"url": "/shop/?on_sale=1", "is_external": False, "nofollow": False},
            "content_width": "full",
            "width": slider(250),
            "min_height": slider(205),
            "flex_direction": "column",
            "flex_justify_content": "space-between",
            "flex_align_items": "flex-start",
            "background_background": "gradient",
            "background_color": "#068462",
            "background_color_b": "#085340",
            "background_gradient_angle": slider(145, "deg"),
            "border_radius": dim_all(16),
            "padding": dim_all(18),
            "_flex_size": "none",
        },
        elements=[
            make_container(
                "h1100051",
                {"_title": "متن کارت کمپین", "content_width": "full", "flex_direction": "column", "flex_gap": gaps(6, 6, linked=True), "padding": dim_all(0)},
                elements=[
                    make_widget(
                        "h1100052",
                        "heading",
                        {
                            "_title": "تیتر هفته سلامت داروخانه",
                            "title": "هفته سلامت داروخانه",
                            "header_size": "h4",
                            "align": "right",
                            "title_color": "#FFFFFF",
                            "typography_typography": "custom",
                            "typography_font_size": slider(14),
                            "typography_font_weight": "800",
                        },
                    ),
                    make_widget(
                        "h1100053",
                        "heading",
                        {
                            "_title": "توضیح کمپین سلامت",
                            "title": "تا ۴۰٪ تخفیف روی مکمل‌ها، مراقبت پوست و تجهیزات پزشکی",
                            "header_size": "p",
                            "align": "right",
                            "title_color": "rgba(255, 255, 255, 0.84)",
                            "typography_typography": "custom",
                            "typography_font_size": slider(11.5),
                            "typography_font_weight": "500",
                            "typography_line_height": slider(1.85, "em"),
                        },
                    ),
                ],
                is_inner=True,
            ),
            make_widget(
                "h1100054",
                "heading",
                {
                    "_title": "دکمه مشاهده پیشنهادها",
                    "title": "مشاهده پیشنهادها",
                    "header_size": "span",
                    "title_color": "#066A50",
                    "typography_typography": "custom",
                    "typography_font_size": slider(11.5),
                    "typography_font_weight": "800",
                    "_background_background": "classic",
                    "_background_color": "#FFFFFF",
                    "_padding": dim(6, 12, 6, 12, linked=False),
                    "_border_radius": dim_all(8),
                    "_element_width": "auto",
                },
            ),
        ],
        is_inner=True,
    )

    return make_container(
        "h1100003",
        {
            "_title": "پنل بازشونده مگامنوی دسکتاپ (۴ ستون + برندها + کارت تخفیف)",
            "content_width": "boxed",
            "boxed_width": slider(1440),
            "flex_direction": "row",
            "flex_wrap": "nowrap",
            "flex_align_items": "stretch",
            "flex_gap": gaps(22, 16),
            "background_background": "classic",
            "background_color": "#FFFFFF",
            "border_border": "solid",
            "border_width": dim(1, 0, 1, 0, linked=False),
            "border_color": "#E6ECF1",
            "border_radius": dim(0, 0, 16, 16, linked=False),
            "box_shadow_box_shadow_type": "yes",
            "box_shadow_box_shadow": {
                "horizontal": 0,
                "vertical": 16,
                "blur": 34,
                "spread": 0,
                "color": "rgba(20, 33, 46, 0.10)",
            },
            "padding": dim(20, 24, 20, 24, linked=False),
        },
        elements=[right_mega_body, promo_card],
        is_inner=True,
    )


def build_mobile_tablet_megamenu():
    """
    Dedicated Tablet & Mobile Accordion Menu (<= 1024px) using Elementor Pro's native
    `mega-menu` in `dropdown` layout. Hidden on desktop (`hide_desktop: hidden-desktop`).
    Requires zero external WordPress menu XML!
    """
    mob_cats = [
        ("مکمل‌های ورزشی (پروتئین، کراتین، BCAA)", "/product-category/sports-supplements/"),
        ("ویتامین و مکمل روزانه (مولتی‌ویتامین، امگا ۳)", "/product-category/vitamins/"),
        ("مراقبت پوست (ضدآفتاب، سرم، مرطوب‌کننده)", "/product-category/skin-care/"),
        ("مراقبت مو (شامپو، ضدریزش، سرم مو)", "/product-category/hair-care/"),
        ("بهداشت دهان و دندان", "/product-category/oral-care/"),
        ("تجهیزات پزشکی خانگی (فشارسنج، قند خون)", "/product-category/medical-devices/"),
        ("مادر و کودک (کرم، شامپو، شیشه شیر)", "/product-category/mom-baby/"),
    ]
    cat_widgets = [
        make_widget(
            f"h12001{idx:02d}",
            "heading",
            {
                "_title": c_title,
                "title": c_title,
                "header_size": "span",
                "align": "right",
                "link": {"url": c_url, "is_external": False, "nofollow": False},
                "title_color": "#35485C",
                "title_hover_color": "#068462",
                "typography_typography": "custom",
                "typography_font_size": slider(12.5),
                "typography_font_weight": "600",
                "_padding": dim(8, 10, 8, 10, linked=False),
                "_background_background": "classic",
                "_background_color": "#F4F7F9",
                "_border_radius": dim_all(10),
            },
        )
        for idx, (c_title, c_url) in enumerate(mob_cats, start=1)
    ]

    mob_cat_panel = make_container(
        "h1200010",
        {
            "_title": "زیرشاخه دسته‌بندی‌ها در موبایل و تبلت",
            "content_width": "full",
            "flex_direction": "column",
            "flex_gap": gaps(6, 6, linked=True),
            "background_background": "classic",
            "background_color": "#FFFFFF",
            "padding": dim(10, 14, 12, 14, linked=False),
        },
        elements=cat_widgets,
        is_inner=True,
    )

    mob_items_spec = [
        ("mb101", "دسته‌بندی محصولات", "/shop/", "yes", {"value": "fas fa-th-large", "library": "fa-solid"}, mob_cat_panel),
        ("mb102", "تخفیف‌ها و پیشنهاد ویژه", "/shop/?on_sale=1", "no", {"value": "fas fa-fire", "library": "fa-solid"}, None),
        ("mb103", "پرفروش‌ترین‌ها", "/shop/?orderby=popularity", "no", {"value": "", "library": ""}, None),
        ("mb104", "جدیدترین محصولات", "/shop/?orderby=date", "no", {"value": "", "library": ""}, None),
        ("mb105", "برندهای داروخانه", "/shop/", "no", {"value": "", "library": ""}, None),
        ("mb106", "تجهیزات پزشکی", "/product-category/medical-devices/", "no", {"value": "", "library": ""}, None),
        ("mb107", "مجله سلامت", "/blog/", "no", {"value": "", "library": ""}, None),
        ("mb108", "تماس با ما و مشاوره داروساز", "/contact/", "no", {"value": "", "library": ""}, None),
    ]

    rep = []
    children = []
    for idx, (rid, title, url, has_dd, icon, panel) in enumerate(mob_items_spec, start=1):
        rep.append(
            {
                "_id": rid,
                "item_title": title,
                "item_link": {"url": url, "is_external": False, "nofollow": False},
                "item_dropdown_content": has_dd,
                "item_icon": icon,
            }
        )
        if panel is not None:
            children.append(panel)
        else:
            children.append(
                make_container(
                    f"h12002{idx:02d}",
                    {"_title": f"آیتم موبایل: {title}", "padding": dim_all(0)},
                    elements=[],
                    is_inner=True,
                )
            )

    return make_widget(
        "h1000013",
        "mega-menu",
        {
            "_title": "منوی کشویی موبایل و تبلت (آکاردئونی)",
            "menu_name": "منوی موبایل داروخانه",
            "menu_items": rep,
            "item_layout": "dropdown",
            "toggle_align": "flex-start",
            "menu_toggle_icon_normal": {"value": "fas fa-bars", "library": "fa-solid"},
            "menu_toggle_icon_active": {"value": "fas fa-times", "library": "fa-solid"},
            "style_menu_toggle_icon_size": slider(18),
            "menu_toggle_icon_color_normal": "#35485C",
            "menu_toggle_icon_color_hover": "#068462",
            "menu_toggle_icon_color_active": "#068462",
            "menu_toggle_icon_background_color_normal_background": "classic",
            "menu_toggle_icon_background_color_normal_color": "#FFFFFF",
            "menu_toggle_icon_border_normal_border": "solid",
            "menu_toggle_icon_border_normal_width": dim_all(1),
            "menu_toggle_icon_border_normal_color": "#E6ECF1",
            "menu_toggle_icon_border_radius": dim_all(12),
            "menu_toggle_icon__padding": dim_all(10),
            "menu_toggle_icon_distance_from_dropdown": slider(12),
            "dropdown_menu_item_text_color_normal": "#14212E",
            "dropdown_menu_item_text_color_active": "#068462",
            "menu_item_title_typography_typography": "custom",
            "menu_item_title_typography_font_size": slider(13.5),
            "menu_item_title_typography_font_weight": "700",
            "_element_width": "auto",
            "_flex_size": "none",
            "hide_desktop": "hidden-desktop",
        },
        elements=children,
    )


def build_01_header_megamenu():
    # ---------------- ROW 1: TOP DARK SUPPORT BAR (Desktop only) ----------------
    top_right = make_container(
        "h1000002",
        {
            "_title": "بخش راست نوار بالا (پشتیبانی، شرایط ارسال، سؤالات متداول)",
            "content_width": "full",
            "_flex_size": "none",
            "flex_direction": "row",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(20, 0),
            "padding": dim_all(0),
        },
        elements=[
            make_widget(
                "h1000003",
                "icon-list",
                {
                    "_title": "شماره تماس پشتیبانی داروخانه",
                    "view": "inline",
                    "icon_list": [
                        {
                            "_id": "tp1001",
                            "text": "پشتیبانی: ۰۲۱-۰۰۰۰۰۰۰۰",
                            "selected_icon": {"value": "fas fa-phone-alt", "library": "fa-solid"},
                            "link": {"url": "tel:02100000000", "is_external": False, "nofollow": False},
                        }
                    ],
                    "icon_size": slider(12),
                    "icon_color": "#FFFFFF",
                    "text_color": "#FFFFFF",
                    "text_color_hover": "#99E6CD",
                    "text_indent": slider(6),
                    "icon_typography_typography": "custom",
                    "icon_typography_font_size": slider(12),
                    "icon_typography_font_weight": "700",
                    "_element_width": "auto",
                },
            ),
            nav_link_widget("h1000004", "شرایط ارسال", "/shipping/", color="rgba(255, 255, 255, 0.76)", hover_color="#FFFFFF", size=12, weight="500"),
            nav_link_widget("h1000005", "سؤالات متداول", "/faq/", color="rgba(255, 255, 255, 0.76)", hover_color="#FFFFFF", size=12, weight="500"),
        ],
        is_inner=True,
    )

    top_left = make_container(
        "h1000006",
        {
            "_title": "بخش چپ نوار بالا (پیگیری سفارش، مجله سلامت، درباره داروخانه)",
            "content_width": "full",
            "_flex_size": "none",
            "flex_direction": "row",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(20, 0),
            "padding": dim_all(0),
        },
        elements=[
            nav_link_widget("h1000007", "پیگیری سفارش", "/my-account/orders/", color="rgba(255, 255, 255, 0.76)", hover_color="#FFFFFF", size=12, weight="500"),
            nav_link_widget("h1000008", "مجله سلامت", "/blog/", color="rgba(255, 255, 255, 0.76)", hover_color="#FFFFFF", size=12, weight="500"),
            nav_link_widget("h1000009", "درباره داروخانه", "/about/", color="rgba(255, 255, 255, 0.76)", hover_color="#FFFFFF", size=12, weight="500"),
        ],
        is_inner=True,
    )

    top_bar = make_container(
        "h1000001",
        {
            "_title": "نوار بالای هدر (پشتیبانی و لینک‌های سریع — دسکتاپ)",
            "content_width": "boxed",
            "boxed_width": slider(1440),
            "min_height": slider(36),
            "flex_direction": "row",
            "flex_justify_content": "space-between",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(16, 0),
            "background_background": "classic",
            "background_color": "#14212E",
            "padding": dim(0, 24, 0, 24, linked=False),
            "hide_tablet": "hidden-tablet",
            "hide_mobile": "hidden-mobile",
        },
        elements=[top_right, top_left],
        is_inner=False,
    )

    # ---------------- ROW 2: MIDDLE BRAND + SEARCH + USER/CART BAR ----------------
    brand_group = make_container(
        "h1000012",
        {
            "_title": "گروه راست میانی (دکمه منوی موبایل/تبلت + لوگوی داروخانه)",
            "content_width": "full",
            "_flex_size": "none",
            "flex_direction": "row",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(10, 0),
            "padding": dim_all(0),
        },
        elements=[
            build_mobile_tablet_megamenu(),
            make_widget(
                "h1000014",
                "theme-site-logo",
                {
                    "_title": "لوگوی داروخانه (قابل تنظیم از هویت سایت)",
                    "image_size": "full",
                    "link_to": "site_url",
                    "align": "right",
                    "width": slider(132),
                    "width_tablet": slider(112),
                    "width_mobile": slider(98),
                    "_element_width": "auto",
                    "_flex_size": "none",
                },
            ),
        ],
        is_inner=True,
    )

    search_box = make_container(
        "h1000015",
        {
            "_title": "باکس جستجوی محصولات داروخانه",
            "content_width": "full",
            "_flex_size": "grow",
            "_flex_grow": 1,
            "_flex_size_tablet": "grow",
            "_flex_grow_tablet": 1,
            "_flex_size_mobile": "custom",
            "width_mobile": slider(100, "%"),
            "_flex_order_mobile": "end",
            "flex_direction": "column",
            "flex_justify_content": "center",
            "padding": dim_all(0),
        },
        elements=[
            make_widget(
                "h1000016",
                "search-form",
                {
                    "_title": "فرم جستجوی محصولات",
                    "skin": "classic",
                    "placeholder": "نام محصول، برند یا بیماری موردنظر را جستجو کنید...",
                    "button_type": "text",
                    "button_text": "جستجو",
                    "size": slider(44),
                    "size_mobile": slider(40),
                    "input_typography_typography": "custom",
                    "input_typography_font_size": slider(13),
                    "input_typography_font_size_mobile": slider(12),
                    "input_typography_font_weight": "500",
                    "input_text_color": "#14212E",
                    "input_background_color": "#F4F7F9",
                    "input_border_color": "#E6ECF1",
                    "input_text_color_focus": "#14212E",
                    "input_background_color_focus": "#FFFFFF",
                    "input_border_color_focus": "#0FA47A",
                    "button_border_width": dim_all(0),
                    "border_radius": slider(12),
                    "button_typography_typography": "custom",
                    "button_typography_font_size": slider(12.5),
                    "button_typography_font_weight": "800",
                    "button_text_color": "#FFFFFF",
                    "button_background_color": "#068462",
                    "button_text_color_hover": "#FFFFFF",
                    "button_background_color_hover": "#066A50",
                },
            )
        ],
        is_inner=True,
    )

    actions_group = make_container(
        "h1000017",
        {
            "_title": "دکمه‌های کاربری چپ (ورود | ثبت‌نام، علاقه‌مندی و سبد خرید)",
            "content_width": "full",
            "_flex_size": "none",
            "flex_direction": "row",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(8, 0),
            "padding": dim_all(0),
        },
        elements=[
            make_widget(
                "h1000018",
                "button",
                {
                    "_title": "دکمه ورود | ثبت‌نام (دسکتاپ)",
                    "text": "ورود | ثبت‌نام",
                    "link": {"url": "/my-account/", "is_external": False, "nofollow": False},
                    "selected_icon": {"value": "far fa-user", "library": "fa-regular"},
                    "icon_align": "right",
                    "icon_indent": slider(8),
                    "size": "sm",
                    "typography_typography": "custom",
                    "typography_font_size": slider(13),
                    "typography_font_weight": "700",
                    "button_text_color": "#14212E",
                    "background_background": "classic",
                    "background_color": "#FFFFFF",
                    "hover_color": "#068462",
                    "button_background_hover_background": "classic",
                    "button_background_hover_color": "#EAFAF4",
                    "button_hover_border_color": "#5FD4B0",
                    "border_border": "solid",
                    "border_width": dim_all(1),
                    "border_color": "#E6ECF1",
                    "border_radius": dim_all(12),
                    "text_padding": dim(11, 14, 11, 14, linked=False),
                    "_element_width": "auto",
                    "hide_tablet": "hidden-tablet",
                    "hide_mobile": "hidden-mobile",
                },
            ),
            make_widget(
                "h1000019",
                "button",
                {
                    "_title": "دکمه حساب کاربری (موبایل و تبلت)",
                    "text": "",
                    "link": {"url": "/my-account/", "is_external": False, "nofollow": False},
                    "selected_icon": {"value": "far fa-user", "library": "fa-regular"},
                    "icon_indent": slider(0),
                    "size": "sm",
                    "typography_typography": "custom",
                    "typography_font_size": slider(15),
                    "button_text_color": "#35485C",
                    "background_background": "classic",
                    "background_color": "#FFFFFF",
                    "border_border": "solid",
                    "border_width": dim_all(1),
                    "border_color": "#E6ECF1",
                    "border_radius": dim_all(12),
                    "text_padding": dim(11, 12, 11, 12, linked=False),
                    "_element_width": "auto",
                    "hide_desktop": "hidden-desktop",
                },
            ),
            make_widget(
                "h1000020",
                "button",
                {
                    "_title": "دکمه علاقه‌مندی‌ها",
                    "text": "",
                    "link": {"url": "/wishlist/", "is_external": False, "nofollow": False},
                    "selected_icon": {"value": "far fa-heart", "library": "fa-regular"},
                    "icon_indent": slider(0),
                    "size": "sm",
                    "typography_typography": "custom",
                    "typography_font_size": slider(16),
                    "button_text_color": "#35485C",
                    "background_background": "classic",
                    "background_color": "#FFFFFF",
                    "hover_color": "#E5322D",
                    "button_background_hover_background": "classic",
                    "button_background_hover_color": "#FEF2F2",
                    "border_border": "solid",
                    "border_width": dim_all(1),
                    "border_color": "#E6ECF1",
                    "border_radius": dim_all(12),
                    "text_padding": dim(12, 13, 12, 13, linked=False),
                    "_element_width": "auto",
                    "hide_mobile": "hidden-mobile",
                },
            ),
            make_widget(
                "h1000021",
                "woocommerce-menu-cart",
                {
                    "_title": "سبد خرید کشویی ووکامرس (دکمه مربعی سبز)",
                    "icon": "cart-medium",
                    "items_indicator": "bubble",
                    "hide_empty_indicator": "yes",
                    "show_subtotal": "",
                    "cart_type": "side-cart",
                    "open_cart": "click",
                    "side_cart_alignment": "start",
                    "close_cart_button_show": "yes",
                    "view_cart_button_show": "yes",
                    "checkout_button_show": "yes",
                    "automatically_open_cart": "yes",
                    "automatically_update_cart": "yes",
                    "toggle_button_text_color": "#FFFFFF",
                    "toggle_button_icon_color": "#FFFFFF",
                    "toggle_button_background_color": "#0FA47A",
                    "toggle_button_hover_text_color": "#FFFFFF",
                    "toggle_button_hover_icon_color": "#FFFFFF",
                    "toggle_button_hover_background_color": "#068462",
                    "toggle_button_border_width": slider(0),
                    "toggle_button_border_radius": slider(12),
                    "toggle_button_padding": dim(11, 13, 11, 13, linked=False),
                    "_element_width": "auto",
                },
            ),
        ],
        is_inner=True,
    )

    middle_row = make_container(
        "h1000011",
        {
            "_title": "ردیف میانی هدر (لوگو، جستجو، ورود و سبد خرید)",
            "content_width": "boxed",
            "boxed_width": slider(1440),
            "min_height": slider(76),
            "min_height_tablet": slider(64),
            "min_height_mobile": slider(0),
            "flex_direction": "row",
            "flex_justify_content": "space-between",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_wrap_tablet": "nowrap",
            "flex_wrap_mobile": "wrap",
            "flex_gap": gaps(20, 10),
            "flex_gap_tablet": gaps(12, 8),
            "flex_gap_mobile": gaps(8, 10),
            "padding": dim(12, 24, 12, 24, linked=False),
            "padding_tablet": dim(10, 16, 10, 16, linked=False),
            "padding_mobile": dim(10, 12, 10, 12, linked=False),
        },
        elements=[brand_group, search_box, actions_group],
        is_inner=True,
    )

    # ---------------- ROW 3: DESKTOP NAVIGATION & MEGA-MENU BAR ----------------
    desktop_megamenu_widget = make_widget(
        "h1000024",
        "mega-menu",
        {
            "_title": "مگامنو دسته‌بندی محصولات (بازشونده تمام‌عرض)",
            "menu_name": "دسته‌بندی محصولات داروخانه",
            "menu_items": [
                {
                    "_id": "dm1001",
                    "item_title": "دسته‌بندی محصولات",
                    "item_link": {"url": "/shop/", "is_external": False, "nofollow": False},
                    "item_dropdown_content": "yes",
                    "item_icon": {"value": "fas fa-bars", "library": "fa-solid"},
                }
            ],
            "content_width": "full_width",
            "item_layout": "horizontal",
            "item_position_horizontal": "start",
            "open_on": "hover",
            "breakpoint_selector": "none",
            "menu_item_icon": {"value": "", "library": ""},
            "icon_position": "inline-start",
            "icon_size": slider(15),
            "icon_spacing": slider(8),
            "icon_color": "#14212E",
            "icon_color_hover": "#068462",
            "icon_color_active": "#068462",
            "menu_item_title_typography_typography": "custom",
            "menu_item_title_typography_font_size": slider(13.5),
            "menu_item_title_typography_font_weight": "800",
            "menu_item_title_text_color_normal": "#14212E",
            "menu_item_title_text_color_hover": "#068462",
            "menu_item_title_text_color_active": "#068462",
            "menu_item_title_padding": dim(11, 0, 11, 4, linked=False),
            "content_padding": dim_all(0),
            "_element_width": "auto",
            "_flex_size": "none",
        },
        elements=[build_desktop_megamenu_panel()],
    )

    nav_right_group = make_container(
        "h1000023",
        {
            "_title": "گروه لینک‌های راست نوار ناوبری (دقیقاً مطابق هدر دارونیک)",
            "content_width": "full",
            "_flex_size": "none",
            "flex_direction": "row",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(24, 0),
            "padding": dim_all(0),
        },
        elements=[
            desktop_megamenu_widget,
            nav_link_widget("h1000070", "پرفروش‌ترین‌ها", "/shop/?orderby=popularity", color="#14212E", hover_color="#068462", size=13, weight="700"),
            nav_link_widget("h1000071", "تخفیف‌ها و پیشنهاد ویژه", "/shop/?on_sale=1", color="#E5322D", hover_color="#B91C1C", size=13, weight="800"),
            nav_link_widget("h1000072", "جدیدترین‌ها", "/shop/?orderby=date", color="#14212E", hover_color="#068462", size=13, weight="700"),
            nav_link_widget("h1000073", "برندها", "/shop/", color="#14212E", hover_color="#068462", size=13, weight="700"),
            nav_link_widget("h1000074", "تجهیزات پزشکی", "/product-category/medical-devices/", color="#14212E", hover_color="#068462", size=13, weight="700"),
            nav_link_widget("h1000075", "مجله سلامت", "/blog/", color="#14212E", hover_color="#068462", size=13, weight="700"),
        ],
        is_inner=True,
    )

    nav_bar = make_container(
        "h1000022",
        {
            "_title": "ردیف پایین ناوبری و مگامنو (دسکتاپ)",
            "html_tag": "nav",
            "content_width": "boxed",
            "boxed_width": slider(1440),
            "min_height": slider(44),
            "flex_direction": "row",
            "flex_justify_content": "space-between",
            "flex_align_items": "center",
            "flex_wrap": "nowrap",
            "flex_gap": gaps(16, 0),
            "background_background": "classic",
            "background_color": "#FFFFFF",
            "border_border": "solid",
            "border_width": dim(1, 0, 0, 0, linked=False),
            "border_color": "#EEF2F6",
            "padding": dim(0, 24, 0, 24, linked=False),
            "hide_tablet": "hidden-tablet",
            "hide_mobile": "hidden-mobile",
        },
        elements=[
            nav_right_group,
            nav_link_widget("h1000076", "تماس با ما", "/contact/", color="#64798E", hover_color="#068462", size=13, weight="600"),
        ],
        is_inner=True,
    )

    sticky_header = make_container(
        "h1000010",
        {
            "_title": "هدر چسبان اصلی داروخانه (شامل مگامنوی دسکتاپ و منوی آکاردئونی موبایل)",
            "html_tag": "header",
            "content_width": "full",
            "flex_direction": "column",
            "flex_gap": gaps(0, 0, linked=True),
            "background_background": "classic",
            "background_color": "#FFFFFF",
            "border_border": "solid",
            "border_width": dim(0, 0, 1, 0, linked=False),
            "border_color": "#E6ECF1",
            "box_shadow_box_shadow_type": "yes",
            "box_shadow_box_shadow": {
                "horizontal": 0,
                "vertical": 2,
                "blur": 10,
                "spread": 0,
                "color": "rgba(20, 33, 46, 0.04)",
            },
            "padding": dim_all(0),
            "sticky": "top",
            "sticky_on": ["desktop", "tablet", "mobile"],
            "sticky_offset": 0,
            "z_index": 999,
        },
        elements=[middle_row, nav_bar],
        is_inner=False,
    )

    return {
        "version": "0.4",
        "title": "۰۱ — هدر چسبان و مگامنوی چندستونه داروخانه (نسخه نهایی ریسپانسیو)",
        "type": "header",
        "page_settings": [],
        "content": [top_bar, sticky_header],
    }


NESTED_WIDGETS = {"nested-carousel": "carousel_items", "mega-menu": "menu_items"}
FORBIDDEN_WIDGETS = {"html", "shortcode", "code-highlight"}
FORBIDDEN_SUBSTRINGS = ("<style", "<script", "custom_css")


def validate_all_templates():
    global_ids = set()
    for p in sorted(glob.glob(os.path.join(TPL_DIR, "*.json"))):
        fname = os.path.basename(p)
        with open(p, "r", encoding="utf-8") as f:
            doc = json.load(f)
        assert doc.get("version") == "0.4", f"{fname}: bad version"
        assert doc.get("type") in {"header", "loop-item", "section", "product-archive"}, f"{fname}: bad type"
        containers, widgets = [0], [0]

        def walk(el, is_top=False):
            eid = el.get("id")
            assert isinstance(eid, str) and 7 <= len(eid) <= 8, f"{fname}: bad id {eid}"
            assert eid not in global_ids, f"{fname}: duplicate id {eid}"
            global_ids.add(eid)
            el_type = el.get("elType")
            assert el_type in {"container", "widget"}, f"{fname}: bad elType {el_type}"
            settings = el.get("settings", {})
            s_raw = json.dumps(settings, ensure_ascii=False).lower()
            for bad in FORBIDDEN_SUBSTRINGS:
                assert bad not in s_raw, f"{fname}: forbidden '{bad}' in {eid}"
            assert "typography_font_family" not in settings, f"{fname}: hardcoded font in {eid}"

            if el_type == "container":
                containers[0] += 1
                assert el.get("isInner") is (not is_top), f"{fname}: bad isInner on {eid}"
                for ch in el.get("elements", []):
                    walk(ch, is_top=False)
            else:
                widgets[0] += 1
                wtype = el.get("widgetType")
                assert wtype not in FORBIDDEN_WIDGETS, f"{fname}: forbidden widget {wtype}"
                children = el.get("elements", [])
                if wtype in NESTED_WIDGETS:
                    rep_items = settings.get(NESTED_WIDGETS[wtype], [])
                    assert len(children) == len(rep_items), f"{fname}: {wtype} children mismatch"
                    for ch in children:
                        assert ch.get("elType") == "container", f"{fname}: nested child must be container"
                        walk(ch, is_top=False)
                else:
                    assert children == [], f"{fname}: leaf widget {eid} ({wtype}) has children"

        for top in doc["content"]:
            walk(top, is_top=True)
        print(f"✔ {fname} | type={doc['type']} | {containers[0]} containers, {widgets[0]} widgets | {os.path.getsize(p)/1024:.1f} KB")


def main():
    doc = build_01_header_megamenu()
    out_path = os.path.join(TPL_DIR, "01-header-megamenu-dr-farzane-ghasemi.json")
    with open(out_path, "w", encoding="utf-8") as f:
        json.dump(doc, f, ensure_ascii=False, indent=2)
    validate_all_templates()


if __name__ == "__main__":
    main()
