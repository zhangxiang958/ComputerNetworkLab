const Net = require('net');
const fs = require('fs');
const path = require('path');

const server = new Net.Server();
const PORT = 3000;
const HOST = '127.0.0.1';

const parseRequestObj = (requestHeaders, socket) => {
  requestHeaders = requestHeaders.split('\r\n');
  let [method, url, httpVersion] = requestHeaders.shift().split(' ');
  const headers = requestHeaders.reduce((res, currentLine) => {
    const [key, ...value] = currentLine.split(/:\s/);
    return {
      ...res,
      [key.trim().toLowerCase()]: value.join('').trim()
    }
  }, {});
  return {
    method: method.toLowerCase(),
    url,
    httpVersion: httpVersion.split('/')[1],
    headers,
    socket
  }
};

const parseReponseObj = (request) => {
  let status = 200;
  let statusText = 'OK';
  let headerSent = false;
  let isChunked = false;
  let socket = request.socket;

  const responseHeader = {
    server: 'my-proxy-server'
  };

  const setHeader = (key, value) => {
    responseHeader[key.toLowerCase()] = value;
  };

  const sendHeader = () => {
    if (!headerSent) {
      headerSent = true;

      setHeader('date', new Date().toGMTString());
      socket.write(`HTTP/1.1 ${status} ${statusText}\r\n`);

      Object.keys(responseHeader).forEach((key) => {
        socket.write(`${key}: ${responseHeaer[key]}\r\n`);
      });

      socket.write('\r\n');
    }
  };

  return {
    write: (chunk) => {
      if (!headerSent) {
        if (!responseHeader['content-length']) {
          isChunked = true;
          setHeader('transfer-encoding', 'chunked');
        }
        sendHeader();
      }

      if (isChunked) {
        const size = chunk.length.toString(16);
        socket.write(`${size}\r\n`);
        socket.write(chunk);
        socket.write('\r\n');
      } else {
        socket.write(chunk);
      }
    },
    end: (chunk) => {
      if (!headerSent) {
        if (!responseHeader['content-length']) {
          setHeader('content-length', chunk ? chunk.length : 0);
        }
        sendHeader();
      }

      if (isChunked) {
        if (chunk) {
          const size = chunk.length.toString(16);
          socket.write(`${size}\r\n`);
          socket.write(chunk);
          socket.write('\r\n');
        }
        socket.end('0\r\n\r\n');
      } else {
        socket.end(chunk);
      }
    },
    setHeader,
    setStatus: (statusCode, text) => {
      status = statusCode;
      statusText = text;
    }
  }
};

const connectToRealServer = (request) => {
  const [host, port = 80] = request.headers.host.split(':');
  const socket = Net.createConnection(port, host);
  return socket;
};

const setupProxy = (request, response, data) => {
  const socketToServer = connectToRealServer(request);
  const socketToClient = request.socket;
  const filePath = path.resolve(__dirname, `./cache/${request.url.split('//')[1].replace(/\//g, '_')}`);
  if (fs.existsSync(filePath)) {
    console.log('fucking exist');
    const readStream = fs.createReadStream(filePath);
    readStream.pipe(socketToClient);
    return;
  }
  const writeStream = fs.createWriteStream(filePath);

  socketToServer.on('data', (buf) => {
    writeStream.write(buf);
    socketToClient.write(buf);
  });
  socketToClient.on('data', (buf) => { 
    socketToServer.write(buf); 
  });
  socketToServer.write(data);
};


const handleConnection = (socket) => {
  socket.once('readable', () => {

    let reqBuffer = new Buffer('');
    let totalBuffer = new Buffer('');

    let buf;
    let requestHeader;
    let reqBody;
    
    // 处理头部
    while (true) {
      buf = socket.read();
      
      if (buf === null) break;

      reqBuffer = Buffer.concat([reqBuffer, buf]);
      
      let headerEndFlag = reqBuffer.indexOf('\r\n\r\n');
      if (headerEndFlag !== -1) {

        let body = reqBuffer.slice(headerEndFlag + 4);
        requestHeader = reqBuffer.slice(0, headerEndFlag).toString();
        socket.unshift(body);
        break;
      }
    }
    // 拼接收到的数据
    totalBuffer = Buffer.concat([totalBuffer, reqBuffer]);
    // 解析请求对象
    const request = parseRequestObj(requestHeader, socket);
    // 解析响应对象
    const response = parseReponseObj(request);
    // 重新设置 reqBuf 的值以接收 body
    reqBuffer = new Buffer('');
    // 处理 body
    while ((buf = socket.read()) !== null) {
      reqBuffer = Buffer.concat([reqBuffer, buf]);
    }
    reqBody = reqBuffer.toString();
    // 获取到全部数据
    totalBuffer = Buffer.concat([totalBuffer, reqBuffer]);
    setupProxy(request, response, totalBuffer);
    // socket.end('HTTP/1.1 200 OK\r\nServer: fucking-server\r\nContent-Length:0\r\n\r\n');
  });
};

server.on('connection', handleConnection);

server.on('error', (err) => {
  console.log(`[SERVER ERROR]: ${err}`);
});

server.on('listening', () => {
  console.log(`server is listening on port ${PORT}`);
});

server.listen(PORT, HOST);