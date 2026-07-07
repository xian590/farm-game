
let x = null;
const code = 'x = 42; let y = 100;';
eval(code);
console.log('x after eval:', x);
console.log('y after eval:', typeof y !== 'undefined' ? y : 'undefined');
