const cp = require('child_process');
const fork = cp.fork;
const os = require('os');
const cpus = os.cpus();
const Net = require('net');

const muti_process = [];
const port = 1337;
const host = '127.0.0.1';
const server = new Net.Server();

for(let i = 0, length = cpus.length; i < length; i ++) {
  muti_process.push(fork('./server.js'));
}

server.listen(port, host, () => {
  // muti_process.forEach((process) => {
  //   process.send('server', server);
  // });
  muti_process[0].send('server', server);
  muti_process[1].send('server', server);
  server.close();
  console.log(`server listen on port ${port}`);
});
