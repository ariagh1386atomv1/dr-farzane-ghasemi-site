/* ==========================================================================
   Elementor & WoodMart Template Hub — Interactive Controller
   ========================================================================== */

(function () {
  "use strict";

  const FA_DIGITS = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const toFa = (val) => String(val).replace(/\d/g, (d) => FA_DIGITS[Number(d)]);

  const ICONS = {
    download:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>',
    check:
      '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
    copy:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/></svg>',
    book:
      '<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>',
    desktop:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="8" y1="21" x2="16" y2="21"/><line x1="12" y1="17" x2="12" y2="21"/></svg>',
    tablet:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="2" width="16" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    mobile:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="5" y="2" width="14" height="20" rx="2"/><line x1="12" y1="18" x2="12.01" y2="18"/></svg>',
    expand:
      '<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg>',
    file:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>',
    spark:
      '<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"/></svg>',
  };

  const state = {
    category: "all",
    query: "",
    cardDevice: {},
    modalItemId: null,
    modalDevice: "desktop",
    drawerItemId: null,
  };

  const els = {
    totalBadge: document.getElementById("total-count"),
    filters: document.getElementById("category-filters"),
    searchInput: document.getElementById("search-input"),
    cardsList: document.getElementById("cards-list"),
    backdrop: document.getElementById("backdrop"),
    drawer: document.getElementById("guide-drawer"),
    drawerTitle: document.getElementById("drawer-title"),
    drawerBody: document.getElementById("drawer-body"),
    drawerDownloadBtn: document.getElementById("drawer-download-btn"),
    drawerCloseBtn: document.getElementById("drawer-close-btn"),
    modal: document.getElementById("preview-modal"),
    modalTitle: document.getElementById("modal-title"),
    modalStage: document.getElementById("modal-stage"),
    modalDevices: document.getElementById("modal-devices"),
    modalDownloadBtn: document.getElementById("modal-download-btn"),
    modalCloseBtn: document.getElementById("modal-close-btn"),
    toast: document.getElementById("toast"),
    toastText: document.getElementById("toast-text"),
  };

  let toastTimer = null;
  function showToast(message) {
    els.toastText.textContent = message;
    els.toast.classList.add("is-visible");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => {
      els.toast.classList.remove("is-visible");
    }, 2600);
  }

  async function triggerDownload(item, buttonEl) {
    try {
      const response = await fetch(item.filePath, { cache: "no-cache" });
      if (!response.ok) throw new Error("fetch_failed");
      const buffer = await response.arrayBuffer();
      const blob = new Blob([buffer], { type: "application/octet-stream" });
      const blobUrl = URL.createObjectURL(blob);

      const link = document.createElement("a");
      link.href = blobUrl;
      link.download = item.fileName;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(blobUrl), 4000);
    } catch {
      const fallback = document.createElement("a");
      fallback.href = item.filePath;
      fallback.download = item.fileName;
      document.body.appendChild(fallback);
      fallback.click();
      fallback.remove();
    }

    showToast(`فایل «${item.fileName}» دانلود شد`);

    if (buttonEl && buttonEl.classList.contains("btn-primary")) {
      const original = buttonEl.innerHTML;
      buttonEl.classList.add("is-done");
      buttonEl.innerHTML = `${ICONS.check}<span>دانلود شد</span>`;
      setTimeout(() => {
        buttonEl.classList.remove("is-done");
        buttonEl.innerHTML = original;
      }, 2000);
    }
  }

  async function copyFileContent(item) {
    try {
      const res = await fetch(item.filePath, { cache: "no-cache" });
      const text = await res.text();
      await navigator.clipboard.writeText(text);
      showToast("محتوای فایل در کلیپ‌بورد کپی شد");
    } catch {
      showToast("امکان کپی خودکار نبود — از دکمه دانلود استفاده کنید");
    }
  }

  function getFilteredItems() {
    const q = state.query.trim().toLowerCase();
    return window.STUDIO_CATALOG.filter((item) => {
      if (state.category !== "all" && item.category !== state.category) {
        return false;
      }
      if (!q) return true;
      const haystack = [
        item.title,
        item.description,
        item.fileName,
        item.format,
        item.categoryLabel,
        ...(item.widgets || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }

  function renderFilters() {
    const all = window.STUDIO_CATALOG;
    els.totalBadge.textContent = `${toFa(all.length)} بخش آماده دانلود`;

    els.filters.innerHTML = window.STUDIO_CATEGORIES.map((cat) => {
      const count =
        cat.id === "all"
          ? all.length
          : all.filter((x) => x.category === cat.id).length;
      const active = state.category === cat.id ? "is-active" : "";
      return `
        <button type="button" class="filter-chip ${active}" data-cat="${cat.id}">
          <span>${cat.label}</span>
          <span class="filter-chip__badge">${toFa(count)}</span>
        </button>
      `;
    }).join("");
  }

  function renderCards() {
    const items = getFilteredItems();
    if (items.length === 0) {
      els.cardsList.innerHTML = `
        <div class="empty-state">
          <div class="empty-state__icon">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="18" height="18" rx="2"/><line x1="3" y1="9" x2="21" y2="9"/><line x1="9" y1="21" x2="9" y2="9"/></svg>
          </div>
          <h3 style="font-size:18px;margin-bottom:6px">هنوز بخشی در این دسته ثبت نشده است</h3>
          <p style="color:var(--ink-600);font-size:13.5px">هر سکشن جدیدی که بسازیم بلافاصله با پیش‌نمایش زنده و دکمه دانلود به این لیست اضافه می‌شود.</p>
        </div>
      `;
      return;
    }

    els.cardsList.innerHTML = items
      .map((item) => {
        const dev = state.cardDevice[item.id] || "desktop";
        return `
        <article class="tpl-card" data-item-id="${item.id}">
          <div class="preview-stage">
            <div class="preview-toolbar">
              <div class="browser-dots">
                <div class="browser-dots__lights" aria-hidden="true">
                  <span></span><span></span><span></span>
                </div>
                <span class="browser-dots__label">پیش‌نمایش زنده: ${item.title}</span>
              </div>

              <div class="viewport-Controls">
                <div class="seg-group" role="group" aria-label="تغییر ابعاد پیش‌نمایش">
                  <button type="button" class="seg-btn ${dev === "desktop" ? "is-active" : ""}" data-action="card-device" data-device="desktop" data-id="${item.id}">
                    ${ICONS.desktop}
                    <span>دسکتاپ</span>
                  </button>
                  <button type="button" class="seg-btn ${dev === "mobile" ? "is-active" : ""}" data-action="card-device" data-device="mobile" data-id="${item.id}">
                    ${ICONS.mobile}
                    <span>موبایل</span>
                  </button>
                </div>
                <button type="button" class="expand-btn" data-action="open-modal" data-id="${item.id}" title="مشاهده در ابعاد کامل">
                  ${ICONS.expand}
                  <span>بزرگ‌نمایی</span>
                </button>
              </div>
            </div>

            <div class="preview-viewport ${dev === "mobile" ? "is-mobile" : ""}" id="viewport-${item.id}">
              ${item.renderPreview()}
            </div>
          </div>

          <div class="tpl-body">
            <div class="tpl-info">
              <div class="tpl-badges">
                <span class="badge-step">${item.step}</span>
                <span class="badge-format">.${item.format}</span>
                ${
                  item.noCode
                    ? `<span class="badge-nocode">${ICONS.spark} ۱۰۰٪ المنتور · بدون کد</span>`
                    : ""
                }
                <span class="badge-meta num">${item.fileSize} · ${item.target}</span>
              </div>

              <h2 class="tpl-title">${item.title}</h2>
              <p class="tpl-desc">${item.description}</p>

              <div class="tpl-chips">
                ${(item.widgets || []).map((w) => `<span class="tpl-chip">${w}</span>`).join("")}
                <span class="tpl-file-pill">${ICONS.file} ${item.fileName}</span>
              </div>
            </div>

            <div class="tpl-actions">
              <button type="button" class="btn btn-primary" data-action="download" data-id="${item.id}">
                ${ICONS.download}
                <span>دانلود فایل ${item.format}</span>
              </button>
              <button type="button" class="btn btn-secondary" data-action="open-guide" data-id="${item.id}">
                ${ICONS.book}
                <span>راهنمای نصب</span>
              </button>
              <button type="button" class="btn btn-secondary btn-icon" data-action="copy" data-id="${item.id}" title="کپی مستقیم کد JSON در کلیپ‌بورد" aria-label="کپی فایل">
                ${ICONS.copy}
              </button>
            </div>
          </div>
        </article>
      `;
      })
      .join("");
  }

  function openGuide(itemId) {
    const item = window.STUDIO_CATALOG.find((x) => x.id === itemId);
    if (!item) return;
    state.drawerItemId = itemId;
    els.drawerTitle.textContent = `راهنمای نصب — ${item.step}`;
    els.drawerBody.innerHTML = `
      <p style="font-size:13.5px;color:var(--ink-600);margin-bottom:20px">
        مراحل درون‌ریزی <strong>${item.title}</strong> روی قالب وودمارت و المنتور پرو:
      </p>
      <div>
        ${(item.guideSteps || [])
          .map(
            (s, idx) => `
          <div class="guide-step">
            <span class="guide-step__num">${toFa(idx + 1)}</span>
            <div>
              <div class="guide-step__title">${s.title}</div>
              <div class="guide-step__desc">${s.desc}</div>
            </div>
          </div>
        `,
          )
          .join("")}
      </div>
      ${item.guideTip ? `<div class="guide-tip">${item.guideTip}</div>` : ""}
    `;
    els.backdrop.classList.add("is-open");
    els.drawer.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function openModal(itemId) {
    const item = window.STUDIO_CATALOG.find((x) => x.id === itemId);
    if (!item) return;
    state.modalItemId = itemId;
    state.modalDevice = "desktop";
    els.modalTitle.textContent = item.title;
    els.modalStage.innerHTML = item.renderPreview();
    updateModalDeviceUI();
    els.backdrop.classList.add("is-open");
    els.modal.classList.add("is-open");
    document.body.style.overflow = "hidden";
  }

  function updateModalDeviceUI() {
    els.modalStage.classList.remove("is-tablet", "is-mobile");
    if (state.modalDevice === "tablet") els.modalStage.classList.add("is-tablet");
    if (state.modalDevice === "mobile") els.modalStage.classList.add("is-mobile");

    els.modalDevices.querySelectorAll("[data-modal-device]").forEach((btn) => {
      btn.classList.toggle(
        "is-active",
        btn.getAttribute("data-modal-device") === state.modalDevice,
      );
    });
  }

  function closeOverlays() {
    els.backdrop.classList.remove("is-open");
    els.drawer.classList.remove("is-open");
    els.modal.classList.remove("is-open");
    document.body.style.overflow = "";
    state.drawerItemId = null;
    state.modalItemId = null;
  }

  /* Event Delegation */
  els.filters.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-cat]");
    if (!btn) return;
    state.category = btn.getAttribute("data-cat");
    renderFilters();
    renderCards();
  });

  els.searchInput.addEventListener("input", (e) => {
    state.query = e.target.value;
    renderCards();
  });

  els.cardsList.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-action]");
    if (!btn) return;
    const action = btn.getAttribute("data-action");
    const id = btn.getAttribute("data-id");
    const item = window.STUDIO_CATALOG.find((x) => x.id === id);
    if (!item) return;

    if (action === "download") {
      triggerDownload(item, btn);
    } else if (action === "copy") {
      copyFileContent(item);
    } else if (action === "open-guide") {
      openGuide(id);
    } else if (action === "open-modal") {
      openModal(id);
    } else if (action === "card-device") {
      const dev = btn.getAttribute("data-device");
      state.cardDevice[id] = dev;
      const vp = document.getElementById(`viewport-${id}`);
      if (vp) vp.classList.toggle("is-mobile", dev === "mobile");
      btn
        .closest(".seg-group")
        .querySelectorAll(".seg-btn")
        .forEach((b) =>
          b.classList.toggle("is-active", b.getAttribute("data-device") === dev),
        );
    }
  });

  els.drawerDownloadBtn.addEventListener("click", () => {
    const item = window.STUDIO_CATALOG.find((x) => x.id === state.drawerItemId);
    if (item) triggerDownload(item, els.drawerDownloadBtn);
  });

  els.modalDownloadBtn.addEventListener("click", () => {
    const item = window.STUDIO_CATALOG.find((x) => x.id === state.modalItemId);
    if (item) triggerDownload(item, els.modalDownloadBtn);
  });

  els.modalDevices.addEventListener("click", (e) => {
    const btn = e.target.closest("[data-modal-device]");
    if (!btn) return;
    state.modalDevice = btn.getAttribute("data-modal-device");
    updateModalDeviceUI();
  });

  els.drawerCloseBtn.addEventListener("click", closeOverlays);
  els.modalCloseBtn.addEventListener("click", closeOverlays);
  els.backdrop.addEventListener("click", closeOverlays);

  window.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      closeOverlays();
    } else if (
      e.key === "/" &&
      document.activeElement !== els.searchInput &&
      !["INPUT", "TEXTAREA"].includes(document.activeElement?.tagName || "")
    ) {
      e.preventDefault();
      els.searchInput.focus();
    }
  });

  renderFilters();
  renderCards();
})();
