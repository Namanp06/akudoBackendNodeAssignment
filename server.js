const http =require('http');
const app=require('./app');
const port= process.env.PORT|| 3000;

const server =http.createServer(app);
server.listen(port);
console.log('===============>>> Server is running on',port)


// const http = require('http');
// const app= require('./app');
// const port= precess.env.PORT||3000;

// const server = http.createServer(app);
// server.listen(port);