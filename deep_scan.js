const fs = require('fs');
const js = fs.readFileSync('farm_game.html', 'utf8').match(/<script[^>]*>([\s\S]*?)<\/script>/i)[1];
const lines = js.split('\n');

console.log('=== Deep Bug Scan ===\n');

// 1. Check game.property accesses without null checks
console.log('--- 1. Game Null Reference Checks ---');
const gamePatterns = [
    /\bgame\.[a-zA-Z_$][a-zA-Z0-9_$]*/g
];
let gameAccessCount = 0;
let unprotectedCount = 0;
const unprotectedLines = [];

for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const matches = line.match(/game\.[a-zA-Z_$][a-zA-Z0-9_$]*/g);
    if (!matches) continue;
    
    for (const match of matches) {
        gameAccessCount++;
        // Check if protected in current or previous 3 lines
        let protected = false;
        for (let j = Math.max(0, i-3); j <= i; j++) {
            const checkLine = lines[j];
            if (checkLine.includes('if (!game)') || checkLine.includes('if (game)') || 
                checkLine.includes('game =') || checkLine.includes('let game') ||
                checkLine.includes('var game') || checkLine.includes('const game') ||
                checkLine.includes('game ||') || checkLine.includes('game &&')) {
                protected = true;
                break;
            }
        }
        // Also check if inside a function parameter (safe)
        if (line.includes('function') && line.includes('game')) protected = true;
        if (line.includes('=>') && line.includes('game')) protected = true;
        
        if (!protected && !line.trim().startsWith('//')) {
            unprotectedCount++;
            if (unprotectedLines.length < 10) {
                unprotectedLines.push(`Line ${i+1}: ${line.trim().substring(0, 80)}`);
            }
        }
    }
}
console.log(`Total game accesses: ${gameAccessCount}`);
console.log(`Potentially unprotected: ${unprotectedCount}`);
unprotectedLines.forEach(l => console.log('  ' + l));

// 2. Check setTimeout without clearTimeout
console.log('\n--- 2. Timeout Leak Check ---');
const timeoutIds = new Set();
const clearIds = new Set();
const timeoutRegex = /(?:window\.)?setTimeout\s*\(\s*(?:function\s*\(|\(|\w+)/g;
const clearRegex = /clearTimeout\s*\(/g;
const timeoutCount = (js.match(timeoutRegex) || []).length;
const clearCount = (js.match(clearRegex) || []).length;
console.log(`setTimeout calls: ${timeoutCount}`);
console.log(`clearTimeout calls: ${clearCount}`);
if (timeoutCount > clearCount + 10) {
    console.log('⚠️ Many setTimeouts without clear - potential memory leak');
}

// 3. Check addEventListener for duplicates
console.log('\n--- 3. Event Listener Check ---');
const listenerMatches = js.match(/addEventListener\s*\(\s*['"]([^'"]+)['"]/g) || [];
const listenerTypes = {};
for (const match of listenerMatches) {
    const type = match.match(/['"]([^'"]+)['"]/)[1];
    listenerTypes[type] = (listenerTypes[type] || 0) + 1;
}
for (const [type, count] of Object.entries(listenerTypes)) {
    if (count > 3) console.log(`⚠️ Many '${type}' listeners: ${count}`);
}

// 4. Check for potential NaN/Infinity issues
console.log('\n--- 4. Numeric Safety Check ---');
const divideMatches = js.match(/\/\s*[^\/\n*][^\n;]*/g) || [];
let unsafeDivisions = 0;
for (const match of divideMatches) {
    if (!match.includes('||') && !match.includes('?') && !match.includes('!== 0')) {
        unsafeDivisions++;
    }
}
console.log(`Potential unsafe divisions: ${unsafeDivisions}`);

// 5. Check for missing return statements after modal operations
console.log('\n--- 5. Modal Flow Check ---');
const modalCallbackIssues = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('showModal(') && lines[i].includes('=>')) {
        // Check if callback might not return properly
        if (i + 1 < lines.length && lines[i+1].includes('closeModal()')) {
            // This might be ok
        }
    }
}

// 6. Check localStorage access without try-catch
console.log('\n--- 6. Storage Safety Check ---');
const storageAccess = (js.match(/localStorage\./g) || []).length;
const safeStorage = (js.match(/safeStorage/g) || []).length;
console.log(`localStorage direct: ${storageAccess}, safeStorage: ${safeStorage}`);
if (storageAccess > safeStorage) {
    console.log('⚠️ Some direct localStorage access without safe wrapper');
}

// 7. Check for innerHTML with user input
console.log('\n--- 7. XSS Risk Check ---');
const riskyInnerHtml = [];
for (let i = 0; i < lines.length; i++) {
    if (lines[i].includes('innerHTML') && lines[i].includes('+')) {
        if (!lines[i].includes('escapeHtml') && !lines[i].includes('safeText')) {
            riskyInnerHtml.push(`Line ${i+1}: ${lines[i].trim().substring(0, 60)}`);
        }
    }
}
if (riskyInnerHtml.length > 0) {
    console.log(`⚠️ ${riskyInnerHtml.length} potentially unsafe innerHTML`);
    riskyInnerHtml.slice(0, 5).forEach(l => console.log('  ' + l));
}

console.log('\n=== Scan Complete ===');
