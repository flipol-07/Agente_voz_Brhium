const fs = require('fs');
const path = require('path');

// Manually parse .env.local
const envPath = path.join(__dirname, '../.env.local');
const envContent = fs.readFileSync(envPath, 'utf8');
const env = {};
envContent.split('\n').forEach(line => {
  const match = line.match(/^([^=]+)=(.*)$/);
  if (match) {
    env[match[1]] = match[2];
  }
});

const RETELL_API_KEY = env.RETELL_API_KEY.replace(/['"]+/g, '').trim();
const RETELL_AGENT_ID = env.RETELL_AGENT_ID.replace(/['"]+/g, '').trim();

async function fetchRetell(path, options = {}) {
  const url = `https://api.retellai.com${path}`;
  console.log(`[Retell] Fetching: ${url}`);
  
  const response = await fetch(url, {
    ...options,
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
      'Content-Type': 'application/json',
      ...options.headers,
    },
  });

  if (!response.ok) {
    const text = await response.text();
    console.log(`[Retell] Error Status: ${response.status}`);
    console.log(`[Retell] Error Body: ${text}`);
    throw new Error(`Retell API error: ${response.statusText}`);
  }

  return response.json();
}

async function test() {
  try {
    console.log('Testing with Agent ID:', RETELL_AGENT_ID);
    const agent = await fetchRetell(`/get-agent/${RETELL_AGENT_ID}`);
    console.log('Success! Agent Name:', agent.agent_name);
  } catch (e) {
    console.error('Test Failed:', e.message);
  }
}

test();
