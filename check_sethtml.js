const fs = require('fs');
const c = fs.readFileSync('C:/Users/Administrator/Documents/kimi/workspace/index-manifestation.html', 'utf8');
const r = /<script(?![^>]*src)[^>]*>([\s\S]*?)<\/script>/g;
let m, bn = 0;
while ((m = r.exec(c)) !== null) {
  bn++;
  if (bn === 2) {
    const code = m[1];
    const setHTMLMatches = code.match(/setHTML\('[^']+',[^)]*\)/g);
    console.log('setHTML single line: ' + (setHTMLMatches ? setHTMLMatches.length : 0));
    const templateMatches = code.match(/setHTML\('[^']+', `[^`]*`\);/g);
    console.log('setHTML template literals: ' + (templateMatches ? templateMatches.length : 0));
    const malformed = code.match(/setHTML\('[^']+', `[^`]*`;(?!\))/g);
    console.log('Malformed: ' + (malformed ? malformed.length : 0));
    if (malformed) {
      malformed.forEach(x => console.log('  ' + x.substring(0, 60)));
    }
    const doubleClose = code.match(/setHTML\('[^']+', `[^`]*`\)\);/g);
    console.log('Double parens: ' + (doubleClose ? doubleClose.length : 0));
  }
}
