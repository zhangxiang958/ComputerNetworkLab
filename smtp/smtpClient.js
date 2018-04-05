const Net = require('net');
const util = require('util');
const EventEmitter = require('events');
const serverConfig = require('./smtp.json');
const { promisify } = util;

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
// socket.connect({ host: mailServerHost, port: mailServerPort }, () => {
//   console.log(`Connecting to smtp server....`);
// });

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
    socket.write(`
    shit${msgEnd}
    `);
    socket.write(`.${msgEnd}`);
  }
});
// Send HELO command and print server response.

class Mail extends EventEmitter {
  constructor({ host, port, auth }) {
    super();
    
    this.host = host;
    this.port = port;
    this.auth = auth;
    this.socket = new Net.Socket();
    this.operation = [];

    this.socket.on('data', (data) => {
      data = data.toString();
      console.log(data);
      const [code, ...message] = data.split(' ');
      switch (code) {
        case '220':
          // smtp server send welcome message, do nothing.
          break;
        case '235':
          this.authed = true;
          this.emit('authed');
          break;
        case '250':
          const operation = this.operation.pop();
          if (!this.authed) {
            this.emit('auth');
          }
          if ('to' === operation) {
            this.to(this.content.to);
          }
          if ('data' === operation) {
            this.emit('data');
          }
          if ('quit' === operation) {
            this.emit('quit');
          }
          break;
        case '334':
          this.emit('verifyAccount', message[0]);
          break;
        case '354':
          this.emit('data', this.content.text);
          break;
        case '221':
          this.socket.end();
          break;
        default:
          break;
      }
    });

    this.on('connect', this.connect);
    this.on('auth', this.login);
    this.on('verifyAccount', this.verify);
    this.on('authed', () => {
      this.operation.push(...['quit', 'data', 'to']);
      this.from(this.content.from);
    });
    this.on('data', this.data);
    this.on('quit', () => {
      this.socket.write(`QUIT${msgEnd}`);
    });
  }

  connect (host, port) {
    return new Promise((resolve, reject) => {
      const { socket } = this;
      socket.on('connect', () => {
        this.connected = true;
        socket.write(`HELO ${host}${msgEnd}`);
        resolve(this.connected);
      });
      socket.connect({ host, port });
    });
  }

  login () {
    let needAuth = !!this.auth;
    if (needAuth) {
      if (!this.authed) {
          this.socket.write(`AUTH LOGIN${msgEnd}`);
          return false;
      }
    } else {
      this.authed = true;
    }
  }

  verify (message) {
    message = new Buffer(message, 'base64').toString().toLowerCase();
    if (message.indexOf('username') >= 0) {
      this.socket.write(`${new Buffer(this.auth.user).toString('base64')}${msgEnd}`);
    }
    if (message.indexOf('password') >= 0) {
      this.socket.write(`${new Buffer(this.auth.pass).toString('base64')}${msgEnd}`);
    }
  }

  from (address) {
    const { socket } = this;
    socket.write(`MAIL FROM:<${address}>${msgEnd}`);
  }

  to (address) {
    const { socket } = this;
    address = address.map((a) => { return `<${a}>` }).join('');
    socket.write(`RCPT TO:${address}${msgEnd}`);
  }

  data (content) {
    const { socket } = this;
    if (!content) {
      socket.write(`DATA${msgEnd}`);
    } else {
      const keys = Object.keys(this.content);
      for (let key of keys) {
        switch (key) {
          case 'from':
            socket.write(`From:${this.content[key]}${msgEnd}`);
            break;
          case 'to':
            socket.write(`To:${this.content[key]}${msgEnd}`);
            break;
          case 'subject':
            socket.write(`Subject:${this.content[key]}${msgEnd}`);
          default:
            break;
        }
      }
      socket.write(`${content}${msgEnd}`);
      socket.write(`.${msgEnd}`);
    }
  }

  sendMail ({ from, to = '', subject = '', text }, callback) {
    this.content = {
      from,
      to: Array.isArray(to) ? to : to.split(' '),
      subject,
      text
    }
    this.connect(this.host, this.port);
  }
}

/**
 * const mail = new Mail({
 *  host:'',
 *  port:'',
 *  auth:{}
 * });
 * opt: { from, to, subject, text }
 * mail.sendMail(opt, callback);
//  */
const mail = new Mail({
  host: mailServerHost,
  port: mailServerPort,
  auth: {
    user: mailServerUserName,
    pass: mailServerPass
  }
});

mail.sendMail({
  from: '958033967@qq.com',
  to: '958033967@qq.com',
  subject: 'test',
  text: 'fucker sender'
});