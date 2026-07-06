const fs = require('fs');

// Read the browser test script
const testScript = fs.readFileSync('browser_final_test.js', 'utf8');

// Create a wrapper that captures console output
const wrapper = `
(function(){
  const logs = [];
  const originalLog = console.log;
  const originalError = console.error;
  const originalWarn = console.warn;
  
  console.log = function(...args) { logs.push({type:'log', msg: args.join(' ')}); originalLog.apply(console, args); };
  console.error = function(...args) { logs.push({type:'error', msg: args.join(' ')}); originalError.apply(console, args); };
  console.warn = function(...args) { logs.push({type:'warn', msg: args.join(' ')}); originalWarn.apply(console, args); };
  
  ${testScript.replace(/\/\/.*$/gm, '').replace(/\*\/[\s\S]*?\/\*/g, '')}
  
  return { results: window.__farmTestResults, logs: logs };
})();
`;

// For the evaluate API, we need to send the code as a string in JSON
// We'll write a request file and use curl
const request = {
  action: 'evaluate',
  args: { code: wrapper },
  session: 'xingyuan-v64-test'
};

fs.writeFileSync('wb_eval_request.json', JSON.stringify(request));
console.log('Request written to wb_eval_request.json');
console.log('Code length: ' + wrapper.length + ' chars');
