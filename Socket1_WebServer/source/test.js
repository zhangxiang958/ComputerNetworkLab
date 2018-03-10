'use strict'

const http = require('http')

function createRequest(i) {
  return new Promise((resolve) => {
    setTimeout(() => {
      http.get('http://localhost:8081/', (res) => {
        res.on('data', (data) => {
          console.log(data.toString());
        });
        res.on('end', () => {
          resolve();
        });
      });
    }, 0);
  });
}

const promises = [];

for(let i = 0; i < 4; i ++) {
  promises.push(createRequest(i + 1));
}

let start = Date.now();
Promise.all(promises).then(() => {
  console.log(`spend ${(Date.now() - start) / 1000} s`);
});