const cluster = require('cluster');
const os = require('os');
const cpus = os.cpus();

cluster.schedulingPolicy = cluster.SCHED_RR;

cluster.setupMaster({
  exec: 'server.js'
});

cluster.on('fork', (worker) => {
  console.log(`fork a worker ${worker.id}`);
});

cluster.on('exit', (worker) => {
  console.log(`worker process ${worker.id} died.`);
});

for(let i = 0, length = cpus.length; i < length; i ++) {
  cluster.fork();
}