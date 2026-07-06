
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
  { id: 'ros