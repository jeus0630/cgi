const net = require('net');

const socket = net.createConnection(80,'www.naver.com',()=>{
    socket.write(`
        GET / HTTP/1.1
        Host: naver.com
    `)

    socket.on('data',buffer=>{
        console.log(buffer.toString());
    })
})