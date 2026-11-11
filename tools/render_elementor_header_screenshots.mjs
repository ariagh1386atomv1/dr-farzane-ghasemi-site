#!/usr/bin/env node
/**
 * Faithful Elementor-JSON -> Yoga CSS Flexbox (RTL) + Resvg (HarfBuzz + Dana Font) Renderer.
 * Loads `elementor-templates/01-header-megamenu-dr-farzane-ghasemi.json` directly from disk,
 * computes real CSS Flexbox layout across Desktop (1440px, 1280px), Mega-Menu Open, Tablet (768px),
 * and Mobile (390px closed & open), asserts 0px horizontal overflow, and saves crisp PNG screenshots.
 */

import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { Resvg } from "/tmp/studio-e2e/node_modules/@resvg/resvg-js/index.js";
import Yoga, {
  Align,
  Direction,
  Edge,
  FlexDirection,
  Gutter,
  Justify,
  Wrap,
} from "/tmp/studio-e2e/node_modules/yoga-layout/dist/src/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const TPL_PATH = path.join(REPO_ROOT, "elementor-templates/01-header-megamenu-dr-farzane-ghasemi.json");
const OUT_DIR = path.join(REPO_ROOT, "demo-media/screenshots");

fs.mkdirSync(OUT_DIR, { recursive: true });

const FONT_FILES = [
  path.join(REPO_ROOT, "assets/fonts/Dana-Regular.ttf"),
  path.join(REPO_ROOT, "assets/fonts/Dana-Medium.ttf"),
  path.join(REPO_ROOT, "assets/fonts/Dana-DemiBold.ttf"),
  path.join(REPO_ROOT, "assets/fonts/Dana-Bold.ttf"),
];

const esc = (s) =>
  String(s)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");

function getResp(settings, key, device) {
  if (device === "mobile") {
    if (settings[`${key}_mobile`] !== undefined) return settings[`${key}_mobile`];
    if (settings[`${key}_tablet`] !== undefined) return settings[`${key}_tablet`];
  } else if (device === "tablet") {
    if (settings[`${key}_tablet`] !== undefined) return settings[`${key}_tablet`];
  }
  return settings[key];
}

function isHidden(settings, device) {
  if (device === "desktop" && settings.hide_desktop === "hidden-desktop") return true;
  if (device === "tablet" && settings.hide_tablet === "hidden-tablet") return true;
  if (device === "mobile" && settings.hide_mobile === "hidden-mobile") return true;
  return false;
}

function estTextWidth(text, fontSize, bold = true) {
  const chars = [...String(text)].length;
  return Math.ceil(chars * fontSize * (bold ? 0.45 : 0.42) + 2);
}

/**
 * Right-aligned RTL text helper for resvg:
 * With RLE (\u202B) ... PDF (\u202C) and text-anchor="end", RTL punctuation & mixed Latin stay in true RTL order.
 */
function rtlText(rightX, baselineY, text, { size = 13, weight = "700", fill = "#14212E" } = {}) {
  return `<text x="${rightX}" y="${baselineY}" text-anchor="end" font-family="Dana" font-weight="${weight}" font-size="${size}" fill="${fill}">&#x202B;${esc(text)}&#x202C;</text>`;
}

function centerRtlText(centerX, baselineY, text, { size = 13, weight = "700", fill = "#FFFFFF" } = {}) {
  return `<text x="${centerX}" y="${baselineY}" text-anchor="middle" font-family="Dana" font-weight="${weight}" font-size="${size}" fill="${fill}">&#x202B;${esc(text)}&#x202C;</text>`;
}

function renderHeaderState({ viewportWidth, device, openDesktopMega = false, openMobileMenu = false, label }) {
  const tpl = JSON.parse(fs.readFileSync(TPL_PATH, "utf8"));
  const svgParts = [];

  const rootYoga = Yoga.Node.create();
  rootYoga.setWidth(viewportWidth);
  rootYoga.setFlexDirection(FlexDirection.Column);

  const rootItems = [];

  function buildTree(el, currentDevice) {
    const s = el.settings || {};
    if (isHidden(s, currentDevice)) return null;

    const node = Yoga.Node.create();
    const item = { node, el, s, children: [] };

    if (el.elType === "container") {
      const dir = getResp(s, "flex_direction", currentDevice) || "column";
      node.setFlexDirection(dir === "row" ? FlexDirection.Row : FlexDirection.Column);

      const wrap = getResp(s, "flex_wrap", currentDevice) || "nowrap";
      node.setFlexWrap(wrap === "wrap" ? Wrap.Wrap : Wrap.NoWrap);

      const jc = getResp(s, "flex_justify_content", currentDevice) || "flex-start";
      if (jc === "space-between") node.setJustifyContent(Justify.SpaceBetween);
      else if (jc === "center") node.setJustifyContent(Justify.Center);
      else if (jc === "flex-end") node.setJustifyContent(Justify.FlexEnd);
      else node.setJustifyContent(Justify.FlexStart);

      const ai = getResp(s, "flex_align_items", currentDevice) || "stretch";
      if (ai === "center") node.setAlignItems(Align.Center);
      else if (ai === "flex-start") node.setAlignItems(Align.FlexStart);
      else if (ai === "flex-end") node.setAlignItems(Align.FlexEnd);
      else node.setAlignItems(Align.Stretch);

      const gap = getResp(s, "flex_gap", currentDevice);
      if (gap) {
        if (gap.column !== undefined && gap.column !== "") node.setGap(Gutter.Column, Number(gap.column));
        if (gap.row !== undefined && gap.row !== "") node.setGap(Gutter.Row, Number(gap.row));
      }

      const pad = getResp(s, "padding", currentDevice);
      let padR = Number(pad?.right || 0);
      let padL = Number(pad?.left || 0);
      const padT = Number(pad?.top || 0);
      const padB = Number(pad?.bottom || 0);

      if (s.content_width === "boxed" && s.boxed_width?.size && viewportWidth > s.boxed_width.size) {
        const extra = (viewportWidth - s.boxed_width.size) / 2;
        padR += extra;
        padL += extra;
      }

      node.setPadding(Edge.Top, padT);
      node.setPadding(Edge.Right, padR);
      node.setPadding(Edge.Bottom, padB);
      node.setPadding(Edge.Left, padL);

      const minH = getResp(s, "min_height", currentDevice);
      if (minH?.size) node.setMinHeight(Number(minH.size));

      const fsize = getResp(s, "_flex_size", currentDevice);
      const wObj = getResp(s, "width", currentDevice);
      if (fsize === "grow") {
        node.setFlexGrow(Number(getResp(s, "_flex_grow", currentDevice) || 1));
        node.setFlexShrink(1);
        node.setFlexBasis(0);
      } else if (fsize === "custom" && wObj?.size) {
        if (wObj.unit === "%") node.setWidthPercent(Number(wObj.size));
        else node.setWidth(Number(wObj.size));
      } else if (fsize === "none") {
        node.setFlexGrow(0);
        node.setFlexShrink(0);
        if (wObj?.size) {
          if (wObj.unit === "%") node.setWidthPercent(Number(wObj.size));
          else node.setWidth(Number(wObj.size));
        }
      } else if (!el.isInner) {
        node.setWidthPercent(100);
      }

      const sortedChildren = [...(el.elements || [])].sort((a, b) => {
        const oa = getResp(a.settings || {}, "_flex_order", currentDevice) === "end" ? 1 : 0;
        const ob = getResp(b.settings || {}, "_flex_order", currentDevice) === "end" ? 1 : 0;
        return oa - ob;
      });

      for (const ch of sortedChildren) {
        const chItem = buildTree(ch, currentDevice);
        if (chItem) {
          node.insertChild(chItem.node, node.getChildCount());
          item.children.push(chItem);
        }
      }
      return item;
    }

    const wtype = el.widgetType;
    if (wtype === "theme-site-logo") {
      const w = Number(getResp(s, "width", currentDevice)?.size || 130);
      node.setWidth(w);
      node.setHeight(Math.round(w * 0.34));
      node.setFlexShrink(0);
    } else if (wtype === "search-form") {
      const h = Number(getResp(s, "size", currentDevice)?.size || 44);
      node.setWidthPercent(100);
      node.setHeight(h);
    } else if (wtype === "button") {
      const tp = s.text_padding || { top: 11, right: 13, bottom: 11, left: 13 };
      const fsz = Number(s.typography_font_size?.size || 13);
      const txt = s.text || "";
      const hasIcon = Boolean(s.selected_icon?.value);
      const w =
        (txt ? estTextWidth(txt, fsz, true) : 0) +
        (hasIcon ? 18 : 0) +
        (txt && hasIcon ? Number(s.icon_indent?.size || 8) : 0) +
        Number(tp.right || 12) +
        Number(tp.left || 12);
      const h = txt ? 44 : currentDevice === "mobile" ? 40 : 44;
      node.setWidth(Math.max(h, w));
      node.setHeight(h);
      node.setFlexShrink(0);
    } else if (wtype === "woocommerce-menu-cart") {
      const h = currentDevice === "mobile" ? 40 : 44;
      node.setWidth(h);
      node.setHeight(h);
      node.setFlexShrink(0);
    } else if (wtype === "icon-list") {
      const first = (s.icon_list || [])[0] || { text: "" };
      const fsz = Number(s.icon_typography_font_size?.size || 12);
      node.setWidth(estTextWidth(first.text, fsz, true) + 22);
      node.setHeight(22);
      node.setFlexShrink(0);
    } else if (wtype === "heading") {
      const fsz = Number(getResp(s, "typography_font_size", currentDevice)?.size || 13);
      const pad = s._padding || { top: 0, right: 0, bottom: 0, left: 0 };
      const txtW = estTextWidth(s.title || "", fsz, Number(s.typography_font_weight || 700) >= 700);
      if (s._element_width === "auto") {
        node.setWidth(txtW + Number(pad.right || 0) + Number(pad.left || 0));
        node.setFlexShrink(0);
      }
      const lines = s.header_size === "p" ? 2.4 : 1.45;
      node.setHeight(Math.ceil(fsz * lines) + Number(pad.top || 0) + Number(pad.bottom || 0));
    } else if (wtype === "mega-menu") {
      if (s.item_layout === "dropdown") {
        const sz = currentDevice === "mobile" ? 40 : 42;
        node.setWidth(sz);
        node.setHeight(sz);
        node.setFlexShrink(0);
      } else {
        const title = s.menu_items?.[0]?.item_title || "دسته‌بندی محصولات";
        const fsz = Number(s.menu_item_title_typography_font_size?.size || 13.5);
        node.setWidth(estTextWidth(title, fsz, true) + 28);
        node.setHeight(42);
        node.setFlexShrink(0);
      }
    }
    return item;
  }

  for (const top of tpl.content) {
    const tItem = buildTree(top, device);
    if (tItem) {
      rootYoga.insertChild(tItem.node, rootYoga.getChildCount());
      rootItems.push(tItem);
    }
  }

  if (openDesktopMega && device === "desktop") {
    const findWidget = (el, id) => {
      if (el.id === id) return el;
      for (const c of el.elements || []) {
        const r = findWidget(c, id);
        if (r) return r;
      }
      return null;
    };
    const mmWidget = tpl.content.map((t) => findWidget(t, "h1000024")).find(Boolean);
    const panelItem = buildTree(mmWidget.elements[0], "desktop");
    panelItem.node.setWidth(viewportWidth);
    rootYoga.insertChild(panelItem.node, rootYoga.getChildCount());
    rootItems.push(panelItem);
  }

  rootYoga.calculateLayout(viewportWidth, undefined, Direction.RTL);

  function paintIcon(type, cx, cy, color) {
    if (type === "phone") {
      return `<path d="M${cx - 4.5} ${cy - 5.5}c1 0 1.8.8 2 1.8l.8 1.8c.2.8-.4 1.6-.9 2 1 1.8 2.7 3.5 4.5 4.5.4-.5 1.2-1.1 2-.9l1.8.8c1 .2 1.8 1 1.8 2 0 2.6-2.5 4.5-4.5 4.5-5.5 0-12-6.5-12-12 0-2 1.9-4.5 4.5-4.5z" fill="${color}"/>`;
    }
    if (type === "bars") {
      return `<g stroke="${color}" stroke-width="1.9" stroke-linecap="round">
        <line x1="${cx - 7}" y1="${cy - 4.8}" x2="${cx + 7}" y2="${cy - 4.8}"/>
        <line x1="${cx - 7}" y1="${cy}" x2="${cx + 7}" y2="${cy}"/>
        <line x1="${cx - 4}" y1="${cy + 4.8}" x2="${cx + 7}" y2="${cy + 4.8}"/>
      </g>`;
    }
    if (type === "user") {
      return `<g fill="none" stroke="${color}" stroke-width="1.65" stroke-linecap="round">
        <circle cx="${cx}" cy="${cy - 3}" r="3.3"/>
        <path d="M${cx - 6.2} ${cy + 6.2}c0-3 2.7-4.8 6.2-4.8s6.2 1.8 6.2 4.8"/>
      </g>`;
    }
    if (type === "heart") {
      return `<path d="M${cx} ${cy + 6.2}l-5.6-5.4a3.8 3.8 0 0 1 5.3-5.3l.3.3.3-.3a3.8 3.8 0 0 1 5.3 5.3z" fill="none" stroke="${color}" stroke-width="1.65" stroke-linejoin="round"/>`;
    }
    if (type === "cart") {
      return `<g fill="none" stroke="${color}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
        <circle cx="${cx - 3}" cy="${cy + 6}" r="1.4" fill="${color}"/>
        <circle cx="${cx + 4}" cy="${cy + 6}" r="1.4" fill="${color}"/>
        <path d="M${cx + 8} ${cy - 6}h-2.3l-1.8 8.4h-8l-1.5-5.8h11"/>
      </g>`;
    }
    if (type === "search") {
      return `<g fill="none" stroke="${color}" stroke-width="1.7" stroke-linecap="round">
        <circle cx="${cx - 1}" cy="${cy - 1}" r="5"/>
        <line x1="${cx + 2.8}" y1="${cy + 2.8}" x2="${cx + 6.4}" y2="${cy + 6.4}"/>
      </g>`;
    }
    return "";
  }

  function paintItem(item, ox = 0, oy = 0) {
    const x = ox + item.node.getComputedLeft();
    const y = oy + item.node.getComputedTop();
    const w = item.node.getComputedWidth();
    const h = item.node.getComputedHeight();
    const { el, s } = item;

    assert(
      x >= -1 && x + w <= viewportWidth + 1,
      `[${label}] Horizontal overflow on ${el.id} (${s._title}): x=${x}, w=${w}, viewport=${viewportWidth}`,
    );

    if (el.elType === "container") {
      const rad = Number(s.border_radius?.top || s.border_radius?.bottom || 0);
      let fill = "none";
      if (s.background_background === "gradient") fill = "url(#promoGrad)";
      else if (s.background_color) fill = s.background_color;

      const filterAttr =
        el.id === "h1100003" ? ' filter="url(#softShadow)"' : el.id === "h1000010" ? ' filter="url(#hdrShadow)"' : "";

      if (fill !== "none") {
        svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${rad}" fill="${fill}"${filterAttr}/>`);
      }
      if (s.border_border === "solid" && s.border_color) {
        const bw = s.border_width || {};
        if (Number(bw.top) > 0 && Number(bw.bottom) === 0) {
          svgParts.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${s.border_color}" stroke-width="${bw.top}"/>`);
        } else if (Number(bw.bottom) > 0 && Number(bw.top) === 0) {
          svgParts.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${s.border_color}" stroke-width="${bw.bottom}"/>`);
        } else if (Number(bw.top) > 0 && Number(bw.bottom) > 0) {
          svgParts.push(`<line x1="${x}" y1="${y}" x2="${x + w}" y2="${y}" stroke="${s.border_color}" stroke-width="1"/>`);
          svgParts.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${s.border_color}" stroke-width="1"/>`);
        }
      }
      for (const ch of item.children) paintItem(ch, x, y);
      return;
    }

    const wt = el.widgetType;
    if (wt === "theme-site-logo") {
      const cy = y + h / 2;
      svgParts.push(`
        <g>
          <rect x="${x + w - 9}" y="${y + 2}" width="8" height="8" rx="2.5" fill="#0FA47A"/>
          ${rtlText(x + w - 13, cy + 4, "دارونیک", { size: Math.max(18, Math.round(h * 0.56)), weight: "800", fill: "#14212E" })}
          <text x="${x + w - 14}" y="${y + h}" text-anchor="end" font-family="Dana" font-weight="600" font-size="8.5" letter-spacing="2" fill="#7A8E9F">DARUNIK</text>
        </g>
      `);
    } else if (wt === "icon-list") {
      const entry = s.icon_list[0];
      const cy = y + h / 2;
      svgParts.push(paintIcon("phone", x + w - 8, cy, "#FFFFFF"));
      svgParts.push(rtlText(x + w - 21, cy + 4.5, entry.text, { size: 12, weight: "700", fill: "#FFFFFF" }));
    } else if (wt === "heading") {
      const fsz = Number(getResp(s, "typography_font_size", device)?.size || 13);
      const fw = Number(s.typography_font_weight || 700) >= 700 ? "700" : "500";
      const color = s.title_color || "#14212E";
      const pad = s._padding || { top: 0, right: 0, bottom: 0, left: 0 };
      if (s._background_color) {
        const r = Math.min(h / 2, Number(s._border_radius?.top || 8));
        svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${s._background_color}"/>`);
      }
      if (s._border_border === "solid" && Number(s._border_width?.bottom) > 0) {
        svgParts.push(`<line x1="${x}" y1="${y + h}" x2="${x + w}" y2="${y + h}" stroke="${s._border_color}" stroke-width="1"/>`);
      }
      const rx = x + w - Number(pad.right || 0);
      if (s.header_size === "p" && w < 260) {
        const words = String(s.title).split(" ");
        const mid = Math.ceil(words.length / 2);
        svgParts.push(rtlText(rx, y + fsz + 2, words.slice(0, mid).join(" "), { size: fsz, weight: fw, fill: color }));
        svgParts.push(rtlText(rx, y + fsz * 2.75, words.slice(mid).join(" "), { size: fsz, weight: fw, fill: color }));
      } else {
        svgParts.push(rtlText(rx, y + Number(pad.top || 0) + fsz + 2, s.title, { size: fsz, weight: fw, fill: color }));
      }
    } else if (wt === "search-form") {
      const r = Number(s.border_radius?.size || 12);
      const btnW = device === "mobile" ? 68 : 78;
      svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${s.input_background_color}" stroke="${s.input_border_color}" stroke-width="1"/>`);
      svgParts.push(paintIcon("search", x + w - 18, y + h / 2, "#9AABBB"));
      const ph = device === "mobile" ? "جستجوی نام محصول، برند یا کاربرد..." : s.placeholder;
      svgParts.push(rtlText(x + w - 34, y + h / 2 + 4.5, ph, { size: device === "mobile" ? 11.5 : 12.5, weight: "500", fill: "#7A8E9F" }));
      svgParts.push(`<rect x="${x + 5}" y="${y + 5}" width="${btnW}" height="${h - 10}" rx="${r - 3}" fill="${s.button_background_color}"/>`);
      svgParts.push(centerRtlText(x + 5 + btnW / 2, y + h / 2 + 4.5, s.button_text, { size: 12.5, weight: "700", fill: "#FFFFFF" }));
    } else if (wt === "button") {
      const r = Number(s.border_radius?.top || 12);
      svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${s.background_color || "#FFFFFF"}" stroke="${s.border_color || "#E6ECF1"}" stroke-width="1"/>`);
      const icoName = (s.selected_icon?.value || "").includes("heart") ? "heart" : "user";
      if (s.text) {
        svgParts.push(paintIcon(icoName, x + w - 18, y + h / 2, "#14212E"));
        svgParts.push(rtlText(x + w - 31, y + h / 2 + 4.5, s.text, { size: 12.5, weight: "700", fill: "#14212E" }));
      } else {
        svgParts.push(paintIcon(icoName, x + w / 2, y + h / 2, "#35485C"));
      }
    } else if (wt === "woocommerce-menu-cart") {
      const r = Number(s.toggle_button_border_radius?.size || 12);
      svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="${r}" fill="${s.toggle_button_background_color}"/>`);
      svgParts.push(paintIcon("cart", x + w / 2, y + h / 2, "#FFFFFF"));
    } else if (wt === "mega-menu") {
      if (s.item_layout === "dropdown") {
        svgParts.push(`<rect x="${x}" y="${y}" width="${w}" height="${h}" rx="12" fill="#FFFFFF" stroke="${openMobileMenu ? "#0FA47A" : "#E6ECF1"}" stroke-width="1.2"/>`);
        svgParts.push(paintIcon("bars", x + w / 2, y + h / 2, openMobileMenu ? "#068462" : "#35485C"));
      } else {
        const activeColor = openDesktopMega ? "#068462" : "#14212E";
        svgParts.push(paintIcon("bars", x + w - 9, y + h / 2, activeColor));
        svgParts.push(rtlText(x + w - 23, y + h / 2 + 4.5, "دسته‌بندی محصولات", { size: 13.5, weight: "700", fill: activeColor }));
        if (openDesktopMega) {
          svgParts.push(`<rect x="${x}" y="${y + h - 2}" width="${w}" height="2.5" rx="1" fill="#0FA47A"/>`);
        }
      }
    }
  }

  for (const rItem of rootItems) paintItem(rItem, 0, 0);

  let totalHeight = Math.ceil(rootYoga.getComputedHeight());

  let extraMobileMenuSvg = "";
  if (openMobileMenu && device === "mobile") {
    const menuY = totalHeight + 8;
    const mobWidget = tpl.content[1].elements[0].elements[0].elements[0];
    const items = mobWidget.settings.menu_items;
    const catChildren = mobWidget.elements[0].elements;
    let cy = menuY + 12;
    const cardParts = [];

    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const isFirst = i === 0;
      const isSale = it.item_title.includes("تخفیف");
      cardParts.push(`<rect x="22" y="${cy}" width="${viewportWidth - 44}" height="38" rx="10" fill="${isFirst ? "#EAFAF4" : "#FFFFFF"}" stroke="${isFirst ? "#99E6CD" : "#EEF2F6"}"/>`);
      cardParts.push(
        rtlText(viewportWidth - 36, cy + 24, it.item_title, {
          size: 12.5,
          weight: "700",
          fill: isSale ? "#E5322D" : isFirst ? "#066A50" : "#14212E",
        }),
      );
      cy += 44;
      if (isFirst) {
        for (const sub of catChildren.slice(0, 5)) {
          cardParts.push(`<rect x="32" y="${cy}" width="${viewportWidth - 64}" height="31" rx="8" fill="#F4F7F9"/>`);
          cardParts.push(rtlText(viewportWidth - 44, cy + 20, sub.settings.title, { size: 11, weight: "500", fill: "#35485C" }));
          cy += 36;
        }
        cy += 4;
      }
    }

    const boxH = cy - menuY + 8;
    extraMobileMenuSvg = `
      <rect x="12" y="${menuY}" width="${viewportWidth - 24}" height="${boxH}" rx="16" fill="#FFFFFF" stroke="#E6ECF1" filter="url(#softShadow)"/>
      ${cardParts.join("\n")}
    `;
    totalHeight = menuY + boxH + 16;
  } else {
    totalHeight += openDesktopMega ? 24 : 26;
  }

  rootYoga.freeRecursive();

  const defs = `
    <linearGradient id="promoGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#068462"/>
      <stop offset="100%" stop-color="#085340"/>
    </linearGradient>
    <filter id="softShadow" x="-6%" y="-6%" width="112%" height="124%">
      <feDropShadow dx="0" dy="8" stdDeviation="10" flood-color="#14212E" flood-opacity="0.09"/>
    </filter>
    <filter id="hdrShadow" x="-4%" y="-10%" width="108%" height="135%">
      <feDropShadow dx="0" dy="2" stdDeviation="4" flood-color="#14212E" flood-opacity="0.05"/>
    </filter>
  `;

  const fullSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${viewportWidth}" height="${totalHeight}" viewBox="0 0 ${viewportWidth} ${totalHeight}">
    <defs>${defs}</defs>
    <rect width="${viewportWidth}" height="${totalHeight}" fill="#F4F7F9"/>
    ${svgParts.join("\n")}
    ${extraMobileMenuSvg}
  </svg>`;

  return { svg: fullSvg, width: viewportWidth, height: totalHeight };
}

function savePng(svg, outPath, zoom = 2) {
  const resvg = new Resvg(svg, {
    fitTo: { mode: "zoom", value: zoom },
    font: { fontFiles: FONT_FILES, loadSystemFonts: false, defaultFontFamily: "Dana" },
  });
  const png = resvg.render().asPng();
  fs.writeFileSync(outPath, png);
  return png;
}

const s1 = renderHeaderState({ viewportWidth: 1440, device: "desktop", openDesktopMega: false, label: "Desktop 1440px" });
savePng(s1.svg, path.join(OUT_DIR, "01-header-desktop-1440.png"), 1.6);

renderHeaderState({ viewportWidth: 1280, device: "desktop", openDesktopMega: true, label: "Laptop 1280px" });

const s2 = renderHeaderState({ viewportWidth: 1440, device: "desktop", openDesktopMega: true, label: "Desktop Mega-Menu Open" });
savePng(s2.svg, path.join(OUT_DIR, "02-header-megamenu-open-1440.png"), 1.6);

const s3 = renderHeaderState({ viewportWidth: 768, device: "tablet", label: "Tablet 768px" });
savePng(s3.svg, path.join(OUT_DIR, "03-header-tablet-768.png"), 2);

const s4Closed = renderHeaderState({ viewportWidth: 390, device: "mobile", openMobileMenu: false, label: "Mobile 390px Closed" });
const s4Open = renderHeaderState({ viewportWidth: 390, device: "mobile", openMobileMenu: true, label: "Mobile 390px Accordion Open" });
savePng(s4Open.svg, path.join(OUT_DIR, "04-header-mobile-390.png"), 2);

const boardW = 1520;
const boardH = 1268;
const stripOuterSvg = (svgStr) => svgStr.replace(/^<svg[^>]*>/, "").replace(/<\/svg>\s*$/, "");

const boardSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="${boardW}" height="${boardH}" viewBox="0 0 ${boardW} ${boardH}">
  <rect width="${boardW}" height="${boardH}" fill="#EEF3F8"/>

  ${rtlText(boardW - 40, 44, "بررسی کامل ریسپانسیو هدر و مگامنوی داروخانه (رندر مستقیم از فایل JSON المنتور)", { size: 20, weight: "800", fill: "#0F1D2E" })}
  <text x="40" y="44" font-family="Dana" font-weight="700" font-size="13" fill="#1D63ED">01-header-megamenu-dr-farzane-ghasemi.json  |  RTL Flexbox Verified</text>

  ${rtlText(boardW - 40, 82, "۱. نمای دسکتاپ ۱۴۴۰ پیکسل (حالت عادی چسبان، منطبق با تصویر مرجع دارونیک)", { size: 14, weight: "700", fill: "#35485C" })}
  <g transform="translate(40, 94)">
    <rect x="-1" y="-1" width="1442" height="${s1.height + 2}" rx="10" fill="none" stroke="#CBD5E1"/>
    ${stripOuterSvg(s1.svg)}
  </g>

  ${rtlText(boardW - 40, 314, "۲. نمای دسکتاپ هنگام باز شدن مگامنوی «دسته‌بندی محصولات» (۴ ستون + برندهای پرطرفدار + کارت تخفیف هفته سلامت)", { size: 14, weight: "700", fill: "#35485C" })}
  <g transform="translate(40, 326)">
    <rect x="-1" y="-1" width="1442" height="${s2.height + 2}" rx="10" fill="none" stroke="#CBD5E1"/>
    ${stripOuterSvg(s2.svg)}
  </g>

  ${rtlText(boardW - 40, 818, "۳. نمای تبلت (۷۶۸ پیکسل) و نمای موبایل (۳۹۰ پیکسل در دو حالت بسته و منوی آکاردئونی باز)", { size: 14, weight: "700", fill: "#35485C" })}

  <g transform="translate(${boardW - 40 - 768}, 834)">
    <rect x="-1" y="-1" width="770" height="${s3.height + 2}" rx="10" fill="none" stroke="#CBD5E1"/>
    ${stripOuterSvg(s3.svg)}
    ${rtlText(768, s3.height + 24, "تبلت ۷۶۸ پیکسل: حذف خودکار نوار بالا، دکمه همبرگری، جستجوی یکپارچه و آیکون‌های کاربری بدون شکستگی", { size: 12, weight: "700", fill: "#068462" })}
  </g>

  <g transform="translate(${boardW - 40 - 390}, 985)">
    <rect x="-1" y="-1" width="392" height="${s4Closed.height + 2}" rx="10" fill="none" stroke="#CBD5E1"/>
    ${stripOuterSvg(s4Closed.svg)}
    ${rtlText(390, s4Closed.height + 24, "موبایل ۳۹۰ پیکسل (حالت بسته): ردیف اول لوگو و سبد خرید + ردیف دوم جستجوی ۱۰۰ درصد عرض", { size: 12, weight: "700", fill: "#068462" })}
  </g>

  <g transform="translate(60, 834) scale(0.55)">
    <rect x="-2" y="-2" width="394" height="${s4Open.height + 4}" rx="18" fill="none" stroke="#94A3B8" stroke-width="2"/>
    ${stripOuterSvg(s4Open.svg)}
  </g>
  ${rtlText(274, 1244, "موبایل ۳۹۰ پیکسل (منوی آکاردئونی باز)", { size: 12, weight: "700", fill: "#068462" })}
</svg>`;

savePng(boardSvg, path.join(OUT_DIR, "00-header-megamenu-responsive-showcase.png"), 1.5);

console.log("✔ All 5 responsive screenshots rendered & verified with 0px overflow in demo-media/screenshots/:");
for (const f of fs.readdirSync(OUT_DIR).sort()) {
  const st = fs.statSync(path.join(OUT_DIR, f));
  console.log(`  - ${f} (${(st.size / 1024).toFixed(1)} KB)`);
}
