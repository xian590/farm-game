const fs = require('fs');
const html = fs.readFileSync('index-manifestation.html', 'utf8');
const scripts = html.match(/<script>([\s\S]*?)<\/script>/g) || [];
let allScript = '';
scripts.forEach((s, i) => {
  allScript += s.replace(/<script>/g, '').replace(/<\/script>/g, '') + '\n';
});

// Extract all function definitions
const functionDefs = new Set();
const fnDeclRegex = /function\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\(/g;
let m;
while ((m = fnDeclRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}
const fnAssignRegex = /(?:const|let|var)\s+([a-zA-Z_$][a-zA-Z0-9_$]*)\s*=\s*function\s*\(/g;
while ((m = fnAssignRegex.exec(allScript)) !== null) {
  functionDefs.add(m[1]);
}

// Find wish-related functions
console.log('--- Wish related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('wish')) console.log(' ', fn);
}

// Find diary-related functions
console.log('--- Diary related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('diary')) console.log(' ', fn);
}

// Find emotion-related functions
console.log('--- Emotion related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('emotion') || fn.toLowerCase().includes('mood')) console.log(' ', fn);
}

// Find task-related functions
console.log('--- Task related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('task')) console.log(' ', fn);
}

// Find habit-related functions
console.log('--- Habit related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('habit')) console.log(' ', fn);
}

// Find streak-related functions
console.log('--- Streak related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('streak')) console.log(' ', fn);
}

// Find level-related functions
console.log('--- Level related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('level')) console.log(' ', fn);
}

// Find breathe-related functions
console.log('--- Breathe related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('breathe') || fn.toLowerCase().includes('breath')) console.log(' ', fn);
}

// Find fortune-related functions
console.log('--- Fortune related ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('fortune')) console.log(' ', fn);
}

// Find data import/export functions
console.log('--- Data import/export ---');
for (const fn of functionDefs) {
  if (fn.toLowerCase().includes('import') || fn.toLowerCase().includes('export')) console.log(' ', fn);
}

// Check for addWishProgress
console.log('\n--- Checking addWishProgress ---');
console.log(functionDefs.has('addWishProgress') ? '✅ addWishProgress exists' : '❌ addWishProgress missing');

// Check for closePage
console.log('--- Checking closePage ---');
console.log(functionDefs.has('closePage') ? '✅ closePage exists' : '❌ closePage missing');
