const Net = require('net');

const port = process.port || 8080;
const host = '127.0.0.1';

const server = new Net.Server();

function sleep (second) {
  second = parseInt(second, 10);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });
}

let allSpend = 0;

server.on('connection', (socket) => {
  console.log('a new connection has been established.');
  const start = Date.now();
  console.log('start time:', start);
  socket.on('data', (chunk) => {
    console.log(`received data from client...`);
    response(chunk);
  });

  socket.on('end', () => {
    console.log('Closing connection with the client.\n');
  });

  async function response (chunk) {
    console.log(`wait for ${ allSpend } s....`);
    await sleep(3);
    socket.write(chunk.toString());
    socket.end();
    console.log(`request spend ${Math.floor( ( Date.now() - start ) / 1000 ) } s`);
    allSpend += 3;
  }

});

server.on('error', (err) => {
  console.log(err);
});

let worker;
process.on('message', (message, tcp) => {
  if(message == 'server') {
    worker = tcp;
    tcp.on('connection', (socket) => {
      console.log(`handled by process ${process.pid}`);
      server.emit('connection', socket);
    });
  }
});

process.on('uncaughtExeption', (err) => {
  console.log(err);
  process.send({ act: 'suicide' });
  worker.close(() => {
    process.exit(1);
  });

  setTimeout(() => {
    process.exit(1);
  }, 5000);
});