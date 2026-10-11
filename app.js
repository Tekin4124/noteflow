/**
 * =========================================================
 * SÄ°HÄ°RLÄ° DEFTERÄ°M - 2 SAYFALI Ä°NTERAKTÄ°F DEFTER UYGULAMASI
 * =========================================================
 */

// 60 SayfalÄ±k VarsayÄ±lan Defter Ãœretici
function generateDefaultPages(total = 60) {
  const pages = [
    {
      id: 1,
      title: "",
      date: "",
      content: "",
      stickers: []
    },
    {
      id: 2,
      title: "",
      date: "",
      content: "",
      stickers: []
    }
  ];

  for (let i = 3; i <= total; i++) {
    pages.push({
      id: i,
      title: "",
      date: "",
      content: "",
      stickers: []
    });
  }
  return pages;
}

// Ã‡Ä±kartma KÃ¼tÃ¼phanesi
const STICKER_DATA = {
  emojis: ['â­', 'ğŸŒŸ', 'ğŸ’–', 'âœ¨', 'ğŸ”¥', 'ğŸ‰', 'ğŸ€', 'ğŸ’¡', 'ğŸŒˆ', 'ğŸ¨', 'ğŸš€', 'ğŸ±', 'ğŸ¶', 'ğŸ¦„', 'â˜•', 'ğŸ§', 'ğŸ•', 'ğŸ°'],
  study: ['ğŸ“š', 'âœï¸', 'ğŸ“', 'ğŸ“Œ', 'ğŸ“', 'ğŸ“', 'ğŸ¯', 'ğŸ’¯', 'ğŸ†', 'ğŸ””', 'â³', 'ğŸ’»', 'ğŸ“–', 'ğŸ”¬', 'ğŸ“', 'ğŸ·ï¸', 'ğŸ”–', 'ğŸ“…'],
  stamps: ['ğŸ’®', 'ğŸŒ¸', 'ğŸµï¸', 'ğŸŒº', 'ğŸ‘‘', 'ğŸ…', 'ğŸ¥‡', 'ğŸ¥ˆ', 'ğŸ¥‰', 'ğŸ’ ', 'ğŸ’¤', 'ğŸ’­', 'ğŸ—¯ï¸', 'âœ”ï¸', 'âŒ', 'â¤ï¸', 'ğŸ§¡', 'ğŸ’›'],
  nature: ['ğŸŒ¿', 'ğŸ€', 'ğŸ‚', 'ğŸ', 'ğŸ„', 'ğŸŒ»', 'ğŸŒ¹', 'ğŸŒ·', 'ğŸŒ´', 'ğŸŒ²', 'â˜€ï¸', 'ğŸŒ™', 'â­', 'â˜ï¸', 'ğŸŒ§ï¸', 'âš¡', 'ğŸŒŠ', 'ğŸ¦‹']
};

// ================= APP STATE =================
let state = {
  pages: [],
  currentSpread: 0, // 0 => Sayfa 1 ve 2; 1 => Sayfa 3 ve 4
  viewMode: 'open', // 'front_cover' | 'open' | 'back_cover'
  settings: {
    fontFamily: "'Caveat', cursive",
    fontSize: 16,
    penColor: "#1e293b",
    coverTheme: "cover-leather",
    paperPattern: "pattern-ruled",
    soundEnabled: true,
    toolbarCollapsed: false,
    notebookScale: 1.0
  },
  lastActiveEditor: null
};

// DOM ElemanlarÄ±
const els = {
  appContainer: document.getElementById('appContainer'),
  notebookToolbar: document.getElementById('notebookToolbar'),
  notebookWrapper: document.getElementById('notebookWrapper'),
  notebookCover: document.getElementById('notebookCover'),
  
  // Kapaklar & Ä°Ã§ YayÄ±lÄ±m
  closedCoverFront: document.getElementById('closedCoverFront'),
  closedCoverBack: document.getElementById('closedCoverBack'),
  bookSpread: document.getElementById('bookSpread'),
  btnOpenFromFront: document.getElementById('btnOpenFromFront'),
  btnOpenFromBack: document.getElementById('btnOpenFromBack'),

  // Sol Sayfa
  leftPageLeaf: document.getElementById('leftPageLeaf'),
  leftPageTitle: document.getElementById('leftPageTitle'),
  leftPageDate: document.getElementById('leftPageDate'),
  leftPageEditor: document.getElementById('leftPageEditor'),
  leftPageNumber: document.getElementById('leftPageNumber'),
  leftStickersContainer: document.getElementById('leftStickersContainer'),
  leftFlipTrigger: document.getElementById('leftFlipTrigger'),
  btnClearCurrentLeft: document.getElementById('btnClearCurrentLeft'),
  btnDeleteCurrentLeft: document.getElementById('btnDeleteCurrentLeft'),

  // SaÄŸ Sayfa
  rightPageLeaf: document.getElementById('rightPageLeaf'),
  rightPageTitle: document.getElementById('rightPageTitle'),
  rightPageDate: document.getElementById('rightPageDate'),
  rightPageEditor: document.getElementById('rightPageEditor'),
  rightPageNumber: document.getElementById('rightPageNumber'),
  rightStickersContainer: document.getElementById('rightStickersContainer'),
  rightFlipTrigger: document.getElementById('rightFlipTrigger'),
  btnClearCurrentRight: document.getElementById('btnClearCurrentRight'),
  btnDeleteCurrentRight: document.getElementById('btnDeleteCurrentRight'),

  // Yan Gezinme OklarÄ±
  btnPrevPage: document.getElementById('btnPrevPage'),
  btnNextPage: document.getElementById('btnNextPage'),

  // Ãœst AraÃ§lar
  btnToggleToolbar: document.getElementById('btnToggleToolbar'),
  toggleToolbarIcon: document.getElementById('toggleToolbarIcon'),
  toggleToolbarText: document.getElementById('toggleToolbarText'),
  btnTableOfContents: document.getElementById('btnTableOfContents'),
  btnNewSpread: document.getElementById('btnNewSpread'),
  btnExport: document.getElementById('btnExport'),
  btnFullscreen: document.getElementById('btnFullscreen'),

  // Toolbar
  fontFamilySelect: document.getElementById('fontFamilySelect'),
  btnFontSizeDec: document.getElementById('btnFontSizeDec'),
  btnFontSizeInc: document.getElementById('btnFontSizeInc'),
  fontSizeDisplay: document.getElementById('fontSizeDisplay'),
  btnBold: document.getElementById('btnBold'),
  btnItalic: document.getElementById('btnItalic'),
  btnUnderline: document.getElementById('btnUnderline'),
  btnStrike: document.getElementById('btnStrike'),
  btnListUl: document.getElementById('btnListUl'),
  btnListOl: document.getElementById('btnListOl'),
  btnChecklist: document.getElementById('btnChecklist'),
  btnAddDate: document.getElementById('btnAddDate'),
  customPenColor: document.getElementById('customPenColor'),
  coverThemeSelect: document.getElementById('coverThemeSelect'),
  paperPatternSelect: document.getElementById('paperPatternSelect'),
  btnStickerModal: document.getElementById('btnStickerModal'),
  btnAddSticky: document.getElementById('btnAddSticky'),

  // Alt Ã‡ubuk & YakÄ±nlaÅŸtÄ±rma (Zoom)
  saveStatusBadge: document.getElementById('saveStatusBadge'),
  wordCountBadge: document.getElementById('wordCountBadge'),
  btnZoomOut: document.getElementById('btnZoomOut'),
  btnZoomIn: document.getElementById('btnZoomIn'),
  zoomLevelDisplay: document.getElementById('zoomLevelDisplay'),

  // Modaller
  printModal: document.getElementById('printModal'),
  btnClosePrintModal: document.getElementById('btnClosePrintModal'),
  btnPrintCurrentSpread: document.getElementById('btnPrintCurrentSpread'),
  btnPrintAllPages: document.getElementById('btnPrintAllPages'),
  printRenderContainer: document.getElementById('printRenderContainer'),

  tocModal: document.getElementById('tocModal'),
  tocGrid: document.getElementById('tocGrid'),
  btnCloseToc: document.getElementById('btnCloseToc'),
  btnModalAddPage: document.getElementById('btnModalAddPage'),

  stickerModal: document.getElementById('stickerModal'),
  stickerGrid: document.getElementById('stickerGrid'),
  btnCloseStickerModal: document.getElementById('btnCloseStickerModal'),

  stickyModal: document.getElementById('stickyModal'),
  stickyNoteText: document.getElementById('stickyNoteText'),
  btnCloseStickyModal: document.getElementById('btnCloseStickyModal'),
  btnInsertSticky: document.getElementById('btnInsertSticky')
};

// ================= BAÅLANGIÃ‡ & YÃœKLEME =================
function initApp() {
  state.lastActiveEditor = els.leftPageEditor;
  loadFromLocalStorage();
  applySettingsToUI();
  renderCurrentSpread();
  setupEventListeners();
}

// LocalStorage'dan yÃ¼kleme
function loadFromLocalStorage() {
  try {
    const savedData = localStorage.getItem('sihirli_defter_data_v16');
    if (savedData) {
      const parsed = JSON.parse(savedData);
      state.pages = parsed.pages || generateDefaultPages(60);
      state.currentSpread = parsed.currentSpread || 0;
      state.viewMode = parsed.viewMode || 'open';
      if (parsed.settings) {
        state.settings = { ...state.settings, ...parsed.settings };
      }
    } else {
      state.pages = generateDefaultPages(60);
      state.viewMode = 'open';
    }
  } catch (e) {
    console.error("YÃ¼kleme hatasÄ±:", e);
    state.pages = generateDefaultPages(60);
    state.viewMode = 'open';
  }

  // Defter en az 2 sayfa olsun
  if (state.pages.length < 2) {
    state.pages = generateDefaultPages(60);
  }

  // Sayfa sayÄ±sÄ± tekse Ã§ift yap
  if (state.pages.length % 2 !== 0) {
    state.pages.push(createNewPageObject(state.pages.length + 1));
  }

  // Spread sÄ±nÄ±r kontrolÃ¼
  const maxSpread = Math.floor(state.pages.length / 2) - 1;
  if (state.currentSpread > maxSpread) state.currentSpread = maxSpread;
  if (state.currentSpread < 0) state.currentSpread = 0;
}

// LocalStorage'a kaydetme
let saveTimeout = null;
function triggerAutoSave() {
  els.saveStatusBadge.innerHTML = `<i class="fa-solid fa-spinner fa-spin"></i> Kaydediliyor...`;
  els.saveStatusBadge.style.color = "#f59e0b";

  clearTimeout(saveTimeout);
  saveTimeout = setTimeout(() => {
    saveCurrentSpreadState();

    const dataToSave = {
      pages: state.pages,
      currentSpread: state.currentSpread,
      viewMode: state.viewMode,
      settings: state.settings
    };

    try {
      localStorage.setItem('sihirli_defter_data_v16', JSON.stringify(dataToSave));
      els.saveStatusBadge.innerHTML = `<i class="fa-solid fa-check"></i> Otomatik Kaydedildi`;
      els.saveStatusBadge.style.color = "#34d399";
    } catch (e) {
      console.warn("KayÄ±t kotasÄ± veya hatasÄ±:", e);
      els.saveStatusBadge.innerHTML = `<i class="fa-solid fa-triangle-exclamation"></i> KayÄ±t UyarÄ±sÄ±`;
      els.saveStatusBadge.style.color = "#ef4444";
    }
    updateWordCount();
  }, 400);
}

// Mevcut sayfadaki inputlarÄ± state'e aktar
function saveCurrentSpreadState() {
  if (state.viewMode !== 'open') return;

  const leftIdx = state.currentSpread * 2;
  const rightIdx = leftIdx + 1;

  if (state.pages[leftIdx]) {
    state.pages[leftIdx].title = els.leftPageTitle.value;
    state.pages[leftIdx].date = els.leftPageDate.value;
    state.pages[leftIdx].content = els.leftPageEditor.innerHTML;
  }

  if (state.pages[rightIdx]) {
    state.pages[rightIdx].title = els.rightPageTitle.value;
    state.pages[rightIdx].date = els.rightPageDate.value;
    state.pages[rightIdx].content = els.rightPageEditor.innerHTML;
  }
}

// ================= GÃ–RSEL & SAYFA OLUÅTURMA =================
function renderCurrentSpread() {
  const totalPages = state.pages.length;
  const maxSpread = Math.floor(totalPages / 2) - 1;

  if (state.viewMode === 'front_cover') {
    // Ã–n Kapak GÃ¶rÃ¼nÃ¼mÃ¼ - MenÃ¼ otomatik kapalÄ±
    els.appContainer.classList.add('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-down';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ GÃ¶ster';

    els.closedCoverFront.classList.remove('hidden');
    els.closedCoverBack.classList.add('hidden');
    els.bookSpread.classList.add('hidden');
    els.notebookWrapper.classList.add('closed-book-mode');

    els.btnPrevPage.disabled = true;
    els.btnNextPage.disabled = false;

    els.btnPrevPage.title = "BaÅŸlangÄ±Ã§tasÄ±nÄ±z";
    els.btnNextPage.title = "Defteri AÃ§ (Sayfa 1-2)";
    return;
  }

  if (state.viewMode === 'back_cover') {
    // Arka Kapak GÃ¶rÃ¼nÃ¼mÃ¼ - MenÃ¼ otomatik kapalÄ±
    els.appContainer.classList.add('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-down';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ GÃ¶ster';

    els.closedCoverBack.classList.remove('hidden');
    els.closedCoverFront.classList.add('hidden');
    els.bookSpread.classList.add('hidden');
    els.notebookWrapper.classList.add('closed-book-mode');

    els.btnNextPage.disabled = true;
    els.btnPrevPage.disabled = false;

    els.btnNextPage.title = "Defterin sonundasÄ±nÄ±z";
    els.btnPrevPage.title = "Son Sayfalara DÃ¶n";
    return;
  }

  // AÃ§Ä±k Defter GÃ¶rÃ¼nÃ¼mÃ¼
  if (state.settings.toolbarCollapsed) {
    els.appContainer.classList.add('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-down';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ GÃ¶ster';
  } else {
    els.appContainer.classList.remove('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-up';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ Gizle';
  }

  els.closedCoverFront.classList.add('hidden');
  els.closedCoverBack.classList.add('hidden');
  els.bookSpread.classList.remove('hidden');
  els.notebookWrapper.classList.remove('closed-book-mode');

  const leftIdx = state.currentSpread * 2;
  const rightIdx = leftIdx + 1;

  const leftPage = state.pages[leftIdx] || createNewPageObject(leftIdx + 1);
  const rightPage = state.pages[rightIdx] || createNewPageObject(rightIdx + 1);

  // Sol Sayfa Doldur
  els.leftPageTitle.value = leftPage.title || "";
  els.leftPageDate.value = leftPage.date || "";
  els.leftPageEditor.innerHTML = leftPage.content || "";
  els.leftPageNumber.textContent = leftPage.id;
  renderStickers(els.leftStickersContainer, leftPage.stickers || [], leftIdx);

  // SaÄŸ Sayfa Doldur
  els.rightPageTitle.value = rightPage.title || "";
  els.rightPageDate.value = rightPage.date || "";
  els.rightPageEditor.innerHTML = rightPage.content || "";
  els.rightPageNumber.textContent = rightPage.id;
  renderStickers(els.rightStickersContainer, rightPage.stickers || [], rightIdx);

  // Ok ButonlarÄ±
  els.btnPrevPage.disabled = false;
  els.btnNextPage.disabled = false;

  if (state.currentSpread === 0) {
    els.btnPrevPage.title = "Defteri Kapat (Ã–n Kapak)";
  } else {
    els.btnPrevPage.title = "Ã–nceki Sayfalar (Klavye: Sol Ok)";
  }

  if (state.currentSpread >= maxSpread) {
    els.btnNextPage.title = "Defteri Kapat (Arka Kapak)";
  } else {
    els.btnNextPage.title = "Sonraki Sayfalar (Klavye: SaÄŸ Ok)";
  }

  updateWordCount();
}

// ================= SAYFA Ã‡EVÄ°RME & ANÄ°MASYON =================
function goToNextSpread() {
  const maxSpread = Math.floor(state.pages.length / 2) - 1;

  if (state.viewMode === 'front_cover') {
    openBookFromCover(0);
    return;
  }

  if (state.viewMode === 'open') {
    if (state.currentSpread < maxSpread) {
      saveCurrentSpreadState();
      playPageTurnSound();
      state.currentSpread++;
      animateSpreadFlip('next');
    } else {
      closeBookToBack();
    }
    return;
  }
}

function goToPrevSpread() {
  const maxSpread = Math.floor(state.pages.length / 2) - 1;

  if (state.viewMode === 'back_cover') {
    openBookFromCover(maxSpread);
    return;
  }

  if (state.viewMode === 'open') {
    if (state.currentSpread > 0) {
      saveCurrentSpreadState();
      playPageTurnSound();
      state.currentSpread--;
      animateSpreadFlip('prev');
    } else {
      closeBookToFront();
    }
    return;
  }
}

function animateSpreadFlip(direction) {
  const isNext = direction === 'next';
  const animClass = isNext ? 'flip-next-active' : 'flip-prev-active';

  // Ã–nce iÃ§eriÄŸi gÃ¼ncelle
  renderCurrentSpread();
  triggerAutoSave();

  // Sonra animasyonu tetikle (reflow ile sÄ±fÄ±rla)
  const el = els.bookSpread;
  el.classList.remove('flip-next-active', 'flip-prev-active');
  void el.offsetWidth; // reflow
  el.classList.add(animClass);

  setTimeout(() => {
    el.classList.remove(animClass);
  }, 700);
}

function openBookFromCover(startSpread = 0) {
  playPageTurnSound();
  state.viewMode = 'open';
  state.currentSpread = startSpread;
  renderCurrentSpread();
  triggerAutoSave();
}

function closeBookToFront() {
  saveCurrentSpreadState();
  playPageTurnSound();
  state.viewMode = 'front_cover';
  renderCurrentSpread();
  triggerAutoSave();
}

function closeBookToBack() {
  saveCurrentSpreadState();
  playPageTurnSound();
  state.viewMode = 'back_cover';
  renderCurrentSpread();
  triggerAutoSave();
}

function goToSpread(spreadIdx) {
  saveCurrentSpreadState();
  playPageTurnSound();
  state.viewMode = 'open';
  state.currentSpread = spreadIdx;
  renderCurrentSpread();
  triggerAutoSave();
}

// Yeni Ã‡ift Sayfa Ekle
function addNewSpread() {
  saveCurrentSpreadState();
  const nextId = state.pages.length + 1;
  state.pages.push(createNewPageObject(nextId));
  state.pages.push(createNewPageObject(nextId + 1));
  state.viewMode = 'open';
  state.currentSpread = Math.floor((state.pages.length - 2) / 2);
  playPageTurnSound();
  renderCurrentSpread();
  triggerAutoSave();
}

// ================= SAYFA TEMÄ°ZLEME VE SAYFAYI KALDIRMA =================

// Sol Sayfadaki YazÄ±larÄ± Temizle
function clearLeftPage() {
  const pageNum = state.currentSpread * 2 + 1;
  if (confirm(`Sol sayfadaki (Sayfa ${pageNum}) tÃ¼m yazÄ±larÄ± temizlemek istiyor musunuz?`)) {
    const leftIdx = state.currentSpread * 2;
    els.leftPageTitle.value = "";
    els.leftPageDate.value = "";
    els.leftPageEditor.innerHTML = "";
    if (state.pages[leftIdx]) {
      state.pages[leftIdx].title = "";
      state.pages[leftIdx].date = "";
      state.pages[leftIdx].content = "";
      state.pages[leftIdx].stickers = [];
    }
    renderStickers(els.leftStickersContainer, [], leftIdx);
    triggerAutoSave();
  }
}

// SaÄŸ Sayfadaki YazÄ±larÄ± Temizle
function clearRightPage() {
  const pageNum = state.currentSpread * 2 + 2;
  if (confirm(`SaÄŸ sayfadaki (Sayfa ${pageNum}) tÃ¼m yazÄ±larÄ± temizlemek istiyor musunuz?`)) {
    const rightIdx = state.currentSpread * 2 + 1;
    els.rightPageTitle.value = "";
    els.rightPageDate.value = "";
    els.rightPageEditor.innerHTML = "";
    if (state.pages[rightIdx]) {
      state.pages[rightIdx].title = "";
      state.pages[rightIdx].date = "";
      state.pages[rightIdx].content = "";
      state.pages[rightIdx].stickers = [];
    }
    renderStickers(els.rightStickersContainer, [], rightIdx);
    triggerAutoSave();
  }
}

// Sol SayfayÄ± Defterden KaldÄ±r (Sil)
function deleteLeftPage() {
  const pageNum = state.currentSpread * 2 + 1;
  if (confirm(`Sayfa ${pageNum}'i defterden tamamen kaldÄ±rmak istiyor musunuz?`)) {
    const leftIdx = state.currentSpread * 2;
    state.pages.splice(leftIdx, 1);
    
    if (state.pages.length % 2 !== 0) {
      state.pages.push(createNewPageObject(state.pages.length + 1));
    }
    
    state.pages.forEach((p, idx) => p.id = idx + 1);

    const maxSpread = Math.floor(state.pages.length / 2) - 1;
    if (state.currentSpread > maxSpread) state.currentSpread = maxSpread;

    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  }
}

// SaÄŸ SayfayÄ± Defterden KaldÄ±r (Sil)
function deleteRightPage() {
  const pageNum = state.currentSpread * 2 + 2;
  if (confirm(`Sayfa ${pageNum}'yi defterden tamamen kaldÄ±rmak istiyor musunuz?`)) {
    const rightIdx = state.currentSpread * 2 + 1;
    state.pages.splice(rightIdx, 1);

    if (state.pages.length % 2 !== 0) {
      state.pages.push(createNewPageObject(state.pages.length + 1));
    }

    state.pages.forEach((p, idx) => p.id = idx + 1);

    const maxSpread = Math.floor(state.pages.length / 2) - 1;
    if (state.currentSpread > maxSpread) state.currentSpread = maxSpread;

    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  }
}

// ================= BOYUT Ã–LÃ‡EÄÄ° (ZOOM / YAKINLAÅTIR-UZAKLAÅTIR / SATIR YOÄUNLUÄU) =================
function setNotebookZoom(scale) {
  scale = Math.max(0.50, Math.min(1.50, parseFloat(scale.toFixed(2))));
  state.settings.notebookScale = scale;

  const baseLineHeight = 22;
  const baseFontSize = 16;

  // Defter Ã§erÃ§evesi ekranda daima %100 geniÅŸ ve tam boyutta kalÄ±r!
  // (-) ye basÄ±ldÄ±ÄŸÄ±nda satÄ±rlar sÄ±klaÅŸÄ±r, satÄ±r sayÄ±sÄ± artar (geniÅŸ aÃ§Ä± gÃ¶rÃ¼nÃ¼mÃ¼)
  // (+) ya basÄ±ldÄ±ÄŸÄ±nda satÄ±rlar bÃ¼yÃ¼r, satÄ±r sayÄ±sÄ± azalÄ±r
  const curLineHeight = Math.max(12, Math.round(baseLineHeight * scale));
  const curFontSize = Math.max(9, Math.round(baseFontSize * scale));

  document.documentElement.style.setProperty('--line-height', `${curLineHeight}px`);
  document.documentElement.style.setProperty('--notebook-font-size', `${curFontSize}px`);

  // DÄ±ÅŸ Ã§erÃ§eve boyutunu serbest bÄ±rak (CSS'teki tam boyut geÃ§erli olsun)
  els.notebookWrapper.style.maxWidth = '';
  els.notebookWrapper.style.maxHeight = '';

  if (els.zoomLevelDisplay) {
    els.zoomLevelDisplay.textContent = `%${Math.round(scale * 100)}`;
  }
  triggerAutoSave();
}

// ================= AYARLARI UYGULA =================
function applySettingsToUI() {
  document.documentElement.style.setProperty('--notebook-font', state.settings.fontFamily);
  document.documentElement.style.setProperty('--notebook-font-size', `${state.settings.fontSize}px`);

  els.fontFamilySelect.value = state.settings.fontFamily;
  els.fontSizeDisplay.textContent = `${state.settings.fontSize}px`;
  els.coverThemeSelect.value = state.settings.coverTheme;
  els.paperPatternSelect.value = state.settings.paperPattern;

  // Kapak sÄ±nÄ±fÄ± uygula
  els.notebookCover.className = `notebook-cover ${state.settings.coverTheme}`;

  // KaÄŸÄ±t deseni uygula
  els.leftPageLeaf.className = `page-leaf page-left ${state.settings.paperPattern}`;
  els.rightPageLeaf.className = `page-leaf page-right ${state.settings.paperPattern}`;

  // Kalem paletinde aktif seÃ§imi iÅŸaretle
  document.querySelectorAll('.color-swatch').forEach(sw => {
    if (sw.dataset.color === state.settings.penColor) {
      sw.classList.add('active');
    } else {
      sw.classList.remove('active');
    }
  });

  // Zoom Ã¶lÃ§eÄŸini uygula
  setNotebookZoom(state.settings.notebookScale || 1.0);

  // Toolbar gizli mi?
  if (state.settings.toolbarCollapsed) {
    els.appContainer.classList.add('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-down';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ GÃ¶ster';
  } else {
    els.appContainer.classList.remove('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-up';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ Gizle';
  }
}

function toggleToolbarCollapse() {
  state.settings.toolbarCollapsed = !state.settings.toolbarCollapsed;
  if (state.settings.toolbarCollapsed) {
    els.appContainer.classList.add('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-down';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ GÃ¶ster';
  } else {
    els.appContainer.classList.remove('toolbar-collapsed');
    els.toggleToolbarIcon.className = 'fa-solid fa-chevron-up';
    els.toggleToolbarText.textContent = 'MenÃ¼yÃ¼ Gizle';
  }
  triggerAutoSave();
}

// ================= WEB AUDIO API Ä°LE SES SENTEZLEYÄ°CÄ° =================
let audioCtx = null;
function playPageTurnSound() {
  try {
    if (!audioCtx) {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (audioCtx.state === 'suspended') {
      audioCtx.resume();
    }

    const bufferSize = audioCtx.sampleRate * 0.30;
    const buffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufferSize * 0.3));
    }

    const noise = audioCtx.createBufferSource();
    noise.buffer = buffer;

    const filter = audioCtx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.setValueAtTime(850, audioCtx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(320, audioCtx.currentTime + 0.26);
    filter.Q.setValueAtTime(2.0, audioCtx.currentTime);

    const gain = audioCtx.createGain();
    gain.gain.setValueAtTime(0.30, audioCtx.currentTime);
    gain.gain.linearRampToValueAtTime(0.01, audioCtx.currentTime + 0.30);

    noise.connect(filter);
    filter.connect(gain);
    gain.connect(audioCtx.destination);

    noise.start();
  } catch (e) {
    // Sessizce geÃ§
  }
}

// ================= ZENGÄ°N METÄ°N & KALEM RENK YÃ–NETÄ°MÄ° =================
function formatDoc(command, value = null) {
  const targetEditor = state.lastActiveEditor || els.leftPageEditor;
  targetEditor.focus();
  document.execCommand(command, false, value);
  triggerAutoSave();
}

function applyPenColor(color) {
  state.settings.penColor = color;
  const targetEditor = state.lastActiveEditor || els.leftPageEditor;
  targetEditor.focus();
  document.execCommand('foreColor', false, color);
  triggerAutoSave();
}

function insertChecklist() {
  const checklistHtml = `<div class="todo-item"><input type="checkbox" class="todo-checkbox"> <span>YapÄ±lacak yeni gÃ¶rev</span></div>`;
  const targetEditor = state.lastActiveEditor || els.leftPageEditor;
  targetEditor.focus();
  document.execCommand('insertHTML', false, checklistHtml);
  triggerAutoSave();
}

function insertDateStamp() {
  const dateStr = `<strong>ğŸ“… ${getFormattedTodayDate()} : </strong> `;
  const targetEditor = state.lastActiveEditor || els.leftPageEditor;
  targetEditor.focus();
  document.execCommand('insertHTML', false, dateStr);
  triggerAutoSave();
}

// ================= Ã‡IKARTMALAR VE STICKER'LAR =================
function renderStickers(container, stickers, pageIndex) {
  container.innerHTML = '';
  stickers.forEach((st) => {
    if (st.type === 'sticky') {
      const card = document.createElement('div');
      card.className = 'sticky-note-card';
      card.style.backgroundColor = st.color || '#fef08a';
      card.style.left = `${st.x}%`;
      card.style.top = `${st.y}%`;
      card.innerHTML = `
        <div class="sticky-tape"></div>
        <button class="sticky-delete-btn" title="Notu KaldÄ±r"><i class="fa-solid fa-xmark"></i></button>
        <p>${escapeHtml(st.text)}</p>
      `;

      card.querySelector('.sticky-delete-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeSticker(pageIndex, st.id);
      });

      makeDraggable(card, pageIndex, st.id);
      container.appendChild(card);
    } else {
      const el = document.createElement('div');
      el.className = 'placed-sticker';
      el.textContent = st.emoji;
      el.style.left = `${st.x}%`;
      el.style.top = `${st.y}%`;
      el.innerHTML = `${st.emoji} <button class="delete-sticker-btn" title="Sil"><i class="fa-solid fa-xmark"></i></button>`;

      el.querySelector('.delete-sticker-btn').addEventListener('click', (e) => {
        e.stopPropagation();
        removeSticker(pageIndex, st.id);
      });

      makeDraggable(el, pageIndex, st.id);
      container.appendChild(el);
    }
  });
}

function makeDraggable(element, pageIndex, stickerId) {
  let isDragging = false;

  element.addEventListener('mousedown', (e) => {
    if (e.target.closest('button')) return;
    isDragging = true;
    element.style.cursor = 'grabbing';
    e.preventDefault();
  });

  window.addEventListener('mousemove', (e) => {
    if (!isDragging) return;
    const parent = element.parentElement;
    const parentRect = parent.getBoundingClientRect();

    let newX = ((e.clientX - parentRect.left) / parentRect.width) * 100;
    let newY = ((e.clientY - parentRect.top) / parentRect.height) * 100;

    newX = Math.max(2, Math.min(88, newX));
    newY = Math.max(2, Math.min(88, newY));

    element.style.left = `${newX}%`;
    element.style.top = `${newY}%`;
  });

  window.addEventListener('mouseup', () => {
    if (isDragging) {
      isDragging = false;
      element.style.cursor = 'grab';
      
      const page = state.pages[pageIndex];
      if (page && page.stickers) {
        const item = page.stickers.find(s => s.id === stickerId);
        if (item) {
          item.x = parseFloat(element.style.left);
          item.y = parseFloat(element.style.top);
          triggerAutoSave();
        }
      }
    }
  });
}

function removeSticker(pageIndex, stickerId) {
  const page = state.pages[pageIndex];
  if (page && page.stickers) {
    page.stickers = page.stickers.filter(s => s.id !== stickerId);
    renderCurrentSpread();
    triggerAutoSave();
  }
}

function addStickerToPage(targetSide, emoji) {
  const pageIndex = targetSide === 'left' ? state.currentSpread * 2 : state.currentSpread * 2 + 1;
  const page = state.pages[pageIndex];
  if (!page) return;

  if (!page.stickers) page.stickers = [];
  page.stickers.push({
    id: 'st_' + Date.now(),
    emoji: emoji,
    x: 40 + Math.random() * 20,
    y: 30 + Math.random() * 15
  });

  renderCurrentSpread();
  triggerAutoSave();
  closeModal(els.stickerModal);
}

function addStickyNoteToPage(targetSide, text, color) {
  if (!text.trim()) return;
  const pageIndex = targetSide === 'left' ? state.currentSpread * 2 : state.currentSpread * 2 + 1;
  const page = state.pages[pageIndex];
  if (!page) return;

  if (!page.stickers) page.stickers = [];
  page.stickers.push({
    id: 'sticky_' + Date.now(),
    type: 'sticky',
    text: text,
    color: color,
    x: 35 + Math.random() * 15,
    y: 25 + Math.random() * 15
  });

  renderCurrentSpread();
  triggerAutoSave();
  els.stickyNoteText.value = '';
  closeModal(els.stickyModal);
}

// ================= YAZDIRMA (PRINT / PDF) YÃ–NETÄ°MÄ° =================
function formatPrintPageLeaf(page, isLeft) {
  const leafClass = isLeft ? 'print-page-left' : 'print-page-right';
  const pageId = page ? page.id : '';
  const title = page ? (page.title || '') : '';
  const date = page ? (page.date || '') : '';
  const content = page ? (page.content || '') : '';

  return `
    <div class="print-page-leaf ${leafClass}">
      <div class="page-inner-content">
        <div class="page-header">
          <div class="print-page-title">${escapeHtml(title)}</div>
          <div class="print-page-date">${date ? `ğŸ“… ${escapeHtml(date)}` : ''}</div>
        </div>
        <div class="margin-line"></div>
        <div class="page-text-area">${content}</div>
        <div class="page-footer">
          <div class="page-number-box">
            <span class="page-num">${pageId}</span>
          </div>
        </div>
      </div>
    </div>
  `;
}

function printCurrentSpread() {
  closeModal(els.printModal);
  saveCurrentSpreadState();

  const leftIdx = state.currentSpread * 2;
  const rightIdx = leftIdx + 1;
  const p1 = state.pages[leftIdx] || createNewPageObject(leftIdx + 1);
  const p2 = state.pages[rightIdx] || createNewPageObject(rightIdx + 1);

  els.printRenderContainer.innerHTML = `
    <div class="print-spread ${state.settings.paperPattern || 'pattern-ruled'}">
      ${formatPrintPageLeaf(p1, true)}
      <div class="print-spine"></div>
      ${formatPrintPageLeaf(p2, false)}
    </div>
  `;

  setTimeout(() => {
    window.print();
  }, 120);
}

function printAllPages() {
  closeModal(els.printModal);
  saveCurrentSpreadState();

  let html = '';
  const totalSpreads = Math.ceil(state.pages.length / 2);

  for (let i = 0; i < totalSpreads; i++) {
    const p1 = state.pages[i * 2];
    const p2 = state.pages[i * 2 + 1];

    const hasContent1 = p1 && (p1.title || p1.content);
    const hasContent2 = p2 && (p2.title || p2.content);

    if (hasContent1 || hasContent2 || i === 0) {
      html += `
        <div class="print-spread ${state.settings.paperPattern || 'pattern-ruled'}">
          ${formatPrintPageLeaf(p1 || createNewPageObject(i * 2 + 1), true)}
          <div class="print-spine"></div>
          ${formatPrintPageLeaf(p2 || createNewPageObject(i * 2 + 2), false)}
        </div>
      `;
    }
  }

  els.printRenderContainer.innerHTML = html;

  setTimeout(() => {
    window.print();
  }, 120);
}

// ================= Ä°Ã‡Ä°NDEKÄ°LER MODALI =================
function renderTableOfContents() {
  els.tocGrid.innerHTML = '';
  const totalSpreads = Math.ceil(state.pages.length / 2);

  for (let i = 0; i < totalSpreads; i++) {
    const leftP = state.pages[i * 2];
    const rightP = state.pages[i * 2 + 1];

    const card = document.createElement('div');
    card.className = `toc-item ${i === state.currentSpread && state.viewMode === 'open' ? 'active' : ''}`;
    card.innerHTML = `
      <div class="toc-spread-badge">Sayfa ${leftP.id} - ${rightP ? rightP.id : ''}</div>
      <div class="toc-title-preview">${escapeHtml(leftP.title || "BoÅŸ Sayfa")}</div>
      <div class="toc-title-preview" style="color: #64748b;">${rightP ? escapeHtml(rightP.title || "BoÅŸ Sayfa") : ''}</div>
    `;

    card.addEventListener('click', () => {
      goToSpread(i);
      closeModal(els.tocModal);
    });

    els.tocGrid.appendChild(card);
  }
}

// ================= KELÄ°ME SAYACI =================
function updateWordCount() {
  if (state.viewMode !== 'open') {
    els.wordCountBadge.innerHTML = `<i class="fa-solid fa-book"></i> Defter KapalÄ±`;
    return;
  }
  const leftText = els.leftPageEditor.innerText || "";
  const rightText = els.rightPageEditor.innerText || "";
  const combined = (leftText + " " + rightText).trim();
  const words = combined ? combined.split(/\s+/).filter(w => w.length > 0).length : 0;
  els.wordCountBadge.innerHTML = `<i class="fa-solid fa-file-lines"></i> ${words} Kelime`;
}

// ================= EVENT LISTENERS =================
function setupEventListeners() {
  
  // MenÃ¼yÃ¼ Gizle / GÃ¶ster
  els.btnToggleToolbar.addEventListener('click', toggleToolbarCollapse);

  // Takvim ikonuna tÄ±klayÄ±nca date picker aÃ§
  document.querySelectorAll('.page-date-box .fa-calendar').forEach(icon => {
    icon.addEventListener('click', () => {
      const dateInput = icon.parentElement.querySelector('input[type="date"]');
      if (dateInput) dateInput.showPicker && dateInput.showPicker();
    });
  });

  // Alt Bar Zoom (+ / -) Kontrolleri
  if (els.btnZoomIn) {
    els.btnZoomIn.addEventListener('click', () => {
      setNotebookZoom((state.settings.notebookScale || 1.0) + 0.05);
    });
  }

  if (els.btnZoomOut) {
    els.btnZoomOut.addEventListener('click', () => {
      setNotebookZoom((state.settings.notebookScale || 1.0) - 0.05);
    });
  }

  if (els.zoomLevelDisplay) {
    els.zoomLevelDisplay.addEventListener('click', () => {
      setNotebookZoom(1.0); // %100'e sÄ±fÄ±rla
    });
  }

  // Kapak AÃ§ma ButonlarÄ±
  els.btnOpenFromFront.addEventListener('click', () => {
    state.viewMode = 'open';
    state.currentSpread = 0;
    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  });

  els.closedCoverFront.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    state.viewMode = 'open';
    state.currentSpread = 0;
    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  });

  els.btnOpenFromBack.addEventListener('click', () => {
    state.viewMode = 'open';
    state.currentSpread = 0;
    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  });

  els.closedCoverBack.addEventListener('click', (e) => {
    if (e.target.closest('button')) return;
    const maxSpread = Math.floor(state.pages.length / 2) - 1;
    state.viewMode = 'open';
    state.currentSpread = maxSpread;
    playPageTurnSound();
    renderCurrentSpread();
    triggerAutoSave();
  });

  // Son Aktif EditÃ¶r Takibi
  els.leftPageEditor.addEventListener('focus', () => state.lastActiveEditor = els.leftPageEditor);
  els.rightPageEditor.addEventListener('focus', () => state.lastActiveEditor = els.rightPageEditor);

  // Sayfa DeÄŸiÅŸtirme ButonlarÄ± & Kenar TÄ±klamalarÄ±
  els.btnPrevPage.addEventListener('click', goToPrevSpread);
  els.btnNextPage.addEventListener('click', goToNextSpread);
  els.leftFlipTrigger.addEventListener('click', goToPrevSpread);
  els.rightFlipTrigger.addEventListener('click', goToNextSpread);

  // Klavye YÃ¶n TuÅŸlarÄ± ile Sayfa DeÄŸiÅŸtirme
  window.addEventListener('keydown', (e) => {
    const isEditing = document.activeElement && (
      document.activeElement.tagName === 'INPUT' || 
      document.activeElement.tagName === 'TEXTAREA' || 
      document.activeElement.isContentEditable
    );

    if (!isEditing) {
      if (e.key === 'ArrowLeft') goToPrevSpread();
      if (e.key === 'ArrowRight') goToNextSpread();
    } else if (e.altKey || e.ctrlKey) {
      if (e.key === 'ArrowLeft') goToPrevSpread();
      if (e.key === 'ArrowRight') goToNextSpread();
    }
  });

  // Metin DeÄŸiÅŸikliÄŸi & Input Dinleyicileri
  [els.leftPageTitle, els.leftPageDate, els.rightPageTitle, els.rightPageDate].forEach(input => {
    input.addEventListener('input', triggerAutoSave);
  });

  [els.leftPageEditor, els.rightPageEditor].forEach(editor => {
    editor.addEventListener('input', triggerAutoSave);
    editor.addEventListener('keyup', updateWordCount);

    // Checkbox tÄ±klamalarÄ±
    editor.addEventListener('change', (e) => {
      if (e.target.classList.contains('todo-checkbox')) {
        const parent = e.target.closest('.todo-item');
        if (parent) {
          if (e.target.checked) parent.classList.add('checked');
          else parent.classList.remove('checked');
        }
        triggerAutoSave();
      }
    });
  });

  // Font Ailesi
  els.fontFamilySelect.addEventListener('change', (e) => {
    state.settings.fontFamily = e.target.value;
    document.documentElement.style.setProperty('--notebook-font', state.settings.fontFamily);
    triggerAutoSave();
  });

  // Font Boyutu
  els.btnFontSizeInc.addEventListener('click', () => {
    if (state.settings.fontSize < 36) {
      state.settings.fontSize += 2;
      document.documentElement.style.setProperty('--notebook-font-size', `${state.settings.fontSize}px`);
      els.fontSizeDisplay.textContent = `${state.settings.fontSize}px`;
      triggerAutoSave();
    }
  });

  els.btnFontSizeDec.addEventListener('click', () => {
    if (state.settings.fontSize > 10) {
      state.settings.fontSize -= 2;
      document.documentElement.style.setProperty('--notebook-font-size', `${state.settings.fontSize}px`);
      els.fontSizeDisplay.textContent = `${state.settings.fontSize}px`;
      triggerAutoSave();
    }
  });

  // BiÃ§imlendirme ButonlarÄ±
  els.btnBold.addEventListener('click', () => formatDoc('bold'));
  els.btnItalic.addEventListener('click', () => formatDoc('italic'));
  els.btnUnderline.addEventListener('click', () => formatDoc('underline'));
  els.btnStrike.addEventListener('click', () => formatDoc('strikeThrough'));
  els.btnListUl.addEventListener('click', () => formatDoc('insertUnorderedList'));
  els.btnListOl.addEventListener('click', () => formatDoc('insertOrderedList'));
  els.btnChecklist.addEventListener('click', insertChecklist);
  els.btnAddDate.addEventListener('click', insertDateStamp);

  // Kalem Renk Paleti
  document.querySelectorAll('.color-swatch').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.color-swatch').forEach(s => s.classList.remove('active'));
      btn.classList.add('active');
      const color = btn.dataset.color;
      applyPenColor(color);
    });
  });

  els.customPenColor.addEventListener('input', (e) => {
    const color = e.target.value;
    applyPenColor(color);
  });

  // Kapak TemasÄ± SeÃ§imi
  els.coverThemeSelect.addEventListener('change', (e) => {
    state.settings.coverTheme = e.target.value;
    els.notebookCover.className = `notebook-cover ${state.settings.coverTheme}`;
    triggerAutoSave();
  });

  // KaÄŸÄ±t Deseni SeÃ§imi
  els.paperPatternSelect.addEventListener('change', (e) => {
    state.settings.paperPattern = e.target.value;
    els.leftPageLeaf.className = `page-leaf page-left ${state.settings.paperPattern}`;
    els.rightPageLeaf.className = `page-leaf page-right ${state.settings.paperPattern}`;
    triggerAutoSave();
  });

  // Ãœst Butonlar
  els.btnNewSpread.addEventListener('click', addNewSpread);

  // Sayfa Temizleme ve KaldÄ±rma
  els.btnClearCurrentLeft.addEventListener('click', clearLeftPage);
  els.btnDeleteCurrentLeft.addEventListener('click', deleteLeftPage);

  els.btnClearCurrentRight.addEventListener('click', clearRightPage);
  els.btnDeleteCurrentRight.addEventListener('click', deleteRightPage);

  // Tam Ekran
  els.btnFullscreen.addEventListener('click', () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().catch(err => alert(err.message));
      els.btnFullscreen.innerHTML = `<i class="fa-solid fa-compress"></i>`;
    } else {
      document.exitFullscreen();
      els.btnFullscreen.innerHTML = `<i class="fa-solid fa-expand"></i>`;
    }
  });

  // DÄ±ÅŸa Aktar / YazdÄ±r ModalÄ±
  els.btnExport.addEventListener('click', () => openModal(els.printModal));
  els.btnClosePrintModal.addEventListener('click', () => closeModal(els.printModal));
  els.btnPrintCurrentSpread.addEventListener('click', printCurrentSpread);
  els.btnPrintAllPages.addEventListener('click', printAllPages);

  // Modaller
  els.btnTableOfContents.addEventListener('click', () => {
    renderTableOfContents();
    openModal(els.tocModal);
  });
  els.btnCloseToc.addEventListener('click', () => closeModal(els.tocModal));
  els.btnModalAddPage.addEventListener('click', () => {
    addNewSpread();
    closeModal(els.tocModal);
  });

  // Ã‡Ä±kartma ModalÄ±
  els.btnStickerModal.addEventListener('click', () => {
    loadStickersByCategory('emojis');
    openModal(els.stickerModal);
  });
  els.btnCloseStickerModal.addEventListener('click', () => closeModal(els.stickerModal));

  document.querySelectorAll('.sticker-tab-btn').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sticker-tab-btn').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      loadStickersByCategory(tab.dataset.cat);
    });
  });

  // Post-it ModalÄ±
  els.btnAddSticky.addEventListener('click', () => openModal(els.stickyModal));
  els.btnCloseStickyModal.addEventListener('click', () => closeModal(els.stickyModal));

  let selectedStickyColor = '#fef08a';
  document.querySelectorAll('.sticky-color-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      document.querySelectorAll('.sticky-color-btn').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      selectedStickyColor = btn.dataset.color;
    });
  });

  els.btnInsertSticky.addEventListener('click', () => {
    const text = els.stickyNoteText.value;
    const target = document.querySelector('input[name="stickyTargetPage"]:checked').value;
    addStickyNoteToPage(target, text, selectedStickyColor);
  });

  // Modal dÄ±ÅŸÄ±na tÄ±klayÄ±nca kapat
  [els.printModal, els.tocModal, els.stickerModal, els.stickyModal].forEach(modal => {
    modal.addEventListener('click', (e) => {
      if (e.target === modal) closeModal(modal);
    });
  });
}

function loadStickersByCategory(category) {
  els.stickerGrid.innerHTML = '';
  const list = STICKER_DATA[category] || STICKER_DATA.emojis;
  list.forEach(emoji => {
    const btn = document.createElement('button');
    btn.className = 'sticker-opt';
    btn.textContent = emoji;
    btn.addEventListener('click', () => {
      const target = document.querySelector('input[name="stickerTargetPage"]:checked').value;
      addStickerToPage(target, emoji);
    });
    els.stickerGrid.appendChild(btn);
  });
}

function openModal(modal) {
  modal.classList.remove('hidden');
}

function closeModal(modal) {
  modal.classList.add('hidden');
}

// ================= YARDIMCI FONKSÄ°YONLAR =================
function createNewPageObject(id) {
  return {
    id: id,
    title: "",
    date: "",
    content: "",
    stickers: []
  };
}

function getFormattedTodayDate() {
  const d = new Date();
  const options = { day: 'numeric', month: 'long', year: 'numeric' };
  return d.toLocaleDateString('tr-TR', options);
}

function escapeHtml(text) {
  if (!text) return '';
  const map = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' };
  return text.replace(/[&<>"']/g, m => map[m]);
}

// UygulamayÄ± BaÅŸlat
document.addEventListener('DOMContentLoaded', initApp);

/* ================= API AND AUTH ================= */
const API_URL = (window.location.origin.includes('localhost') || window.location.origin.includes('127.0.0.1')) && window.location.port !== '3005'
  ? 'http://localhost:3005/api'
  : '/api';
let authToken = localStorage.getItem('sihirli_defter_token');
let currentUser = localStorage.getItem('sihirli_defter_user');

async function fetchFruits() {
  try {
    const res = await fetch(API_URL + '/fruits');
    if (res.ok) {
      const data = await res.json();
      populateDropdown('loginFruit', data.registered, '-- Kayıtlı Meyveni Seç --');
      populateDropdown('registerFruit', data.available, '-- Boşta Olan Bir Meyve Seç --');
    }
  } catch (e) {
    console.error('Meyve listesi alınamadı:', e);
  }
}

function populateDropdown(elementId, items, placeholder) {
  const select = document.getElementById(elementId);
  select.innerHTML = '<option value=\"\">' + placeholder + '</option>';
  items.forEach(item => {
    const opt = document.createElement('option');
    opt.value = item;
    opt.textContent = item;
    select.appendChild(opt);
  });
}

function showAuthModal() {
  document.getElementById('authModal').classList.remove('hidden');
  document.getElementById('appContainer').style.filter = 'blur(5px)';
  fetchFruits();
}

function hideAuthModal() {
  document.getElementById('authModal').classList.add('hidden');
  document.getElementById('appContainer').style.filter = 'none';
}

function switchAuthTab(tab) {
  document.getElementById('tabLogin').classList.remove('active');
  document.getElementById('tabRegister').classList.remove('active');
  document.getElementById('loginForm').classList.add('hidden');
  document.getElementById('registerForm').classList.add('hidden');
  
  if (tab === 'login') {
    document.getElementById('tabLogin').classList.add('active');
    document.getElementById('loginForm').classList.remove('hidden');
  } else {
    document.getElementById('tabRegister').classList.add('active');
    document.getElementById('registerForm').classList.remove('hidden');
  }
}

async function handleRegister() {
  const fruit = document.getElementById('registerFruit').value;
  const pass = document.getElementById('registerPass').value;
  if (!fruit) return alert('Lütfen bir meyve seçin!');
  if (!pass) return alert('Şifre giriniz!');
  
  try {
    const res = await fetch(API_URL + '/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fruit_name: fruit, password: pass })
    });
    const data = await res.json();
    if (res.ok) {
      alert('Hesap oluşturuldu! Meyve Adın: ' + data.fruit_name + '\nLütfen unutma!');
      authToken = data.token;
      currentUser = data.fruit_name;
      localStorage.setItem('sihirli_defter_token', authToken);
      localStorage.setItem('sihirli_defter_user', currentUser);
      hideAuthModal();
      loadCloudData();
    } else {
      alert(data.error);
    }
  } catch (e) {
    alert('Sunucuya bağlanılamadı!');
  }
}

async function handleLogin() {
  const fruit = document.getElementById('loginFruit').value;
  const pass = document.getElementById('loginPass').value;
  if (!fruit || !pass) return alert('Meyveni seç ve şifreni gir!');
  
  try {
    const res = await fetch(API_URL + '/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ fruit_name: fruit, password: pass })
    });
    const data = await res.json();
    if (res.ok) {
      authToken = data.token;
      currentUser = data.fruit_name;
      localStorage.setItem('sihirli_defter_token', authToken);
      localStorage.setItem('sihirli_defter_user', currentUser);
      hideAuthModal();
      loadCloudData();
    } else {
      alert(data.error);
    }
  } catch (e) {
    alert('Sunucuya bağlanılamadı!');
  }
}

function handleLogout() {
  if(confirm('Çıkış yapmak istediğine emin misin?')) {
    localStorage.removeItem('sihirli_defter_token');
    localStorage.removeItem('sihirli_defter_user');
    window.location.reload();
  }
}

async function saveCloudData(dataObj) {
  if (!authToken) return;
  try {
    await fetch(API_URL + '/sync', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + authToken
      },
      body: JSON.stringify(dataObj)
    });
  } catch(e) {
    console.error('Senkronizasyon hatası', e);
  }
}

async function loadCloudData() {
  if (!authToken) return;
  try {
    const res = await fetch(API_URL + '/load', {
      headers: { 'Authorization': 'Bearer ' + authToken }
    });
    const data = await res.json();
    if (data) {
      state = Object.assign({}, defaultState, data);
      renderCurrentSpread();
      renderTOC();
    }
  } catch(e) {
    console.error('Veri yükleme hatası', e);
  }
}

const originalTriggerAutoSave = triggerAutoSave;
triggerAutoSave = function() {
  originalTriggerAutoSave();
  if (authToken) {
      saveCloudData(state);
  }
};

window.addEventListener('load', () => {
  if (!authToken) {
    showAuthModal();
  } else {
    loadCloudData();
  }
});
