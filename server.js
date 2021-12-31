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

        const reqHeader = {};
        for(let i = 1; i < requestMessage.split('\r\n').length; i+=1){
            if(requestMessage.split('\r\n')[i]){
                reqHeader[ requestMessage.split('\r\n')[i].split(": ")[0]] = requestMessage.split('\r\n')[i].split(": ")[1];
            }else{
                break;
            }
        }


        if( !socket.tempBuf){
            socket.tempBuf = buffer;
        }else{
            socket.tempBuf = Buffer.from([socket.tempBuf,buffer]);
            if(socket.tempBuf.slice(socket.tempBuf.indexOf('\r\n\r\n')+4).length == reqHeader["Content-Length"]){
                let getParameter;

                if(resource.indexOf("?") != -1){
                    getParameter = resource.split("?")[1];
                    resource = resource.split("?")[0];
                }

                let postParameter; // Buffer 객체
                if( method != "GET"){
                    postParameter = buffer.slice(buffer.indexOf(Buffer.from("\r\n\r\n"))+4);
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
                }else if(resource.startsWith("/cgi/") && fs.existsSync("." + resource)){
                    let cgiResult;
                    if(!getParameter){
                        if(!postParameter){
                            cgiResult = cp.execSync("node ."+resource, {env:{...reqHeader}});
                        }else{
                            cgiResult = cp.execSync("node ."+resource,{input : postParameter, env:{...reqHeader}});
                        }
                    }
                    else{
                        if(!postParameter){
                            cgiResult = cp.execSync("node ."+resource,{env:{...reqHeader,"QUERY_STRING":getParameter}});
                        }else{
                            cgiResult = cp.execSync("node ."+resource,{input : postParameter, env:{...reqHeader,"QUERY_STRING":getParameter}});
                        }
                    }
                    socket.write(Buffer.from("HTTP/1.1 200 OK\r\n"));
                    socket.write(cgiResult);
                }else{
                    const content = `<!doctype html><html lang="en"><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0"><meta http-equiv="X-UA-Compatible" content="ie=edge"><title>Document</title></head><body>
                            <h1>NOT FOUND</h1></body></html>`;

                    socket.write(Buffer.from("HTTP/1.1 404 Not Found\r\n"));
                    socket.write(Buffer.from("Content-Type: text/html\r\n"));
                    socket.write(Buffer.from(`Content-Length: ${content.length}\r\n`));
                    socket.write(Buffer.from("\r\n"));
                    socket.write(content);
                    socket.write(Buffer.from("\r\n"));
                }
                socket.tempBuf = null;
            }
        }

    })

});

server.listen(4005);