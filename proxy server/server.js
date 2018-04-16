const Net = require('net');

const server = new Net.Server();
const PORT = 3000;
const HOST = '127.0.0.1';

server.on('connection', (socket) => {
  let chunks = [];
  socket.on('data', (chunk) => {
    chunks.push(chunk);
  });
  socket.on('end', () => {
    let data = Buffer.concat(chunks);
    console.log(data.toString());
    const lines = data.toString().split('\r\n').filter((line) => { return line !== '' });
    console.log(lines);
    const firstLine = lines[0].split(' ');
    const method = (firstLine[0]).toLocaleLowerCase();
    const requestPath = firstLine[1];
    const host = lines[1].split(' ')[1];
    console.log(method);
    console.log(requestPath);
    console.log(host);
  });
  socket.end('socker server is on');
});

server.on('error', (err) => {
  console.log(`[SERVER ERROR]: ${err}`);
});

server.on('listening', () => {
  console.log(`server is listening on port ${PORT}`);
});

server.listen(PORT, HOST);