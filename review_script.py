import re, os, json

def main(ctx):
    path = r"C:\Users\Administrator\Documents\kimi\workspace\farm_game.html"
    with open(path, "r", encoding="utf-8") as f:
        content = f.read()
    lines = content.splitlines()
    total_lines = len(lines)

    # Find script blocks
    script_ranges = []
    idx = 0
    while True:
        start = content.find("<script", idx)
        if start == -1: break
        end_tag = content.find(">", start)
        end = content.find("</script>", end_tag)
        if end == -1: break
        script_ranges.append((end_tag + 1, end))
        idx = end + 1

    def in_script(ln):
        pos = sum(len(lines[k]) + 1 for k in range(ln-1))
        for s, e in script_ranges:
            if s <= pos < e:
                return True
        return False

    def line_no(pos):
        pos_acc = 0
        for i, line in enumerate(lines, 1):
            if pos_acc + len(line) + 1 > pos:
                return i
            pos_acc += len(line) + 1
        return total_lines

    def context(ln, radius=2):
        start = max(1, ln - radius)
        end = min(total_lines, ln + radius)
        return "\n".join([f"{j:>5}: {lines[j-1]}" for j in range(start, end+1)])

    findings = []
    def add(cat, sev, ln, desc):
        findings.append({"cat": cat, "sev": sev, "ln": ln, "desc": desc, "ctx": context(ln, 2)})

    # 1. forEach return issues
    # Find all .forEach( and check if there is a return inside the callback that returns a value.
    for m in re.finditer(r'\.forEach\s*\(', content):
        start = m.end()
        paren_depth = 1
        j = start
        while j < len(content) and paren_depth > 0:
            if content[j] == '(': paren_depth += 1
            elif content[j] == ')': paren_depth -= 1
            elif content[j] in '"\'`':
                quote = content[j]
                j += 1
                while j < len(content) and content[j] != quote:
                    if content[j] == '\\': j += 1
                    j += 1
            j += 1
        while j < len(content) and content[j] in ' \t\n': j += 1
        if j < len(content) and content[j] == '{':
            brace_depth = 1
            k = j + 1
            body_start = j + 1
            while k < len(content) and brace_depth > 0:
                if content[k] == '{': brace_depth += 1
                elif content[k] == '}': brace_depth -= 1
                elif content[k] in '"\'`':
                    quote = content[k]
                    k += 1
                    while k < len(content) and content[k] != quote:
                        if content[k] == '\\': k += 1
                        k += 1
                k += 1
            body_end = k - 1
            body = content[body_start:body_end]
            # Find returns in body that are not inside nested functions (rough check)
            for ret_m in re.finditer(r'\breturn\b', body):
                ret_pos = body[ret_m.start():]
                ret_stmt = ret_pos[:ret_pos.find(';')+1 if ';' in ret_pos else 20]
                if re.search(r'\breturn\b\s*[^;]', ret_stmt):
                    ln = line_no(body_start + ret_m.start())
                    add("forEach return", "P2", ln, f"forEach 回调内使用 return 值: {ret_stmt.strip()}。在 forEach 中 return 仅跳过当前迭代，不会终止外部函数。")

    # 2. NaN/Infinity / Division by zero
    for m in re.finditer(r'([\w.\[\]]+)\s*/\s*([\w.\[\]]+)', content):
        expr = m.group(0)
        denom = m.group(2)
        ln = line_no(m.start())
        line = lines[ln-1]
        if '/*' in line or '*/' in line or line.strip().startswith('//') or 'url(' in line:
            continue
        if not in_script(ln):
            continue
        before = content[max(0, m.start()-200):m.start()]
        if 'isFinite' in before or '|| 0' in before or 'if' in before:
            continue
        if re.match(r'^[a-zA-Z_]', denom):
            add("NaN/Infinity", "P2", ln, f"除法缺少零值防护: {expr}")

    # parseInt/parseFloat without NaN guard
    for m in re.finditer(r'\bparseInt\s*\(|\bparseFloat\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        line = lines[ln-1]
        if 'isNaN' in line or '|| 0' in line or '|| ' in line:
            continue
        add("NaN/Infinity", "P2", ln, f"parseInt/parseFloat 结果未做 NaN 防护: {line.strip()}")

    # 3. Timer leaks
    for m in re.finditer(r'\bsetInterval\s*\(|\bsetTimeout\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        line = lines[ln-1]
        if re.search(r'[\w\]]+\s*=\s*\bsetInterval|\bsetTimeout', line) or \
           re.search(r'\b(?:let|const|var)\s+\w+\s*=\s*\bsetInterval|\bsetTimeout', line):
            continue
        found = False
        for offset in range(1, 4):
            if ln - offset > 0:
                pline = lines[ln - offset - 1]
                if re.search(r'[\w\]]+\s*=\s*\bsetInterval|\bsetTimeout', pline) or \
                   re.search(r'\b(?:let|const|var)\s+\w+\s*=\s*\bsetInterval|\bsetTimeout', pline):
                    found = True
                    break
        if not found:
            add("Timer leaks", "P1", ln, f"定时器未保存引用，可能导致泄漏: {line.strip()}")

    # 4. Event listener leaks
    add_events = []
    remove_events = []
    for m in re.finditer(r'([\w.\[\]]+)\s*\.addEventListener\s*\(\s*["\']([^"\']+)["\']\s*,\s*([^,)]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        add_events.append((ln, m.group(1), m.group(2), m.group(3).strip()))
    for m in re.finditer(r'([\w.\[\]]+)\s*\.removeEventListener\s*\(\s*["\']([^"\']+)["\']\s*,\s*([^,)]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        remove_events.append((ln, m.group(1), m.group(2), m.group(3).strip()))

    for a_ln, a_el, a_ev, a_fn in add_events:
        matched = False
        for r_ln, r_el, r_ev, r_fn in remove_events:
            if a_el == r_el and a_ev == r_ev and a_fn == r_fn:
                matched = True
                break
        if not matched:
            add("Event listener leaks", "P2", a_ln, f"addEventListener ({a_el}, {a_ev}) 缺少对应的 removeEventListener。")

    # 5. innerHTML XSS
    for m in re.finditer(r'([\w.\[\]]+)\s*\.innerHTML\s*=', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        line = lines[ln-1]
        rhs = line.split('=', 1)[1] if '=' in line else ''
        if rhs.strip().startswith('"') or rhs.strip().startswith("'") or (rhs.strip().startswith('`') and '${' not in rhs):
            continue
        if 'escapeHtml' in line or 'textContent' in line:
            continue
        add("XSS (innerHTML)", "P1", ln, f"innerHTML 赋值可能包含未转义的用户输入: {line.strip()}")

    # 6. State inconsistency
    money_lines = []
    other_game_lines = []
    for i, line in enumerate(lines, 1):
        if not in_script(i): continue
        if 'game.money' in line and '=' in line:
            money_lines.append(i)
        elif 'game.' in line and '=' in line and 'game.money' not in line:
            other_game_lines.append(i)

    for ml in money_lines:
        for ol in other_game_lines:
            if abs(ml - ol) < 15 and ml != ol:
                add("State inconsistency", "P2", ml, f"game.money 修改行 {ml} 与 game 其他字段修改行 {ol} 距离很近，缺少原子性保护。若中间报错可能导致状态不一致。")
                break

    # 7. Circular references
    for m in re.finditer(r'\bJSON\.stringify\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        before = content[max(0, m.start()-100):m.start()]
        if 'try' not in before:
            add("Circular reference", "P2", ln, f"JSON.stringify 可能因循环引用抛出异常，缺少 try-catch: {lines[ln-1].strip()}")

    for m in re.finditer(r'(\w+)\.(\w+)\s*=\s*\1\b', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        add("Circular reference", "P2", ln, f"可能的循环引用: {m.group(0)}")

    # 8. Array out of bounds
    for m in re.finditer(r'([\w.]+)\[(\w+)\]', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        arr = m.group(1)
        idx = m.group(2)
        if idx in ('0','1','2','3','4','5','6','7','8','9','length'):
            continue
        if idx in ('i','j','k','index'):
            window = "\n".join(lines[max(0,ln-5):min(total_lines,ln+5)])
            if f'{arr}.length' in window or ('for' in window and 'length' in window):
                continue
        add("Array out of bounds", "P2", ln, f"数组索引访问未做边界检查: {m.group(0)}")

    # 9. String concatenation / XSS
    for m in re.finditer(r'\binsertAdjacentHTML\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        add("String concatenation/XSS", "P1", ln, f"insertAdjacentHTML 使用未转义内容: {lines[ln-1].strip()}")

    for m in re.finditer(r'([\w.]+)\s*\+=\s*([^;]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        lhs = m.group(1)
        if 'html' not in lhs and 'HTML' not in lhs:
            continue
        rhs = m.group(2)
        if 'escapeHtml' not in rhs and not (rhs.strip().startswith('"') or rhs.strip().startswith("'")):
            add("String concatenation/XSS", "P1", ln, f"HTML 字符串拼接可能包含未转义内容: {lines[ln-1].strip()}")

    # 10. Game balance
    for m in re.finditer(r'Math\.random\s*\(\s*\)\s*([<>]=?)\s*([0-9.]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        val = float(m.group(2))
        if val < 0.01:
            add("Game balance", "P2", ln, f"概率极低 ({val})，可能导致玩家无法触发，影响体验。")
        if val > 0.95:
            add("Game balance", "P2", ln, f"概率极高 ({val})，几乎必然触发，可能失去随机意义。")

    for m in re.finditer(r'(?<![\w.])(\d{5,})(?![\w.])', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        val = int(m.group(1))
        line = lines[ln-1]
        if 'px' in line or 'z-index' in line or 'width' in line or 'height' in line:
            continue
        if val > 100000:
            add("Game balance", "P2", ln, f"极大的数值 {val} 出现在游戏逻辑中，可能破坏经济平衡。")

    # Deduplicate
    seen = set()
    unique = []
    for f in findings:
        key = (f['cat'], f['ln'], f['desc'])
        if key not in seen:
            seen.add(key)
            unique.append(f)

    severity_order = {'P0': 0, 'P1': 1, 'P2': 2}
    unique.sort(key=lambda x: (severity_order.get(x['sev'], 3), x['ln']))

    report_path = os.path.join(ctx["runDir"], "review_report.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# farm_game.html Code Review Report\n\n")
        f.write(f"Total findings: {len(unique)}\n\n")
        for fnd in unique:
            f.write(f"## [{fnd['sev']}] {fnd['cat']} - Line {fnd['ln']}\n")
            f.write(f"{fnd['desc']}\n\n")
            f.write("```javascript\n")
            f.write(fnd['ctx'])
            f.write("\n```\n\n")

    return report_path

if __name__ == "__main__":
    import tempfile
    ctx = {"runDir": r"C:\Users\Administrator\Documents\kimi\workspace"}
    result = main(ctx)
    print(result)
