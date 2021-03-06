const dgram = require('dgram');
const socket = dgram.createSocket('udp4');

const remotePort = 8900;
const remoteHost = '0.0.0.0';

const sendTimes = [];
const output = [];
const RTTs = [];
const wait = 1000;
const pingTime = 10;

socket.on('message', (msg, info) => {
  console.log(`client socket receiver message: ${msg} from ${info.address}:${info.port}`);
  msg = msg.toString().split(' ');
  let index = parseInt(msg[2], 10);
  let sendTime = sendTimes[index];
  let RTT = (Date.now() - sendTime) / 1000;
  let outputMsg = `Ping ${index} RTT: ${RTT} s`;
  console.log(outputMsg);
  !RTTs[index] && (RTTs[index] = RTT);
  !output[index] && (output[index] = outputMsg);
});

socket.on('pingTimeout', (i) => {
  if(RTTs[i]) {
    return;
  } else {
    output[i] = `Ping ${i} request timeout`;
    RTTs[i] = NaN;
    console.log(output[i]);
  }
  let outputResult = output.filter((o) => { return o && o.length > 0 });
  if(outputResult.length === pingTime) {
    console.log(`
      最大 RTT: ${calculateMaxRTT()} s
      最小 RTT: ${calculateMinRTT()} s
      平均 RTT: ${calculateMeanRTT()} s
      丢包率: ${( calculateTimeout() / pingTime) * 100}%
    `);
  }
});

socket.on('close', () => {
  console.log('socket is closed.');
});

socket.on('error', (err) => {
  console.log(`socket err: ${err}`);
});

for(let i = 0; i < pingTime; i ++) {
  let now = Date.now();
  sendTimes.push(now);
  let msg = `Ping ${i} ${now}`;
  socket.send(msg, 0, msg.length, remotePort, remoteHost, (err, bytes) => {
    console.log(msg);
    setTimeout(() => {
      socket.emit('pingTimeout', i);
    }, wait);
  });
}

function calculateMaxRTT () {
  let rtts = RTTs.filter((r) => { return !isNaN(r) });
  return Math.max(...rtts);
}

function calculateMinRTT () {
  let rtts = RTTs.filter((r) => { return !isNaN(r) });
  return Math.min(...rtts);
}

function calculateMeanRTT () {
  let rtts = RTTs.filter((r) => { return !isNaN(r) });
  let num = rtts.length;
  let allRtt = rtts.reduce((all, r) => {
    return all + r;
  }, 0);
  return (allRtt / num).toFixed(3);
}

function calculateTimeout () {
  let timeouts = output.filter((o) => {
    return o.indexOf('request timeout') >= 0;
  });
  return timeouts.length;
}
