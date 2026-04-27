
const { fetchRetellCalls } = require('./src/features/brhium-platform/server/service');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function test() {
  try {
    const calls = await fetchRetellCalls();
    console.log('Calls:', JSON.stringify(calls, null, 2));
  } catch (err) {
    console.error('Error:', err);
  }
}

test();
