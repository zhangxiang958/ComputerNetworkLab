const Net = require('net');
const serverConfig = require('./smtp.json');

const msg = 'I Love Computer Networks';
const msgEnd = '\r\n';
// Choose a mail server (e.g. Google mail server) and call it mailserver
const mailServerHost = serverConfig.debug.host;
const mailServerPort = serverConfig.debug.port;

const mailServerUserName = serverConfig.debug.auth.user;
const mailServerPass = serverConfig.debug.auth.pass

// Create socket called clientSocket and establish a TCP connection with mailserver
const socket = new Net.Socket();
socket.connect({ host: mailServerHost, port: mailServerPort }, () => {
  console.log(`Connecting to smtp server....`);
});

socket.on('data', (data) => {
  console.log(data.toString());
  data = data.toString();
  const [code, message] = data.split(' ');
  if(code === '220') {
    console.log('fuck here');
    socket.write(`HELO debugmail.io${msgEnd}`);
  }
  if(code === '250') {
    socket.write(`AUTH LOGIN${msgEnd}`);
    // socket.write(`MAIL FROM 958033967@qq.com${msgEnd}`);
  }
  if(code === '334') {
    let str = new Buffer(message, 'base64');
    console.log(str.toString());
    if(str.toString() === 'Username:') {
      let name = new Buffer(mailServerUserName);
      name = name.toString('base64');
      console.log(`input username:${mailServerUserName}:${name}`);
      socket.write(name);
    }
  }
});
// Send HELO command and print server response.

class Mail {
  constructor({ host, port }) {
    this.host = host;
    this.port = port;
  }
  auth() {

  }

  to() {
    
  }

  from() {

  }

  send() {

  }
}