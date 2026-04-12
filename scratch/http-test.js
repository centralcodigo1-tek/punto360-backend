const http = require('http');

http.get('http://127.0.0.1:3000/sales?startDate=2026-03-30&endDate=2026-04-09', (res) => {
  let data = '';
  res.on('data', (chunk) => data += chunk);
  res.on('end', () => console.log('Response:', res.statusCode, data));
}).on('error', (err) => {
  console.error('Error:', err.message);
});
