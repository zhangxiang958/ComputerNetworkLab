const Net = require('net');

const client = new Net.Socket();
const PORT = 8080;
const HOST = '127.0.0.1';

client.connect(PORT, HOST, () => {
  console.log(`sending a request to PORT: ${PORT}, HOST: ${HOST}`);
  client.write('I am client.');
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