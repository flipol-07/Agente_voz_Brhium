const { createHash } = require('node:crypto');

function hashPassword(password) {
  return createHash('sha256').update(password).digest('hex');
}

const target = '05edcc342c2b44883a9d0f110ce0d2038be9b7eb2ad25553fc1c85dc194a8f9e';
const common = ['admin', 'admin123', 'brhium', 'password', '123456', 'brhium123'];

for (const p of common) {
  if (hashPassword(p) === target) {
    console.log(`Found: ${p}`);
    process.exit(0);
  }
}
console.log('Not found');
