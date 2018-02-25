const net = require('net');

const port = process.port || 8080;

const server = net.createServer((socket) => {
  socket.on('data', (res) => {
    console.log(res);
  });
});

server.listen(port, () => {
  console.log(`server is runing on port ${port}`);
});