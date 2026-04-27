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
  console.log("AGENT:", JSON.stringify(agent, null, 2));

  if (agent.response_engine?.llm_id) {
    const llmRes = await fetch(`https://api.retellai.com/get-retell-llm/${agent.response_engine.llm_id}`, {
      headers: { 'Authorization': `Bearer ${key}` }
    });
    const llm = await llmRes.json();
    console.log("LLM:", JSON.stringify(llm, null, 2));
  }
}
main();
