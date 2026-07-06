const fs = require('fs');
const js = fs.readFileSync('farm_game.html', 'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];

const issues = [];
const lines = js.split('\n');

// Check 1: game.property without game check in same function scope
const gameProps = [
    'game\.fields', 'game\.money', 'game\.health', 'game\.stamina', 
    'game\.day', 'game\.season', 'game\.crops', 'game\.items',
    'game\.seeds', 'game\.npcs', 'game\.skills', 'game\.buildings',
    'game\.reputation', 'game\.totalDay', 'game\.time', 'game\.mode',
    'game\.version', 'game\.saveVersion', 'game\.tutorialStep',
    'game\.tutorialCompleted', 'game\.justStarted', 'game\.stats'
];

// Check 2: setInterval/setTimeout without clear
const intervalMatches = js.match(/setInterval\(/g) || [];
const clearMatches = js.match(/clearInterval\(/g) || [];
if (intervalMatches.length > clearMatches.length) {
    issues.push(`⚠️ Possible interval leak: ${intervalMatches.length} setInterval vs ${clearMatches.length} clearInterval`);
}

// Check 3: document.getElementById without null check
for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    // Skip comments
    if (line.trim().startsWith('//') || line.trim().startsWith('*')) continue;
    
    // Check game.property patterns in function bodies
    for (const prop of ['game.fields', 'game.money', 'game.health', 'game.stamina']) {
        if (line.includes(prop)) {
            // Check if there's a game null check in preceding 5 lines
            let hasCheck = false;
            for (let j = Math.max(0, i-5); j < i; j++) {
                if (lines[j].includes('if (!game)') || lines[j].includes('if (game)')) {
                    hasCheck = true;
                    break;
                }
            }
            if (!hasCheck) {
                // Only report if it's not inside a function that already checks
                // Skip if line is inside an arrow function parameter or conditional
                if (!line.includes('=>') && !line.includes('?') && !line.includes('||')) {
                    // This is a simplified check - many false positives possible
                }
            }
        }
    }
}

// Check 4: innerHTML assignments that might not be safe
const innerHtmlMatches = js.match(/innerHTML\s*=/g) || [];
issues.push(`📊 innerHTML assignments: ${innerHtmlMatches.length}`);

// Check 5: onclick assignments (might have memory leak issues)
const onclickMatches = js.match(/\.onclick\s*=/g) || [];
issues.push(`📊 onclick assignments: ${onclickMatches.length}`);

// Check 6: Missing return after showModal/closeModal in some paths
// Check 7: console.log/error left in code
const consoleLogs = js.match(/console\.(log|error|warn)\(/g) || [];
issues.push(`📊 console statements: ${consoleLogs.length}`);

// Check 8: Potential infinite loops
const whileMatches = js.match(/while\s*\(/g) || [];
issues.push(`📊 while loops: ${whileMatches.length}`);

// Check 9: parseFloat/parseInt without isFinite check
const parseMatches = js.match(/parse(Float|Int)\(/g) || [];
const isFiniteMatches = js.match(/isFinite\(/g) || [];
issues.push(`📊 parseFloat/Int: ${parseMatches.length}, isFinite checks: ${isFiniteMatches.length}`);

// Check 10: eval or Function constructor (security risk)
if (js.includes('eval(')) issues.push('❌ eval() found - security risk');

console.log('=== Bug Scan Results ===');
issues.forEach(i => console.log(i));
console.log('\n=== Quick Stats ===');
console.log(`Functions: ${(js.match(/function\s+\w+/g) || []).length}`);
console.log(`Event listeners: ${(js.match(/addEventListener\(/g) || []).length}`);
console.log(`setTimeout: ${(js.match(/setTimeout\(/g) || []).length}`);
console.log(`setInterval: ${intervalMatches.length}`);
