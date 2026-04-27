const { readFileSync } = require('fs');

async function main() {
  const env = readFileSync('.env.local', 'utf8');
  let key, agentId;
  for (const line of env.split('\n')) {
    if (line.startsWith('RETELL_API_KEY=')) key = line.split('=')[1].trim().replace(/"/g, '');
    if (line.startsWith('RETELL_AGENT_ID=')) agentId = line.split('=')[1].trim().replace(/"/g, '');
  }

  const agentRes = await fetch(`https://api.retellai.com/get-agent/${agentId}`, {
    headers: { 'Authorization': `Bearer ${key}` }
  });
  const agent = await agentRes.json();
  const llmId = agent.response_engine.llm_id;

  const res = await fetch(`https://api.retellai.com/update-retell-llm/${llmId}`, {
    method: 'PATCH',
    headers: { 
      'Authorization': `Bearer ${key}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      high_priority: true
    })
  });
  console.log(await res.json());
}
main();
