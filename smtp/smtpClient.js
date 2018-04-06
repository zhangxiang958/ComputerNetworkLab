const util = require('util');
const path = require('path');
const { promisify } = util;

const Mail = require('./mailer.js');
const serverConfig = require('./smtp.json');

// const configType = 'debugForQQ';
const configType = 'QQ';
const mailServerHost = serverConfig[configType].host;
const mailServerPort = serverConfig[configType].port;

const mailServerUserName = serverConfig[configType].auth.user;
const mailServerPass = serverConfig[configType].auth.pass
const mailServerSecure = serverConfig[configType].secure

console.log(mailServerUserName);
console.log(mailServerPass);
const mail = new Mail({
  host: mailServerHost,
  port: mailServerPort,
  auth: {
    user: mailServerUserName,
    pass: mailServerPass
  },
  secure: mailServerSecure
});
mail.sendMail({
  from: '958033967@qq.com',
  to: '958033967@qq.com',
  subject: 'test',
  text: 'fucker sender',
  html: '<h1>Fuck YOU!!!</h1>',
  attachment: [
    path.resolve(__dirname, './smtp.json'),
    path.resolve(__dirname, './file/99.png')
  ]
});