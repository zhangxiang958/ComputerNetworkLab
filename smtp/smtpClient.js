const Net = require('net');
const serverConfig = require('./smtp.json');

const msg = 'I Love Computer Networks';
const msgEnd = '\r\n';
// Choose a mail server (e.g. Google mail server) and call it mailserver
const configType = 'debugForQQ';
const mailServerHost = serverConfig[configType].host;
const mailServerPort = serverConfig[configType].port;

const mailServerUserName = serverConfig[configType].auth.user;
const mailServerPass = serverConfig[configType].auth.pass

// Create socket called clientSocket and establish a TCP connection with mailserver
const socket = new Net.Socket();
socket.connect({ host: mailServerHost, port: mailServerPort }, () => {
  console.log(`Connecting to smtp server....`);
});

let auth = false, RECT = false, DATA = false;
socket.on('data', (data) => {
  console.log(data.toString());
  data = data.toString();
  const [code, message] = data.split(' ');

  if(code === '220') {
    console.log('say hello');
    socket.write(`HELO debugmail.io${msgEnd}`);
  }

  if(code === '235') {
    console.log('auth ok');
    auth = true;
    socket.write(`MAIL FROM:<${mailServerUserName}>${msgEnd}`);
  }

  if(code === '250') {
    if (!auth) {
      socket.write(`AUTH LOGIN${msgEnd}`);
    } else {
      if(!RECT) {
        socket.write(`RCPT TO:<${mailServerUserName}>${msgEnd}`);
        RECT = true;
      } else if(!DATA){
        socket.write(`DATA${msgEnd}`);
        DATA = true;
      } else {
        console.log('quit');
        socket.write(`QUIT${msgEnd}`);
      }
    }
  }
  if(code === '334') {
    let str = new Buffer(message, 'base64');
    console.log(str.toString());
    if(str.toString() === 'Username:') {
      let name = new Buffer(mailServerUserName);
      name = name.toString('base64');
      console.log(`input username:${mailServerUserName}:${name}`);
      socket.write(`${name}${msgEnd}`);
    }
    if(str.toString() === 'Password:') {
      let name = new Buffer(mailServerPass);
      name = name.toString('base64');
      console.log(`input password:${mailServerPass}:${name}`);
      socket.write(`${name}${msgEnd}`);
    }
  }
  if(code === '354') {
    socket.write(`shit${msgEnd}`);
    socket.write(`.${msgEnd}`);
  }
});
// Send HELO command and print server response.

class Mail {
  constructor({ host, port }) {
    this.host = host;
    this.port = port;
    this.socket = new Net.socket();
    this.socket.on('data', (data) => {
      data = data.toString();
      console.log(data);
      const [code, message] = data.split(' ');
      switch (code) {
        case '220':
          this.socket.write(`HELO ${this.host}${megEnd}`);
          break;
        case '250':
          this.socket.emit('auth');
          break;
        case '334':
          this.socket.emit('auth', message);
          break;
        case '235':
          break;
        default:
          break;
      } 
    });
    this.socket.on('auth', this.auth.bind(this));
  }

  auth(order) {
    let sendMessage;
    if ('Username:' === order) {
      sendMessage = new Buffer(mailServerUserName);
      sendMessage = sendMessage.toString('base64');
      console.log(`input username:${mailServerUserName}:${sendMessage}`);
      socket.write(`${sendMessage}${msgEnd}`);
    }
    if('Password:' === order) {
      sendMessage = new Buffer(mailServerUserName);
      sendMessage = sendMessage.toString('base64');
      console.log(`input password:${mailServerPass}:${sendMessage}`);
      socket.write(`${sendMessage}${msgEnd}`);
    }
  }

  from() {

  }

  to() {
    
  }

  send() {

  }
}