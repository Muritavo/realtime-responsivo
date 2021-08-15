#!/usr/bin/env node

const handler = require('serve-handler');
const http = require('http');

const server = http.createServer((request, response) => {
  // You pass two more arguments for config and middleware
  // More details here: https://github.com/vercel/serve-handler#options
  return handler(request, response, {
      directoryListing: false,
      public: "./build"
  });
})

server.listen(10000, () => {
  console.log('The realtime-responsive application is running on http://localhost:10000');
});