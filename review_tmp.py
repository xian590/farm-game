import re

def main(ctx):
    with open(r'C:\Users\Administrator\Documents\kimi\workspace\farm_game.html', 'r', encoding='utf-8') as f:
        lines = f.readlines()
    
    script_start = 3062
    script_end = 23646
    script_lines = lines[script_start:script_end+1]
    
    issues = []
    
    def find_try_catch_ranges():
        ranges = []
        stack = []
        for i, line in enumerate(script_lines):
            real_line = script_start + i + 1
            if re.search(r'\btry\s*\{', line):
                stack.append(real_line)
            if re.search(r'\bcatch\s*\(', line) and stack:
                start = stack.pop()
                ranges.append((start, real_line))
        return ranges
    
    try_catch_ranges = find_try_catch_ranges()
    
    def in_try_catch(line_no):
        for start, end in try_catch_ranges:
            if start <= line_no <= end:
                return True
        return False
    
    # 1. Check game === null or undefined before accessing game.xxx
    # Find all functions that access game.xxx without checking if game exists
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        # Skip if game is already checked in the same function (naive: check previous 20 lines for "if (!game)" or similar)
        found_guard = False
        for j in range(max(0, i-20), i):
            prev = script_lines[j]
            if 'if (!game)' in prev or 'if(!game)' in prev or 'if (game)' in prev or 'game &&' in prev or 'game ||' in prev or 'if (!game' in prev:
                found_guard = True
                break
        if found_guard:
            continue
        # Check for game.xxx access where game itself might be null
        if re.search(r'\bgame\.\w', line) and not re.search(r'\b(game\s*=|var game|let game|const game|function.*game|return game)', line):
            # Skip lines that are clearly safe (e.g., in initGame, migrateSave, etc.)
            pass  # We'll analyze all for now
    
    # 2. Check Object.entries/keys on game.xxx that could be null
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'Object.entries(' in line or 'Object.keys(' in line:
            match = re.search(r'Object\.(?:entries|keys)\(\s*game\.(\w+)', line)
            if match:
                prop = match.group(1)
                if not re.search(r'game\.' + prop + r'\s*\|\|\s*\{\}', line) and not re.search(r'game\.' + prop + r'\s*\?\?', line):
                    issues.append({
                        'line': real_line,
                        'type': 'Object.entries/keys on game.xxx without null guard',
                        'prop': prop,
                        'code': line.strip()[:120]
                    })
    
    # 3. Check JSON.stringify without try-catch
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'JSON.stringify' in line and not in_try_catch(real_line):
            issues.append({
                'line': real_line,
                'type': 'JSON.stringify without try-catch',
                'code': line.strip()[:120]
            })
    
    # 4. Check localStorage without try-catch
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'localStorage.' in line and not in_try_catch(real_line):
            if 'safeStorage' not in line:
                if 'localStorage.getItem' in line or 'localStorage.setItem' in line or 'localStorage.removeItem' in line:
                    issues.append({
                        'line': real_line,
                        'type': 'localStorage without try-catch',
                        'code': line.strip()[:120]
                    })
    
    # 5. Check audio operations without try-catch
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'audioCtx.create' in line or 'createOscillator()' in line or 'createBuffer(' in line or 'createGain()' in line:
            if not in_try_catch(real_line):
                issues.append({
                    'line': real_line,
                    'type': 'audio operation without try-catch',
                    'code': line.strip()[:120]
                })
    
    # 6. Check URL.createObjectURL without revoke
    create_lines = []
    revoke_lines = []
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'URL.createObjectURL' in line:
            create_lines.append(real_line)
        if 'URL.revokeObjectURL' in line:
            revoke_lines.append(real_line)
    
    # 7. Check setTimeout without clearTimeout
    timeout_vars = set()
    clear_vars = set()
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        m = re.search(r'(\w+)\s*=\s*setTimeout', line)
        if m:
            timeout_vars.add(m.group(1))
        m = re.search(r'clearTimeout\((\w+)', line)
        if m:
            clear_vars.add(m.group(1))
    
    # 8. Check addEventListener without removeEventListener
    add_listeners = []
    remove_listeners = []
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'addEventListener' in line and '(' in line:
            add_listeners.append((real_line, line.strip()))
        if 'removeEventListener' in line and '(' in line:
            remove_listeners.append((real_line, line.strip()))
    
    # 9. Check innerHTML assignments
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if '.innerHTML = ' in line or '.innerHTML=' in line:
            issues.append({
                'line': real_line,
                'type': 'innerHTML assignment',
                'code': line.strip()[:120]
            })
    
    # 10. Check Math.random usage
    for i, line in enumerate(script_lines):
        real_line = script_start + i + 1
        if 'Math.random()' in line:
            issues.append({
                'line': real_line,
                'type': 'Math.random() usage (non-cryptographic)',
                'code': line.strip()[:120]
            })
    
    return {
        'total_issues': len(issues),
        'timeout_vars': list(timeout_vars),
        'cleared_vars': list(clear_vars),
        'uncleared_timeouts': list(timeout_vars - clear_vars),
        'add_listeners_count': len(add_listeners),
        'remove_listeners_count': len(remove_listeners),
        'create_object_url_lines': create_lines,
        'revoke_object_url_lines': revoke_lines,
        'issues': issues
    }

