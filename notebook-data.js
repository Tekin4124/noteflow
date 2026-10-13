// Normalize all persisted input before it reaches HTML, style or notebook state.
(function(root) {
  const defaults = { fontFamily: "'Caveat', cursive", fontSize: 16, penColor: '#1e293b', coverTheme: 'cover-leather', paperPattern: 'pattern-ruled', soundEnabled: true, toolbarCollapsed: false, notebookScale: 1 };
  function normalize(data, sanitize) {
    const pages = Array.isArray(data?.pages) ? data.pages.slice(0,120) : [];
    const settings = { ...defaults };
    const s = data?.settings || {};
    if (typeof s.fontFamily === 'string' && /^[\w\s,'-]{1,80}$/.test(s.fontFamily)) settings.fontFamily = s.fontFamily;
    if (Number.isFinite(s.fontSize)) settings.fontSize = Math.max(9,Math.min(36,s.fontSize));
    if (/^#[a-f0-9]{6}$/i.test(s.penColor)) settings.penColor = s.penColor;
    if (['cover-leather','cover-navy','cover-emerald','cover-bordeaux','cover-noir','cover-sakura','cover-camel','cover-purple'].includes(s.coverTheme)) settings.coverTheme = s.coverTheme;
    if (['pattern-ruled','pattern-grid','pattern-dotted','pattern-blank','pattern-sepia','pattern-dark'].includes(s.paperPattern)) settings.paperPattern = s.paperPattern;
    for (const k of ['soundEnabled','toolbarCollapsed']) if (typeof s[k] === 'boolean') settings[k] = s[k];
    if (Number.isFinite(s.notebookScale)) settings.notebookScale = Math.max(.5,Math.min(1.5,s.notebookScale));
    const text = (v,max) => typeof v === 'string' ? v.slice(0,max) : '';
    const normalized = pages.map((p,i) => ({ id:i+1, title:text(p?.title,200), date:text(p?.date,64), content:sanitize(text(p?.content,65536)), stickers: (Array.isArray(p?.stickers) ? p.stickers : []).slice(0,50).filter(st => st && ['sticky','emoji'].includes(st.type)).map((st,j) => ({ id:(typeof st.id==='string' && /^[a-zA-Z0-9_-]{1,80}$/.test(st.id)) || Number.isFinite(st.id) ? st.id : j+1,type:st.type,x:Number.isFinite(st.x)?Math.max(0,Math.min(100,st.x)):50,y:Number.isFinite(st.y)?Math.max(0,Math.min(100,st.y)):50,...(st.type==='sticky'?{text:text(st.text,2000),color:/^#[a-f0-9]{6}$/i.test(st.color)?st.color:'#fef08a'}:{emoji:text(st.emoji,32)}) })) }));
    const blank = () => ({ id:normalized.length+1,title:'',date:'',content:'',stickers:[] });
    while (normalized.length < 2 || normalized.length%2) normalized.push(blank());
    return { pages: normalized, currentSpread:Number.isInteger(data?.currentSpread)?Math.max(0,Math.min(Math.floor(normalized.length/2)-1,data.currentSpread)):0, viewMode:['open','front_cover','back_cover'].includes(data?.viewMode)?data.viewMode:'open',settings };
  }
  root.NotebookData = { normalize, defaults };
  if (typeof module !== 'undefined') module.exports = root.NotebookData;
})(typeof window === 'undefined' ? globalThis : window);
