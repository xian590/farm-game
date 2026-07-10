"""
Batch A11y fix script for index.html
Adds aria-label, role, type="button", aria-modal, aria-labelledby, etc.
"""
import re, sys, html

BASE = r"C:\Users\Administrator\Documents\kimi\workspace"
INPUT = BASE + r"\index.html"
OUTPUT = BASE + r"\index_a11y.html"

with open(INPUT, "r", encoding="utf-8") as f:
    text = f.read()

# --- 1. Add type="button" to all <button> without type ---
def add_button_type(m):
    tag = m.group(0)
    if 'type=' not in tag:
        tag = tag.replace('<button', '<button type="button"')
    return tag

text = re.sub(r'<button\b[^>]*>', add_button_type, text, flags=re.IGNORECASE)

# --- 2. Smart aria-label for buttons: extract text content between <button> and </button> ---
button_pattern = re.compile(r'(<button\b[^>]*>)(.*?)(</button>)', re.IGNORECASE | re.DOTALL)

def add_button_aria(m):
    start, content, end = m.group(1), m.group(2).strip(), m.group(3)
    if 'aria-label' in start:
        return m.group(0)
    # Extract visible text (remove HTML tags, collapse whitespace)
    visible = re.sub(r'<[^>]+>', '', content).strip()
    visible = re.sub(r'\s+', ' ', visible)
    # If visible text is empty or just icon/font-awesome, use nearby context
    if not visible or len(visible) < 2:
        # Check for icon class
        if 'fa-' in start or 'icon' in start.lower():
            # infer from class name
            cls_match = re.search(r'class="([^"]*)"', start)
            if cls_match:
                cls = cls_match.group(1)
                # e.g., fa-home -> home, fa-arrow-left -> back
                for c in cls.split():
                    if c.startswith('fa-'):
                        visible = c.replace('fa-', '').replace('-', ' ')
                        break
        if not visible:
            visible = "button"
    # Truncate and escape
    visible = visible[:60]
    visible = html.escape(visible, quote=True)
    # Insert aria-label before the closing >
    start = start[:-1] + f' aria-label="{visible}">'
    return start + content + end

text = button_pattern.sub(add_button_aria, text)

# --- 3. Add role="dialog" aria-modal="true" to all .modal ---
modal_pattern = re.compile(r'(<div\b[^>]*class="[^"]*\bmodal\b[^"]*"[^>]*>)', re.IGNORECASE)

def add_modal_role(m):
    tag = m.group(1)
    if 'role=' not in tag:
        tag = tag.replace('class="', 'role="dialog" aria-modal="true" class="')
    return tag

text = modal_pattern.sub(add_modal_role, text)

# --- 4. Add role="navigation" to nav ---
nav_pattern = re.compile(r'(<nav\b[^>]*>)', re.IGNORECASE)

def add_nav_role(m):
    tag = m.group(1)
    if 'role=' not in tag:
        tag = tag.replace('class="', 'role="navigation" aria-label="Main navigation" class="')
    return tag

text = nav_pattern.sub(add_nav_role, text)

# --- 5. Add role="main" to the first <main> or <div class="pages"> ---
main_pattern = re.compile(r'(<div\b[^>]*class="[^"]*\bpages\b[^"]*"[^>]*>)', re.IGNORECASE)

def add_main_role(m):
    tag = m.group(1)
    if 'role=' not in tag:
        tag = tag.replace('class="', 'role="main" class="')
    return tag

text = text = main_pattern.sub(add_main_role, text, count=1)

# --- 6. Add aria-label to all <input> without placeholder or aria-label ---
input_pattern = re.compile(r'(<input\b[^>]*>)', re.IGNORECASE)

def add_input_aria(m):
    tag = m.group(1)
    if 'aria-label' in tag or 'placeholder' in tag:
        return tag
    # Try to infer from id or name
    id_match = re.search(r'\bid="([^"]*)"', tag)
    name_match = re.search(r'\bname="([^"]*)"', tag)
    label = id_match.group(1) if id_match else (name_match.group(1) if name_match else "input")
    label = label.replace('-', ' ').replace('_', ' ').strip()
    label = html.escape(label, quote=True)
    tag = tag[:-1] + f' aria-label="{label}">'
    return tag

text = input_pattern.sub(add_input_aria, text)

# --- 7. Add aria-label to <textarea> without it ---
textarea_pattern = re.compile(r'(<textarea\b[^>]*>)', re.IGNORECASE)

def add_textarea_aria(m):
    tag = m.group(1)
    if 'aria-label' in tag or 'placeholder' in tag:
        return tag
    id_match = re.search(r'\bid="([^"]*)"', tag)
    label = id_match.group(1).replace('-', ' ') if id_match else "text area"
    label = html.escape(label, quote=True)
    tag = tag[:-1] + f' aria-label="{label}">'
    return tag

text = textarea_pattern.sub(add_textarea_aria, text)

# --- 8. Add aria-label to <select> without it ---
select_pattern = re.compile(r'(<select\b[^>]*>)', re.IGNORECASE)

def add_select_aria(m):
    tag = m.group(1)
    if 'aria-label' in tag:
        return tag
    id_match = re.search(r'\bid="([^"]*)"', tag)
    label = id_match.group(1).replace('-', ' ') if id_match else "select menu"
    label = html.escape(label, quote=True)
    tag = tag[:-1] + f' aria-label="{label}">'
    return tag

text = select_pattern.sub(add_select_aria, text)

# --- 9. Add aria-label to <a> links that are icon-only (no visible text) ---
a_pattern = re.compile(r'(<a\b[^>]*>)(.*?)(</a>)', re.IGNORECASE | re.DOTALL)

def add_link_aria(m):
    start, content, end = m.group(1), m.group(2).strip(), m.group(3)
    if 'aria-label' in start:
        return m.group(0)
    visible = re.sub(r'<[^>]+>', '', content).strip()
    visible = re.sub(r'\s+', ' ', visible)
    if not visible or len(visible) < 2:
        # icon-only link
        if 'href' in start:
            href_match = re.search(r'href="([^"]*)"', start)
            label = href_match.group(1) if href_match else "link"
        else:
            label = "link"
        label = label.replace('#', '').replace('/', ' ').strip() or "link"
        label = html.escape(label, quote=True)
        start = start[:-1] + f' aria-label="{label}">'
    return start + content + end

text = a_pattern.sub(add_link_aria, text)

# --- 10. Add tabindex="0" to interactive cards/divs that have onclick but no tabindex ---
# Only for elements with class card or similar interactive containers
interactive_pattern = re.compile(r'(<div\b[^>]*class="[^"]*(?:card|item|tile|entry|row)[^"]*"[^>]*\bonclick\b[^>]*>)', re.IGNORECASE)

def add_tabindex(m):
    tag = m.group(1)
    if 'tabindex' in tag:
        return tag
    tag = tag[:-1] + ' tabindex="0">'
    return tag

text = interactive_pattern.sub(add_tabindex, text)

# Write output
with open(OUTPUT, "w", encoding="utf-8") as f:
    f.write(text)

# Stats
original_len = len(open(INPUT, "r", encoding="utf-8").read())
new_len = len(text)
print(f"Original: {original_len} chars")
print(f"New:      {new_len} chars")
print(f"Delta:    {new_len - original_len} chars added")
print(f"Saved to: {OUTPUT}")
