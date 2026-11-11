#!/usr/bin/env python3
"""
Generates and validates Turn 20 Pure-Elementor Templates (Zero Custom Code / CSS):
  - elementor-templates/06-home-hero-trust-dr-farzane-ghasemi.json
  - elementor-templates/09-header-megamenu-dr-farzane-ghasemi.json
"""

import glob
import json
import os

REPO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
TPL_DIR = os.path.join(REPO_ROOT, "elementor-templates")
PUBLIC_MEDIA_BASE = "https://ariagh1386atomv1.github.io/dr-farzane-ghasemi-site/demo-media"


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


def gaps(col, row, unit="px", linked=True):
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


def build_hero_slide(slide_idx, ids, spec):
    cid, box_id, badge_id, h2_id, desc_id, cta_id = ids
    is_dark = spec["theme"] == "dark"

    badge_w = make_widget(
        badge_id,
        "heading",
        {
            "_title": f"نشان اسلاید {slide_idx}",
            "title": spec["badge"],
            "header_size": "span",
            "align": "right",
            "title_color": "#FFFFFF",
            "typography_typography": "custom",
            "typography_font_size": slider(11),
            "typography_font_weight": "800",
            "typography_line_height": slider(1.6, "em"),
            "_background_background": "classic",
            "_background_color": "rgba(255, 255, 255, 0.18)" if is_dark else "#0FA47A",
            "_padding": dim(5, 12, 5, 12, linked=False),
            "_border_radius": dim_all(8),
            "_element_width": "auto",
        },
    )

    h2_w = make_widget(
        h2_id,
        "heading",
        {
            "_title": f"تیتر اسلاید {slide_idx}",
            "title": spec["title"],
            "header_size": "h2",
            "align": "right",
            "title_color": "#FFFFFF" if is_dark else "#14212E",
            "typography_typography": "custom",
            "typography_font_size": slider(34),
            "typography_font_size_tablet": slider(26),
            "typography_font_size_mobile": slider(21),
            "typography_font_weight": "800",
            "typography_line_height": slider(1.6, "em"),
        },
    )

    desc_w = make_widget(
        desc_id,
        "heading",
        {
            "_title": f"توضیح اسلاید {slide_idx}",
            "title": spec["desc"],
            "header_size": "p",
            "align": "right",
            "title_color": "rgba(255, 255, 255, 0.82)" if is_dark else "#35485C",
            "typography_typography": "custom",
            "typography_font_size": slider(13.5),
            "typography_font_size_mobile": slider(12),
            "typography_font_weight": "500",
            "typography_line_height": slider(1.95, "em"),
        },
    )

    cta_w = make_widget(
        cta_id,
        "button",
        {
            "_title": f"دکمه اقدام اسلاید {slide_idx}",
            "text": spec["cta"],
            "link": {"url": spec["href"], "is_external": False, "nofollow": False},
            "typography_typography": "custom",
            "typography_font_size": slider(14),
            "typography_font_weight": "700",
            "button_text_color": "#FFFFFF",
            "hover_color": "#FFFFFF",
            "background_background": "gradient",
            "background_color": "#0FA47A",
            "background_color_b": "#068462",
            "background_gradient_angle": slider(180, "deg"),
            "button_background_hover_background": "classic",
            "button_background_hover_color": "#066A50",
            "border_radius": dim_all(12),
            "text_padding": dim(11, 24, 11, 24, linked=False),
            "button_box_shadow_box_shadow_type": "yes",
            "button_box_shadow_box_shadow": {
                "horizontal": 0,
                "vertical": 6,
                "blur": 16,
                "spread": 0,
                "color": "rgba(6, 132, 98, 0.26)",
            },
            "_element_width": "auto",
        },
    )

    content_box = make_container(
        box_id,
        {
            "_title": f"محتوای متنی اسلاید {slide_idx}",
            "content_width": "full",
            "width": slider(500),
            "width_tablet": slider(75, "%"),
            "width_mobile": slider(100, "%"),
            "flex_direction": "column",
            "flex_justify_content": "center",
            "flex_align_items": "flex-start",
            "flex_gap": gaps(12, 12),
            "padding": dim_all(0),
        },
        elements=[badge_w, h2_w, desc_w, cta_w],
        is_inner=True,
    )

    return make_container(
        cid,
        {
            "_title": f"اسلاید {slide_idx} — {spec['short_label']}",
            "content_width": "full",
            "min_height": slider(412),
            "min_height_tablet": slider(340),
            "min_height_mobile": slider(280),
            "flex_direction": "row",
            "flex_justify_content": "flex-start",
            "flex_align_items": "center",
            "background_background": "classic",
            "background_color": spec["bg_fallback"],
            "background_image": {"url": spec["image_url"], "id": ""},
            "background_position": "center left",
            "background_repeat": "no-repeat",
            "background_size": "cover",
            "background_overlay_background": "gradient",
            "background_overlay_color": spec["ov_start"],
            "background_overlay_color_b": spec["ov_end"],
            "background_overlay_gradient_angle": slider(270, "deg"),
            "background_overlay_opacity": slider(0.92),
            "border_radius": dim_all(16),
            "padding": dim(36, 44, 44, 44, linked=False),
            "padding_tablet": dim(28, 28, 36, 28, linked=False),
            "padding_mobile": dim(22, 18, 34, 18, linked=False),
            "overflow": "hidden",
        },
        elements=[content_box],
        is_inner=True,
    )


def build_06_home_hero_and_trust():
    slides_data = [
        {
            "rep_id": "hs60001",
            "short_label": "روتین پوستی",
            "badge": "روتین پوستی · تا ۲۵٪ تخفیف",
            "title": "پوست شما لایق مراقبت روزانه است",
            "desc": "ضدآفتاب، سرم ویتامین C و مرطوب‌کننده‌های تخصصی برای همه انواع پوست، با تضمین اصالت کالا.",
            "cta": "مشاهده مراقبت پوست",
            "href": "/product-category/skin-care/",
            "theme": "light",
            "bg_fallback": "#EFF7F2",
            "image_url": f"{PUBLIC_MEDIA_BASE}/banners/hero-skincare.jpg",
            "ov_start": "rgba(255, 255, 255, 0.94)",
            "ov_end": "rgba(255, 255, 255, 0.12)",
            "ids": ("f6000005", "f6000006", "f6000007", "f6000008", "f6000009", "f6000010"),
        },
        {
            "rep_id": "hs60002",
            "short_label": "مکمل‌های ورزشی",
            "badge": "کمپین تناسب اندام · تا ۴۰٪ تخفیف",
            "title": "مکمل‌های ورزشی اصل، با مشاوره تخصصی",
            "desc": "پروتئین وی، کراتین و آمینواسید از برندهای منتخب؛ همراه با راهنمای مصرف و پشتیبانی داروساز.",
            "cta": "خرید مکمل ورزشی",
            "href": "/product-category/sports-supplements/",
            "theme": "dark",
            "bg_fallback": "#14212E",
            "image_url": f"{PUBLIC_MEDIA_BASE}/banners/hero-sports.jpg",
            "ov_start": "rgba(20, 33, 46, 0.90)",
            "ov_end": "rgba(20, 33, 46, 0.25)",
            "ids": ("f6000011", "f6000012", "f6000013", "f6000014", "f6000015", "f6000016"),
        },
        {
            "rep_id": "hs60003",
            "short_label": "ویتامین‌های خانواده",
            "badge": "سلامت خانواده · تا ۳۰٪ تخفیف",
            "title": "ویتامین‌ها و مکمل‌های روزانه خانواده",
            "desc": "مولتی‌ویتامین، ویتامین D، امگا ۳ و مکمل کودکان؛ ارسال سریع به سراسر ایران.",
            "cta": "خرید ویتامین",
            "href": "/product-category/vitamins/",
            "theme": "light",
            "bg_fallback": "#EAF7F3",
            "image_url": f"{PUBLIC_MEDIA_BASE}/banners/hero-vitamins.jpg",
            "ov_start": "rgba(255, 255, 255, 0.93)",
            "ov_end": "rgba(255, 255, 255, 0.15)",
            "ids": ("f6000017", "f6000018", "f6000019", "f6000020", "f6000021", "f6000022"),
        },
    ]

    slide_containers = [build_hero_slide(idx + 1, s["ids"], s) for idx, s in enumerate(slides_data)]

    hero_carousel = make_widget(
        "f6000004",
        "nested-carousel",
        {
            "_title": "اسلایدر اصلی ۳ اسلایده صفحه اول (Nested Carousel)",
            "carousel_name": "پیشنهادهای ویژه داروخانه",
            "carousel_items": [
                {"_id": s["rep_id"], "slide_title": f"اسلاید {i + 1} — {s['short_label']}"}
                for i, s in enumerate(slides_data)
            ],
            "slides_to_show": "1",
            "slides_to_show_tablet": "1",
            "slides_to_show_mobile": "1",
            "slides_to_scroll": "1",
            "equal_height": "yes",
            "autoplay": "yes",
            "autoplay_speed": 6500,
            "pause_on_hover": "yes",
            "pause_on_interaction": "yes",
            "infinite": "yes",
            "speed": 600,
            "direction": "rtl",
            "arrows": "yes",
            "navigation_previous_icon": {"value": "fas fa-chevron-left", "library": "fa-solid"},
            "navigation_next_icon": {"value": "fas fa-chevron-right", "library": "fa-solid"},
            "navigation_previous_icon_horizontal_position": slider(12),
            "navigation_next_icon_horizontal_position": slider(12),
            "pagination": "bullets",
            "dots_position": "inside",
            "dots_size": slider(8),
            "dots_gap": slider(6),
            "dots_normal_color": "rgba(20, 33, 46, 0.25)",
            "dots_hover_color": "#0FA47A",
            "image_spacing_custom": slider(0),
        },
        elements=slide_containers,
    )

    slider_col = make_container(
        "f6000003",
        {
            "_title": "ستون راست — اسلایدر اصلی هیرو",
            "content_width": "full",
            "flex_direction": "column",
            "padding": dim_all(0),
            "_flex_size": "grow",
        },
        elements=[hero_carousel],
        is_inner=True,
    )

    dev_card = make_container(
        "f6000024",
        {
            "_title": "بنر کناری ۱ — تجهیزات پزشکی خانگی",
            "html_tag": "a",
            "link": {"url": "/product-category/medical-devices/", "is_external": False, "nofollow": False},
            "content_width": "full",
            "width_tablet": slider(48.5, "%"),
            "width_mobile": slider(100, "%"),
            "min_height": slider(200),
            "min_height_mobile": slider(165),
            "flex_direction": "column",
            "flex_justify_content": "space-between",
            "flex_align_items": "flex-start",
            "background_background": "classic",
            "background_color": "#10253B",
            "background_image": {"url": f"{PUBLIC_MEDIA_BASE}/banners/banner-devices.jpg", "id": ""},
            "background_position": "center left",
            "background_size": "cover",
            "background_overlay_background": "gradient",
            "background_overlay_color": "#16324F",
            "background_overlay_color_b": "rgba(11, 28, 45, 0.45)",
            "background_overlay_gradient_angle": slider(250, "deg"),
            "background_overlay_opacity": slider(0.86),
            "border_radius": dim_all(16),
            "padding": dim_all(18),
            "overflow": "hidden",
            "_flex_size": "grow",
        },
        elements=[
            make_container(
                "f6000025",
                {"_title": "متن بنر تجهیزات پزشکی", "content_width": "full", "flex_direction": "column", "flex_gap": gaps(4, 4), "padding": dim_all(0)},
                elements=[
                    make_widget("f6000026", "heading", {"_title": "تیتر تجهیزات پزشکی خانگی", "title": "تجهیزات پزشکی خانگی", "header_size": "h3", "align": "right", "title_color": "#FFFFFF", "typography_typography": "custom", "typography_font_size": slider(15), "typography_font_weight": "800"}),
                    make_widget("f6000027", "heading", {"_title": "زیرعنوان تجهیزات پزشکی", "title": "فشارسنج، گلوکومتر و نبولایزر", "header_size": "p", "align": "right", "title_color": "rgba(255, 255, 255, 0.76)", "typography_typography": "custom", "typography_font_size": slider(11.5), "typography_font_weight": "500"}),
                ],
                is_inner=True,
            ),
            make_widget("f6000028", "heading", {"_title": "دکمه خرید با گارانتی", "title": "خرید با گارانتی", "header_size": "span", "title_color": "#FFFFFF", "typography_typography": "custom", "typography_font_size": slider(11), "typography_font_weight": "700", "_background_background": "classic", "_background_color": "rgba(255, 255, 255, 0.18)", "_padding": dim(5, 11, 5, 11, linked=False), "_border_radius": dim_all(8), "_element_width": "auto"}),
        ],
        is_inner=True,
    )

    mom_card = make_container(
        "f6000029",
        {
            "_title": "بنر کناری ۲ — دنیای مادر و کودک",
            "html_tag": "a",
            "link": {"url": "/product-category/mom-baby/", "is_external": False, "nofollow": False},
            "content_width": "full",
            "width_tablet": slider(48.5, "%"),
            "width_mobile": slider(100, "%"),
            "min_height": slider(200),
            "min_height_mobile": slider(165),
            "flex_direction": "column",
            "flex_justify_content": "space-between",
            "flex_align_items": "flex-start",
            "background_background": "classic",
            "background_color": "#FDECE2",
            "background_image": {"url": f"{PUBLIC_MEDIA_BASE}/banners/banner-mom.jpg", "id": ""},
            "background_position": "center left",
            "background_size": "cover",
            "background_overlay_background": "gradient",
            "background_overlay_color": "rgba(253, 236, 226, 0.94)",
            "background_overlay_color_b": "rgba(253, 236, 226, 0.35)",
            "background_overlay_gradient_angle": slider(260, "deg"),
            "background_overlay_opacity": slider(0.9),
            "border_radius": dim_all(16),
            "padding": dim_all(18),
            "overflow": "hidden",
            "_flex_size": "grow",
        },
        elements=[
            make_container(
                "f6000030",
                {"_title": "متن بنر مادر و کودک", "content_width": "full", "flex_direction": "column", "flex_gap": gaps(4, 4), "padding": dim_all(0)},
                elements=[
                    make_widget("f6000031", "heading", {"_title": "تیتر دنیای مادر و کودک", "title": "دنیای مادر و کودک", "header_size": "h3", "align": "right", "title_color": "#14212E", "typography_typography": "custom", "typography_font_size": slider(15), "typography_font_weight": "800"}),
                    make_widget("f6000032", "heading", {"_title": "زیرعنوان مادر و کودک", "title": "محصولات ملایم مخصوص پوست نوزاد", "header_size": "p", "align": "right", "title_color": "#35485C", "typography_typography": "custom", "typography_font_size": slider(11.5), "typography_font_weight": "500"}),
                ],
                is_inner=True,
            ),
            make_widget("f6000033", "heading", {"_title": "دکمه مشاهده محصولات", "title": "مشاهده محصولات", "header_size": "span", "title_color": "#066A50", "typography_typography": "custom", "typography_font_size": slider(11), "typography_font_weight": "800", "_background_background": "classic", "_background_color": "#FFFFFF", "_padding": dim(5, 11, 5, 11, linked=False), "_border_radius": dim_all(8), "_element_width": "auto"}),
        ],
        is_inner=True,
    )

    side_banners_col = make_container(
        "f6000023",
        {
            "_title": "ستون چپ — ۲ بنر کناری (۳۰۰ پیکسل)",
            "content_width": "full",
            "width": slider(305),
            "width_tablet": slider(100, "%"),
            "width_mobile": slider(100, "%"),
            "flex_direction": "column",
            "flex_direction_tablet": "row",
            "flex_direction_mobile": "column",
            "flex_wrap": "wrap",
            "flex_gap": gaps(12, 12),
            "padding": dim_all(0),
            "_flex_size": "none",
        },
        elements=[dev_card, mom_card],
        is_inner=True,
    )

    hero_top_grid = make_container(
        "f6000002",
        {
            "_title": "شبکه بالای هیرو (اسلایدر راست + ۲ بنر چپ)",
            "content_width": "full",
            "flex_direction": "row",
            "flex_direction_tablet": "column",
            "flex_direction_mobile": "column",
            "flex_align_items": "stretch",
            "flex_gap": gaps(12, 12),
            "padding": dim_all(0),
        },
        elements=[slider_col, side_banners_col],
        is_inner=True,
    )

    trust_items = [
        ("f6000035", "f6000036", "f6000037", "f6000038", "f6000039", "fas fa-shipping-fast", "ارسال سریع", "تحویل درون‌شهری زیر ۴ ساعت"),
        ("f6000040", "f6000041", "f6000042", "f6000043", "f6000044", "fas fa-shield-alt", "تضمین اصالت", "تأمین از مسیر رسمی"),
        ("f6000045", "f6000046", "f6000047", "f6000048", "f6000049", "fas fa-comment-medical", "مشاوره داروساز", "پاسخ‌گویی ۷ روز هفته"),
        ("f6000050", "f6000051", "f6000052", "f6000053", "f6000054", "fas fa-undo-alt", "بازگشت کالا", "تا ۷ روز برای کالای پلمب"),
    ]

    trust_cards = []
    for card_id, ico_id, txt_col_id, t_id, d_id, ico_cls, title_tx, desc_tx in trust_items:
        ico_w = make_widget("f" if False else ico_id, "icon", {"_title": f"آیکون {title_tx}", "selected_icon": {"value": ico_cls, "library": "fa-solid"}, "view": "stacked", "shape": "square", "primary_color": "#EAFAF4", "secondary_color": "#068462", "size": slider(20), "icon_padding": slider(12), "border_radius": dim_all(12), "_flex_size": "none"})
        txt_col = make_container(
            txt_col_id,
            {"_title": f"متن {title_tx}", "content_width": "full", "flex_direction": "column", "flex_gap": gaps(2, 2), "padding": dim_all(0)},
            elements=[
                make_widget(t_id, "heading", {"_title": title_tx, "title": title_tx, "header_size": "h4", "align": "right", "title_color": "#14212E", "typography_typography": "custom", "typography_font_size": slider(13.5), "typography_font_weight": "800"}),
                make_widget(d_id, "heading", {"_title": desc_tx, "title": desc_tx, "header_size": "span", "align": "right", "title_color": "#64798E", "typography_typography": "custom", "typography_font_size": slider(11.5), "typography_font_weight": "500"}),
            ],
            is_inner=True,
        )
        trust_cards.append(
            make_container(
                card_id,
                {
                    "_title": f"کارت اعتماد: {title_tx}",
                    "content_width": "full",
                    "width": slider(24, "%"),
                    "width_tablet": slider(48.5, "%"),
                    "width_mobile": slider(47.5, "%"),
                    "flex_direction": "row",
                    "flex_align_items": "center",
                    "flex_gap": gaps(12, 12),
                    "background_background": "classic",
                    "background_color": "#FFFFFF",
                    "border_radius": dim_all(16),
                    "box_shadow_box_shadow_type": "yes",
                    "box_shadow_box_shadow": {"horizontal": 0, "vertical": 2, "blur": 10, "spread": 0, "color": "rgba(20, 33, 46, 0.06)"},
                    "padding": dim_all(16),
                    "padding_mobile": dim_all(12),
                    "_flex_size": "grow",
                },
                elements=[ico_w, txt_col],
                is_inner=True,
            )
        )

    trust_row = make_container("f6000034", {"_title": "ردیف ۴ کارت تضمین و خدمات داروخانه", "content_width": "full", "flex_direction": "row", "flex_wrap": "wrap", "flex_gap": gaps(12, 12), "padding": dim_all(0)}, elements=trust_cards, is_inner=True)

    root = make_container(
        "f6000001",
        {
            "_title": "سکشن کامل مین هیرو + بنرهای کناری + ردیف اعتماد (صفحه اصلی)",
            "html_tag": "section",
            "content_width": "boxed",
            "boxed_width": slider(1440),
            "flex_direction": "column",
            "flex_gap": gaps(16, 16),
            "background_background": "classic",
            "background_color": "#F4F7F9",
            "padding": dim_all(20),
            "padding_mobile": dim_all(12),
        },
        elements=[hero_top_grid, trust_row],
        is_inner=False,
    )

    return {
        "version": "0.4",
        "title": "۰۶ — مین هیرو صفحه اصلی + ۲ بنر کناری + ۴ کارت اعتماد",
        "type": "section",
        "content": [root],
        "page_settings": [],
    }


def build_09_header_megamenu():
    with open(os.path.join(TPL_DIR, "01-header-dr-farzane-ghasemi.json"), "r", encoding="utf-8") as f:
        h1 = json.load(f)

    raw_h1 = json.dumps(h1, ensure_ascii=False)
    for n in range(1, 40):
        raw_h1 = raw_h1.replace(f"a10000{n:02d}", f"m90000{n:02d}")
    h9 = json.loads(raw_h1)
    h9["title"] = "۰۹ — هدر ارتقایافته همراه با مگامنو چندستونه دارونیک (بدون کد)"

    mega_cols_spec = [
        ("m9100010", "مکمل‌های ورزشی", "/product-category/sports-supplements/", [("پروتئین و وی", "/product-category/sports-supplements/protein/"), ("کراتین مونوهیدرات", "/product-category/sports-supplements/creatine/"), ("آمینو اسید و BCAA", "/product-category/sports-supplements/amino/"), ("گینر و افزایش وزن", "/product-category/sports-supplements/mass-gainer/"), ("پیش از تمرین", "/product-category/sports-supplements/pre-workout/")]),
        ("m9100020", "ویتامین و مکمل روزانه", "/product-category/vitamins/", [("مولتی‌ویتامین بزرگسالان", "/product-category/vitamins/multivitamin/"), ("ویتامین D و کلسیم", "/product-category/vitamins/vitamin-d/"), ("امگا ۳ و روغن ماهی", "/product-category/vitamins/omega/"), ("زینک، آهن و مینرال‌ها", "/product-category/vitamins/minerals/"), ("مکمل بانوان و کودکان", "/product-category/vitamins/women-supplement/")]),
        ("m9100030", "مراقبت پوست و مو", "/product-category/skin-care/", [("ضدآفتاب تخصصی", "/product-category/skin-care/sunscreen/"), ("سرم ویتامین C و نیاسینامید", "/product-category/skin-care/face-serum/"), ("مرطوب‌کننده و آبرسان", "/product-category/skin-care/moisturizer/"), ("شامپو و ضدریزش مو", "/product-category/hair-care/shampoo/"), ("بهداشت دهان و دندان", "/product-category/oral-care/")]),
        ("m9100040", "تجهیزات پزشکی و کودک", "/product-category/medical-devices/", [("فشارسنج بازویی و مچی", "/product-category/medical-devices/blood-pressure/"), ("تست قند خون و نوار", "/product-category/medical-devices/glucose/"), ("تب‌سنج و پالس اکسیمتر", "/product-category/medical-devices/thermometer/"), ("شامپو و کرم کودک", "/product-category/mom-baby/baby-skin/"), ("شیشه شیر و تغذیه نوزاد", "/product-category/mom-baby/baby-feeding/")]),
    ]

    mega_col_containers = []
    wid_counter = 50
    for col_id, parent_title, parent_url, links in mega_cols_spec:
        wid_counter += 1
        head_w = make_widget(f"m91000{wid_counter:02d}", "heading", {"_title": parent_title, "title": parent_title, "header_size": "h4", "align": "right", "link": {"url": parent_url, "is_external": False, "nofollow": False}, "title_color": "#066A50", "typography_typography": "custom", "typography_font_size": slider(13.5), "typography_font_weight": "800", "_padding": dim(0, 0, 6, 0, linked=False), "_border_border": "solid", "_border_width": dim(0, 0, 1, 0, linked=False), "_border_color": "#E6ECF1"})
        link_widgets = []
        for l_title, l_url in links:
            wid_counter += 1
            link_widgets.append(make_widget(f"m91000{wid_counter:02d}", "heading", {"_title": l_title, "title": l_title, "header_size": "span", "align": "right", "link": {"url": l_url, "is_external": False, "nofollow": False}, "title_color": "#35485C", "title_hover_color": "#0FA47A", "typography_typography": "custom", "typography_font_size": slider(12.5), "typography_font_weight": "600", "typography_line_height": slider(1.9, "em")}))
        mega_col_containers.append(make_container(col_id, {"_title": f"ستون مگامنو: {parent_title}", "content_width": "full", "width": slider(18.5, "%"), "width_tablet": slider(48, "%"), "width_mobile": slider(100, "%"), "flex_direction": "column", "flex_gap": gaps(6, 6), "padding": dim_all(6), "_flex_size": "grow"}, elements=[head_w] + link_widgets, is_inner=True))

    mega_promo_card = make_container(
        "m9100090",
        {"_title": "کارت تخفیف ویژه داخل مگامنو", "html_tag": "a", "link": {"url": "/shop/?on_sale=1", "is_external": False, "nofollow": False}, "content_width": "full", "width": slider(230), "width_tablet": slider(100, "%"), "min_height": slider(190), "flex_direction": "column", "flex_justify_content": "space-between", "flex_align_items": "flex-start", "background_background": "gradient", "background_color": "#068462", "background_color_b": "#085340", "background_gradient_angle": slider(145, "deg"), "border_radius": dim_all(16), "padding": dim_all(18), "_flex_size": "none"},
        elements=[
            make_widget("m9100091", "heading", {"_title": "تیتر کمپین مگامنو", "title": "هفته سلامت داروخانه", "header_size": "h4", "align": "right", "title_color": "#FFFFFF", "typography_typography": "custom", "typography_font_size": slider(14), "typography_font_weight": "800"}),
            make_widget("m9100092", "heading", {"_title": "توضیح کمپین مگامنو", "title": "تا ۴۰٪ تخفیف روی مکمل‌های ورزشی، مراقبت پوست و تجهیزات پزشکی خانگی", "header_size": "p", "align": "right", "title_color": "rgba(255,255,255,0.84)", "typography_typography": "custom", "typography_font_size": slider(11.5), "typography_font_weight": "500", "typography_line_height": slider(1.85, "em")}),
            make_widget("m9100093", "heading", {"_title": "دکمه مشاهده پیشنهادها", "title": "مشاهده پیشنهادها ‹", "header_size": "span", "title_color": "#066A50", "typography_typography": "custom", "typography_font_size": slider(11), "typography_font_weight": "800", "_background_background": "classic", "_background_color": "#FFFFFF", "_padding": dim(6, 12, 6, 12, linked=False), "_border_radius": dim_all(8), "_element_width": "auto"}),
        ],
        is_inner=True,
    )

    dropdown_panel_1 = make_container(
        "m9100002",
        {"_title": "پنل بازشونده مگامنو دسته‌بندی محصولات", "content_width": "boxed", "boxed_width": slider(1400), "flex_direction": "row", "flex_wrap": "wrap", "flex_align_items": "stretch", "flex_gap": gaps(16, 16), "background_background": "classic", "background_color": "#FFFFFF", "border_border": "solid", "border_width": dim_all(1), "border_color": "#E6ECF1", "border_radius": dim(0, 0, 16, 16, linked=False), "box_shadow_box_shadow_type": "yes", "box_shadow_box_shadow": {"horizontal": 0, "vertical": 14, "blur": 34, "spread": 0, "color": "rgba(20, 33, 46, 0.12)"}, "padding": dim(20, 24, 20, 24, linked=False)},
        elements=mega_col_containers + [mega_promo_card],
        is_inner=True,
    )

    menu_items_spec = [
        ("mm9001", "دسته‌بندی محصولات", "/shop/", "yes", {"value": "fas fa-th-large", "library": "fa-solid"}, dropdown_panel_1),
        ("mm9002", "پرفروش‌ترین‌ها", "/shop/?orderby=popularity", "no", {"value": "", "library": ""}, None),
        ("mm9003", "جدیدترین‌ها", "/shop/?orderby=date", "no", {"value": "", "library": ""}, None),
        ("mm9004", "تجهیزات پزشکی", "/product-category/medical-devices/", "no", {"value": "", "library": ""}, None),
        ("mm9005", "مراقبت پوست", "/product-category/skin-care/", "no", {"value": "", "library": ""}, None),
        ("mm9006", "مادر و کودک", "/product-category/mom-baby/", "no", {"value": "", "library": ""}, None),
        ("mm9007", "مجله سلامت", "/blog/", "no", {"value": "", "library": ""}, None),
    ]

    mm_repeater = []
    mm_children = []
    for idx, (rid, mtitle, murl, has_dd, micon, panel) in enumerate(menu_items_spec):
        mm_repeater.append({"_id": rid, "item_title": mtitle, "item_link": {"url": murl, "is_external": False, "nofollow": False}, "item_dropdown_content": has_dd, "item_icon": micon})
        if panel is not None:
            mm_children.append(panel)
        else:
            mm_children.append(make_container(f"m91009{idx:02d}", {"_title": f"آیتم ساده: {mtitle}", "padding": dim_all(0)}, elements=[], is_inner=True))

    mega_menu_widget = make_widget(
        "m9100001",
        "mega-menu",
        {
            "_title": "مگامنو جامع داروخانه (Elementor Pro Menu)",
            "menu_name": "مگامنو اصلی داروخانه دکتر فرزانه قاسمی",
            "menu_items": mm_repeater,
            "content_width": "full_width",
            "item_layout": "horizontal",
            "item_position_horizontal": "start",
            "menu_item_icon": {"value": "fas fa-angle-down", "library": "fa-solid"},
        },
        elements=mm_children,
    )

    def replace_bottom_nav(container):
        if container.get("id") == "m9000017":
            left_promo = container["elements"][-1]
            container["elements"] = [mega_menu_widget, left_promo]
            return True
        for ch in container.get("elements", []):
            if ch.get("elType") == "container" and replace_bottom_nav(ch):
                return True
        return False

    assert any(replace_bottom_nav(top) for top in h9["content"]), "Could not locate bottom navbar container m9000017"
    return h9


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
    hero_doc = build_06_home_hero_and_trust()
    with open(os.path.join(TPL_DIR, "06-home-hero-trust-dr-farzane-ghasemi.json"), "w", encoding="utf-8") as f:
        json.dump(hero_doc, f, ensure_ascii=False, indent=2)

    mega_doc = build_09_header_megamenu()
    with open(os.path.join(TPL_DIR, "09-header-megamenu-dr-farzane-ghasemi.json"), "w", encoding="utf-8") as f:
        json.dump(mega_doc, f, ensure_ascii=False, indent=2)

    validate_all_templates()


if __name__ == "__main__":
    main()
