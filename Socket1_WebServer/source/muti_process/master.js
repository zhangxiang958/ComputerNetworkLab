const cp = require('child_process');
const fork = cp.fork;
const os = require('os');
const cpus = os.cpus();
const Net = require('net');

const muti_process = [];
const port = 1337;
const host = '127.0.0.1';
const server = new Net.Server();
const workers = {};

server.listen(port, () => {
  console.log(`server listening on port ${port}`);
});

const limit = 10;
const during = 60000;
let restart = [];
function isTooFrequently() {
  let time = Date.now();
  restart.push(time);
  let length = restart.length;
  if(length > limit) {
    restart = restart.slice(limit * -1);
  }
  return (restart.length >= limit) && (restart[restart.length - 1] - restart[0] < during);
}

function createWorker() {
  
  if(isTooFrequently()) {
    process.emit('giveup', length, during);
    return;
  }

  let worker = fork('./server.js');

  worker.on('message', (message) => {
    if(message.act === 'suicide') {
      createWorker();
    }
  });

  worker.on('exit', () => {
    console.log(`worker process ${worker.pid} exited.`);
    delete workers[worker.pid];
  });

  worker.send('server', server);
  workers[worker.pid] = worker;
  console.log(`create worker process ${worker.pid}`);
}

for(let i = 0, length = cpus.length; i < length; i ++) {
  createWorker();
}

