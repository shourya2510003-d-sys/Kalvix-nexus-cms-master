const https = require('https');

const apiKey = process.env.OPENROUTER_API_KEY || "YOUR_API_KEY_HERE";
const data = JSON.stringify({
  model: 'nvidia/nemotron-nano-9b-v2:free',
  messages: [{ role: 'user', content: 'hello' }]
});

const options = {
  hostname: 'openrouter.ai',
  port: 443,
  path: '/api/v1/chat/completions',
  method: 'POST',
  headers: {
    'Authorization': `Bearer ${apiKey}`,
    'Content-Type': 'application/json',
    'Content-Length': data.length
  }
};

const req = https.request(options, res => {
  let responseBody = '';
  res.on('data', chunk => responseBody += chunk);
  res.on('end', () => {
    console.log('Status:', res.statusCode);
    console.log('Body:', responseBody);
  });
});

req.on('error', error => {
  console.error('Error:', error);
});

req.write(data);
req.end();
