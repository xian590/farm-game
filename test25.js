
// ============================================================
//  DOM 安全辅助函数 (v6.4 全面排查添加)
// ============================================================
function $el(id) { return document.getElementById(id); }
function setText(id, text) { const el = $el(id); if (el) el.textContent = text; }
function setHTML(id, html) { const el = $el(id); if (el) el.innerHTML = html; }
function addCls(id, cls) { const el = $el(id); if (el) el.classList.add(cls); }
function remCls(id, cls) { const el = $el(id); if (el) el.classList.remove(cls); }
function toggleCls(id, cls, force) { const el = $el(id); if (el) el.classList.toggle(cls, force); }
function setStyle(id, prop, val) { const el = $el(id); if (el) el.style[prop] = val; }
function setVal(id, val) { const el = $el(id); if (el) el.value = val; }
function showModal(id) { addCls(id, 'show'); }
function hideModal(id) { remCls(id, 'show'); }

// ============================================================
//  数据定义
// ============================================================

// 12位公主 + 对应花
const PERSONAS = [
  { id: 'rose', name: '玫瑰公主', flower: '玫瑰', color: '#D4A5B8', animal: '🦊 狐狸',
    trait: '行动型', second: '魅力型',
    advantage: '行动力超强，敢想敢做，魅力四射，永远充满热情',
    block: '容易急躁冲太快，缺乏耐心导致返工，偶尔太强势',
