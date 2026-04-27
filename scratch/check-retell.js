const RETELL_API_KEY = "key_c7219248fcd80e293856d964ab7d";
const RETELL_AGENT_ID = "agent_008f7c2686aa4abfffa6c79d10";

async function checkRetell() {
  const response = await fetch(`https://api.retellai.com/v2/get-agent/${RETELL_AGENT_ID}`, {
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`,
    },
  });
  const agent = await response.json();
  console.log('AGENT:', JSON.stringify(agent, null, 2));

  if (agent.response_engine?.llm_id) {
    const llmResp = await fetch(`https://api.retellai.com/v2/get-retell-llm/${agent.response_engine.llm_id}`, {
      headers: {
        'Authorization': `Bearer ${RETELL_API_KEY}`,
      },
    });
    const llm = await llmResp.json();
    console.log('LLM:', JSON.stringify(llm, null, 2));
  }
}

checkRetell();
