const Net = require('net');
const serverConfig = require('./smtp.json');

const msg = 'I Love Computer Networks';
const msgEnd = '\r\n';
// Choose a mail server (e.g. Google mail server) and call it mailserver
const mailServerHost = serverConfig.debug.host;
const mailServerPort = serverConfig.debug.port;

// Create socket called clientSocket and establish a TCP connection with mailserver
const socket = new Net.Socket();
socket.connect({ host: mailServerHost, port: mailServerPort }, () => {
  console.log(`Connecting to smtp server....`);
});

socket.on('data', (data) => {
  console.log(data.toString());
  data = data.toString();
  const [code] = data.split(' ');
  if(code === '220') {
    console.log('fuck here');
    socket.write(`HELO debugmail.io${msgEnd}`, () => { console.log('???'); });
  } else {
    console.log('fuck you');
  }
});
// Send HELO command and print server response.
