'use strict'

const http = require('http')

function createRequest() {
  return new Promise((resolve) => {
    http.get('http://localhost:8081/', (res) => {
      res.on('data', (data) => {
        console.log(data.toString());
      });
      res.on('end', () => {
        resolve();
      });
    });
  });
}

const promises = [];

for(let i = 0; i < 10; i ++) {
  promises.push(createRequest());
}

let start = Date.now();
Promise.all(promises).then(() => {
  console.log(`spend ${(Date.now() - start) / 1000} s`);
});