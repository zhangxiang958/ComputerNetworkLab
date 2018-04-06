const Net = require('net');
const Tls = require('tls');
const fs = require('fs');
const EventEmitter = require('events');

const msgEnd = '\r\n';

module.exports = class Mail extends EventEmitter {
  constructor({ host, port, auth, secure }) {
    super();
    
    this.host = host;
    this.port = port;
    this.auth = auth;
    this.socket = secure ? new Tls.TLSSocket() : new Net.Socket();
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
            this.emit('data', {});
          }
          if ('quit' === operation) {
            this.emit('quit');
          }
          break;
        case '334':
          this.emit('verifyAccount', message[0]);
          break;
        case '354':
          const { text, html, attachment } = this.content;
          this.emit('data', { text, html, attachment });
          break;
        case '221':
          this.socket.end();
          break;
        default:
          break;
      }
    });
    
    this.socket.on('error', (msg) => {
      console.log(`[socket error]: ${msg}`);
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

  static handleFile ({ path, boundary, mimeVersion }, socket) {
    return new Promise((resolve, reject) => {
      let filename = path.replace(/^.*[/\\]/,'').toLowerCase();
      let fileStream = fs.createReadStream(path, { encoding: 'base64' });
      socket.write(`\n--${boundary}\n`);
      socket.write('Content-Type: application/octet-stream\n');
      socket.write(`MIME-Version:${mimeVersion}\n`);
      socket.write('Content-Transfer-Encoding: base64\n');
      socket.write(`Content-Disposition: attachment; filename="${filename}"\n\n`);
      fileStream.pipe(socket, { end: false });
      fileStream.on('end', () => {
        socket.write(`${msgEnd}`);
        resolve();
      });
    });
  }

  async data ({ text, html, attachment }) {
    const { socket } = this;
    if (!text) {
      socket.write(`DATA${msgEnd}`);
    } else {
      const keys = Object.keys(this.content);
      const mimeVersion = '1.0';
      const boundary = `========${(Math.random() * 10000000000000).toFixed()}==`;
      socket.write(`Content-Type:multipart/mixed;\n boundary="${boundary}"${msgEnd}`);
      socket.write(`MIME-Version: ${mimeVersion}${msgEnd}`);
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
            break;
          case 'text':
            socket.write(`\n--${boundary}\n`);
            socket.write(`Content-Type:text/plain; charset="utf-8"\n`);
            socket.write(`MIME-Version:${mimeVersion}\n`);
            socket.write(`\n${text}${msgEnd}`);
            break;
          case 'html':
            socket.write(`\n--${boundary}\n`);
            socket.write(`Content-Type:text/html; charset="utf-8"\n`);
            socket.write(`MIME-Version:${mimeVersion}\n`);
            socket.write(`\n${html}${msgEnd}`);
            break;
          case 'attachment':
            const filePaths = attachment;
            const fileNum = attachment.length;
            for (let path of filePaths) {
              await Mail.handleFile({ path, boundary, mimeVersion }, socket);
            }
            break;
          default:
            break;
        }
      }
      socket.write(`\n--${boundary}--\n${msgEnd}`);
      socket.write(`${msgEnd}.${msgEnd}`);
    }
  }

  sendMail ({ from, to = '', subject = '', text, html, attachment }, callback) {
    to = Array.isArray(to) ? to : to.split(' ');
    attachment = Array.isArray(attachment) ? attachment : [];
    this.content = {
      from,
      to,
      subject,
      text,
      html,
      attachment
    }
    this.connect(this.host, this.port);
  }
}