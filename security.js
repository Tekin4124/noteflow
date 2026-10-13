const sanitizeHtml = require('sanitize-html');
const MAX_NOTEBOOK_BYTES = 1024 * 1024;
const MAX_PAGES = 120;
function cleanHTML(value) {
  return sanitizeHtml(value, {
    allowedTags: ['p', 'div', 'span', 'br', 'b', 'strong', 'i', 'em', 'u', 's', 'strike', 'ul', 'ol', 'li', 'blockquote', 'h1', 'h2', 'h3', 'font', 'input'],
    allowedAttributes: { '*': ['style'], font: ['color', 'face', 'size'], input: ['type', 'checked', 'disabled'] },
    allowedStyles: { '*': { color: [/^#[a-f0-9]{3,8}$/i, /^rgb\([\d\s,.]+\)$/], 'font-size': [/^\d{1,2}(px|pt)$/], 'font-family': [/^[\w\s,'-]{1,80}$/], 'text-align': [/^(left|right|center|justify)$/], 'text-decoration': [/^(underline|line-through)$/], 'font-weight': [/^(bold|normal|[1-9]00)$/], 'font-style': [/^(italic|normal)$/] } },
    transformTags: { input: (tag, attrs) => ({ tagName: 'input', attribs: { type: 'checkbox', disabled: '', ...(Object.hasOwn(attrs, 'checked') ? { checked: '' } : {}) } }) }
  });
}
function validNotebook(data) {
  if (!data || typeof data !== 'object' || Array.isArray(data) || !Array.isArray(data.pages) || data.pages.length > MAX_PAGES || data.pages.length < 1) return false;
  if (Buffer.byteLength(JSON.stringify(data)) > MAX_NOTEBOOK_BYTES) return false;
  const allowed = new Set(['pages', 'currentSpread', 'viewMode', 'settings']);
  if (Object.keys(data).some(k => !allowed.has(k))) return false;
  if (data.currentSpread !== undefined && (!Number.isInteger(data.currentSpread) || data.currentSpread < 0 || data.currentSpread >= Math.ceil(data.pages.length / 2))) return false;
  if (data.viewMode !== undefined && !['open', 'front_cover', 'back_cover'].includes(data.viewMode)) return false;
  for (const p of data.pages) {
    if (!p || typeof p !== 'object' || Array.isArray(p) || Object.keys(p).some(k => !['id', 'title', 'date', 'content', 'stickers'].includes(k))) return false;
    if (p.id !== undefined && (!Number.isInteger(p.id) || p.id < 1 || p.id > MAX_PAGES)) return false;
    for (const [k, max] of [['title', 200], ['date', 64], ['content', 65536]]) if (p[k] !== undefined && (typeof p[k] !== 'string' || p[k].length > max)) return false;
    if (p.stickers !== undefined && (!Array.isArray(p.stickers) || p.stickers.length > 50 || p.stickers.some(s => !s || !['sticky', 'emoji'].includes(s.type) || !((typeof s.id === 'number' && Number.isFinite(s.id)) || (typeof s.id === 'string' && /^[a-zA-Z0-9_-]{1,80}$/.test(s.id))) || !Number.isFinite(s.x) || !Number.isFinite(s.y) || s.x < 0 || s.x > 100 || s.y < 0 || s.y > 100 || typeof (s.text ?? '') !== 'string' || (s.text || '').length > 2000 || typeof (s.emoji ?? '') !== 'string' || (s.emoji || '').length > 32 || (s.color !== undefined && !/^#[a-f0-9]{6}$/i.test(s.color)) || Object.keys(s).some(k => !['id','type','x','y','text','emoji','color'].includes(k))))) return false;
  }
  if (data.settings !== undefined) {
    const s = data.settings;
    if (!s || typeof s !== 'object' || Array.isArray(s)) return false;
    const rules = { fontFamily: v => typeof v === 'string' && /^[\w\s,'-]{1,80}$/.test(v), fontSize: v => Number.isFinite(v) && v >= 9 && v <= 36, penColor: v => /^#[a-f0-9]{6}$/i.test(v), coverTheme: v => /^cover-[a-z-]{1,24}$/.test(v), paperPattern: v => /^pattern-[a-z-]{1,24}$/.test(v), soundEnabled: v => typeof v === 'boolean', toolbarCollapsed: v => typeof v === 'boolean', notebookScale: v => Number.isFinite(v) && v >= .5 && v <= 1.5 };
    if (Object.entries(s).some(([k,v]) => !Object.hasOwn(rules,k) || !rules[k](v))) return false;
  }
  return true;
}
function cleanNotebook(data) {
  if (!validNotebook(data)) return null;
  return { ...data, pages: data.pages.map(p => ({ ...p, ...(p.content !== undefined ? { content: cleanHTML(p.content) } : {}) })) };
}
function rateLimit({ limit, windowMs, maxClients = 5000 }) {
  const clients = new Map();
  return (req, res, next) => {
    const now = Date.now();
    for (const [key, item] of clients) if (item.until <= now) clients.delete(key);
    const key = req.ip;
    let entry = clients.get(key);
    if (!entry) {
      if (clients.size >= maxClients) return res.status(429).json({ error: 'Lütfen biraz sonra tekrar deneyin.' });
      clients.set(key, entry = { count: 0, until: now + windowMs });
    }
    if (++entry.count > limit) {
      res.set('Retry-After', String(Math.ceil((entry.until - now) / 1000)));
      return res.status(429).json({ error: 'Çok fazla deneme. Lütfen biraz sonra tekrar deneyin.' });
    }
    next();
  };
}
module.exports = { cleanNotebook, cleanHTML, rateLimit, MAX_NOTEBOOK_BYTES, MAX_PAGES };
