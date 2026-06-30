const fs = require('fs');
const content = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/farm_game.html', 'utf8');
const scriptMatch = content.match(/<script>([\s\S]*?)<\/script>/);
const code = scriptMatch[1];

const vm = require('vm');
const sandbox = {
  console, Math, JSON, Date, Array, Object, String, Number, RegExp, Error,
  window: {}, document: {}, localStorage: { getItem: () => null, setItem: () => {}, removeItem: () => {} },
  setTimeout: () => {}, clearTimeout: () => {}, setInterval: () => {}, clearInterval: () => {}
};
vm.createContext(sandbox);
vm.runInContext(code, sandbox, { timeout: 5000 });

const audit = { issues: [], checks: [], data: {} };

function push(msg) { audit.checks.push(msg); }

// ============ CROP_DATA ============
push('=== CROP_DATA ===');
const crops = sandbox.CROP_DATA;
for (const [k, c] of Object.entries(crops)) {
  const price = c.type === 'rice' ? 3.0 : 1.5;
  const net = c.baseYield * price - c.seedPrice;
  const daily = net / c.growDays;
  push(`${c.name}: cost=${c.seedPrice}, yield=${c.baseYield}, price=${price}, net=${net}, daily=${daily.toFixed(1)}`);
  audit.data[k] = { net, daily, growDays: c.growDays };
  if (c.steps.length !== c.stepCosts.length) {
    audit.issues.push(`ERROR: ${c.name} steps(${c.steps.length}) != stepCosts(${c.stepCosts.length})`);
  }
  const stepTotal = c.stepCosts.reduce((a, b) => a + b, 0);
  push(`  steps=${c.steps.length}, stepTotal=${stepTotal}, avg=${(stepTotal/c.stepCosts.length).toFixed(1)}`);
}

// ============ HOUSE_DATA ============
push('');
push('=== HOUSE_DATA ===');
const houses = sandbox.HOUSE_DATA;
for (const [k, h] of Object.entries(houses)) {
  const dailyRegen = (h.staminaRegen / 4) * 24;
  push(`${h.name}: staminaRegen=${h.staminaRegen}/hr => daily=${dailyRegen}, healthRegen=${h.healthRegen}/night, rent=${h.rent}, upgrade=${h.upgradeCost}`);
  if (dailyRegen >= 120) audit.issues.push(`WARNING: ${h.name} daily regen ${dailyRegen} >= max stamina 120`);
}

// ============ TOOL_DATA ============
push('');
push('=== TOOL_DATA ===');
const tools = sandbox.TOOL_DATA;
for (const [k, t] of Object.entries(tools)) {
  push(`${t.name}: ${t.price}元, effect='${t.effect}', type=${t.type}`);
}

// ============ WEATHER_DATA ============
push('');
push('=== WEATHER_DATA ===');
const weather = sandbox.WEATHER_DATA;
const seasonWeather = sandbox.SEASON_WEATHER;
for (const [k, w] of Object.entries(weather)) {
  push(`${w.name}: ${w.emoji}, stamina=${w.stamina}, growth=${w.growth}, duration=${JSON.stringify(w.duration)}`);
}
for (const [s, w] of Object.entries(seasonWeather)) {
  push(`Season ${s}: ${w.join(', ')}`);
}

// ============ EVENTS ============
push('');
push('=== EVENTS ===');
const events = sandbox.EVENTS || [];
const storyEvents = sandbox.STORY_EVENTS || [];
push(`Events count: ${events.length}`);
push(`StoryEvents count: ${storyEvents.length}`);
if (events.length > 0) {
  const probs = events.map(e => e.probability || 0);
  const totalProb = probs.reduce((a, b) => a + b, 0);
  push(`Total event probability: ${totalProb.toFixed(3)}`);
  if (totalProb > 1.0) audit.issues.push(`WARNING: Total event probability ${totalProb} > 1.0`);
  const disasters = events.filter(e => e.type === 'disaster').length;
  const gains = events.filter(e => e.type === 'gain').length;
  push(`Disaster events: ${disasters}, Gain events: ${gains}`);
  if (disasters > gains * 1.5) audit.issues.push(`WARNING: Too many disasters (${disasters}) vs gains (${gains})`);
}

// ============ NPC_DATA ============
push('');
push('=== NPC_DATA ===');
const npcs = sandbox.NPC_DATA;
for (const [k, n] of Object.entries(npcs)) {
  push(`${n.name}: ${n.emoji}, gift=${n.gift}, giftFreq=${n.giftFrequency}, initialFavor=${n.initialFavor}`);
}

// ============ TECH_DATA ============
push('');
push('=== TECH_DATA ===');
const techs = sandbox.TECH_DATA;
let techCount = 0;
for (const [cat, list] of Object.entries(techs)) {
  techCount += list.length;
  push(`Category ${cat}: ${list.length} techs`);
  for (const t of list) {
    push(`  ${t.name}: cost=${t.cost}, ${t.description}`);
  }
}

// ============ FORAGING_DATA ============
push('');
push('=== FORAGING_DATA ===');
const foraging = sandbox.FORAGING_DATA || {};
for (const [k, f] of Object.entries(foraging)) {
  push(`${k}: ${f.items.length} items, staminaCost=${f.staminaCost}, avgPrice=${f.items.reduce((a,i)=>a+(i.price||0),0)/f.items.length}`);
}

// ============ PROCESSING_DATA ============
push('');
push('=== PROCESSING_DATA ===');
const processing = sandbox.PROCESSING_DATA || {};
for (const [k, p] of Object.entries(processing)) {
  push(`${k}: input=${p.inputAmount} ${p.inputCrop}, cost=${p.processingCost}, output=${p.outputAmount} ${p.outputItem}`);
}

// ============ DAILY_ACTIVITIES ============
push('');
push('=== DAILY_ACTIVITIES ===');
const activities = sandbox.DAILY_ACTIVITIES || {};
for (const [k, a] of Object.entries(activities)) {
  push(`${a.name}: stamina-${a.staminaCost}, ${a.description}`);
}

// ============ PET_DATA ============
push('');
push('=== PET_DATA ===');
const pets = sandbox.PET_DATA || {};
for (const [k, p] of Object.entries(pets)) {
  push(`${p.name}: cost=${p.cost}, food=${p.dailyFoodCost}, unlock=${p.unlockCondition}`);
}

// ============ BUILDING_DATA ============
push('');
push('=== BUILDING_DATA ===');
const buildings = sandbox.BUILDING_DATA || {};
for (const [k, b] of Object.entries(buildings)) {
  push(`${b.name}: buildCost=${b.buildCost}, dailyIncome=${b.dailyIncome}, unlock=${b.unlockCondition}`);
}

// ============ TAB_UNLOCK_CONFIG ============
push('');
push('=== TAB_UNLOCK_CONFIG ===');
const tabs = sandbox.TAB_UNLOCK_CONFIG || {};
for (const [k, t] of Object.entries(tabs)) {
  push(`${t.name}: day=${t.day}${t.money ? ', money=' + t.money : ''}`);
}

// ============ SKILL_EFFECTS ============
push('');
push('=== SKILL_EFFECTS ===');
const skillEffects = sandbox.SKILL_EFFECTS || {};
for (const [k, s] of Object.entries(skillEffects)) {
  push(`${s.name}: ${s.description}`);
}

// ============ NPC_MILESTONES ============
push('');
push('=== NPC_MILESTONES ===');
const milestones = sandbox.NPC_MILESTONES || {};
for (const [k, m] of Object.entries(milestones)) {
  push(`${k}: ${m.length} milestones`);
}

// ============ QUEST_DATA ============
push('');
push('=== QUEST_DATA ===');
const quests = sandbox.QUEST_DATA || {};
const questCount = Object.keys(quests).length;
push(`Quests: ${questCount}`);
for (const [k, q] of Object.entries(quests)) {
  push(`${q.name}: ${q.description}, reward=${JSON.stringify(q.reward)}`);
}

// ============ MILESTONE_DATA ============
push('');
push('=== MILESTONE_DATA ===');
const mData = sandbox.MILESTONE_DATA || {};
for (const [k, m] of Object.entries(mData)) {
  push(`${m.name}: ${m.description}, reward=${JSON.stringify(m.reward)}`);
}

// ============ CROSS-CHECKS ============
push('');
push('=== CROSS-CHECKS ===');

// House upgrade chain
const houseOrder = ['新手房', '进阶房', '精英房', '终极房'];
for (let i = 1; i < houseOrder.length; i++) {
  const prev = houses[houseOrder[i-1]];
  const curr = houses[houseOrder[i]];
  if (!curr) audit.issues.push(`ERROR: Missing house ${houseOrder[i]}`);
  if (curr && curr.upgradeCost <= prev.upgradeCost) {
    audit.issues.push(`WARNING: ${curr.name} upgradeCost(${curr.upgradeCost}) <= ${prev.name}(${prev.upgradeCost})`);
  }
  if (curr && curr.rent <= prev.rent) {
    audit.issues.push(`WARNING: ${curr.name} rent(${curr.rent}) <= ${prev.name}(${prev.rent})`);
  }
}

// Check season consistency
for (const [k, c] of Object.entries(crops)) {
  if (!['spring', 'summer', 'autumn', 'winter'].includes(c.season)) {
    audit.issues.push(`ERROR: ${c.name} has invalid season '${c.season}'`);
  }
}

// Check tool effect descriptions for consistency
for (const [k, t] of Object.entries(tools)) {
  if (t.effect.includes('-自动') || t.effect.includes('自动')) {
    audit.issues.push(`WARNING: Tool ${t.name} has 'automatic' effect: '${t.effect}'`);
  }
}

// Check foraging item prices vs stamina cost
for (const [k, f] of Object.entries(foraging)) {
  const avgPrice = f.items.reduce((a, i) => a + (i.price || 0), 0) / f.items.length;
  if (avgPrice < f.staminaCost * 2) {
    audit.issues.push(`WARNING: Foraging ${k} avgPrice(${avgPrice}) < staminaCost*2(${f.staminaCost * 2}), may not be worth it`);
  }
}

// Check building ROI
for (const [k, b] of Object.entries(buildings)) {
  if (b.dailyIncome > 0 && b.buildCost > 0) {
    const daysToROI = b.buildCost / b.dailyIncome;
    push(`${b.name}: ROI in ${daysToROI.toFixed(1)} days`);
    if (daysToROI > 60) audit.issues.push(`WARNING: ${b.name} ROI too long: ${daysToROI.toFixed(1)} days`);
    if (daysToROI < 3) audit.issues.push(`WARNING: ${b.name} ROI too short: ${daysToROI.toFixed(1)} days`);
  }
}

// Check pet costs vs starting money
const startMoney = 1500;
for (const [k, p] of Object.entries(pets)) {
  if (p.cost > startMoney * 2) {
    audit.issues.push(`WARNING: Pet ${p.name} cost(${p.cost}) > 2x starting money(${startMoney})`);
  }
  const dailyNet = p.dailyFoodCost; // Assume no other income from pet
  if (dailyNet > 50) audit.issues.push(`WARNING: Pet ${p.name} daily cost(${dailyNet}) too high`);
}

// Check tech costs
let allTechs = [];
for (const [cat, list] of Object.entries(techs)) {
  allTechs = allTechs.concat(list);
}
const totalTechCost = allTechs.reduce((a, t) => a + t.cost, 0);
push(`Total tech cost: ${totalTechCost}`);
const avgTechCost = totalTechCost / allTechs.length;
push(`Average tech cost: ${avgTechCost}`);
if (totalTechCost > 100000) audit.issues.push(`WARNING: Total tech cost ${totalTechCost} too high`);

// Summary
push('');
push('=== SUMMARY ===');
push(`Total issues found: ${audit.issues.length}`);
if (audit.issues.length > 0) {
  push('ISSUES:');
  audit.issues.forEach(i => push('  ' + i));
}

console.log(audit.checks.join('\n'));
