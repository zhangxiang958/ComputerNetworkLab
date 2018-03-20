const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

socket.on('message', (msg, receiver) => {
  let rand = Math.round( Math.random() * 10 );
  if(rand < 4) {
    console.log('请求超时');
    return;
  }
  console.log(`receiver msg: ${msg} from ${receiver.address}:${receiver.port}`);
  msg = msg.toString().split(' ');
  let sendMessage = `received Ping ${msg[1]}`;
  socket.send(sendMessage, 0, sendMessage.length, receiver.port, receiver.address, (err, bytes) => {});
});

socket.on('listening', () => {
  const address = socket.address();
  console.log(`server is listening on ${address.address}:${address.port}`);
});

socket.on('close', () => {
  console.log('socket is closed, no longer emit message.');
});

socket.on('error', (err) => {
  console.log(`socket error: ${err}`);
});

socket.bind(8900);