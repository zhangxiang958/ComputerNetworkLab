const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const remotePort = 8900;
const remoteHost = '0.0.0.0';

const msg = 'Hello World!';

socket.on('message', (msg, info) => {
  console.log(`client socket receiver message: ${msg} from ${info.address}:${info.port}`);
  socket.close();
});

socket.on('close', () => {
  console.log('socket is closed.');
});

socket.on('error', (err) => {
  console.log(`socket err: ${err}`);
});

socket.send(msg, 0, msg.length, remotePort, remoteHost, (err, bytes) => {
  // socket.close();
});