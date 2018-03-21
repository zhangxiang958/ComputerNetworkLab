const dgram = require('dgram');

const remotePort = 8900;
const remoteHost = '0.0.0.0';

const timeGap = 1000;
let i = 0;

setInterval(() => {
  let socket = dgram.createSocket('udp4');
  let now = Date.now();
  let msg = `Ping ${i++} ${now}`;
  socket.send(msg, 0, msg.length, remotePort, remoteHost, (err, bytes) => {
    console.log(msg);
    socket.close();
  });

  socket.on('error', (error) => {
    console.log('socket error:', error);
  });
}, timeGap);