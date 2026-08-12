const http = await import('http');
const data = JSON.stringify({ email: 'admin@cathyrepair.com', password: 'admin123' });
const req = http.request({
  host: 'localhost', port: 3000, path: '/api/admin/login',
  method: 'POST',
  headers: { 'Content-Type': 'application/json', 'Content-Length': Buffer.byteLength(data) }
}, (res) => {
  console.log('STATUS:', res.statusCode);
  const sc = res.headers['set-cookie'];
  if (sc) { sc.forEach((c, i) => console.log('Set-Cookie[' + i + ']:', c)); }
  else { console.log('NO set-cookie header'); }
  let body = '';
  res.on('data', (d) => body += d);
  res.on('end', () => console.log('BODY:', body));
});
req.write(data);
req.end();
