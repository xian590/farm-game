import json, re

with open('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'r', encoding='utf-8') as f:
    content = f.read()

script_match = re.search(r'<script>(.*?)</script>', content, re.DOTALL)
code = script_match.group(1)

issues = []
checks = []

def extract_object(name):
    pattern = r'const\s+' + re.escape(name) + r'\s*=\s*\{[\s\S]*?\};\s*(?=\nconst|\nfunction|\n//|\n\n)'
    match = re.search(pattern, code)
    if match: return match.group(0)
    pattern2 = r'const\s+' + re.escape(name) + r'\s*=\s*\[[\s\S]*?\];'
    match2 = re.search(pattern2, code)
    if match2: return match2.group(0)
    return None

def js_to_dict(js_code):
    try:
        py_code = re.sub(r'const\s+\w+\s*=\s*', '', js_code)
        py_code = re.sub(r'\btrue\b', 'True', py_code)
        py_code = re.sub(r'\bfalse\b', 'False', py_code)
        py_code = re.sub(r'\bnull\b', 'None', py_code)
        py_code = re.sub(r'\bundefined\b', 'None', py_code)
        py_code = py_code.rstrip().rstrip(';')
        return eval(py_code)
    except:
        return None

def js_to_list(js_code):
    try:
        py_code = re.sub(r'const\s+\w+\s*=\s*', '', js_code)
        py_code = re.sub(r'\btrue\b', 'True', py_code)
        py_code = re.sub(r'\bfalse\b', 'False', py_code)
        py_code = re.sub(r'\bnull\b', 'None', py_code)
        py_code = py_code.rstrip().rstrip(';')
        return eval(py_code)
    except:
        return None

checks.append('=== CROP_DATA ===')
crop_data = extract_object('CROP_DATA')
crops = js_to_dict(crop_data) if crop_data else {}
for k, c in crops.items():
    price = 3.0 if c['type'] == 'rice' else 1.5
    net = c['baseYield'] * price - c['seedPrice']
    daily = net / c['growDays']
    checks.append(f"{c['name']}: seed={c['seedPrice']}, yield={c['baseYield']}, price={price}, net={net}, daily={daily:.1f}")
    if len(c['steps']) != len(c['stepCosts']):
        issues.append(f"ERROR: {c['name']} steps({len(c['steps'])}) != stepCosts({len(c['stepCosts'])})")
    step_total = sum(c['stepCosts'])
    checks.append(f"  steps={len(c['steps'])}, stepTotal={step_total}, avg={step_total/len(c['stepCosts']):.1f}")
    if c['season'] not in ['spring','summer','autumn','winter']:
        issues.append(f"ERROR: {c['name']} invalid season: {c['season']}")

checks.append('')
checks.append('=== HOUSE_DATA ===')
house_data = extract_object('HOUSE_DATA')
houses = js_to_dict(house_data) if house_data else {}
for k, h in houses.items():
    daily_regen = (h['staminaRegen'] / 4) * 24
    checks.append(f"{h['name']}: staminaRegen={h['staminaRegen']}/hr => daily={daily_regen}, healthRegen={h['healthRegen']}/night, rent={h['rent']}, upgrade={h['upgradeCost']}")
    if daily_regen >= 120:
        issues.append(f"WARNING: {h['name']} daily regen {daily_regen} >= max stamina 120")

checks.append('')
checks.append('=== TOOL_DATA ===')
tool_data = extract_object('TOOL_DATA')
tools = js_to_dict(tool_data) if tool_data else {}
for k, t in tools.items():
    checks.append(f"{t['name']}: {t['price']}元, effect='{t['effect']}', type={t['type']}")
    if '自动' in t['effect']:
        issues.append(f"WARNING: Tool {t['name']} has 'auto' effect: {t['effect']}")

checks.append('')
checks.append('=== WEATHER_DATA ===')
weather_data = extract_object('WEATHER_DATA')
weather = js_to_dict(weather_data) if weather_data else {}
for k, w in weather.items():
    checks.append(f"{w['name']}: {w['emoji']}, stamina={w.get('stamina','?')}, growth={w.get('growth','?')}, duration={w.get('duration','?')}")

checks.append('')
checks.append('=== SEASON_WEATHER ===')
sw_data = extract_object('SEASON_WEATHER')
sw = js_to_dict(sw_data) if sw_data else {}
for s, w in sw.items():
    checks.append(f"Season {s}: {', '.join(w)}")

checks.append('')
checks.append('=== EVENTS ===')
events_data = extract_object('EVENTS')
events = js_to_dict(events_data) if events_data else {}
if events:
    checks.append(f"Events count: {len(events)}")
    probs = [e.get('probability', 0) for e in events.values()]
    total_prob = sum(probs)
    checks.append(f"Total event probability: {total_prob:.3f}")
    if total_prob > 1.0:
        issues.append(f"WARNING: Total event probability {total_prob} > 1.0")
    disasters = sum(1 for e in events.values() if e.get('type') == 'disaster')
    gains = sum(1 for e in events.values() if e.get('type') == 'gain')
    checks.append(f"Disasters: {disasters}, Gains: {gains}")
    if disasters > gains * 1.5:
        issues.append(f"WARNING: Too many disasters ({disasters}) vs gains ({gains})")

checks.append('')
checks.append('=== STORY_EVENTS ===')
story_data = extract_object('STORY_EVENTS')
story = js_to_list(story_data) if story_data else []
if story:
    checks.append(f"Story events count: {len(story)}")
    probs = [e.get('probability', 0) for e in story]
    total_prob = sum(probs)
    checks.append(f"Total story probability: {total_prob:.3f}")
    if total_prob > 1.0:
        issues.append(f"WARNING: Total story probability {total_prob} > 1.0")

checks.append('')
checks.append('=== NPC_DATA ===')
npc_data = extract_object('NPC_DATA')
npcs = js_to_dict(npc_data) if npc_data else {}
for k, n in npcs.items():
    checks.append(f"{n['name']}: {n['emoji']}, gift={n.get('gift','?')}, giftFreq={n.get('giftFrequency','?')}, initialFavor={n.get('initialFavor','?')}")

checks.append('')
checks.append('=== TECH_DATA ===')
tech_data = extract_object('TECH_DATA')
techs = js_to_dict(tech_data) if tech_data else {}
if techs:
    total_cost = 0
    total_count = 0
    for cat, list in techs.items():
        total_count += len(list)
        for t in list:
            total_cost += t.get('cost', 0)
            checks.append(f"  {t['name']}: cost={t.get('cost','?')}")
    checks.append(f"Total techs: {total_count}, total cost: {total_cost}, avg: {total_cost/total_count:.0f}")
    if total_cost > 100000:
        issues.append(f"WARNING: Total tech cost {total_cost} too high")

checks.append('')
checks.append('=== FORAGING_DATA ===')
foraging_data = extract_object('FORAGING_DATA')
foraging = js_to_dict(foraging_data) if foraging_data else {}
for k, f in foraging.items():
    avg_price = sum(i.get('price', 0) for i in f['items']) / len(f['items'])
    checks.append(f"{k}: {len(f['items'])} items, stamina={f['staminaCost']}, avgPrice={avg_price:.1f}")
    if avg_price < f['staminaCost'] * 2:
        issues.append(f"WARNING: Foraging {k} avgPrice({avg_price:.1f}) < staminaCost*2({f['staminaCost']*2})")

checks.append('')
checks.append('=== PROCESSING_DATA ===')
proc_data = extract_object('PROCESSING_DATA')
proc = js_to_dict(proc_data) if proc_data else {}
for k, p in proc.items():
    checks.append(f"{k}: input={p['inputAmount']} {p['inputCrop']}, cost={p['processingCost']}, output={p['outputAmount']} {p['outputItem']}")

checks.append('')
checks.append('=== DAILY_ACTIVITIES ===')
act_data = extract_object('DAILY_ACTIVITIES')
acts = js_to_dict(act_data) if act_data else {}
for k, a in acts.items():
    checks.append(f"{a['name']}: stamina-{a['staminaCost']}, {a['description']}")

checks.append('')
checks.append('=== PET_DATA ===')
pet_data = extract_object('PET_DATA')
pets = js_to_dict(pet_data) if pet_data else {}
for k, p in pets.items():
    checks.append(f"{p['name']}: cost={p['cost']}, food={p['dailyFoodCost']}, unlock={p['unlockCondition']}")
    if p['cost'] > 3000:
        issues.append(f"WARNING: Pet {p['name']} cost {p['cost']} too high vs start money 1500")

checks.append('')
checks.append('=== BUILDING_DATA ===')
build_data = extract_object('BUILDING_DATA')
builds = js_to_dict(build_data) if build_data else {}
for k, b in builds.items():
    income = b.get('dailyIncome', 0)
    cost = b.get('buildCost', 0)
    if income > 0 and cost > 0:
        roi = cost / income
        checks.append(f"{b['name']}: buildCost={cost}, dailyIncome={income}, ROI={roi:.1f} days")
        if roi > 60:
            issues.append(f"WARNING: {b['name']} ROI too long: {roi:.1f} days")
        if roi < 3:
            issues.append(f"WARNING: {b['name']} ROI too short: {roi:.1f} days")
    else:
        checks.append(f"{b['name']}: buildCost={cost}, dailyIncome={income}")

checks.append('')
checks.append('=== TAB_UNLOCK_CONFIG ===')
tab_data = extract_object('TAB_UNLOCK_CONFIG')
tabs = js_to_dict(tab_data) if tab_data else {}
for k, t in tabs.items():
    checks.append(f"{t['name']}: day={t.get('day','?')}, money={t.get('money', 'N/A')}")

checks.append('')
checks.append('=== SKILL_EFFECTS ===')
skill_data = extract_object('SKILL_EFFECTS')
skills = js_to_dict(skill_data) if skill_data else {}
for k, s in skills.items():
    checks.append(f"{s['name']}: {s['description']}")

checks.append('')
checks.append('=== QUEST_DATA ===')
quest_data = extract_object('QUEST_DATA')
quests = js_to_dict(quest_data) if quest_data else {}
if quests:
    checks.append(f"Quests: {len(quests)}")
    for k, q in quests.items():
        checks.append(f"  {q['name']}: reward={q.get('reward',{})}")

checks.append('')
checks.append('=== MILESTONE_DATA ===')
mile_data = extract_object('MILESTONE_DATA')
miles = js_to_dict(mile_data) if mile_data else {}
for k, m in miles.items():
    checks.append(f"{m['name']}: {m['description']}, reward={m.get('reward',{})}")

checks.append('')
checks.append('=== NPC_MILESTONES ===')
nm_data = extract_object('NPC_MILESTONES')
nms = js_to_dict(nm_data) if nm_data else {}
for k, m in nms.items():
    checks.append(f"{k}: {len(m)} milestones")

checks.append('')
checks.append('=== SKILL_EXP_TABLE ===')
exp_table = extract_object('SKILL_EXP_TABLE')
exp = js_to_list(exp_table) if exp_table else []
if exp:
    checks.append(f"Exp table: {exp}")
    for i in range(1, len(exp)):
        diff = exp[i] - exp[i-1]
        checks.append(f"  Lv{i}->{i+1}: {diff} exp")
    ratios = []
    for i in range(2, len(exp)):
        if exp[i-1] > 0:
            ratios.append(exp[i] / exp[i-1])
    if ratios:
        avg_ratio = sum(ratios) / len(ratios)
        checks.append(f"  Avg growth ratio: {avg_ratio:.2f}")
        if avg_ratio < 1.3:
            issues.append(f"WARNING: Skill exp growth too slow: avg ratio {avg_ratio:.2f}")

checks.append('')
checks.append('=== PET_FRIENDSHIP_LEVELS ===')
pet_levels = extract_object('PET_FRIENDSHIP_LEVELS')
levels = js_to_list(pet_levels) if pet_levels else []
if levels:
    checks.append(f"Pet levels: {levels}")

checks.append('')
checks.append('=== CROSS-CHECKS ===')
if houses:
    house_order = ['新手房', '进阶房', '精英房', '终极房']
    for i in range(1, len(house_order)):
        prev = houses.get(house_order[i-1])
        curr = houses.get(house_order[i])
        if curr and prev:
            if curr['upgradeCost'] <= prev['upgradeCost']:
                issues.append(f"WARNING: {curr['name']} upgradeCost({curr['upgradeCost']}) <= {prev['name']}({prev['upgradeCost']})")
            if curr['rent'] <= prev['rent']:
                issues.append(f"WARNING: {curr['name']} rent({curr['rent']}) <= {prev['name']}({prev['rent']})")

print('\n'.join(checks))
print(f"\n=== SUMMARY: {len(issues)} issues found ===")
for i in issues:
    print(f"  {i}")
