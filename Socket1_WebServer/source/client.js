const Net = require('net');

const client = new Net.Socket();
const PORT = process.argv[3] || 8080;
const HOST = process.argv[2] || '127.0.0.1';

const Header = `
GET / HTTP/1.1
Host: ${HOST}
Cache-Control: max-age=0
Accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8
`;

const body = `I am client`;

client.connect(PORT, HOST, () => {
  console.log(`sending a request to PORT: ${PORT}, HOST: ${HOST}`);
  client.write(`${Header} \n ${body}`);
});

client.on('data', (chunk) => {
  console.log(`receiver data from server: ${chunk.toString()}`);
  client.destroy();
});

client.on('close', () => {
  console.log('socket totally shut down!');
});

client.on('end', () => {
  console.log(`receiver FIN, connection disconnect`);
});