const cp = require('child_process');
const fork = cp.fork;
const os = require('os');
const cpus = os.cpus();

for(let i = 0, length = cpus.length; i < length; i ++) {
  fork('../server.js');
}