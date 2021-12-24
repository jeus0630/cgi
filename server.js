const net = require('net');
const fs = require('fs');
const cp = require('child_process');

const server = net.createServer(socket=>{
    socket.on("close",()=>{

    });

    socket.on("error",()=>{});

    socket.on("data",buffer=>{
        const requestMessage = buffer.toString();
        const [first] = requestMessage.split('\r\n');
        let [method, resource, version] = first.split(' ');
        let getParameter;
        if(resource.indexOf("?") != -1){
            getParameter = resource.split("?")[1];
            resource = resource.split("?")[0];
        }

        if(resource[resource.length - 1] === "/"){
            resource += "index.html";
        }

        if(fs.existsSync("./source"+resource)){
            const content = fs.readFileSync("./source"+resource);
            socket.write(Buffer.from("HTTP/1.1 200 OK\r\n"));
            socket.write(Buffer.from("Content-Type: text/html\r\n"));
            socket.write(Buffer.from(`Content-Length: ${content.length}\r\n`));
            socket.write(Buffer.from("\r\n"));
            socket.write(content);
            socket.write(Buffer.from("\r\n"));
            return;
        }else if(resource.startsWith("/cgi/") && fs.existsSync("." + resource)){
            let cgiResult;
            if(!getParameter)
                cgiResult = cp.execSync("node ."+resource);
            else
                cgiResult = cp.execSync("node ."+resource,{env:{"QUERY_STRING":getParameter}});
            socket.write(Buffer.from("HTTP/1.1 200 OK\r\n"));
            socket.write(cgiResult);
            return;
        }

        const content = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>
                            <h1>NOT FOUND</h1></body></html>`;

        socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n"));
        socket.write(Buffer.from("Content-Type: text/html\r\n"));
        socket.write(Buffer.from(`Content-Length: ${content.length}\r\n`));
        socket.write(Buffer.from("\r\n"));
        socket.write(content);
        socket.write(Buffer.from("\r\n"));
    })

});

server.listen(4005);