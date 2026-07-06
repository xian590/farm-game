import re, os, bisect

FILE_PATH = 'index-manifestation.html'

with open(FILE_PATH, 'r', encoding='utf-8') as f:
    content = f.read()

# Build line index for fast line number lookup
line_starts = [0]
for i, ch in enumerate(content):
    if ch == '\n':
        line_starts.append(i + 1)

def get_line(idx):
    return bisect.bisect_right(line_starts, idx)

# Extract <script> and <style> blocks
script_blocks = []
style_blocks = []

for m in re.finditer(r'<script[^>]*>', content, re.IGNORECASE):
    start = m.end()
    end_m = re.search(r'</script>', content[start:], re.IGNORECASE)
    if end_m:
        script_blocks.append(content[start:start + end_m.start()])

for m in re.finditer(r'<style[^>]*>', content, re.IGNORECASE):
    start = m.end()
    end_m = re.search(r'</style>', content[start:], re.IGNORECASE)
    if end_m:
        style_blocks.append(content[start:start + end_m.start()])

script_text = '\n'.join(script_blocks)
style_text = '\n'.join(style_blocks)

# Global variables for output
report = []
report.append(f'=== Bug Scan Report for {FILE_PATH} ===\n')
report.append(f'Total lines: {len(line_starts)}\n')

# --- 1. Unused function definitions ---
# Find all function definitions
func_defs = {}
for m in re.finditer(r'\bfunction\s+([a-zA-Z_$][\w$]*)\s*\(', content):
    name = m.group(1)
    line = get_line(m.start())
    if name not in func_defs:
        func_defs[name] = line

# Find all calls (name followed by ()
calls = set()
keywords = {
    'if','while','for','switch','catch','function','return','new','typeof','instanceof',
    'else','do','with','throw','console','Math','Date','JSON','Object','Array','String',
    'Number','Boolean','RegExp','Error','window','document','localStorage','setTimeout',
    'setInterval','clearTimeout','clearInterval','alert','confirm','prompt','parseInt',
    'parseFloat','isNaN','isFinite','eval','encodeURI','encodeURIComponent','decodeURI',
    'decodeURIComponent','undefined','null','true','false','this','self','top','parent',
    'location','navigator','history','screen','requestAnimationFrame','cancelAnimationFrame',
    'fetch','atob','btoa','TextEncoder','TextDecoder','Intl','Promise','Map','Set','WeakMap',
    'WeakSet','Symbol','BigInt','Infinity','NaN','Event','HTMLElement','Element','Node',
    'NodeList','HTMLCollection','DocumentFragment','CustomEvent','FormData','XMLHttpRequest',
    'WebSocket','SharedArrayBuffer','Atomics','Proxy','Reflect','Generator','Iterator',
    'AsyncFunction','GeneratorFunction','performance','crypto','CSS','URL','Blob','FileReader',
    'Image','Audio','MouseEvent','KeyboardEvent','TouchEvent','MutationObserver','IntersectionObserver'
}

for m in re.finditer(r'([a-zA-Z_$][\w$]*)\s*\(', content):
    name = m.group(1)
    # Skip if preceded by 'function'
    before = content[max(0, m.start()-20):m.start()]
    if re.search(r'\bfunction\s*$', before):
        continue
    if name in keywords:
        continue
    calls.add(name)

# Also add addEventListener callbacks
for m in re.finditer(r'addEventListener\s*\(\s*["\'][^"\']+["\']\s*,\s*([a-zA-Z_$][\w$]*)', content):
    calls.add(m.group(1))

unused = [ (n, l) for n, l in func_defs.items() if n not in calls ]
report.append('--- 1. Unused Function Definitions ---\n')
if unused:
    for name, line in sorted(unused, key=lambda x: x[1]):
        report.append(f'Line {line}: function {name}() defined but never called.\n')
else:
    report.append('None found.\n')
report.append('\n')

# --- 2. Functions in onclick but not defined ---
report.append('--- 2. Functions in onclick but not defined ---\n')
onclick_issues = []
for m in re.finditer(r'onclick\s*=\s*(["\'])(.*?)\1', content):
    attr = m.group(2)
    line = get_line(m.start())
    for m2 in re.finditer(r'([a-zA-Z_$][\w$]*)\s*\(', attr):
        name = m2.group(1)
        if name not in func_defs:
            onclick_issues.append((name, line, attr))

if onclick_issues:
    for name, line, attr in onclick_issues:
        report.append(f'Line {line}: onclick references "{name}()" which is not defined as a function.\n')
else:
    report.append('None found.\n')
report.append('\n')

# --- 3. CSS classes used but not defined ---
# Extract defined classes from <style>
defined_classes = set()
for text in style_blocks:
    for m in re.finditer(r'\.([a-zA-Z_-][\w-]*)', text):
        defined_classes.add(m.group(1))

# Known dynamic classes to skip
known_dynamic = {
    'active','hidden','show','glass-card','soft-btn','gradient-text','btn-primary','btn-soft','tab-pill','dream-input','mood-tag','option-card','chip-soft','card-hover','progress-bar','progress-fill','modal-backdrop','modal-content','book-page-content','toast','building','island-sky','rain-drop','celestial-body','flower-icon','flower-grid','flower-cell','emotion-scale','emotion-marker','step-dot','wish-card','neg-crystal','pos-crystal','wish-plaque','voice-bubble','settings-group','settings-item','toggle-switch','voice-option','theme-dot','pin-dot','stat-card','chart-container','nav-item','wish-star','starry-sky','petal','click-sparkle','breath-circle','breath-circle-inner','letter-paper','book-shelf','book-stand','book-spine','glass-header','welcome-page','page','glass'
}

used_classes = {}  # class -> list of lines

# class="..." or class='...'
for m in re.finditer(r'class\s*=\s*(["\'])(.*?)\1', content):
    classes = m.group(2).split()
    line = get_line(m.start())
    for c in classes:
        if c:
            used_classes.setdefault(c, []).append(line)

# classList.add/remove/toggle('...')
for m in re.finditer(r'classList\.(?:add|remove|toggle)\s*\(([^)]+)\)', content):
    args = m.group(1)
    line = get_line(m.start())
    for m2 in re.finditer(r'["\']([\w-]+)["\']', args):
        c = m2.group(1)
        used_classes.setdefault(c, []).append(line)

# className = '...'
for m in re.finditer(r'className\s*=\s*(["\'])(.*?)\1', content):
    classes = m.group(2).split()
    line = get_line(m.start())
    for c in classes:
        if c:
            used_classes.setdefault(c, []).append(line)

missing = []
for cls, lines in used_classes.items():
    if cls in defined_classes or cls in known_dynamic:
        continue
    missing.append((cls, lines))

report.append('--- 3. CSS Classes Used but Not Defined ---\n')
if missing:
    for cls, lines in sorted(missing, key=lambda x: x[1][0]):
        report.append(f'Class "{cls}" used at lines {", ".join(map(str, lines))} but not defined in <style>.\n')
else:
    report.append('None found.\n')
report.append('\n')

# --- 4. State variable references ---
report.append('--- 4. State Variable References ---\n')
state_declared = bool(re.search(r'\b(var|let|const)\s+state\b', content))
report.append(f'State declared: {state_declared}\n')

loadstate_lines = [ get_line(m.start()) for m in re.finditer(r'loadState\s*\(', content) ]
report.append(f'loadState() calls at lines: {loadstate_lines if loadstate_lines else "none"}\n')

state_refs = []
for m in re.finditer(r'\bstate\.([a-zA-Z_$][\w$]*)', content):
    state_refs.append((m.group(1), get_line(m.start())))

report.append('State property references (potential undefined if state is not initialized):\n')
for prop, line in state_refs:
    report.append(f'  Line {line}: state.{prop}\n')
report.append('\n')

# --- 5. Potential infinite loops / recursion ---
report.append('--- 5. Potential Infinite Loops / Recursion ---\n')
infinite_loops = []
for m in re.finditer(r'while\s*\((.*?)\)', content):
    cond = m.group(1).strip()
    if cond == 'true' or cond == '1' or cond == '':
        infinite_loops.append(('while', get_line(m.start()), cond))

for m in re.finditer(r'for\s*\((.*?)\)', content):
    parts = m.group(1).split(';')
    if len(parts) >= 3:
        cond = parts[1].strip()
        if cond == '' or cond == 'true' or cond == '1':
            infinite_loops.append(('for', get_line(m.start()), m.group(1)))

if infinite_loops:
    for typ, line, cond in infinite_loops:
        report.append(f'Line {line}: {typ} loop with potentially infinite condition ({cond}).\n')
else:
    report.append('No obvious infinite loops found.\n')

# Recursion check
recursion = []
for m in re.finditer(r'\bfunction\s+([a-zA-Z_$][\w$]*)\s*\([^)]*\)\s*\{', content):
    name = m.group(1)
    start_idx = m.end()
    brace = 1
    i = start_idx
    while i < len(content) and brace > 0:
        if content[i] == '{':
            brace += 1
        elif content[i] == '}':
            brace -= 1
        i += 1
    body = content[start_idx:i-1]
    if re.search(r'\b' + re.escape(name) + r'\s*\(', body):
        recursion.append((name, get_line(m.start())))

if recursion:
    for name, line in recursion:
        report.append(f'Line {line}: function {name}() appears to call itself (recursion).\n')
else:
    report.append('No direct recursion found.\n')
report.append('\n')

# --- 6. Array index out of bounds risks ---
report.append('--- 6. Array Index Out of Bounds Risks ---\n')
arr_accesses = []
for m in re.finditer(r'\b([a-zA-Z_$][\w$]*)\[([a-zA-Z_$][\w$]*)\]', content):
    arr = m.group(1)
    idx = m.group(2)
    arr_accesses.append((arr, idx, get_line(m.start())))

if arr_accesses:
    report.append(f'Found {len(arr_accesses)} array accesses with variable index (review for bounds):\n')
    for arr, idx, line in arr_accesses[:50]:
        report.append(f'  Line {line}: {arr}[{idx}]\n')
    if len(arr_accesses) > 50:
        report.append(f'  ... and {len(arr_accesses) - 50} more.\n')
else:
    report.append('None found.\n')
report.append('\n')

# Write report
report_text = ''.join(report)
with open('bug_scan_report.txt', 'w', encoding='utf-8') as f:
    f.write(report_text)

print(report_text)
