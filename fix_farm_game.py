import re

path = r'C:\Users\Administrator\Documents\kimi\workspace\farm_game.html'
with open(path, 'r', encoding='utf-8') as f:
    text = f.read()

# Keep track of replacements
replacements = []

# ========== Fix 1: advanceSeason game.fields 防护 ==========
old = 'function advanceSeason(silent = false) {\n    if (game.day <= 28) return;'
new = 'function advanceSeason(silent = false) {\n    if (!game || !game.fields || game.day <= 28) return;'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 1: advanceSeason - OK')
else:
    replacements.append('Fix 1: advanceSeason - FAILED (old string not found)')

# ========== Fix 2: calculateOfflineReward game.fields 防护 ==========
old = 'function calculateOfflineReward() {\n    if (!game || !game.lastSaveTimestamp) return null;'
new = 'function calculateOfflineReward() {\n    if (!game || !game.lastSaveTimestamp) return null;\n    if (!game.fields) game.fields = [];'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 2: calculateOfflineReward - OK')
else:
    replacements.append('Fix 2: calculateOfflineReward - FAILED (old string not found)')

# ========== Fix 3: renderFieldsPanel game.fields 防护 ==========
old = 'function renderFieldsPanel() {\n    const panel = document.getElementById(\'content-panel\');\n    if (!panel) return;'
new = 'function renderFieldsPanel() {\n    if (!game || !game.fields) return;\n    const panel = document.getElementById(\'content-panel\');\n    if (!panel) return;'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 3: renderFieldsPanel - OK')
else:
    replacements.append('Fix 3: renderFieldsPanel - FAILED (old string not found)')

# ========== Fix 4: getQuestProgress game.fields 防护 ==========
old = 'function getQuestProgress(questId) {\n    const q = game.quests;'
new = 'function getQuestProgress(questId) {\n    if (!game.fields) game.fields = [];\n    const q = game.quests;'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 4: getQuestProgress - OK')
else:
    replacements.append('Fix 4: getQuestProgress - FAILED (old string not found)')

# ========== Fix 5: renderSidebarQuests game.fields 防护 ==========
old = 'function renderSidebarQuests() {\n    const listEl = document.getElementById(\'sidebar-quests-list\');\n    if (!listEl || !game) return;'
new = 'function renderSidebarQuests() {\n    if (!game.fields) game.fields = [];\n    const listEl = document.getElementById(\'sidebar-quests-list\');\n    if (!listEl || !game) return;'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 5: renderSidebarQuests - OK')
else:
    replacements.append('Fix 5: renderSidebarQuests - FAILED (old string not found)')

# ========== Fix 6: renderQuestBox game.fields 防护 ==========
old = 'function renderQuestBox() {\n    const q = game.quests;'
new = 'function renderQuestBox() {\n    if (!game.fields) game.fields = [];\n    const q = game.quests;'
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 6: renderQuestBox - OK')
else:
    replacements.append('Fix 6: renderQuestBox - FAILED (old string not found)')

# ========== Fix 7: MILESTONE_DATA m5, m6, m7, m9 防护 ==========
# m5
old_m5 = '''check: () => {
            let count = 0;
            for (const key in game.npcs) {
                if (game.npcs[key] >= 40) count++;
            }
            return count >= 3;
        }'''
new_m5 = '''check: () => {
            if (!game.npcs) return false;
            let count = 0;
            for (const key in game.npcs) {
                if (game.npcs[key] >= 40) count++;
            }
            return count >= 3;
        }'''
if old_m5 in text:
    text = text.replace(old_m5, new_m5)
    replacements.append('Fix 7a: MILESTONE_DATA m5 - OK')
else:
    replacements.append('Fix 7a: MILESTONE_DATA m5 - FAILED (old string not found)')

# m6
old_m6 = '''check: () => {
            let count = 0;
            for (const key in game.pets) {
                if (game.pets[key]) count++;
            }
            return count >= 2;
        }'''
new_m6 = '''check: () => {
            if (!game.pets) return false;
            let count = 0;
            for (const key in game.pets) {
                if (game.pets[key]) count++;
            }
            return count >= 2;
        }'''
if old_m6 in text:
    text = text.replace(old_m6, new_m6)
    replacements.append('Fix 7b: MILESTONE_DATA m6 - OK')
else:
    replacements.append('Fix 7b: MILESTONE_DATA m6 - FAILED (old string not found)')

# m7
old_m7 = 'check: () => game.fields.length >= 3'
new_m7 = 'check: () => { if (!game.fields) return false; return game.fields.length >= 3; }'
if old_m7 in text:
    text = text.replace(old_m7, new_m7)
    replacements.append('Fix 7c: MILESTONE_DATA m7 - OK')
else:
    replacements.append('Fix 7c: MILESTONE_DATA m7 - FAILED (old string not found)')

# m9
old_m9 = '''check: () => {
            const riceValue = game.crops.rice * 2;
            const sweetValue = game.crops.sweet * 0.5;
            const total = game.money + riceValue + sweetValue;
            return total >= 5000;
        }'''
new_m9 = '''check: () => {
            if (!game.crops) return false;
            const riceValue = game.crops.rice * 2;
            const sweetValue = game.crops.sweet * 0.5;
            const total = game.money + riceValue + sweetValue;
            return total >= 5000;
        }'''
if old_m9 in text:
    text = text.replace(old_m9, new_m9)
    replacements.append('Fix 7d: MILESTONE_DATA m9 - OK')
else:
    replacements.append('Fix 7d: MILESTONE_DATA m9 - FAILED (old string not found)')

# ========== Fix 8: checkSkillLevelUp game.skills 防护 ==========
old = '''function checkSkillLevelUp(skillKey) {
    // 统一使用addSkillExp处理升级，避免双系统不一致
    // 此函数保留兼容旧代码调用，但逻辑统一
    if (!game.skills[skillKey]) return;'''
new = '''function checkSkillLevelUp(skillKey) {
    // 统一使用addSkillExp处理升级，避免双系统不一致
    // 此函数保留兼容旧代码调用，但逻辑统一
    if (!game.skills) game.skills = {};
    if (!game.skills[skillKey]) return;'''
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 8: checkSkillLevelUp - OK')
else:
    replacements.append('Fix 8: checkSkillLevelUp - FAILED (old string not found)')

# ========== Fix 9: Object.entries(game.xxx) null 防护 ==========
entries_fixes = [
    ('Object.entries(game.unlockedTechs)', 'Object.entries(game.unlockedTechs || {})'),
    ('Object.entries(game.npcMilestones)', 'Object.entries(game.npcMilestones || {})'),
    ('Object.entries(game.buildings)', 'Object.entries(game.buildings || {})'),
    ('Object.entries(game.pets)', 'Object.entries(game.pets || {})'),
    ('Object.entries(game.agriTechEffects)', 'Object.entries(game.agriTechEffects || {})'),
    ('Object.entries(game.animals)', 'Object.entries(game.animals || {})'),
    ('Object.keys(game.pets)', 'Object.keys(game.pets || {})'),
    ('Object.keys(game.npcs)', 'Object.keys(game.npcs || {})'),
    ('Object.entries(game.npcs)', 'Object.entries(game.npcs || {})'),
    ('Object.keys(game.achievements)', 'Object.keys(game.achievements || {})'),
    ('Object.entries(game.processedItems)', 'Object.entries(game.processedItems || {})'),
    ('Object.entries(game.mineInventory)', 'Object.entries(game.mineInventory || {})'),
    ('Object.entries(game.animalProducts)', 'Object.entries(game.animalProducts || {})'),
    ('Object.entries(game.fruits)', 'Object.entries(game.fruits || {})'),
]

for old, new in entries_fixes:
    count = text.count(old)
    if count > 0:
        text = text.replace(old, new)
        replacements.append(f'Fix 9: {old} -> {new} ({count} occurrences) - OK')
    else:
        replacements.append(f'Fix 9: {old} -> {new} - NOT FOUND (0 occurrences)')

# ========== Fix 10: localStorage 操作改为 safeStorageGet/Set ==========
# 10a
old = "if (localStorage.getItem('farm_migration_shown')) return;"
new = "if (safeStorageGet('farm_migration_shown')) return;"
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 10a: localStorage.getItem farm_migration_shown - OK')
else:
    replacements.append('Fix 10a: localStorage.getItem farm_migration_shown - FAILED')

# 10b - inside the onclick HTML string
old = "localStorage.setItem('farm_migration_shown', '1')"
new = "safeStorageSet('farm_migration_shown', '1')"
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 10b: localStorage.setItem farm_migration_shown - OK')
else:
    replacements.append('Fix 10b: localStorage.setItem farm_migration_shown - FAILED')

# 10c
old = "const save = localStorage.getItem('farm_game_save_v1');"
new = "const save = safeStorageGet('farm_game_save_v1');"
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 10c: localStorage.getItem farm_game_save_v1 - OK')
else:
    replacements.append('Fix 10c: localStorage.getItem farm_game_save_v1 - FAILED')

# ========== Fix 11: panel._lastRenderFields JSON.stringify 添加 try-catch ==========
# Use regex to find all occurrences and wrap them
pattern = re.compile(r'panel\._lastRenderFields = JSON\.stringify\(([^;]+)\);')

def replace_last_render(match):
    inner = match.group(1)
    return f'try {{ panel._lastRenderFields = JSON.stringify({inner}); }} catch(e) {{ panel._lastRenderFields = null; }}'

count = len(pattern.findall(text))
text = pattern.sub(replace_last_render, text)
replacements.append(f'Fix 11: panel._lastRenderFields try-catch ({count} occurrences) - OK')

# ========== Fix 12: showModal content 统一转义 ==========
old = '''function showModal(title, content, onConfirm) {
    const titleEl = document.getElementById('modal-title');'''
new = '''function showModal(title, content, onConfirm) {
    content = escapeHtml(content);
    const titleEl = document.getElementById('modal-title');'''
if old in text:
    text = text.replace(old, new)
    replacements.append('Fix 12: showModal escapeHtml - OK')
else:
    replacements.append('Fix 12: showModal escapeHtml - FAILED')

with open(path, 'w', encoding='utf-8') as f:
    f.write(text)

print('\\n'.join(replacements))
print(f'\\nTotal fixes applied: {len([r for r in replacements if "OK" in r])}/{len(replacements)}')
