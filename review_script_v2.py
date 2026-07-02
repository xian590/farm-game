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
    # Find all forEach and check for return statements inside the callback body.
    # Only flag if return has a value or if it's a bare return that looks like a break attempt.
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
            # Find returns in body that are not inside nested functions (simple heuristic: skip if 'function' appears before return in body)
            for ret_m in re.finditer(r'\breturn\b', body):
                ret_pos = ret_m.start()
                # Check if inside a nested function by looking for 'function' or '=>' before this return
                # without a matching '}' in between. This is approximate.
                segment = body[:ret_pos]
                # If there is 'function' in segment, we skip (conservative)
                if re.search(r'\bfunction\s*\(', segment):
                    continue
                # If there is '=>' followed by '{' in segment, skip
                if re.search(r'\)\s*=>\s*\{', segment):
                    continue
                ret_line = body[ret_pos:]
                ret_stmt = ret_line[:ret_line.find(';')+1 if ';' in ret_line else 25]
                # Only flag if return has a value (looks like break attempt) or if the next line is an update that is skipped
                if re.search(r'\breturn\b\s*[^;\s]', ret_stmt) or re.search(r'\breturn\b\s*;', ret_stmt):
                    ln = line_no(body_start + ret_pos)
                    # Check if it's just a normal skip
                    # Flag as P2 because it might be intended, but return in forEach is confusing
                    add("forEach return", "P2", ln, f"forEach 回调内存在 return: {ret_stmt.strip()}。return 仅跳过当前迭代，不会终止外层函数。若意图为 break 或提前退出外层函数，则此为 bug。")

    # 2. NaN/Infinity / Division by zero
    # Only flag when denominator is a variable or property that could be zero
    for m in re.finditer(r'([\w.\[\]]+)\s*/\s*([\w.\[\]]+)', content):
        expr = m.group(0)
        denom = m.group(2)
        ln = line_no(m.start())
        line = lines[ln-1]
        if not in_script(ln): continue
        # Skip obvious safe patterns
        if line.strip().startswith('//') or 'url(' in line or '/*' in line:
            continue
        # Skip if denominator is a literal number > 0
        if re.match(r'^[1-9]\d*$', denom.strip()):
            continue
        # Skip if denominator is a known constant like 100, 60, etc.
        if denom.strip() in ('100', '60', '24', '365', '12', '3600', '1000', '10', '2', '3', '4', '5', '6', '7', '8', '9'):
            continue
        # Check if there is a guard in the line or nearby
        before = content[max(0, m.start()-100):m.start()]
        if 'isFinite' in before or '|| 0' in before or 'if' in before or '?' in before:
            continue
        # If denominator is a variable or property, flag
        if re.search(r'[a-zA-Z_]', denom):
            add("NaN/Infinity", "P2", ln, f"除法运算可能除零: {expr}。建议对分母添加零值检查或 || 1 防护。")

    # parseInt/parseFloat without NaN guard
    for m in re.finditer(r'\bparseInt\s*\(|\bparseFloat\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        line = lines[ln-1]
        if 'isNaN' in line or '|| 0' in line or '|| ' in line:
            continue
        add("NaN/Infinity", "P2", ln, f"parseInt/parseFloat 结果未做 NaN 防护: {line.strip()}")

    # 3. Timer leaks
    # Find setInterval / setTimeout that are not assigned to a variable
    for m in re.finditer(r'\bsetInterval\s*\(|\bsetTimeout\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        line = lines[ln-1]
        # Check if the line is an assignment
        if re.search(r'[\w\]]+\s*=\s*\bsetInterval|\bsetTimeout', line) or \
           re.search(r'\b(?:let|const|var)\s+\w+\s*=\s*\bsetInterval|\bsetTimeout', line):
            continue
        # Check if previous lines contain assignment
        found = False
        for offset in range(1, 4):
            if ln - offset > 0:
                pline = lines[ln - offset - 1]
                if re.search(r'[\w\]]+\s*=\s*\bsetInterval|\bsetTimeout', pline) or \
                   re.search(r'\b(?:let|const|var)\s+\w+\s*=\s*\bsetInterval|\bsetTimeout', pline):
                    found = True
                    break
        if not found:
            # Only flag if it's a setInterval (recurring) or setTimeout with a delay that might leak
            # skip immediate setTimeout(()=>{}, 0) used for scheduling
            if 'setTimeout' in line and '0)' in line:
                continue
            add("Timer leaks", "P1", ln, f"定时器未保存引用，无法清理: {line.strip()}")

    # 4. Event listener leaks
    # Find addEventListener using anonymous functions
    for m in re.finditer(r'([\w.\[\]]+)\s*\.addEventListener\s*\(\s*["\']([^"\']+)["\']\s*,\s*(function\s*\(|\(([^)]*)\)\s*=>)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        el = m.group(1)
        ev = m.group(2)
        # Check if a corresponding removeEventListener exists for the same element and event
        # Since it's anonymous, it can't be removed. Always flag.
        add("Event listener leaks", "P2", ln, f"addEventListener 使用匿名函数绑定 {el}.{ev}，无法通过 removeEventListener 移除。若多次调用会导致重复监听。")

    # Also check named function references that are never removed
    for m in re.finditer(r'([\w.\[\]]+)\s*\.addEventListener\s*\(\s*["\']([^"\']+)["\']\s*,\s*([\w]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        el = m.group(1)
        ev = m.group(2)
        fn = m.group(3)
        # Search for removeEventListener with same el, ev, fn
        pattern = re.escape(el) + r'\s*\.removeEventListener\s*\(\s*["\']' + re.escape(ev) + r'["\']\s*,\s*' + re.escape(fn)
        if not re.search(pattern, content):
            add("Event listener leaks", "P2", ln, f"addEventListener ({el}.{ev}, {fn}) 缺少对应的 removeEventListener。")

    # 5. innerHTML XSS - Only flag direct assignments with non-escaped interpolations from potentially tainted sources
    # For strict review, we flag any innerHTML assignment where the RHS contains a template literal with a variable not wrapped in escapeHtml.
    # But we will skip builder patterns where the variable is 'html' because those are usually rendered from internal data.
    # Actually, let's focus on innerHTML assignments where the RHS is a template literal with a non-escaped variable that is not a hardcoded data key.
    for m in re.finditer(r'([\w.\[\]]+)\s*\.innerHTML\s*=\s*(.+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        rhs = m.group(2).strip()
        # Skip if RHS starts with a simple string literal without interpolation
        if rhs.startswith('"') or rhs.startswith("'") or rhs.startswith('`') and '${' not in rhs:
            continue
        # Skip if RHS contains escapeHtml
        if 'escapeHtml' in rhs:
            continue
        # Skip if RHS is just a variable named 'html' (builder pattern)
        if rhs == 'html' or rhs == 'html;':
            continue
        # If RHS contains template literal with interpolation, check if all interpolations are escaped
        # Extract all ${...} in RHS
        interpolations = re.findall(r'\$\{([^}]+)\}', rhs)
        unescaped = [i for i in interpolations if 'escapeHtml' not in i]
        if unescaped:
            add("XSS (innerHTML)", "P1", ln, f"innerHTML 赋值包含未转义的插值变量: {unescaped}。若变量来自用户输入或不可信数据，可能导致 XSS。")

    # 6. State inconsistency
    # Look for functions that modify game.money and other fields without safeguards.
    # Find function bodies that contain game.money -= or game.money += and also game.somethingElse += / -=
    # We use a line-window heuristic.
    money_change_lines = []
    other_change_lines = []
    for i, line in enumerate(lines, 1):
        if not in_script(i): continue
        if re.search(r'game\.money\s*[-+]?=', line):
            money_change_lines.append(i)
        elif re.search(r'game\.[a-zA-Z_]+\s*[-+]?=', line):
            other_change_lines.append(i)
    for ml in money_change_lines:
        for ol in other_change_lines:
            if abs(ml - ol) < 20 and ml != ol:
                # Check if there is a try-catch in the same window
                window = "\n".join(lines[max(0, ml-10):min(total_lines, ml+10)])
                if 'try' not in window or 'catch' not in window:
                    add("State inconsistency", "P2", ml, f"game.money 修改（行 {ml}）与 game 其他字段修改（行 {ol}）在相近位置，无 try-catch 原子保护。中间若报错会导致存档状态不一致。")
                    break

    # 7. Circular references / JSON.stringify
    for m in re.finditer(r'\bJSON\.stringify\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        before = content[max(0, m.start()-80):m.start()]
        if 'try' not in before:
            add("Circular reference", "P2", ln, f"JSON.stringify 可能因循环引用抛出异常，缺少 try-catch 保护。")

    # 8. Array out of bounds
    for m in re.finditer(r'([\w.]+)\[(\w+)\]', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        arr = m.group(1)
        idx = m.group(2)
        if idx in ('0','1','2','3','4','5','6','7','8','9','length','i','j','k','index'):
            if idx in ('i','j','k','index'):
                window = "\n".join(lines[max(0,ln-5):min(total_lines,ln+5)])
                if f'{arr}.length' in window or 'for' in window and 'length' in window:
                    continue
            else:
                continue
        add("Array out of bounds", "P2", ln, f"数组索引访问可能越界: {m.group(0)}。建议添加长度检查。")

    # 9. String concatenation / XSS
    # Only flag insertAdjacentHTML or innerHTML with user-input-like variables
    for m in re.finditer(r'\binsertAdjacentHTML\s*\(', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        add("String concatenation/XSS", "P1", ln, f"insertAdjacentHTML 使用未转义内容: {lines[ln-1].strip()}")

    # 10. Game balance
    for m in re.finditer(r'Math\.random\s*\(\s*\)\s*([<>]=?)\s*([0-9.]+)', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        val = float(m.group(2))
        if val < 0.01:
            add("Game balance", "P2", ln, f"概率极低 ({val})，可能导致玩家长期无法触发该事件。")
        if val > 0.95:
            add("Game balance", "P2", ln, f"概率极高 ({val})，几乎必然触发，随机性失去意义。")

    for m in re.finditer(r'(?<![\w.])(\d{5,})(?![\w.])', content):
        ln = line_no(m.start())
        if not in_script(ln): continue
        val = int(m.group(1))
        line = lines[ln-1]
        if 'px' in line or 'z-index' in line or 'width' in line or 'height' in line:
            continue
        if val > 100000:
            add("Game balance", "P2", ln, f"极大的数值 {val} 出现在游戏逻辑中，可能破坏经济平衡或导致数值溢出。")

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

    report_path = os.path.join(ctx["runDir"], "review_report_v2.md")
    with open(report_path, "w", encoding="utf-8") as f:
        f.write("# farm_game.html 代码审查报告 v2\n\n")
        f.write(f"共发现 {len(unique)} 个问题\n\n")
        for fnd in unique:
            f.write(f"## [{fnd['sev']}] {fnd['cat']} - 行 {fnd['ln']}\n")
            f.write(f"{fnd['desc']}\n\n")
            f.write("```javascript\n")
            f.write(fnd['ctx'])
            f.write("\n```\n\n")

    return report_path

if __name__ == "__main__":
    ctx = {"runDir": r"C:\Users\Administrator\Documents\kimi\workspace"}
    result = main(ctx)
    print(result)
