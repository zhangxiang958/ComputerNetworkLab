const cp = require('child_process');
const fork = cp.fork;
const Net = require('net');

const child = fork('./child.js');
const server = new Net.createServer();

server.on('connection', (socket) => {
  socket.end('handled by parent');
});

server.listen('9094', () => {
  child.send('server', server);
});