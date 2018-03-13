const Net = require('net');
const fs = require('fs');

const port = process.port || 8081;
const host = '127.0.0.1';

const server = new Net.Server();
const helloworldFile = fs.readFileSync('./HelloWorld.html');
const Header = `
HTTP/1.1 200 OK
Content-Type: text/html;charset=utf-8
Date: ${new Date()}
`;

server.on('connection', async (socket) => {
  console.log('a new connection has been established.');
  const start = Date.now();
  let path;
  
  // await sleep(3);
  doSomething();
  socket.write(`${Header}\n ${helloworldFile}`, 'binary');
  
  socket.on('data', (chunk) => {
    console.log(`received data from client...`);
    let [message] = chunk.toString().split('\n');
    path = (message.split(' '))[1];
    socket.end();
  });

  socket.on('end', () => {
    console.log('Closing connection with the client.');
    console.log(`path: ${path}, start time: ${start}, end time: ${Date.now()}, spend time ${(start - Date.now()) / 1000} s`);
    socket.end();
  });
});

server.on('error', (err) => {
  console.log(err);
});

server.listen(port, host, () => {
  console.log(`server is runing on port ${port}\n`);
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
