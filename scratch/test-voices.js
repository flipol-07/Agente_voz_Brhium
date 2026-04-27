const RETELL_API_KEY = process.env.RETELL_API_KEY;

async function test() {
  const resp = await fetch('https://api.retellai.com/list-voices', {
    headers: {
      'Authorization': `Bearer ${RETELL_API_KEY}`
    }
  });
  const data = await resp.json();
  console.log(JSON.stringify(data, null, 2));
}

test();
