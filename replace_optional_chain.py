#!/usr/bin/env python3
"""
批量替换JavaScript可选链操作符（?.）为兼容写法
支持模式：
1. obj?.prop → (obj && obj.prop)
2. obj?.prop || default → (obj && obj.prop) || default
3. obj?.[expr] → (obj && obj[expr])
4. 嵌套可选链：a?.b?.c → (a && a.b && a.b.c)
"""

import re

def replace_optional_chaining(js_code):
    """替换所有?.为兼容写法"""
    
    # 模式匹配：identifier?.identifier 或 identifier?.[expr]
    # 需要多次迭代处理嵌套
    max_iterations = 20
    
    for _ in range(max_iterations):
        new_code = _replace_one_level(js_code)
        if new_code == js_code:
            break
        js_code = new_code
    
    return js_code

def _replace_one_level(code):
    """替换一层可选链"""
    
    # 模式1: obj?.identifier (如 game.skills?.cropFamiliarity?.level)
    # 我们用最简单的方式：找到所有 ?. 然后逐个处理
    
    result = []
    i = 0
    while i < len(code):
        # 查找 ?. 或 ?[
        if i + 1 < len(code) and code[i] == '?':
            if code[i+1] == '.':
                # 可选链属性访问: obj?.prop
                replacement, new_i = _handle_optional_dot(code, i)
                result.append(replacement)
                i = new_i
                continue
            elif code[i+1] == '[':
                # 可选链索引访问: obj?[expr]
                replacement, new_i = _handle_optional_bracket(code, i)
                result.append(replacement)
                i = new_i
                continue
        
        result.append(code[i])
        i += 1
    
    return ''.join(result)

def _handle_optional_dot(code, dot_pos):
    """处理 obj?.prop"""
    # 找到 ?. 前面的对象表达式
    obj_expr = _find_object_expression(code, dot_pos)
    
    # 找到 ?. 后面的属性名
    prop_start = dot_pos + 2
    prop_name = ''
    j = prop_start
    while j < len(code) and (code[j].isalnum() or code[j] == '_'):
        prop_name += code[j]
        j += 1
    
    # 替换为: (obj && obj.prop)
    replacement = f'({obj_expr} && {obj_expr}.{prop_name})'
    return replacement, j

def _handle_optional_bracket(code, bracket_pos):
    """处理 obj?[expr]"""
    obj_expr = _find_object_expression(code, bracket_pos)
    
    # 找到匹配的 ]
    bracket_start = bracket_pos + 1
    bracket_depth = 0
    bracket_end = bracket_start + 1
    for k in range(bracket_start, len(code)):
        if code[k] == '[':
            bracket_depth += 1
        elif code[k] == ']':
            if bracket_depth == 0:
                bracket_end = k + 1
                break
            bracket_depth -= 1
    
    expr = code[bracket_start:bracket_end-1]
    replacement = f'({obj_expr} && {obj_expr}[{expr}])'
    return replacement, bracket_end

def _find_object_expression(code, dot_pos):
    """找到 ?. 前面的对象表达式"""
    # 从 dot_pos 往前回溯，找到完整的对象表达式
    # 需要考虑括号匹配
    
    i = dot_pos - 1
    depth = 0
    
    # 跳过空白
    while i >= 0 and code[i].isspace():
        i -= 1
    
    # 对象表达式可能是:
    # - identifier
    # - identifier.identifier
    # - identifier[index]
    # - (expression)
    # - functionCall()
    
    end = i + 1
    
    while i >= 0:
        c = code[i]
        
        if c == ')':
            depth += 1
            i -= 1
        elif c == '(':
            if depth == 0:
                break
            depth -= 1
            i -= 1
        elif c == ']':
            depth += 1
            i -= 1
        elif c == '[':
            if depth == 0:
                break
            depth -= 1
            i -= 1
        elif c == '.':
            if depth == 0:
                # 检查前面是否是 ?. 的一部分
                if i > 0 and code[i-1] == '?':
                    # 这是另一个可选链，跳过
                    pass
                else:
                    # 普通属性访问，继续往前
                    pass
            i -= 1
        elif c.isalnum() or c == '_':
            # 标识符的一部分
            i -= 1
        elif c.isspace():
            if depth == 0:
                break
            i -= 1
        else:
            if depth == 0:
                break
            i -= 1
    
    return code[i+1:end].strip()


if __name__ == '__main__':
    import sys
    
    with open('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'r', encoding='utf-8') as f:
        content = f.read()
    
    # 提取JS部分
    script_start = content.indexOf('<script>') + 8
    script_end = content.indexOf('</script>')
    html_part = content[:script_start]
    js_part = content[script_start:script_end]
    html_end = content[script_end:]
    
    # 替换
    new_js = replace_optional_chaining(js_part)
    
    # 写回
    with open('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'w', encoding='utf-8') as f:
        f.write(html_part + new_js + html_end)
    
    print('Done!')
