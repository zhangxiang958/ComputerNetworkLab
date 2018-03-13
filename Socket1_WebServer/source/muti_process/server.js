const Net = require('net');
const fs = require('fs');

const port = process.port || 8080;
const host = '127.0.0.1';

const server = new Net.Server({allowHalfOpen:true});
const helloworldFile = fs.readFileSync('./HelloWorld.html');
const Header = `
HTTP/1.1 200 OK
Content-Type: text/html;charset=utf-8
Date: ${new Date()}
`;

server.on('connection', async (socket) => {
  console.log(`a new connection has been established. handled By ${process.pid}`);
  
  const start = Date.now();
  let path;

  // await sleep(3);
  // fs.createReadStream('./HelloWorld.html').pipe(socket);
  doSomething();
  socket.write(`${Header}\n ${helloworldFile}`, 'binary');

  socket.on('data', async (chunk) => {
    let [message] = chunk.toString().split('\n');
    path = (message.split(' '))[1];
    console.log(`received data from client...`);
    socket.end();
  });

  socket.on('end', () => {
    console.log('Closing connection with the client.');
    console.log(`path: ${path}, handled By ${process.pid}, start time: ${start}, end time: ${Date.now()}, spend time ${(Date.now() - start) / 1000} s`);
  });

  socket.on('error', (err) => {
    console.log(`scoekt error: ${err}`);
  });
});

server.on('error', (err) => {
  console.log(`server err: ${err}`);
});

server.listen(port, () => {
  console.log(`listening on port ${port}`);
});

function doSomething() {
  Array.from({ length: 100000 }).forEach(value => {
    return value * value * value
  })
}

function sleep (second) {
  second = parseInt(second, 10);
  return new Promise((resolve, reject) => {
    setTimeout(() => {
      resolve();
    }, second * 1000);
  });
}

// let worker;
// process.on('message', (message, tcp) => {
//   if(message == 'server') {
//     worker = tcp;
//     tcp.on('connection', (socket) => {
//       console.log(`handled by process ${process.pid}`);
//       server.emit('connection', socket);
//     });
//   }
// });

// process.on('uncaughtExeption', (err) => {
//   console.log(err);
//   process.send({ act: 'suicide' });
//   worker.close(() => {
//     process.exit(1);
//   });

//   setTimeout(() => {
//     process.exit(1);
//   }, 5000);
// });