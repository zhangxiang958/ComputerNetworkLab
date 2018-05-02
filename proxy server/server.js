const Net = require('net');

const server = new Net.Server();
const PORT = 3000;
const HOST = '127.0.0.1';

server.on('connection', (socket) => {
  let chunks = [];
  console.log('remoteAddress/remotePort', socket.remoteAddress, socket.remotePort);
  console.log('localAddress/localPort', socket.localAddress, socket.localPort);
  socket.on('data', (chunk) => {
    chunks.push(chunk);
  });
  socket.on('end', () => {
    let data = Buffer.concat(chunks);
    // console.log(data.toString());
    const lines = data.toString().split('\r\n').filter((line) => { return line !== '' });
    // console.log(lines);
    const firstLine = lines[0].split(' ');
    const method = (firstLine[0]).toLocaleLowerCase();
    const requestPath = firstLine[1];
    const address = lines[1].split(' ')[1];
    // console.log(method);
    // console.log(requestPath);
    // console.log(address);
    const [request_HOST, request_PORT = 80] = address.split(':');
    console.log(request_PORT, request_HOST);
    console.log(socket.remoteAddress, socket.remotePort);
    const newSocket = new Net.Socket();
    newSocket.connect(request_PORT, request_HOST, () => {
      newSocket.write(data);
    });
    const dataArr = [];
    newSocket.on('data', (chunk) => {
      dataArr.push(chunk);
    });

    newSocket.on('end', () => {
      console.log(Buffer.concat(dataArr).toString());
      // socket.end(Buffer.concat(dataArr).toString());
    });

    newSocket.on('error', (error) => {
      console.log(error);
    });
  });
  socket.end('socket server is on');
});

server.on('error', (err) => {
  console.log(`[SERVER ERROR]: ${err}`);
});

server.on('listening', () => {
  console.log(`server is listening on port ${PORT}`);
});

server.listen(PORT, HOST);