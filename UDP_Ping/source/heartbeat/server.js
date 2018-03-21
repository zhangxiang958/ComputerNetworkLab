const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const heartbeat = {};
const checkPeriod = 150;
const checkTimeout = 60000;

socket.on('message', (msg, receiver) => {
  let rand = Math.round( Math.random() * 10 );
  if(rand < 4) {
    console.log('请求超时');
    return;
  }
  const { address, port } = receiver;
  console.log(`receiver msg: ${msg} from ${address}:${port}`);
  msg = msg.toString().split(' ');
  let sendMessage = `received Ping ${msg[1]}`;
  heartbeat[`${address}:${port}`] = new Date();
  // socket.send(sendMessage, 0, sendMessage.length, receiver.port, receiver.address, (err, bytes) => {});
});

socket.on('listening', () => {
  const { address, port } = socket.address();
  console.log(`server is listening on ${address}:${port}`);
});

socket.on('close', () => {
  console.log('socket is closed, no longer emit message.');
});

socket.on('error', (err) => {
  console.log(`socket error: ${err}`);
});

socket.bind(8900);

setInterval(() => {
  Object.keys(heartbeat).forEach((address) => {
    let time = heartbeat[address];
    if(new Date() - time < checkTimeout) {
      console.log(`${address} slient.`);
    }
  });
}, checkPeriod);